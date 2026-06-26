export type LngLat = [number, number];

export interface RiverFeatureProperties {
  fromNode: number;
  idCode: number;
  lengthKm: number;
  lengthM: number;
  riverId: number;
  segmentNumber: number;
  toNode: number;
}

export interface RiverSummarySegment {
  idCode: number;
  lengthKm: number;
  riverId: number;
  segmentNumber: number;
}

export interface RiverSummary {
  averageLengthKm: number;
  bounds: [number, number, number, number];
  center: LngLat;
  featureCount: number;
  generatedAt: string;
  lengthBuckets: Record<string, number>;
  longestSegments: RiverSummarySegment[];
  sourceProjection: string;
  totalLengthKm: number;
}

export type RiverGeometry =
  | {
      type: 'LineString';
      coordinates: LngLat[];
    }
  | {
      type: 'MultiLineString';
      coordinates: LngLat[][];
    };

export interface RiverFeature {
  type: 'Feature';
  properties: RiverFeatureProperties;
  geometry: RiverGeometry;
}

export interface RiverFeatureCollection {
  type: 'FeatureCollection';
  features: RiverFeature[];
}

async function readJson<T>(path: string) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Unable to load ${path}.`);
  }

  return (await response.json()) as T;
}

export function getRiverData() {
  return readJson<RiverFeatureCollection>('/data/rivers.geojson');
}

export function getRiverSummary() {
  return readJson<RiverSummary>('/data/rivers-summary.json');
}
