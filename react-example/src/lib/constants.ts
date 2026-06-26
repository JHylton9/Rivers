export const jamaicaBounds = [
  -78.348454,
  17.757486,
  -76.196512,
  18.521657
] as const;

export const jamaicaCenter = [-77.272483, 18.139572] as const;

export const mapStyleUrl = 'https://tiles.openfreemap.org/styles/liberty';

export const viewPresets = [
  {
    id: 'all',
    label: 'Full network',
    description: 'View every mapped river segment across the island.'
  },
  {
    id: 'major',
    label: 'Major channels',
    description: 'Segments 5 km and longer for the island-wide spine.'
  },
  {
    id: 'tributaries',
    label: 'Tributaries',
    description: 'Shorter branches under 2.5 km, useful for dense areas.'
  }
] as const;
