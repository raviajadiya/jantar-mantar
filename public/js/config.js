// CanvasRenderingContext2D roundRect polyfill for full cross-browser and WebView compatibility
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii = 0) {
    if (typeof radii === 'number') radii = [radii, radii, radii, radii];
    else if (!Array.isArray(radii)) radii = [0, 0, 0, 0];
    const tl = radii[0] || 0;
    const tr = radii[1] || tl;
    const br = radii[2] || tl;
    const bl = radii[3] || tr;
    this.beginPath();
    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + tr);
    this.lineTo(x + w, y + h - br);
    this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    this.lineTo(x + bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - bl);
    this.lineTo(x, y + tl);
    this.quadraticCurveTo(x, y, x + tl, y);
    this.closePath();
    return this;
  };
}

// Jantar Mantar 2.0 - Circular Road Network & Game Configuration
const CONFIG = {
  world: {
    width: 3600,
    height: 3600,
    center: { x: 1800, y: 1800 },
    roadWidth: 90, // Wide street corridor
    bgColor: '#0b1120', // Modern deep midnight background
    gridSize: 50
  },

  // Concentric Circular Road System
  circularLayout: {
    center: { x: 1800, y: 1800 },
    // Concentric rings from center to outer perimeter
    rings: [
      { id: 'ring-0', radius: 240, name: 'Jantar Mantar Heritage Circle (Center Sanctuary)', speedLimit: 1 },
      { id: 'ring-1', radius: 480, name: 'Inner Circular Avenue (Parikrama Marg)', speedLimit: 1 },
      { id: 'ring-2', radius: 760, name: 'Middle Circular Road (Sansad Vithi)', speedLimit: 1 },
      { id: 'ring-3', radius: 1080, name: 'Outer Radial Circular Road (Rajiv Ring)', speedLimit: 1 },
      { id: 'ring-4', radius: 1400, name: 'Perimeter Boulevard (Dilli Border Ring)', speedLimit: 1 }
    ],
    // 16 Radial Avenues: 8 Main avenues (Center to Rim) + 8 Intermediate Avenues (Ring 2 to Rim)
    radialAvenues: [
      { id: 'rad-north', angle: -Math.PI / 2, name: 'Janpath North Avenue', connects: [0, 1, 2, 3, 4], isMain: true },
      { id: 'rad-inter-1', angle: -(3 * Math.PI) / 8, name: 'Janpath-Tolstoy Connector', connects: [2, 3, 4], isMain: false },
      { id: 'rad-ne', angle: -Math.PI / 4, name: 'Tolstoy Marg (North-East)', connects: [0, 1, 2, 3, 4], isMain: true },
      { id: 'rad-inter-2', angle: -Math.PI / 8, name: 'Tolstoy-Barakhamba Link', connects: [2, 3, 4], isMain: false },
      { id: 'rad-east', angle: 0, name: 'Barakhamba Road (East)', connects: [0, 1, 2, 3, 4], isMain: true },
      { id: 'rad-inter-3', angle: Math.PI / 8, name: 'Barakhamba-KG Connector', connects: [2, 3, 4], isMain: false },
      { id: 'rad-se', angle: Math.PI / 4, name: 'Kasturba Gandhi Marg (South-East)', connects: [0, 1, 2, 3, 4], isMain: true },
      { id: 'rad-inter-4', angle: (3 * Math.PI) / 8, name: 'KG-Patel Link', connects: [2, 3, 4], isMain: false },
      { id: 'rad-south', angle: Math.PI / 2, name: 'Patel Chowk Avenue (South)', connects: [0, 1, 2, 3, 4], isMain: true },
      { id: 'rad-inter-5', angle: (5 * Math.PI) / 8, name: 'Patel-Ashoka Link', connects: [2, 3, 4], isMain: false },
      { id: 'rad-sw', angle: (3 * Math.PI) / 4, name: 'Ashoka Road (South-West)', connects: [0, 1, 2, 3, 4], isMain: true },
      { id: 'rad-inter-6', angle: (7 * Math.PI) / 8, name: 'Ashoka-Sansad Link', connects: [2, 3, 4], isMain: false },
      { id: 'rad-west', angle: Math.PI, name: 'Sansad Marg (Parliament Street - West)', connects: [0, 1, 2, 3, 4], isMain: true },
      { id: 'rad-inter-7', angle: -(7 * Math.PI) / 8, name: 'Sansad-BKS Link', connects: [2, 3, 4], isMain: false },
      { id: 'rad-nw', angle: -(3 * Math.PI) / 4, name: 'Baba Kharak Singh Marg (North-West)', connects: [0, 1, 2, 3, 4], isMain: true },
      { id: 'rad-inter-8', angle: -(5 * Math.PI) / 8, name: 'BKS-Janpath Link', connects: [2, 3, 4], isMain: false }
    ]
  },

  // Flags to Collect across different roads before entering Center
  flagLocations: [
    { id: 'flag-1', ringIndex: 4, radialIndex: 12, label: 'Sansad Marg Flag', name: 'Purani Pension Flag', color: '#f59e0b' },
    { id: 'flag-2', ringIndex: 3, radialIndex: 0, label: 'Janpath Flag', name: 'Inquilab Flag', color: '#ef4444' },
    { id: 'flag-3', ringIndex: 3, radialIndex: 4, label: 'Barakhamba Flag', name: 'Rozgar Do Flag', color: '#10b981' },
    { id: 'flag-4', ringIndex: 2, radialIndex: 8, label: 'Patel Chowk Flag', name: 'Kisan Ekta Flag', color: '#3b82f6' },
    { id: 'flag-5', ringIndex: 2, radialIndex: 2, label: 'Tolstoy Flag', name: 'Save Democracy Flag', color: '#ec4899' },
    { id: 'flag-6', ringIndex: 1, radialIndex: 10, label: 'Ashoka Flag', name: 'Constitution Flag', color: '#8b5cf6' }
  ],

  // Real Jantar Mantar Instruments at the CENTER of the map (x: 1800, y: 1800)
  centerJantarMantar: {
    center: { x: 1800, y: 1800 },
    radius: 240,
    samratYantra: {
      x: 1800,
      y: 1800,
      gnomonLength: 150,
      gnomonWidth: 28,
      quadrantRadius: 90,
      name: 'Vrihat Samrat Yantra (Supreme Instrument)',
      hindi: 'बृहत् सम्राट यंत्र'
    },
    misraYantra: {
      x: 1910,
      y: 1730,
      w: 80,
      h: 60,
      name: 'Misra Yantra',
      hindi: 'मिश्र यंत्र'
    },
    jaiPrakashYantra: {
      bowl1: { x: 1710, y: 1870, radius: 28 },
      bowl2: { x: 1760, y: 1890, radius: 28 },
      name: 'Jai Prakash Yantra',
      hindi: 'जय प्रकाश यंत्र'
    },
    ramYantra: {
      tower1: { x: 1880, y: 1880, radius: 32 },
      name: 'Ram Yantra',
      hindi: 'राम यंत्र'
    },
    protestStage: {
      x: 1750,
      y: 1680,
      w: 100,
      h: 50,
      name: 'Anshan Manch (Central Dharna Dais)'
    }
  },

  // Color Palette
  colors: {
    asphalt: '#1e293b',
    asphaltBorder: '#0f172a',
    roadMarking: '#f8fafc',
    footpath: '#334155',
    buildingBase: '#162032',
    buildingRoof: '#1a273e',
    curb: '#2d3d54',
    sintexBlack: '#0f172a',
    
    // Jantar Mantar
    jmSandstone: '#ea580c',
    jmSandstoneDark: '#c2410c',
    jmSandstoneLight: '#f97316',
    jmMarble: '#f8fafc',
    jmGrass: '#15803d',
    jmGrassDark: '#166534',
    
    // Police
    policeKhaki: '#b49f7d',
    policeCap: '#1e3a8a',
    policeVisionCone: 'rgba(239, 68, 68, 0.18)',
    policeWarningCone: 'rgba(245, 158, 11, 0.22)',
    
    // Protester
    protesterGold: '#f59e0b',
    protesterGreen: '#16a34a',
    targetRing: '#f97316'
  },

  // Delhi Satirical News Marquee
  newsHeadlines: [
    "🚩 MISSION: All 6 protest flags must be collected on Delhi's circular roads before reaching Jantar Mantar!",
    "⚠️ POLICE WARNING: Delhi Police patrolling circular roads; stay out of their red vision cone!",
    "🏃 TIP: If police spot you, break line-of-sight and sprint onto another radial road to lose them!",
    "🏛️ JANTAR MANTAR CENTER: Reach the Samrat Yantra sundial with all flags to achieve victory!",
    "☕ DELHI DIARY: Raju Dhaba on Outer Ring is serving cutting chai to escaping protesters",
    "📢 DHARNA UPDATE: Section 144 imposed on Ring 3; protesters taking Ring 2 detour"
  ]
};

if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
