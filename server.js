const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Real Jantar Mantar & Delhi Architectural & Historical Landmark Data
const LANDMARKS = [
  {
    id: 'samrat-yantra',
    name: 'Vrihat Samrat Yantra (Supreme Instrument)',
    hindiName: 'बृहत् सम्राट यंत्र',
    type: 'astronomical',
    zone: 'jantar-mantar',
    x: 2400,
    y: 2500,
    width: 220,
    height: 180,
    description: 'The monumental 70-foot high equinoctial sundial gnomon pointing true North, with two enormous circular marble scale quadrants. Accurately measures local Delhi solar time to within 2 seconds.',
    historicalFact: 'Constructed by Maharaja Jai Singh II of Jaipur in 1724 AD. The triangular gnomon is inclined at 28°37\', exactly matching the latitude of Delhi.',
    gameRole: 'Core Golden Sanctuary Zone (The final victory gathering spot)'
  },
  {
    id: 'misra-yantra',
    name: 'Misra Yantra (Mixed Instrument)',
    hindiName: 'मिश्र यंत्र',
    type: 'astronomical',
    zone: 'jantar-mantar',
    x: 2700,
    y: 2360,
    width: 170,
    height: 150,
    description: 'Composite structure comprising five distinct astronomical instruments, featuring iconic terracotta double-curved arches. It indicated noon across various international observatories (Greenwich, Zurich, Notkey, Serichew).',
    historicalFact: 'Believed to have been added by Madho Singh, son of Jai Singh II. Its iconic facade is the most photographed symbol of Jantar Mantar.',
    gameRole: 'Secondary gathering point with high morale boost zone'
  },
  {
    id: 'jai-prakash-yantra',
    name: 'Jai Prakash Yantra',
    hindiName: 'जय प्रकाश यंत्र',
    type: 'astronomical',
    zone: 'jantar-mantar',
    x: 2220,
    y: 2680,
    width: 150,
    height: 120,
    description: 'Two sunken hemispherical marble bowls set into the ground with intersecting cross-wires at the focal point. Inverted celestial sphere projection.',
    historicalFact: 'One bowl acts as the complementary shadow of the other, allowing astronomers to walk inside along passageways without casting shadows on reading lines.',
    gameRole: 'Secret hiding spot where protesters can evade police detection'
  },
  {
    id: 'ram-yantra',
    name: 'Ram Yantra',
    hindiName: 'राम यंत्र',
    type: 'astronomical',
    zone: 'jantar-mantar',
    x: 2580,
    y: 2750,
    width: 160,
    height: 140,
    description: 'Two large cylindrical open-top stone structures with a central pillar and radial floor sectors used to measure celestial altitude and azimuth.',
    historicalFact: 'Each cylinder is split into 12 or 30 stone sectors alternating with empty spaces of equal width so observers could stand inside.',
    gameRole: 'Strategic fortress zone with 360-degree defense bonus'
  },
  {
    id: 'jm-main-gate',
    name: 'Jantar Mantar Heritage Gate & Ticket Complex',
    hindiName: 'जंतर मंतर मुख्य द्वार',
    type: 'entrance',
    zone: 'jantar-mantar',
    x: 2150,
    y: 2320,
    width: 120,
    height: 80,
    description: 'Sandstone archway entrance on Sansad Marg with ASI security check, ticket counter, visitor path, and palm garden.',
    historicalFact: 'UNESCO World Heritage Tentative List and protected national monument maintained by Archaeological Survey of India (ASI).',
    gameRole: 'Entrance boundary where protesters enter the protected heritage grounds'
  },
  {
    id: 'sansad-marg-dharna',
    name: 'Sansad Marg Dharna & Protest Hub',
    hindiName: 'संसद मार्ग धरना स्थल',
    type: 'protest_zone',
    zone: 'sansad-marg',
    x: 1850,
    y: 2280,
    width: 260,
    height: 160,
    description: 'The historic epicentre of Indian citizen protests, hunger strikes, and peaceful assemblies along Parliament Street.',
    historicalFact: 'From anti-corruption movements to farmers and government employee pension demands, this stretch has hosted India’s most pivotal peaceful gatherings.',
    gameRole: 'Primary staging ground with podium, loudspeakers, and media coverage'
  },
  {
    id: 'connaught-place',
    name: 'Connaught Place (Rajiv Chowk)',
    hindiName: 'कनॉट प्लेस (राजीव चौक)',
    type: 'landmark',
    zone: 'connaught-place',
    x: 800,
    y: 750,
    width: 500,
    height: 500,
    description: 'Colossal colonial Georgian-style colonnaded radial roundabout with Inner, Middle, and Outer Circle blocks radiating out like a wheel.',
    historicalFact: 'Designed by Robert Tor Russell and built between 1929 and 1933. Central Park at the core features Delhi’s highest 207-ft Indian Tricolor flag.',
    gameRole: 'Northern Starting Zone: High pedestrian density for rapid Kafila recruitment'
  },
  {
    id: 'police-hq-barricade',
    name: 'Sansad Marg Police Barricade & Checkpoint',
    hindiName: 'दिल्ली पुलिस बैरिकेड',
    type: 'security',
    zone: 'sansad-marg',
    x: 1450,
    y: 1650,
    width: 220,
    height: 100,
    description: 'Yellow and blue heavy iron Delhi Police barricades flanked by Rapid Action Force (RAF) riot vans and water cannons.',
    historicalFact: 'Permanent security perimeter regulating flow between Connaught Place and the Parliament House / North Block high-security corridor.',
    gameRole: 'Major roadblock requiring strategic diversion or large crowd power to bypass'
  },
  {
    id: 'patel-chowk-metro',
    name: 'Patel Chowk Metro Station',
    hindiName: 'पटेल चौक मेट्रो स्टेशन',
    type: 'transit',
    zone: 'transit',
    x: 1750,
    y: 2850,
    width: 140,
    height: 100,
    description: 'Yellow Line underground metro station housing the unique Delhi Metro Museum.',
    historicalFact: 'One of the busiest transit hubs in Central Delhi serving government office commuters and visitors to Jantar Mantar.',
    gameRole: 'Fast-travel and citizen spawn point with high influx of people'
  },
  {
    id: 'palika-bazaar',
    name: 'Palika Bazaar Underground Market',
    hindiName: 'पालिका बाज़ार',
    type: 'market',
    zone: 'connaught-place',
    x: 950,
    y: 1020,
    width: 180,
    height: 120,
    description: 'Underground air-conditioned marketplace located between the inner and outer circles of Connaught Place.',
    historicalFact: 'Built in the late 1970s, it was India’s first fully underground air-conditioned retail bazaar.',
    gameRole: 'Underground bypass route to evade street patrol'
  }
];

// Map metadata
const MAP_CONFIG = {
  worldWidth: 3600,
  worldHeight: 3600,
  scale: 1,
  startSpawn: { x: 750, y: 750, name: 'Connaught Place Central Park' },
  jantarMantarCenter: { x: 2450, y: 2550, name: 'Jantar Mantar Observatory' },
  zones: [
    { id: 'cp', name: 'Connaught Place Commercial Hub', bounds: { x1: 200, y1: 200, x2: 1400, y2: 1300 } },
    { id: 'sansad', name: 'Sansad Marg (Parliament Street) Corridor', bounds: { x1: 1100, y1: 1200, x2: 2100, y2: 2600 } },
    { id: 'jantar', name: 'Jantar Mantar Astronomical Heritage Complex', bounds: { x1: 2050, y1: 2150, x2: 3000, y2: 3100 } },
    { id: 'janpath', name: 'Janpath & Tolstoy Marg District', bounds: { x1: 2100, y1: 500, x2: 3300, y2: 2000 } }
  ]
};

// API Endpoints
app.get('/api/landmarks', (req, res) => {
  res.json({ success: true, count: LANDMARKS.length, data: LANDMARKS });
});

app.get('/api/map-config', (req, res) => {
  res.json({ success: true, data: MAP_CONFIG });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`★ Jantar Mantar 2.0 Server running on port ${PORT}`);
  console.log(`★ Open: http://localhost:${PORT}`);
  console.log(`===================================================`);
});
