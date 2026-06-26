import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import proj4 from 'proj4';
import { open } from 'shapefile';

const projectRoot = resolve(import.meta.dirname, '..');
const sourceBase = resolve(projectRoot, '..', 'rivers');
const outputDir = resolve(projectRoot, 'public', 'data');
const outputGeoJson = join(outputDir, 'rivers.geojson');
const outputSummary = join(outputDir, 'rivers-summary.json');

const jamaicaGrid =
  '+proj=lcc +lat_1=18 +lat_0=18 +lon_0=-77 +k_0=1 +x_0=250000 +y_0=150000 +a=6378206.4 +rf=294.9786982 +units=m +no_defs';

function roundCoordinate(value) {
  return Number(value.toFixed(6));
}

function projectCoordinate([x, y]) {
  const [longitude, latitude] = proj4(jamaicaGrid, proj4.WGS84, [x, y]);
  return [roundCoordinate(longitude), roundCoordinate(latitude)];
}

function projectGeometry(geometry) {
  if (geometry.type === 'LineString') {
    return {
      type: 'LineString',
      coordinates: geometry.coordinates.map(projectCoordinate)
    };
  }

  return {
    type: 'MultiLineString',
    coordinates: geometry.coordinates.map((line) => line.map(projectCoordinate))
  };
}

function forEachCoordinate(geometry, iteratee) {
  if (geometry.type === 'LineString') {
    geometry.coordinates.forEach(iteratee);
    return;
  }

  for (const line of geometry.coordinates) {
    line.forEach(iteratee);
  }
}

function makeFeature(value) {
  return {
    type: 'Feature',
    properties: {
      fromNode: value.properties.FNODE_,
      idCode: value.properties.ID_CODE,
      lengthKm: Number((value.properties.LENGTH / 1000).toFixed(3)),
      lengthM: Number(value.properties.LENGTH.toFixed(3)),
      riverId: value.properties.RIVER_ID,
      segmentNumber: value.properties.RIVER_,
      toNode: value.properties.TNODE_
    },
    geometry: projectGeometry(value.geometry)
  };
}

function createEmptyBucketState() {
  return {
    under1km: 0,
    from1to2_5km: 0,
    from2_5to5km: 0,
    from5to10km: 0,
    over10km: 0
  };
}

async function main() {
  const source = await open(`${sourceBase}.shp`, `${sourceBase}.dbf`);
  const features = [];
  const longestSegments = [];
  const lengthBuckets = createEmptyBucketState();

  let minLongitude = Infinity;
  let minLatitude = Infinity;
  let maxLongitude = -Infinity;
  let maxLatitude = -Infinity;
  let totalLengthKm = 0;

  while (true) {
    const { done, value } = await source.read();

    if (done) {
      break;
    }

    const feature = makeFeature(value);
    features.push(feature);
    totalLengthKm += feature.properties.lengthKm;

    const { lengthKm } = feature.properties;
    if (lengthKm < 1) {
      lengthBuckets.under1km += 1;
    } else if (lengthKm < 2.5) {
      lengthBuckets.from1to2_5km += 1;
    } else if (lengthKm < 5) {
      lengthBuckets.from2_5to5km += 1;
    } else if (lengthKm < 10) {
      lengthBuckets.from5to10km += 1;
    } else {
      lengthBuckets.over10km += 1;
    }

    forEachCoordinate(feature.geometry, ([longitude, latitude]) => {
      if (longitude < minLongitude) minLongitude = longitude;
      if (latitude < minLatitude) minLatitude = latitude;
      if (longitude > maxLongitude) maxLongitude = longitude;
      if (latitude > maxLatitude) maxLatitude = latitude;
    });

    longestSegments.push({
      riverId: feature.properties.riverId,
      segmentNumber: feature.properties.segmentNumber,
      idCode: feature.properties.idCode,
      lengthKm: feature.properties.lengthKm
    });
  }

  longestSegments.sort((left, right) => right.lengthKm - left.lengthKm);

  const geoJson = {
    type: 'FeatureCollection',
    features
  };

  const summary = {
    generatedAt: new Date().toISOString(),
    sourceProjection: 'Jamaica Grid (Lambert Conformal Conic)',
    featureCount: features.length,
    totalLengthKm: Number(totalLengthKm.toFixed(3)),
    averageLengthKm: Number((totalLengthKm / features.length).toFixed(3)),
    bounds: [
      roundCoordinate(minLongitude),
      roundCoordinate(minLatitude),
      roundCoordinate(maxLongitude),
      roundCoordinate(maxLatitude)
    ],
    center: [
      roundCoordinate((minLongitude + maxLongitude) / 2),
      roundCoordinate((minLatitude + maxLatitude) / 2)
    ],
    lengthBuckets,
    longestSegments: longestSegments.slice(0, 12)
  };

  await mkdir(dirname(outputGeoJson), { recursive: true });
  await writeFile(outputGeoJson, `${JSON.stringify(geoJson)}\n`);
  await writeFile(outputSummary, `${JSON.stringify(summary, null, 2)}\n`);

  console.log(
    `Built river dataset with ${summary.featureCount} segments, ${summary.totalLengthKm} km total length.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
