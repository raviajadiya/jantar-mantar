# Jantar Mantar 2.0 - Realistic Delhi 2D Map & Protest Engine 🏛️🇮🇳

A rich 2D top-down game and architectural map engine built with **Node.js (Express)** and **HTML5 Canvas**, modeled faithfully on the real **Jantar Mantar (New Delhi)**, **Sansad Marg (Parliament Street)**, and **Connaught Place (Rajiv Chowk)** inspired by the satirical game *Jantar Mantar Chalo*.

---

## 🌟 Key Features & Realistic Map Design

### 1. 🏛️ Real Jantar Mantar Astronomical Heritage Complex
Faithfully rendered 18th-century masonry instruments built by Maharaja Jai Singh II of Jaipur (1724 AD):
- **Vrihat Samrat Yantra (Supreme Instrument)**: 
  - Massive 70-foot triangular gnomon ramp aligned to true North-South at Delhi's true geographic latitude (28°37').
  - Two giant curved marble quadrant scales (East & West) with degree/hour marks.
  - Realistic dynamic solar shadow casting based on the sun angle!
- **Misra Yantra (Mixed Instrument)**:
  - Iconic double-curved heart-shaped terracotta arch facade indicating noon across world observatories.
- **Jai Prakash Yantra**:
  - Twin sunken hemispherical white marble bowls with crosswires mapping celestial coordinates.
- **Ram Yantra**:
  - Dual open-top cylindrical stone towers with central pillars and 12 radial sectors.
- **Shasthamsa & Digamsa Yantras**, heritage red sandstone walls, palm gardens, stone walkways, and the ASI ticket gate.

### 2. 🪧 Sansad Marg (Parliament Street) Protest Zone
- Located right outside the Jantar Mantar complex gate on Sansad Marg.
- **Anshan Manch (Protest Dais)**: Striped canopy shamiana with microphones, loudspeakers, and *"PURANI PENSION BAHAL KARO"* banners.
- **Dharna Sitting Carpets**: Protesters seated on carpets holding placards.
- **Media Hub**: TV Broadcast OB vans with revolving rooftop satellite dishes (*Delhi TV 24*, *ANI News*).
- **Delhi Police Barricades**: Yellow-and-blue heavy iron frames with bold *"DELHI POLICE"* markings and checkpoints.
- **Police Emergency Vehicles**: Heavy *Vajra* anti-riot water-cannon truck with flashing red/blue beacons.

### 3. ⭕ Connaught Place (Rajiv Chowk)
- Concentric Georgian colonnaded circular blocks (Outer, Middle, and Inner Circle).
- **Central Park**: Green core featuring the waving 207-ft Indian Tricolor (Tiranga) flag.
- Radial avenues shooting outward connecting to Sansad Marg, Janpath, and Barakhamba.
- Rajiv Chowk & Patel Chowk Delhi Metro station entrances.

### 4. 🏙️ Authentic Delhi Street Culture
- **Dhabas & Stalls**: *Raju Dhaba*, *Shiv Dhaba*, *Agarwal Sweets*, *Kumar Mobile & Xerox*, *Cyber Cafe*, *Chole Kulche Corner*.
- **Rooftop Details**: Black Sintex water tanks, split AC compressors, colorful festive bunting (*jhandiya*).
- **Delhi Transit**: Green low-floor DTC buses at bus shelters, yellow-and-green CNG auto-rickshaws cruising along Sansad Marg.
- Monkeys playing on walls and trees!

---

## 🎮 Game Controls & Modes

- **🚶 Walk Mode (Aam Aadmi)**:
  - Point and left-click anywhere to walk.
  - Hold **Right-Click** to run fast.
  - Walk into roaming citizens to recruit them into your **Kafila** (followers trail behind smoothly in a snake queue).
  - Dynamic **Orange Arrow** at bottom points directly towards Jantar Mantar with real-time distance (*"Jantar Mantar - 0.7 km"*).
  - Avoid patrolling Delhi Police officers who will detain followers!

- **🗺️ Map Explorer Mode**:
  - Drag mouse to pan across the 3600x3600 Delhi map.
  - Use **Mouse Wheel** to zoom in (up to 2.4x detail) and zoom out (0.35x macro view).
  - Use **WASD** or **Arrow Keys** to glide the camera.
  - Click any instrument or landmark to open the **Landmark Inspector Modal** with historical facts, astronomy details, and instant teleportation.

- **🎨 View Modes**:
  - **☀️ Delhi Day**: Vibrant daylight with dynamic gnomon sun shadows.
  - **🌙 Dilli Night**: Atmospheric night overlay with glowing street lamps, dharna halogen floodlights, and police beacon lights.
  - **📐 Blueprint Mode**: Architectural blueprint view with coordinate grids and technical annotations.

- **📡 DILLI MAP (Minimap Radar)**:
  - Bottom-right minimap showing CP circles, Sansad Marg corridor, Jantar Mantar gold star, green player dot, and red police dots.
  - Click anywhere on the minimap to instantly navigate there!

---

## 🚀 Running the Project

1. Run directly with Node.js:
   ```bash
   node server.js
   ```
   Or double-click `start.bat`.

2. Open your browser:
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

```
c:\ravi\jantar mantar 2.0\
├── server.js                   # Node.js Express server & REST API
├── package.json                # Project dependencies & start script
├── start.bat                   # 1-click launcher for Windows
├── public/
│   ├── index.html              # Main HTML5 viewport & HUD structure
│   ├── css/
│   │   └── main.css            # Rich aesthetic glassmorphism & HUD CSS
│   └── js/
│       ├── config.js           # Coordinates, architectural dimensions, & headlines
│       ├── main.js             # Application coordinator & render loop
│       ├── engine/
│       │   ├── camera.js       # 2D camera with zoom, pan, lerp & bounds
│       │   └── input.js        # Mouse drag, wheel zoom, keys & clicks
│       ├── map/
│       │   ├── jantarMantarDraw.js # Procedural architectural rendering of instruments
│       │   ├── delhiCityDraw.js    # CP circles, Sansad Marg, buildings & dharna hub
│       │   └── minimap.js          # Interactive "DILLI MAP" radar
│       ├── entities/
│       │   ├── player.js       # Aam Aadmi character & Kafila snake chain
│       │   └── npcManager.js   # Citizens, police AI, autos & monkeys
│       └── ui/
│           ├── hud.js          # Tasks, timer, navigation arrow & news ticker
│           └── landmarkModal.js # Monument scientific & historical modal
```
