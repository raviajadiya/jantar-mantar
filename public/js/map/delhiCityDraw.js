// Delhi City & Sansad Marg Dharna Zone 2D Canvas Engine
class DelhiCityDrawer {
  constructor(ctx, config) {
    this.ctx = ctx;
    this.config = config;
    this.c = config.colors;
    this.protestZone = config.landmarks.protestZone;
    this.cp = config.landmarks.connaughtPlace;
    this.animTime = 0;
  }

  draw(mapMode = 'standard', deltaTime = 0.016) {
    this.animTime += deltaTime;
    const ctx = this.ctx;

    // 1. Street Grid & Sansad Marg Corridor
    this.drawRoadNetwork(mapMode);

    // 2. Connaught Place (Rajiv Chowk) Radial Circles & Central Park
    this.drawConnaughtPlace(mapMode);

    // 3. Sansad Marg Protest Hub & Dharna Staging Grounds
    this.drawProtestHub(mapMode);

    // 4. Delhi Police Barricades & Security Posts
    this.drawPoliceBarricades(mapMode);

    // 5. Delhi Buildings, DDA Flats, & Authentic Shopfronts
    this.drawDelhiBuildings(mapMode);

    // 6. Metro Entrances & Bus Shelters
    this.drawTransitInfrastructure(mapMode);
  }

  // Draw roads connecting CP to Sansad Marg & Jantar Mantar
  drawRoadNetwork(mapMode) {
    const ctx = this.ctx;
    const isBp = mapMode === 'blueprint';

    ctx.save();
    ctx.fillStyle = isBp ? '#0f172a' : this.c.asphalt;
    ctx.strokeStyle = isBp ? '#0284c7' : this.c.footpath;

    // A. Sansad Marg (Parliament Street) - Diagonal / curved avenue from CP to Jantar Mantar
    // Road corridor from (950, 950) down to (2100, 2400)
    ctx.lineWidth = 140; // Wide 4-lane Delhi avenue
    ctx.beginPath();
    ctx.moveTo(900, 900);
    ctx.lineTo(1450, 1500);
    ctx.lineTo(1850, 2100);
    ctx.lineTo(2100, 2350);
    ctx.lineTo(2100, 3100); // Continues south past Jantar Mantar to Patel Chowk
    ctx.stroke();

    // Road surface
    ctx.lineWidth = 120;
    ctx.strokeStyle = isBp ? '#1e293b' : this.c.asphalt;
    ctx.stroke();

    // B. Janpath Road (Parallel avenue heading south)
    ctx.lineWidth = 100;
    ctx.beginPath();
    ctx.moveTo(1250, 850);
    ctx.lineTo(2300, 1650);
    ctx.lineTo(2850, 2050);
    ctx.stroke();

    // C. Tolstoy Marg (Cross avenue intersecting Sansad Marg)
    ctx.lineWidth = 90;
    ctx.beginPath();
    ctx.moveTo(1100, 2100);
    ctx.lineTo(2600, 1600);
    ctx.stroke();

    // D. Lane Markings (White dashed center lines)
    if (!isBp) {
      ctx.strokeStyle = this.c.asphaltMarking;
      ctx.lineWidth = 3;
      ctx.setLineDash([20, 16]);

      ctx.beginPath();
      ctx.moveTo(900, 900);
      ctx.lineTo(1450, 1500);
      ctx.lineTo(1850, 2100);
      ctx.lineTo(2100, 2350);
      ctx.lineTo(2100, 3100);
      ctx.stroke();

      ctx.setLineDash([]); // Reset dash

      // Zebra Crossings near Jantar Mantar Gate and CP
      this.drawZebraCrossing(1850, 2120, 100, 30, Math.PI / 4);
      this.drawZebraCrossing(2080, 2260, 100, 30, 0);
    }

    ctx.restore();
  }

  drawZebraCrossing(x, y, w, h, angle) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = '#ffffff';

    for (let i = -w / 2; i < w / 2; i += 16) {
      ctx.fillRect(i, -h / 2, 8, h);
    }
    ctx.restore();
  }

  // Connaught Place (Rajiv Chowk) Radial Circle & Central Park
  drawConnaughtPlace(mapMode) {
    const ctx = this.ctx;
    const cp = this.cp;
    const isBp = mapMode === 'blueprint';

    ctx.save();

    // 1. Outer Circle Road
    ctx.strokeStyle = isBp ? '#0284c7' : this.c.asphalt;
    ctx.lineWidth = 60;
    ctx.beginPath();
    ctx.arc(cp.center.x, cp.center.y, cp.outerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Colonnaded Blocks between Outer & Middle circle
    if (!isBp) {
      ctx.fillStyle = '#ffffff'; // Iconic white Georgian pillars
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;

      // 12 Colonial Blocks (A Block, B Block, etc.)
      const blocks = 12;
      for (let i = 0; i < blocks; i++) {
        const startA = (i * Math.PI * 2) / blocks + 0.08;
        const endA = ((i + 1) * Math.PI * 2) / blocks - 0.08;

        ctx.beginPath();
        ctx.arc(cp.center.x, cp.center.y, cp.outerRadius - 40, startA, endA);
        ctx.arc(cp.center.x, cp.center.y, cp.middleRadius + 40, endA, startA, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // 3. Middle Circle Road
    ctx.strokeStyle = isBp ? '#0284c7' : this.c.asphalt;
    ctx.lineWidth = 44;
    ctx.beginPath();
    ctx.arc(cp.center.x, cp.center.y, cp.middleRadius, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Inner Circle Road
    ctx.lineWidth = 40;
    ctx.beginPath();
    ctx.arc(cp.center.x, cp.center.y, cp.innerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // 5. Central Park (Green Core of CP)
    ctx.fillStyle = isBp ? '#0c4a6e' : '#4d7c0f';
    ctx.beginPath();
    ctx.arc(cp.center.x, cp.center.y, cp.centralParkRadius, 0, Math.PI * 2);
    ctx.fill();

    // Inner garden paths
    if (!isBp) {
      ctx.fillStyle = '#e2d7c3';
      ctx.beginPath();
      ctx.arc(cp.center.x, cp.center.y, 35, 0, Math.PI * 2);
      ctx.fill();

      // Walking tracks radiating out
      ctx.strokeStyle = '#e2d7c3';
      ctx.lineWidth = 8;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.moveTo(cp.center.x, cp.center.y);
        ctx.lineTo(cp.center.x + Math.cos(a) * cp.centralParkRadius, cp.center.y + Math.sin(a) * cp.centralParkRadius);
        ctx.stroke();
      }

      // Monumental 207-ft Indian Tricolor Flag
      this.drawIndianFlag(cp.center.x, cp.center.y);
    }

    // Label
    ctx.fillStyle = isBp ? '#38bdf8' : '#0f172a';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CONNAUGHT PLACE (RAJIV CHOWK)', cp.center.x, cp.center.y - cp.outerRadius - 20);

    ctx.restore();
  }

  // Giant 207-ft Tiranga Flag waving in Central Park
  drawIndianFlag(x, y) {
    const ctx = this.ctx;
    ctx.save();

    // Base podium
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Flagpole
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x - 2, y - 28, 4, 30);

    // Animated Tiranga banner
    const flagW = 42;
    const flagH = 24;
    const wave = Math.sin(this.animTime * 4) * 4;

    const fx = x + 2;
    const fy = y - 28;

    // Saffron top band
    ctx.fillStyle = '#ff9933';
    ctx.fillRect(fx, fy, flagW + wave, flagH / 3);

    // White middle band
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx, fy + flagH / 3, flagW + wave, flagH / 3);

    // Green bottom band
    ctx.fillStyle = '#138808';
    ctx.fillRect(fx, fy + (flagH / 3) * 2, flagW + wave, flagH / 3);

    // Ashoka Chakra (Navy blue 24-spoke wheel)
    ctx.strokeStyle = '#000080';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(fx + flagW / 2, fy + flagH / 2, 3.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // The Famous Sansad Marg Dharna & Protest Staging Grounds
  drawProtestHub(mapMode) {
    const ctx = this.ctx;
    const pz = this.protestZone;
    const isBp = mapMode === 'blueprint';

    ctx.save();

    // 1. Dharna Ground Area Marking
    ctx.fillStyle = isBp ? 'rgba(56, 189, 248, 0.1)' : 'rgba(245, 158, 11, 0.15)';
    ctx.strokeStyle = isBp ? '#38bdf8' : '#d97706';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);

    ctx.beginPath();
    ctx.roundRect(pz.bounds.x, pz.bounds.y, pz.bounds.w, pz.bounds.h, 16);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Large Protest Dais / Stage (Shamiana Tent)
    const st = pz.stage;
    // Striped canopy roof (Orange & White or Green & White)
    const stripes = 8;
    const stripeW = st.w / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#f97316' : '#ffffff';
      ctx.fillRect(st.x + i * stripeW, st.y, stripeW, st.h);
    }
    // Canopy border & ropes
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 3;
    ctx.strokeRect(st.x, st.y, st.w, st.h);

    // Front stage banner: "PURANI PENSION BAHAL KARO!" / "SAVE DEMOCRACY"
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(st.x - 10, st.y + st.h - 14, st.w + 20, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ PURANI PENSION BAHAL KARO ★', st.x + st.w / 2, st.y + st.h - 1);

    // Speaker podium & microphones
    ctx.fillStyle = '#78350f';
    ctx.fillRect(st.x + st.w / 2 - 10, st.y + st.h / 2, 20, 16);
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(st.x + st.w / 2, st.y + st.h / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // 3. Sitting Dharna Carpets (Dari / Durrie)
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(st.x + 10, st.y + st.h + 16, 70, 40);
    // Carpet patterns
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(st.x + 14, st.y + st.h + 20, 62, 32);

    // 4. Media OB Vans with revolving satellite dish
    const mv = pz.mediaCorner;
    this.drawMediaOBVan(mv.x, mv.y, 'DELHI TV 24');
    this.drawMediaOBVan(mv.x + 85, mv.y - 10, 'ANI NEWS');

    ctx.restore();
  }

  // Draw TV Media Broadcast Van with dish antenna
  drawMediaOBVan(x, y, channel) {
    const ctx = this.ctx;
    ctx.save();

    // Van Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.roundRect(x + 5, y + 5, 60, 32, 6);
    ctx.fill();

    // Van Body
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, 60, 32, 6);
    ctx.fill();
    ctx.stroke();

    // Windshield & side windows
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 46, y + 4, 10, 24);
    ctx.fillRect(x + 12, y + 4, 28, 6);
    ctx.fillRect(x + 12, y + 22, 28, 6);

    // Rooftop Satellite Dish (Revolving)
    const dishAngle = this.animTime * 1.5;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + 24, y + 16, 10, dishAngle, dishAngle + Math.PI);
    ctx.stroke();

    // Channel Decal
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(channel, x + 28, y + 20);

    ctx.restore();
  }

  // Authentic Delhi Police Yellow & Blue Barricades
  drawPoliceBarricades(mapMode) {
    const ctx = this.ctx;
    const isBp = mapMode === 'blueprint';

    // Barricade positions forming choke points on Sansad Marg
    const barricades = [
      { x: 1720, y: 2130, angle: 0.2 },
      { x: 1780, y: 2150, angle: 0.2 },
      { x: 1840, y: 2170, angle: 0.2 },
      { x: 1980, y: 2200, angle: -0.1 },
      { x: 2040, y: 2210, angle: -0.1 },
      { x: 1550, y: 1650, angle: 0.8 },
      { x: 1590, y: 1700, angle: 0.8 }
    ];

    barricades.forEach(b => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);

      // Yellow & Blue striped steel frame
      const bw = 55;
      const bh = 14;

      ctx.fillStyle = this.c.policeYellow;
      ctx.strokeStyle = this.c.policeBlue;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 3);
      ctx.fill();
      ctx.stroke();

      // Blue diagonal warning stripes
      ctx.fillStyle = this.c.policeBlue;
      for (let s = -bw / 2 + 5; s < bw / 2 - 5; s += 12) {
        ctx.fillRect(s, -bh / 2, 6, bh);
      }

      // "DELHI POLICE" Bold Badge in center
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 6.5px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DELHI POLICE', 0, 2);

      ctx.restore();
    });

    // Delhi Police Vajra Riot Control Truck parked nearby
    this.drawPoliceVajra(1690, 2060);
  }

  // Delhi Police Vajra Water-Cannon / Anti-Riot Armored Vehicle
  drawPoliceVajra(x, y) {
    const ctx = this.ctx;
    ctx.save();

    // Body
    ctx.fillStyle = '#1e3a8a'; // Dark Police Blue
    ctx.strokeStyle = '#f59e0b'; // Yellow trim
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, 75, 36, 6);
    ctx.fill();
    ctx.stroke();

    // Windshield wire mesh
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x + 58, y + 4, 12, 28);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(x + 58, y + 4, 12, 28);

    // Water Cannon Turret on roof
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(x + 40, y + 18, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + 40, y + 15, 18, 6); // Cannon nozzle

    // Flashing Red & Blue Emergency Beacon
    const flash = Math.sin(this.animTime * 12) > 0;
    ctx.fillStyle = flash ? '#ef4444' : '#3b82f6';
    ctx.beginPath();
    ctx.arc(x + 22, y + 18, 5, 0, Math.PI * 2);
    ctx.fill();

    // "VAJRA - DELHI POLICE" Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VAJRA - POLICE', x + 34, y + 32);

    ctx.restore();
  }

  // Authentic Delhi Architecture: DDA Flats, Commercial Blocks, & Dhabas
  drawDelhiBuildings(mapMode) {
    const ctx = this.ctx;
    const isBp = mapMode === 'blueprint';

    // Curated Delhi Buildings from the game world
    const buildings = [
      // Top blocks near CP
      { x: 380, y: 1100, w: 220, h: 140, name: 'JOSHI FLATS', color: '#e6dac8' },
      { x: 380, y: 1280, w: 220, h: 120, name: 'KUMAR MOBILE & XEROX', color: '#f1f5f9' },
      { x: 380, y: 1440, w: 220, h: 120, name: 'CYBER CAFE & PRINTS', color: '#e2e8f0' },
      
      // East of Sansad Marg
      { x: 1350, y: 1150, w: 240, h: 160, name: 'GYM & FITNESS CLUB', color: '#e2d9cc' },
      { x: 1350, y: 1350, w: 240, h: 150, name: 'RAJU DHABA - SPECIAL DAL', color: '#fed7aa' },
      { x: 1350, y: 1540, w: 240, h: 150, name: 'AGARWAL SWEETS & SNACKS', color: '#fef08a' },

      // Near Jantar Mantar Gate
      { x: 1950, y: 1950, w: 220, h: 140, name: 'DELHI SOUVENIR EMPORIUM', color: '#e2e8f0' },
      { x: 1950, y: 2500, w: 220, h: 140, name: 'LASSI BHANDAR & JUICE', color: '#fed7aa' },
      { x: 1950, y: 2680, w: 220, h: 150, name: 'CHOLE KULCHE CORNER', color: '#fef9c3' },

      // West Commercial High-Rises
      { x: 1420, y: 2450, w: 280, h: 180, name: 'JEEVAN DEEP BUILDING', color: '#cbd5e1' },
      { x: 1420, y: 2670, w: 280, h: 160, name: 'PATEL BHAWAN (GOVT OFFICES)', color: '#d8cfbe' },

      // South-East
      { x: 3050, y: 2200, w: 220, h: 160, name: 'VIP TAILORS & DRAPES', color: '#e2e8f0' },
      { x: 3050, y: 2400, w: 220, h: 160, name: 'PG FOR BOYS & GIRLS', color: '#fed7aa' },
      { x: 3050, y: 2600, w: 220, h: 150, name: 'SHIV DHABA & TANDOOR', color: '#fef08a' }
    ];

    buildings.forEach(b => {
      ctx.save();

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(b.x + 12, b.y + 12, b.w, b.h);

      // Building Rooftop Base
      ctx.fillStyle = isBp ? '#0c4a6e' : b.color;
      ctx.strokeStyle = isBp ? '#38bdf8' : '#94a3b8';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 6);
      ctx.fill();
      ctx.stroke();

      if (!isBp) {
        // Balcony / Rooftop parapet line
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 4;
        ctx.strokeRect(b.x + 8, b.y + 8, b.w - 16, b.h - 16);

        // Black Sintex Water Tanks on roof
        this.drawSintexTank(b.x + 24, b.y + 24);
        if (b.w > 200) {
          this.drawSintexTank(b.x + b.w - 36, b.y + 24);
        }

        // Split AC outdoor compressor units
        ctx.fillStyle = this.c.acWhite;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.fillRect(b.x + b.w - 44, b.y + b.h - 30, 28, 16);
        ctx.strokeRect(b.x + b.w - 44, b.y + b.h - 30, 28, 16);

        // Colorful Bunting Flags (Jhandiya) across roof
        this.drawBuntings(b.x + 14, b.y + 14, b.w - 28);

        // Dhaba / Shop Signboard Banner
        this.drawShopSign(b.x, b.y + b.h - 26, b.w, b.name);
      } else {
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(b.name, b.x + b.w / 2, b.y + b.h / 2);
      }

      ctx.restore();
    });
  }

  // Black Sintex Water Tank (Iconic Indian rooftop element)
  drawSintexTank(x, y) {
    const ctx = this.ctx;
    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, 11, 0, Math.PI * 2);
    ctx.fill();

    // Black cylindrical tank
    ctx.fillStyle = this.c.sintexBlack;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tank lid
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Colorful festival bunting flags
  drawBuntings(x, y, width) {
    const ctx = this.ctx;
    const colors = this.c.bunting;
    const flagCount = Math.floor(width / 16);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();

    for (let i = 0; i < flagCount; i++) {
      const fx = x + i * 16;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(fx, y);
      ctx.lineTo(fx + 14, y);
      ctx.lineTo(fx + 7, y + 10);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Vibrant Shop Signboard (like Raju Dhaba, Agarwal Sweets)
  drawShopSign(x, y, w, text) {
    const ctx = this.ctx;
    ctx.save();

    // Signboard panel
    ctx.fillStyle = '#b91c1c'; // Indian red / crimson signboard
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(x + 12, y, w - 24, 20, 3);
    ctx.fill();
    ctx.stroke();

    // Signboard text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9.5px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, x + w / 2, y + 14);

    ctx.restore();
  }

  // Metro Stations & DTC Bus Shelters
  drawTransitInfrastructure(mapMode) {
    const ctx = this.ctx;
    const isBp = mapMode === 'blueprint';

    // 1. Patel Chowk Metro Station Entrance
    const metro = this.config.landmarks.patelChowkMetro;
    ctx.save();
    ctx.fillStyle = isBp ? '#0c4a6e' : '#1e3a8a';
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(metro.x, metro.y, metro.w, metro.h, 8);
    ctx.fill();
    ctx.stroke();

    // Red Delhi Metro Logo circle
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(metro.x + 22, metro.y + metro.h / 2, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('M', metro.x + 22, metro.y + metro.h / 2 + 4);

    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'left';
    ctx.fillText('PATEL CHOWK', metro.x + 42, metro.y + metro.h / 2 - 2);
    ctx.fillStyle = '#facc15';
    ctx.font = '8px sans-serif';
    ctx.fillText('YELLOW LINE METRO', metro.x + 42, metro.y + metro.h / 2 + 10);
    ctx.restore();

    // 2. DTC Bus Shelter with Green DTC Bus
    this.drawDTCBusShelter(1880, 2480);
  }

  drawDTCBusShelter(x, y) {
    const ctx = this.ctx;
    ctx.save();

    // Shelter Roof
    ctx.fillStyle = '#15803d'; // Delhi Transport Corp Green
    ctx.fillRect(x, y, 70, 22);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DTC BUS STOP', x + 35, y + 14);

    // Parked Green Low-Floor DTC Bus
    this.drawDTCBus(x - 90, y - 5, '522: CP ➔ JANTAR MANTAR');

    ctx.restore();
  }

  drawDTCBus(x, y, route) {
    const ctx = this.ctx;
    ctx.save();

    // Bus shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 4, y + 4, 80, 32);

    // Green bus body
    ctx.fillStyle = this.c.dtcGreen;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, 80, 32, 6);
    ctx.fill();
    ctx.stroke();

    // Windows
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 65, y + 4, 10, 24); // Windshield
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x + 10 + i * 13, y + 3, 9, 6);
      ctx.fillRect(x + 10 + i * 13, y + 23, 9, 6);
    }

    // Bus destination LED
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 6.5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(route, x + 40, y + 18);

    ctx.restore();
  }
}

if (typeof window !== 'undefined') {
  window.DelhiCityDrawer = DelhiCityDrawer;
}
