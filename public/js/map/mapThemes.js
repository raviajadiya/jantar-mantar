// Jantar Mantar Map Profile & Configuration
const MAP_THEMES = {
  jantar: {
    id: 'jantar',
    name: 'Jantar Mantar',
    fullName: 'Jantar Mantar Observatory & Sanctuary',
    gujaratiName: 'જંતર મંતર વેધશાળા',
    hindiName: 'जंतर मंतर वेधशाला',
    layoutType: 'concentric_8',
    routeTitle: '5 Concentric Rings & 8 Radial Spokes',
    routeGujarati: '૫ વર્તુળાકાર રિંગ્સ અને ૮ રેડિયલ રસ્તા',
    tagline: 'Terracotta Sandstone • Ancient Sundials • Historic Protest Grounds',
    badge: 'HISTORIC CONCENTRIC MAZE',
    icon: '🏛️',
    accent: '#f59e0b',
    bgCanvas: '#e3dfd3',
    roadAsphalt: '#3d444d',
    curbColor: '#bfb5a2',
    roadMarking: '#f4ede2',
    centerGrass: '#4a7c3f',
    centerBorder: '#932d19',
    centerAura: 'rgba(245, 158, 11, 0.45)',
    blockColors: ['#eae2d3', '#f1f5f9', '#fed7aa', '#e2e8f0', '#fef08a', '#e2d9cc'],
    roofProps: 'tanks',
    shopNames: [
      'RAJU DHABA', 'SHIV DHABA', 'AGARWAL SWEETS', 'KUMAR MOBILE',
      'CYBER CAFE', 'CHOLE KULCHE', 'LASSI BHANDAR', 'VIP TAILORS',
      'PG FOR BOYS', 'JOSHI FLATS', 'SHARMA CHAI', 'DELHI SWEETS'
    ],
    stats: {
      difficulty: 'Balanced (સમાન)',
      routeType: '5 Concentric Loop Rings',
      atmosphere: 'Amber Terracotta Stone',
      victorySpot: 'Vrihat Samrat Yantra Sundial',
      cover: 'Alleyways & Chai Stalls'
    },
    spawnPoint: { x: 400, y: 1800 },
    flagLocations: [
      { id: 'f-j1', name: 'Sansad Marg Flag', x: 400, y: 1800, color: '#f59e0b' },
      { id: 'f-j2', name: 'Janpath Flag', x: 1800, y: 720, color: '#ef4444' },
      { id: 'f-j3', name: 'Barakhamba Flag', x: 2880, y: 1800, color: '#10b981' },
      { id: 'f-j4', name: 'Patel Chowk Flag', x: 1800, y: 2560, color: '#3b82f6' },
      { id: 'f-j5', name: 'Tolstoy Flag', x: 2337, y: 1263, color: '#ec4899' },
      { id: 'f-j6', name: 'Ashoka Flag', x: 1461, y: 2139, color: '#8b5cf6' }
    ],
    description: 'The classic astronomical observatory maze: 5 concentric circular rings intersected by 8 radial avenues leading to the central Samrat Yantra sundial sanctuary.'
  }
};

const MAP_LIST = [
  MAP_THEMES.jantar
];

if (typeof window !== 'undefined') {
  window.MAP_THEMES = MAP_THEMES;
  window.MAP_LIST = MAP_LIST;
}
