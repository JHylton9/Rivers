import type { RiverFeatureProperties, RiverSummary } from '../lib/api';
import { viewPresets } from '../lib/constants';

interface RiverPanelProps {
  activePresetId: string;
  error: string | null;
  isLoading: boolean;
  onChoosePreset: (presetId: string) => void;
  onFocusJamaica: () => void;
  onFocusSelection: () => void;
  selectedRiver: RiverFeatureProperties | null;
  summary: RiverSummary | null;
}

function formatLength(value: number) {
  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1
  })} km`;
}

export default function RiverPanel({
  activePresetId,
  error,
  isLoading,
  onChoosePreset,
  onFocusJamaica,
  onFocusSelection,
  selectedRiver,
  summary
}: RiverPanelProps) {
  return (
<<<<<<< Updated upstream
    <aside className="river-panel">
      <div className="panel-intro">
        <p className="eyebrow">Jamaica Hydrography</p>
        <h1>Interactive river network explorer</h1>
        <p className="lede">
          Explore reprojected river segments from the source shapefile, switch
          between network views, and inspect each segment's measured length.
        </p>
=======
    <>
      <aside className="panel-hero">
        <div className="panel-hero__inner">
          <div className="panel-intro">
            <p className="eyebrow">Jamaica Hydrography</p>
            <h1>Interactive river network explorer</h1>
            <p className="lede">
              Explore Jamaica&apos;s river network, switch between map views,
              and inspect individual segments across the island.
            </p>
          </div>
        </div>
      </aside>

      <div className="panel-ribbon" aria-label="Map controls and dataset panels">
        <section className="panel-section panel-section--presets ribbon-card">
          <div className="section-heading">
            <h2>View presets</h2>
            <button
              type="button"
              className="ghost-button panel-action"
              onClick={onFocusJamaica}
            >
              Reset view
            </button>
          </div>
          <div className="preset-list" role="tablist" aria-label="River views">
            {viewPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                role="tab"
                aria-selected={preset.id === activePresetId}
                className="preset-button panel-card-button"
                data-active={preset.id === activePresetId}
                onClick={() => onChoosePreset(preset.id)}
              >
                <span>{preset.label}</span>
                <small>{preset.description}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="panel-section panel-section--metrics ribbon-card">
          <h2>Dataset readout</h2>
          {isLoading ? (
            <p className="status-message">
              Loading river geometry and summary data...
            </p>
          ) : null}
          {error ? <p className="status-message error">{error}</p> : null}
          {summary ? (
            <dl className="stats-grid">
              <div>
                <dt>Segments</dt>
                <dd>{summary.featureCount.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Total length</dt>
                <dd>{formatLength(summary.totalLengthKm)}</dd>
              </div>
              <div>
                <dt>Average segment</dt>
                <dd>{formatLength(summary.averageLengthKm)}</dd>
              </div>
              <div>
                <dt>Longest segment</dt>
                <dd>{formatLength(summary.longestSegments[0]?.lengthKm ?? 0)}</dd>
              </div>
            </dl>
          ) : null}
        </section>

        <section className="panel-section panel-section--selection ribbon-card">
          <div className="section-heading">
            <h2>Selection</h2>
            <button
              type="button"
              className="ghost-button panel-action"
              onClick={onFocusSelection}
              disabled={!selectedRiver}
            >
              Focus segment
            </button>
          </div>
          {selectedRiver ? (
            <dl className="selection-grid">
              <div>
                <dt>River ID</dt>
                <dd>{selectedRiver.riverId}</dd>
              </div>
              <div>
                <dt>Segment no.</dt>
                <dd>{selectedRiver.segmentNumber}</dd>
              </div>
              <div>
                <dt>Length</dt>
                <dd>{formatLength(selectedRiver.lengthKm)}</dd>
              </div>
              <div>
                <dt>Node pair</dt>
                <dd>
                  {selectedRiver.fromNode} to {selectedRiver.toNode}
                </dd>
              </div>
              <div>
                <dt>ID code</dt>
                <dd>{selectedRiver.idCode}</dd>
              </div>
            </dl>
          ) : (
            <p className="status-message">
              Click a river segment on the framed map to inspect it here.
            </p>
          )}
        </section>

        {summary ? (
          <section className="panel-section panel-section--segments ribbon-card ribbon-card--segments">
            <h2>Longest sampled segments</h2>
            <ol className="segment-list">
              {summary.longestSegments.slice(0, 6).map((segment) => (
                <li key={segment.riverId}>
                  <span>
                    Segment {segment.segmentNumber}
                    <small>River ID {segment.riverId}</small>
                  </span>
                  <strong>{formatLength(segment.lengthKm)}</strong>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
>>>>>>> Stashed changes
      </div>

      <section className="panel-section panel-section--presets">
        <div className="section-heading">
          <h2>View presets</h2>
          <button
            type="button"
            className="ghost-button panel-action"
            onClick={onFocusJamaica}
          >
            Reset view
          </button>
        </div>
        <div className="preset-list" role="tablist" aria-label="River views">
          {viewPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              role="tab"
              aria-selected={preset.id === activePresetId}
              className="preset-button panel-card-button"
              data-active={preset.id === activePresetId}
              onClick={() => onChoosePreset(preset.id)}
            >
              <span>{preset.label}</span>
              <small>{preset.description}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="panel-section panel-section--metrics">
        <h2>Dataset readout</h2>
        {isLoading ? (
          <p className="status-message">Loading river geometry and summary data...</p>
        ) : null}
        {error ? <p className="status-message error">{error}</p> : null}
        {summary ? (
          <dl className="stats-grid">
            <div>
              <dt>Segments</dt>
              <dd>{summary.featureCount.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Total length</dt>
              <dd>{formatLength(summary.totalLengthKm)}</dd>
            </div>
            <div>
              <dt>Average segment</dt>
              <dd>{formatLength(summary.averageLengthKm)}</dd>
            </div>
            <div>
              <dt>Longest segment</dt>
              <dd>{formatLength(summary.longestSegments[0]?.lengthKm ?? 0)}</dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section className="panel-section panel-section--selection">
        <div className="section-heading">
          <h2>Selection</h2>
          <button
            type="button"
            className="ghost-button panel-action"
            onClick={onFocusSelection}
            disabled={!selectedRiver}
          >
            Focus segment
          </button>
        </div>
        {selectedRiver ? (
          <dl className="selection-grid">
            <div>
              <dt>River ID</dt>
              <dd>{selectedRiver.riverId}</dd>
            </div>
            <div>
              <dt>Segment no.</dt>
              <dd>{selectedRiver.segmentNumber}</dd>
            </div>
            <div>
              <dt>Length</dt>
              <dd>{formatLength(selectedRiver.lengthKm)}</dd>
            </div>
            <div>
              <dt>Node pair</dt>
              <dd>
                {selectedRiver.fromNode} to {selectedRiver.toNode}
              </dd>
            </div>
            <div>
              <dt>ID code</dt>
              <dd>{selectedRiver.idCode}</dd>
            </div>
          </dl>
        ) : (
          <p className="status-message">
            Click a river segment on the map to inspect it here.
          </p>
        )}
      </section>

      {summary ? (
        <section className="panel-section panel-section--segments">
          <h2>Longest sampled segments</h2>
          <ol className="segment-list">
            {summary.longestSegments.slice(0, 6).map((segment) => (
              <li key={segment.riverId}>
                <span>
                  Segment {segment.segmentNumber}
                  <small>River ID {segment.riverId}</small>
                </span>
                <strong>{formatLength(segment.lengthKm)}</strong>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </aside>
  );
}
