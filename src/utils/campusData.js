// Campus area list. SAMPLE area names: replace them with the real places of your college.



export const HEATMAP_ZONES = [
  {
    id: 'zone-1',
    name: 'Central Plaza & Main Library Walk',
    status: 'safe', // safe | caution | unsafe
    levelText: 'Few student reports',
    lighting: 'Excellent (LED floodlights every 20m)',
    patrols: 'Campus Security station 50m away',
    reportsCount: 1,
    coordinates: { lat: 37.7749, lng: -122.4194 }
  },
  {
    id: 'zone-2',
    name: 'East Tree Grove & Old Greenhouse Path',
    status: 'caution',
    levelText: 'Some student reports',
    lighting: 'Moderate - 2 flickering lamp posts reported',
    patrols: 'Periodic bike patrol every 45 mins',
    reportsCount: 7,
    coordinates: { lat: 37.7765, lng: -122.416 }
  },
  {
    id: 'zone-3',
    name: 'South Boundary Alley & Gate 4 Construction',
    status: 'unsafe',
    levelText: 'Many student reports',
    lighting: 'Poor - Temporary construction barricade, dark blindspots',
    patrols: 'Infrequent patrol, high foliage obstruction',
    reportsCount: 19,
    coordinates: { lat: 37.7725, lng: -122.423 }
  },
  {
    id: 'zone-4',
    name: 'West Quad Sports Field Path',
    status: 'caution',
    levelText: 'Some student reports',
    lighting: 'Fair, perimeter lights operational',
    patrols: 'Security booth at north corner only',
    reportsCount: 9,
    coordinates: { lat: 37.778, lng: -122.421 }
  }
];


// Starts empty: only real student posts are shown.
export const INITIAL_COMMUNITY_ALERTS = [];

