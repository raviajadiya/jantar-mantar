// Jantar Mantar Map Profile & Configuration (Dark and Light Themes)
const JANTAR_COMMON_FLAGS = [
  { id: 'f-j1', name: 'Sansad Marg Flag', x: 400, y: 1800, color: '#f59e0b' },
  { id: 'f-j2', name: 'Janpath Flag', x: 1800, y: 720, color: '#ef4444' },
  { id: 'f-j3', name: 'Barakhamba Flag', x: 2880, y: 1800, color: '#10b981' },
  { id: 'f-j4', name: 'Patel Chowk Flag', x: 1800, y: 2560, color: '#3b82f6' },
  { id: 'f-j5', name: 'Tolstoy Flag', x: 2337, y: 1263, color: '#ec4899' },
  { id: 'f-j6', name: 'Ashoka Flag', x: 1461, y: 2139, color: '#8b5cf6' }
];

const JANTAR_COMMON_SHOPS = [
  'RAJU DHABA', 'SHIV DHABA', 'AGARWAL SWEETS', 'KUMAR MOBILE',
  'CYBER CAFE', 'CHOLE KULCHE', 'LASSI BHANDAR', 'VIP TAILORS',
  'PG FOR BOYS', 'JOSHI FLATS', 'SHARMA CHAI', 'DELHI SWEETS'
];

const MAP_THEMES = {
  // 1. Dark Theme (Midnight Slate Modern)
  jantar_dark: {
    id: 'jantar_dark',
    mode: 'dark',
    name: 'Jantar Mantar (Dark Mode)',
    fullName: 'Jantar Mantar Observatory & Sanctuary',
    hindiName: 'जंतर मंतर वेधशाला',
    layoutType: 'concentric_8',
    routeTitle: '5 Concentric Rings & 16 Radial Avenues',
    tagline: 'Deep Midnight Slate • Luminous Flashlights • Tactical Stealth',
    badge: 'HISTORIC CONCENTRIC MAZE',
    icon: '🌙',
    accent: '#f59e0b',
    bgCanvas: '#0b1120', // Sleek deep midnight slate background
    roadAsphalt: '#1e293b', // Modern smooth dark asphalt
    curbColor: '#334155', // Crisp sidewalk separation curb
    roadMarking: '#f8fafc', // Crisp bright white lane markings
    centerGrass: '#15803d', // Lush emerald sanctuary lawn
    centerBorder: '#ea580c', // Warm vibrant terracotta sandstone
    centerAura: 'rgba(245, 158, 11, 0.60)',
    blockColors: ['#162032', '#1a273e', '#131d2e', '#192539', '#1c2b42', '#152135'], // Architectural sectors
    blockBorder: '#2d3d54',
    blockShadow: 'rgba(0, 0, 0, 0.45)',
    roofProps: 'tanks',
    shopNames: JANTAR_COMMON_SHOPS,
    stats: {
      difficulty: 'Balanced',
      routeType: '5 Concentric Loop Rings',
      atmosphere: 'Deep Midnight Slate',
      victorySpot: 'Vrihat Samrat Yantra Sundial',
      cover: 'Alleyways & Chai Stalls'
    },
    spawnPoint: { x: 400, y: 1800 },
    flagLocations: JANTAR_COMMON_FLAGS,
    description: 'Astronomical observatory maze in sleek dark mode with high contrast streets.'
  },

  // 2. Light Theme (Heritage White Sandstone)
  jantar_light: {
    id: 'jantar_light',
    mode: 'light',
    name: 'Jantar Mantar (Light Mode)',
    fullName: 'Jantar Mantar Observatory & Sanctuary',
    hindiName: 'जंतर मंतर वेधशाला',
    layoutType: 'concentric_8',
    routeTitle: '5 Concentric Rings & 16 Radial Avenues',
    tagline: 'Terracotta Sandstone • Ancient Sundials • Historic Protest Grounds',
    badge: 'HISTORIC CONCENTRIC MAZE',
    icon: '☀️',
    accent: '#d97706',
    bgCanvas: '#e3dfd3', // Previous sandstone / light ground
    roadAsphalt: '#3d444d', // Previous grey road
    curbColor: '#bfb5a2', // Previous stone curb
    roadMarking: '#f4ede2', // Previous cream marking
    centerGrass: '#4a7c3f', // Previous lawn
    centerBorder: '#932d19', // Previous dark terracotta
    centerAura: 'rgba(245, 158, 11, 0.45)',
    blockColors: ['#eae2d3', '#f1f5f9', '#fed7aa', '#e2e8f0', '#fef08a', '#e2d9cc'], // Previous light blocks
    blockBorder: '#94a3b8',
    blockShadow: 'rgba(0, 0, 0, 0.22)',
    roofProps: 'tanks',
    shopNames: JANTAR_COMMON_SHOPS,
    stats: {
      difficulty: 'Balanced',
      routeType: '5 Concentric Loop Rings',
      atmosphere: 'Amber Terracotta Stone',
      victorySpot: 'Vrihat Samrat Yantra Sundial',
      cover: 'Alleyways & Chai Stalls'
    },
    spawnPoint: { x: 400, y: 1800 },
    flagLocations: JANTAR_COMMON_FLAGS,
    description: 'The classic astronomical observatory maze with warm sandstone and white city blocks.'
  }
};

// Convenient aliases
MAP_THEMES.jantar = MAP_THEMES.jantar_dark;
MAP_THEMES.dark = MAP_THEMES.jantar_dark;
MAP_THEMES.light = MAP_THEMES.jantar_light;

const MAP_LIST = [
  MAP_THEMES.jantar_dark,
  MAP_THEMES.jantar_light
];

if (typeof window !== 'undefined') {
  window.MAP_THEMES = MAP_THEMES;
  window.MAP_LIST = MAP_LIST;
}
