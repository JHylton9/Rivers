import {
  FullscreenControl,
  Layer,
  Map,
  NavigationControl,
  Popup,
  Source,
  type MapRef
} from '@vis.gl/react-maplibre';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MapLayerMouseEvent } from 'maplibre-gl';
import RiverPanel from './components/river-panel';
import {
  getRiverData,
  getRiverSummary,
  type LngLat,
  type RiverFeature,
  type RiverFeatureCollection,
  type RiverSummary
} from './lib/api';
import { jamaicaBounds, jamaicaCenter, mapStyleUrl } from './lib/constants';

const riverGlowLayer = {
  id: 'river-glow',
  type: 'line',
  paint: {
    'line-blur': 1.2,
    'line-color': '#c6edf0',
    'line-opacity': 0.44,
    'line-width': ['interpolate', ['linear'], ['zoom'], 6, 1.8, 9, 5.5, 12, 12]
  }
} as const;

const riverMainLayer = {
  id: 'river-main',
  type: 'line',
  paint: {
    'line-color': [
      'step',
      ['get', 'lengthKm'],
      '#79c7cf',
      1,
      '#2e95ac',
      5,
      '#0f6a82',
      10,
      '#0a4357'
    ],
    'line-opacity': 0.96,
    'line-width': [
      'interpolate',
      ['linear'],
      ['zoom'],
      6,
      ['step', ['get', 'lengthKm'], 0.7, 1, 1, 5, 1.4, 10, 1.9],
      10,
      ['step', ['get', 'lengthKm'], 1.2, 1, 1.8, 5, 2.8, 10, 4.2],
      13,
      ['step', ['get', 'lengthKm'], 2.1, 1, 3, 5, 4.7, 10, 7]
    ]
  }
} as const;

const highlightHaloLayer = {
  id: 'river-highlight-halo',
  type: 'line',
  paint: {
    'line-color': '#f5dd8c',
    'line-opacity': 0.88,
    'line-width': ['interpolate', ['linear'], ['zoom'], 6, 4, 10, 8, 13, 14]
  }
} as const;

const highlightLineLayer = {
  id: 'river-highlight-line',
  type: 'line',
  paint: {
    'line-color': '#15495f',
    'line-opacity': 1,
    'line-width': ['interpolate', ['linear'], ['zoom'], 6, 1.6, 10, 3.2, 13, 5.2]
  }
} as const;

interface PopupInfo {
  coordinates: LngLat;
  river: RiverFeature['properties'];
}

const jamaicaNavigationBounds = [
  [jamaicaBounds[0] - 4.5, jamaicaBounds[1] - 3.5],
  [jamaicaBounds[2] + 4.5, jamaicaBounds[3] + 3.5]
] as const;

function getMapPadding() {
  if (window.innerWidth < 900) {
    return { top: 24, right: 24, bottom: 24, left: 24 };
  }

  return { top: 36, right: 36, bottom: 36, left: 36 };
}

function getSelectionPadding() {
  if (window.innerWidth < 900) {
    return { top: 40, right: 40, bottom: 40, left: 40 };
  }

  return { top: 56, right: 56, bottom: 56, left: 56 };
}

function getJamaicaFitBounds(summary: RiverSummary) {
  return [
    [summary.bounds[0], summary.bounds[1]],
    [summary.bounds[2], summary.bounds[3]]
  ] as const;
}

function getPresetFilter(presetId: string) {
  if (presetId === 'major') {
    return ['>=', ['get', 'lengthKm'], 5];
  }

  if (presetId === 'tributaries') {
    return ['<', ['get', 'lengthKm'], 2.5];
  }

  return true;
}

function getFeatureBounds(feature: RiverFeature) {
  let minLongitude = Infinity;
  let minLatitude = Infinity;
  let maxLongitude = -Infinity;
  let maxLatitude = -Infinity;

  const visit = ([longitude, latitude]: LngLat) => {
    if (longitude < minLongitude) minLongitude = longitude;
    if (latitude < minLatitude) minLatitude = latitude;
    if (longitude > maxLongitude) maxLongitude = longitude;
    if (latitude > maxLatitude) maxLatitude = latitude;
  };

  if (feature.geometry.type === 'LineString') {
    feature.geometry.coordinates.forEach(visit);
  } else {
    for (const line of feature.geometry.coordinates) {
      line.forEach(visit);
    }
  }

  return [
    [minLongitude, minLatitude],
    [maxLongitude, maxLatitude]
  ] as const;
}

function getRiverFeature(
  collection: RiverFeatureCollection | null,
  riverId: number | null
) {
  if (!collection || riverId === null) {
    return null;
  }

  return (
    collection.features.find(
      (feature) => feature.properties.riverId === riverId
    ) ?? null
  );
}

export default function App() {
  const mapRef = useRef<MapRef | null>(null);
  const hasFitBounds = useRef(false);
  const [activePresetId, setActivePresetId] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [riverData, setRiverData] = useState<RiverFeatureCollection | null>(null);
  const [summary, setSummary] = useState<RiverSummary | null>(null);
  const [hoveredRiverId, setHoveredRiverId] = useState<number | null>(null);
  const [selectedPopup, setSelectedPopup] = useState<PopupInfo | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [rivers, summaryData] = await Promise.all([
          getRiverData(),
          getRiverSummary()
        ]);

        if (cancelled) {
          return;
        }

        setRiverData(rivers);
        setSummary(summaryData);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'The river dataset could not be loaded.'
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedRiver = selectedPopup?.river ?? null;
  const selectedFeature = getRiverFeature(
    riverData,
    selectedPopup?.river.riverId ?? null
  );
  const highlightedRiverId = hoveredRiverId ?? selectedPopup?.river.riverId ?? -1;

  const resetJamaicaView = useCallback((duration: number) => {
    const map = mapRef.current?.getMap();

    if (!summary || !map) {
      return;
    }

    map.resize();
    map.fitBounds(getJamaicaFitBounds(summary), {
      duration,
      padding: getMapPadding()
    });
  }, [summary]);

  useEffect(() => {
    if (!summary || !isMapReady || hasFitBounds.current) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      resetJamaicaView(1200);
      hasFitBounds.current = true;
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isMapReady, resetJamaicaView, summary]);

  function focusJamaica() {
    resetJamaicaView(1000);
  }

  function focusSelection() {
    if (!selectedFeature || !mapRef.current) {
      return;
    }

    mapRef.current.fitBounds(getFeatureBounds(selectedFeature), {
      duration: 1000,
      padding: getSelectionPadding()
    });
  }

  function handleMapMove(event: MapLayerMouseEvent) {
    const feature = event.features?.[0] as RiverFeature | undefined;
    setHoveredRiverId(feature?.properties.riverId ?? null);

    const canvas = mapRef.current?.getCanvas();
    if (canvas) {
      canvas.style.cursor = feature ? 'pointer' : '';
    }
  }

  function handleMapClick(event: MapLayerMouseEvent) {
    const feature = event.features?.[0] as RiverFeature | undefined;

    if (!feature) {
      return;
    }

    setSelectedPopup({
      coordinates: [event.lngLat.lng, event.lngLat.lat],
      river: feature.properties
    });
  }

  return (
    <div className="app-shell">
      <RiverPanel
        activePresetId={activePresetId}
        error={error}
        isLoading={isLoading}
        onChoosePreset={setActivePresetId}
        onFocusJamaica={focusJamaica}
        onFocusSelection={focusSelection}
        selectedRiver={selectedRiver}
        summary={summary}
      />

      <div className="map-stage">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: jamaicaCenter[0],
            latitude: jamaicaCenter[1],
            zoom: 8
          }}
          maxBounds={jamaicaNavigationBounds}
          minZoom={5.8}
          renderWorldCopies={false}
          mapStyle={mapStyleUrl}
          interactiveLayerIds={['river-main']}
          onClick={handleMapClick}
          onLoad={() => {
            setIsMapReady(true);
          }}
          onMouseLeave={() => {
            setHoveredRiverId(null);
            const canvas = mapRef.current?.getCanvas();
            if (canvas) {
              canvas.style.cursor = '';
            }
          }}
          onMouseMove={handleMapMove}
        >
          <NavigationControl position="top-right" visualizePitch />
          <FullscreenControl position="top-right" />

          {riverData ? (
            <Source id="rivers" type="geojson" data={riverData}>
              <Layer {...riverGlowLayer} filter={getPresetFilter(activePresetId)} />
              <Layer {...riverMainLayer} filter={getPresetFilter(activePresetId)} />
              <Layer
                {...highlightHaloLayer}
                filter={['==', ['get', 'riverId'], highlightedRiverId]}
              />
              <Layer
                {...highlightLineLayer}
                filter={['==', ['get', 'riverId'], highlightedRiverId]}
              />
            </Source>
          ) : null}

          {selectedPopup ? (
            <Popup
              anchor="bottom"
              closeButton={false}
              closeOnClick={false}
              longitude={selectedPopup.coordinates[0]}
              latitude={selectedPopup.coordinates[1]}
              offset={18}
            >
              <div className="popup-card">
                <p className="popup-label">Selected segment</p>
                <h3>River ID {selectedPopup.river.riverId}</h3>
                <dl>
                  <div>
                    <dt>Segment</dt>
                    <dd>{selectedPopup.river.segmentNumber}</dd>
                  </div>
                  <div>
                    <dt>Length</dt>
                    <dd>{selectedPopup.river.lengthKm.toFixed(2)} km</dd>
                  </div>
                  <div>
                    <dt>ID code</dt>
                    <dd>{selectedPopup.river.idCode}</dd>
                  </div>
                </dl>
              </div>
            </Popup>
          ) : null}
        </Map>

        <div className="map-legend">
          <span>Short tributaries</span>
          <i />
          <strong>Long channels</strong>
        </div>
      </div>
    </div>
  );
}
