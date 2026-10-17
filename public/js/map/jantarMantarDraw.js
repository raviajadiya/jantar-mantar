// Realistic Architectural Rendering of Jantar Mantar Complex, New Delhi
class JantarMantarDrawer {
  constructor(ctx, config) {
    this.ctx = ctx;
    this.config = config;
    this.c = config.colors;
    this.jm = config.landmarks.jantarMantar;
  }

  draw(mapMode = 'standard', sunAngle = 1.1) {
    const ctx = this.ctx;
    const b = this.jm.bounds;

    // 1. Heritage Ground / Lush Lawns
    ctx.save();
    
    // Complex base perimeter lawn
    ctx.fillStyle = mapMode === 'blueprint' ? '#0d2238' : this.c.jmGrass;
    ctx.strokeStyle = mapMode === 'blueprint' ? '#38bdf8' : this.c.jmWall;
    ctx.lineWidth = mapMode === 'blueprint' ? 3 : 8;
    
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.w, b.h, 24);
    ctx.fill();
    ctx.stroke();

    // Blueprint grid inside complex if blueprint mode
    if (mapMode === 'blueprint') {
      this.drawBlueprintGrid(b);
    } else {
      // Lawn texture & inner stone paths
      this.drawLawnDetails(b);
      this.drawSandstonePathways();
    }

    // 2. Render Historical Astronomical Instruments
    this.drawSamratYantra(mapMode, sunAngle);
    this.drawMisraYantra(mapMode, sunAngle);
    this.drawJaiPrakashYantra(mapMode);
    this.drawRamYantra(mapMode);
    this.drawShasthamsaYantra(mapMode);
    this.drawDigamsaYantra(mapMode);

    // 3. Heritage Garden Trees & Palms
    if (mapMode !== 'blueprint') {
      this.drawGardenFlora();
    }

    // 4. Perimeter Wall, Main Gate & Ticket Kiosk
    this.drawPerimeterBoundary(b, mapMode);

    ctx.restore();
  }

  // Draw lawn subtle shading & garden flower patches
  drawLawnDetails(b) {
    const ctx = this.ctx;
    ctx.fillStyle = this.c.jmGrassDark;
    
    // Garden hedge borders
    ctx.fillRect(b.x + 40, b.y + 40, b.w - 80, 20);
    ctx.fillRect(b.x + 40, b.y + b.h - 60, b.w - 80, 20);
    ctx.fillRect(b.x + 40, b.y + 40, 20, b.h - 80);
    ctx.fillRect(b.x + b.w - 60, b.y + 40, 20, b.h - 80);

    // Flower patches (Delhi marigolds & roses)
    const flowerColors = ['#f59e0b', '#ef4444', '#ec4899', '#fbbf24'];
    const flowerBeds = [
      { x: b.x + 80, y: b.y + 80, w: 90, h: 40 },
      { x: b.x + 220, y: b.y + 80, w: 90, h: 40 },
      { x: b.x + 80, y: b.y + b.h - 120, w: 100, h: 40 },
      { x: b.x + b.w - 200, y: b.y + 80, w: 120, h: 40 }
    ];

    flowerBeds.forEach((bed, idx) => {
      ctx.fillStyle = flowerColors[idx % flowerColors.length];
      ctx.beginPath();
      ctx.roundRect(bed.x, bed.y, bed.w, bed.h, 8);
      ctx.fill();
      // Little flower dots
      ctx.fillStyle = '#ffffff';
      for (let fx = bed.x + 8; fx < bed.x + bed.w; fx += 16) {
        ctx.beginPath();
        ctx.arc(fx, bed.y + 12, 2.5, 0, Math.PI * 2);
        ctx.arc(fx + 8, bed.y + 28, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  // Connect instruments with red sandstone pathways
  drawSandstonePathways() {
    const ctx = this.ctx;
    ctx.fillStyle = this.c.jmPath;
    ctx.strokeStyle = '#baa88e';
    ctx.lineWidth = 1;

    const paths = [
      // Main pathway from Sansad Marg Gate to Samrat Yantra
      { x: 2150, y: 2320, w: 280, h: 36 },
      // Path heading to Misra Yantra
      { x: 2430, y: 2320, w: 320, h: 32 },
      // North-South central promenade
      { x: 2410, y: 2320, w: 40, h: 560 },
      // Path to Jai Prakash Yantra
      { x: 2240, y: 2660, w: 180, h: 30 },
      // Path to Ram Yantra
      { x: 2430, y: 2770, w: 340, h: 34 }
    ];

    paths.forEach(p => {
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.w, p.h, 6);
      ctx.fill();
      ctx.stroke();

      // Stone tile joint lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      if (p.w > p.h) {
        for (let x = p.x + 20; x < p.x + p.w; x += 20) {
          ctx.beginPath();
          ctx.moveTo(x, p.y);
          ctx.lineTo(x, p.y + p.h);
          ctx.stroke();
        }
      } else {
        for (let y = p.y + 20; y < p.y + p.h; y += 20) {
          ctx.beginPath();
          ctx.moveTo(p.x, y);
          ctx.lineTo(p.x + p.w, y);
          ctx.stroke();
        }
      }
    });
  }

  // 1. SAMRAT YANTRA - Supreme Equinoctial Sundial
  drawSamratYantra(mapMode, sunAngle) {
    const ctx = this.ctx;
    const sy = this.jm.samratYantra;
    const isBp = mapMode === 'blueprint';

    ctx.save();

    // Dynamic Cast Shadow based on Sun Angle
    if (!isBp) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      // Triangle shadow stretching eastward or westward
      const shadowLength = 120 * Math.cos(sunAngle);
      ctx.moveTo(sy.x - sy.gnomonWidth / 2, sy.y + sy.gnomonLength / 2);
      ctx.lineTo(sy.x + sy.gnomonWidth / 2, sy.y + sy.gnomonLength / 2);
      ctx.lineTo(sy.x + sy.gnomonWidth / 2 + shadowLength, sy.y - sy.gnomonLength / 2);
      ctx.lineTo(sy.x - sy.gnomonWidth / 2 + shadowLength, sy.y - sy.gnomonLength / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // A. West & East Quadrant Arcs (Marble Scales)
    const arcRadius = sy.quadrantRadius;
    const arcThickness = 28;

    // West Quadrant Arc (South-West)
    this.drawQuadrantArc(sy.x - sy.gnomonWidth / 2, sy.y, arcRadius, arcThickness, Math.PI * 0.5, Math.PI * 1.05, isBp, 'WEST QUADRANT');

    // East Quadrant Arc (South-East)
    this.drawQuadrantArc(sy.x + sy.gnomonWidth / 2, sy.y, arcRadius, arcThickness, -Math.PI * 0.05, Math.PI * 0.5, isBp, 'EAST QUADRANT');

    // B. Central Triangular Gnomon (Ramp pointing strictly North)
    const gW = sy.gnomonWidth;
    const gL = sy.gnomonLength;
    const topY = sy.y - gL / 2;
    const botY = sy.y + gL / 2;

    // Base podium
    ctx.fillStyle = isBp ? '#0c4a6e' : this.c.jmSandstoneDark;
    ctx.strokeStyle = isBp ? '#38bdf8' : this.c.jmWall;
    ctx.lineWidth = isBp ? 2 : 3;

    ctx.beginPath();
    ctx.roundRect(sy.x - gW / 2 - 8, topY - 10, gW + 16, gL + 20, 8);
    ctx.fill();
    ctx.stroke();

    // Central sloping ramp body
    const rampGrad = ctx.createLinearGradient(sy.x - gW / 2, sy.y, sy.x + gW / 2, sy.y);
    if (isBp) {
      rampGrad.addColorStop(0, '#0284c7');
      rampGrad.addColorStop(1, '#0369a1');
    } else {
      rampGrad.addColorStop(0, this.c.jmSandstoneLight);
      rampGrad.addColorStop(0.5, this.c.jmSandstone);
      rampGrad.addColorStop(1, this.c.jmSandstoneDark);
    }

    ctx.fillStyle = rampGrad;
    ctx.beginPath();
    ctx.roundRect(sy.x - gW / 2, topY, gW, gL, 4);
    ctx.fill();
    ctx.stroke();

    // Flight of stairs running up the central spine
    ctx.fillStyle = isBp ? '#bae6fd' : this.c.jmMarble;
    const stepCount = 28;
    const stepHeight = gL / stepCount;
    for (let i = 0; i < stepCount; i++) {
      const stepY = topY + i * stepHeight;
      ctx.fillRect(sy.x - gW / 2 + 4, stepY, gW - 8, stepHeight - 1.5);
    }

    // Top viewing pavilion / observation turret (Chhatri)
    ctx.fillStyle = isBp ? '#38bdf8' : '#f8fafc';
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sy.x, topY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // North Arrow indicator at top
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(sy.x, topY - 24);
    ctx.lineTo(sy.x - 7, topY - 12);
    ctx.lineTo(sy.x + 7, topY - 12);
    ctx.closePath();
    ctx.fill();

    // Blueprint annotations
    if (isBp) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('SAMRAT YANTRA', sy.x - 48, topY - 30);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('INCLINE: 28°37\' (DELHI LATITUDE)', sy.x - 100, botY + 24);
      ctx.fillText('MERIDIAN: TRUE NORTH-SOUTH', sy.x - 85, botY + 38);
    } else {
      // Label plate on ground
      this.drawLandmarkLabel(sy.x, botY + 28, 'Vrihat Samrat Yantra', 'बृहत् सम्राट यंत्र');
    }

    ctx.restore();
  }

  // Draw curved marble quadrant scales with degree graduations
  drawQuadrantArc(cx, cy, radius, thickness, startAngle, endAngle, isBp, label) {
    const ctx = this.ctx;
    ctx.save();

    // Outer support masonry wall
    ctx.strokeStyle = isBp ? '#0284c7' : this.c.jmSandstone;
    ctx.lineWidth = thickness + 8;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.stroke();

    // Inner marble scale quadrant
    ctx.strokeStyle = isBp ? '#bae6fd' : this.c.jmMarble;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.stroke();

    // Hour and minute tick marks on the marble arc
    ctx.strokeStyle = isBp ? '#0369a1' : '#475569';
    ctx.lineWidth = 1.5;
    const ticks = 24;
    const angleStep = (endAngle - startAngle) / ticks;

    for (let i = 0; i <= ticks; i++) {
      const angle = startAngle + i * angleStep;
      const isMajor = i % 4 === 0;
      const len = isMajor ? thickness : thickness * 0.5;
      const r1 = radius - thickness / 2;
      const r2 = r1 + len;

      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // 2. MISRA YANTRA - Mixed Instrument with iconic heart-arched facade
  drawMisraYantra(mapMode, sunAngle) {
    const ctx = this.ctx;
    const my = this.jm.misraYantra;
    const isBp = mapMode === 'blueprint';

    ctx.save();

    // Shadow
    if (!isBp) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.roundRect(my.x - my.w / 2 + 15, my.y - my.h / 2 + 15, my.w, my.h, 16);
      ctx.fill();
    }

    // Outer Base Terracotta Platform
    ctx.fillStyle = isBp ? '#0369a1' : this.c.jmSandstone;
    ctx.strokeStyle = isBp ? '#38bdf8' : this.c.jmWall;
    ctx.lineWidth = isBp ? 2 : 4;

    ctx.beginPath();
    ctx.roundRect(my.x - my.w / 2, my.y - my.h / 2, my.w, my.h, 16);
    ctx.fill();
    ctx.stroke();

    // Symmetrical Arched Wings (The iconic 2 circular heart wings)
    const wingRadius = 38;
    // Left Wing Arch (indicating Greenwich noon)
    ctx.fillStyle = isBp ? '#0284c7' : this.c.jmSandstoneLight;
    ctx.beginPath();
    ctx.arc(my.x - 45, my.y - 10, wingRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Wing Arch (indicating Zurich noon)
    ctx.beginPath();
    ctx.arc(my.x + 45, my.y - 10, wingRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner marble sectors in each wing
    ctx.fillStyle = isBp ? '#bae6fd' : this.c.jmMarble;
    ctx.beginPath();
    ctx.arc(my.x - 45, my.y - 10, wingRadius - 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(my.x + 45, my.y - 10, wingRadius - 12, 0, Math.PI * 2);
    ctx.fill();

    // Central Gnomon / Observation Tower
    ctx.fillStyle = isBp ? '#38bdf8' : this.c.jmSandstoneDark;
    ctx.beginPath();
    ctx.roundRect(my.x - 18, my.y - my.h / 2 + 10, 36, my.h - 20, 6);
    ctx.fill();
    ctx.stroke();

    // Stairs climbing central tower
    ctx.fillStyle = isBp ? '#ffffff' : this.c.jmMarble;
    for (let y = my.y - my.h / 2 + 16; y < my.y + my.h / 2 - 16; y += 10) {
      ctx.fillRect(my.x - 12, y, 24, 6);
    }

    if (isBp) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('MISRA YANTRA (5-IN-1)', my.x - 65, my.y - my.h / 2 - 12);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('WORLD MERIDIAN DIALS', my.x - 65, my.y + my.h / 2 + 20);
    } else {
      this.drawLandmarkLabel(my.x, my.y + my.h / 2 + 22, 'Misra Yantra', 'मिश्र यंत्र');
    }

    ctx.restore();
  }

  // 3. JAI PRAKASH YANTRA - Twin Sunken Hemispherical Bowls
  drawJaiPrakashYantra(mapMode) {
    const ctx = this.ctx;
    const jp = this.jm.jaiPrakashYantra;
    const isBp = mapMode === 'blueprint';

    [jp.bowl1, jp.bowl2].forEach((b, idx) => {
      ctx.save();

      // Outer stone rim
      ctx.fillStyle = isBp ? '#0c4a6e' : this.c.jmSandstone;
      ctx.strokeStyle = isBp ? '#38bdf8' : this.c.jmWall;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Sunken Concave Bowl (Inverted Celestial Sky)
      const bowlGrad = ctx.createRadialGradient(b.x, b.y, 4, b.x, b.y, b.radius);
      if (isBp) {
        bowlGrad.addColorStop(0, '#0369a1');
        bowlGrad.addColorStop(1, '#075985');
      } else {
        bowlGrad.addColorStop(0, '#f8fafc');
        bowlGrad.addColorStop(0.7, this.c.jmMarble);
        bowlGrad.addColorStop(1, this.c.jmMarbleShade);
      }

      ctx.fillStyle = bowlGrad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      // Intersecting Celestial Coordinates & Passageways
      ctx.strokeStyle = isBp ? '#bae6fd' : '#94a3b8';
      ctx.lineWidth = 1.2;

      // Concentric circles
      for (let r = 12; r < b.radius; r += 12) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Radial cross-lines (Hour lines)
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x + Math.cos(a) * b.radius, b.y + Math.sin(a) * b.radius);
        ctx.stroke();
      }

      // Center crosswire ring
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // Connecting stone walkway between twin bowls
    ctx.fillStyle = isBp ? '#0284c7' : this.c.jmPath;
    ctx.fillRect((jp.bowl1.x + jp.bowl2.x) / 2 - 20, jp.bowl1.y - 12, 40, 24);

    if (isBp) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('JAI PRAKASH YANTRA', jp.bowl1.x - 20, jp.bowl1.y - jp.bowl1.radius - 14);
    } else {
      this.drawLandmarkLabel((jp.bowl1.x + jp.bowl2.x) / 2, jp.bowl2.y + jp.bowl2.radius + 22, 'Jai Prakash Yantra', 'जय प्रकाश यंत्र');
    }
  }

  // 4. RAM YANTRA - Cylindrical Open-Air Altitude-Azimuth Towers
  drawRamYantra(mapMode) {
    const ctx = this.ctx;
    const ry = this.jm.ramYantra;
    const isBp = mapMode === 'blueprint';

    [ry.tower1, ry.tower2].forEach((t, idx) => {
      ctx.save();

      // Outer Circular Stone Wall
      ctx.fillStyle = isBp ? '#075985' : this.c.jmSandstone;
      ctx.strokeStyle = isBp ? '#38bdf8' : this.c.jmWall;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hollow interior floor with alternating sectors
      ctx.fillStyle = isBp ? '#0284c7' : this.c.jmMarble;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius - 10, 0, Math.PI * 2);
      ctx.fill();

      // 12 Radial Stone Sectors (Alternating stone sectors and walking slits)
      const sectors = 12;
      const anglePerSector = (Math.PI * 2) / sectors;

      for (let s = 0; s < sectors; s++) {
        if (s % 2 === 0) {
          ctx.fillStyle = isBp ? '#38bdf8' : this.c.jmSandstoneLight;
          ctx.beginPath();
          ctx.moveTo(t.x, t.y);
          ctx.arc(t.x, t.y, t.radius - 10, s * anglePerSector, (s + 1) * anglePerSector);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Central Cylindrical Pillar
      ctx.fillStyle = isBp ? '#ffffff' : this.c.jmSandstoneDark;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    });

    if (isBp) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('RAM YANTRA (ALT-AZIMUTH)', ry.tower1.x - 30, ry.tower1.y - ry.tower1.radius - 14);
    } else {
      this.drawLandmarkLabel((ry.tower1.x + ry.tower2.x) / 2, ry.tower2.y + ry.tower2.radius + 22, 'Ram Yantra', 'राम यंत्र');
    }
  }

  // 5. Shasthamsa & Digamsa auxiliary instruments
  drawShasthamsaYantra(mapMode) {
    const ctx = this.ctx;
    const sy = this.jm.shasthamsaYantra;
    const isBp = mapMode === 'blueprint';

    ctx.save();
    ctx.fillStyle = isBp ? '#0369a1' : this.c.jmSandstone;
    ctx.strokeStyle = isBp ? '#38bdf8' : this.c.jmWall;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sy.x, sy.y, sy.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isBp ? '#bae6fd' : this.c.jmMarble;
    ctx.beginPath();
    ctx.arc(sy.x, sy.y, sy.radius - 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawDigamsaYantra(mapMode) {
    const ctx = this.ctx;
    const dy = this.jm.digamsaYantra;
    const isBp = mapMode === 'blueprint';

    ctx.save();
    ctx.fillStyle = isBp ? '#0369a1' : this.c.jmSandstone;
    ctx.strokeStyle = isBp ? '#38bdf8' : this.c.jmWall;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(dy.x, dy.y, dy.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isBp ? '#bae6fd' : this.c.jmMarble;
    ctx.beginPath();
    ctx.arc(dy.x, dy.y, dy.radius - 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Garden Trees (Delhi Neem, Banyan & Ornamental Palms)
  drawGardenFlora() {
    const ctx = this.ctx;
    const b = this.jm.bounds;

    const trees = [
      // Along perimeter
      { x: b.x + 100, y: b.y + 160, r: 24, palm: true },
      { x: b.x + 100, y: b.y + 260, r: 22, palm: true },
      { x: b.x + 100, y: b.y + 380, r: 25, palm: true },
      { x: b.x + 100, y: b.y + 500, r: 22, palm: true },
      { x: b.x + 100, y: b.y + 620, r: 26, palm: true },
      // Eastern gardens
      { x: b.x + b.w - 120, y: b.y + 180, r: 28, palm: false },
      { x: b.x + b.w - 120, y: b.y + 320, r: 30, palm: false },
      { x: b.x + b.w - 120, y: b.y + 480, r: 26, palm: false },
      { x: b.x + b.w - 120, y: b.y + 640, r: 32, palm: false },
      // Corner groves
      { x: b.x + 220, y: b.y + b.h - 120, r: 24, palm: true },
      { x: b.x + 360, y: b.y + b.h - 120, r: 26, palm: true }
    ];

    trees.forEach(t => {
      // Tree shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.arc(t.x + 6, t.y + 6, t.r, 0, Math.PI * 2);
      ctx.fill();

      if (t.palm) {
        // Royal Palm top-down fronds
        ctx.strokeStyle = '#2d5a27';
        ctx.lineWidth = 4;
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI * 2) / 8;
          ctx.beginPath();
          ctx.moveTo(t.x, t.y);
          ctx.lineTo(t.x + Math.cos(a) * t.r * 1.2, t.y + Math.sin(a) * t.r * 1.2);
          ctx.stroke();
        }
        ctx.fillStyle = '#8b5a2b';
        ctx.beginPath();
        ctx.arc(t.x, t.y, 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Lush Shade Tree
        ctx.fillStyle = '#2d5a27';
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#417d38';
        ctx.beginPath();
        ctx.arc(t.x - 3, t.y - 3, t.r * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  // Boundary wall & Main Gateway onto Sansad Marg
  drawPerimeterBoundary(b, mapMode) {
    const ctx = this.ctx;
    const isBp = mapMode === 'blueprint';

    // Main Gate cut-out on the West wall facing Sansad Marg
    const gateY = 2300;
    const gateH = 80;

    // Red Sandstone boundary walls
    ctx.fillStyle = isBp ? '#0284c7' : this.c.jmWall;
    ctx.strokeStyle = isBp ? '#38bdf8' : '#45130b';
    ctx.lineWidth = 2;

    // West wall top segment
    ctx.fillRect(b.x - 6, b.y, 12, gateY - b.y);
    // West wall bottom segment
    ctx.fillRect(b.x - 6, gateY + gateH, 12, (b.y + b.h) - (gateY + gateH));

    // North, East, South walls
    ctx.fillRect(b.x, b.y - 6, b.w, 12);
    ctx.fillRect(b.x + b.w - 6, b.y, 12, b.h);
    ctx.fillRect(b.x, b.y + b.h - 6, b.w, 12);

    // GATE PILLARS & ARCHWAY
    ctx.fillStyle = isBp ? '#38bdf8' : this.c.jmSandstone;
    ctx.beginPath();
    ctx.roundRect(b.x - 14, gateY - 10, 28, 20, 4);
    ctx.roundRect(b.x - 14, gateY + gateH - 10, 28, 20, 4);
    ctx.fill();
    ctx.stroke();

    // ASI Ticket Booth & Security Gate
    ctx.fillStyle = isBp ? '#0369a1' : '#334155';
    ctx.fillRect(b.x + 16, gateY + 10, 36, 40);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('ASI TICKET', b.x + 17, gateY + 34);

    // Gate Signboard
    ctx.fillStyle = '#1e3a8a';
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(b.x - 30, gateY + 20, 16, 40, 3);
    ctx.fill();
    ctx.stroke();
  }

  // Label banner over landmark
  drawLandmarkLabel(x, y, eng, hindi) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    const textWidth = Math.max(ctx.measureText(eng).width, ctx.measureText(hindi).width);
    const boxW = textWidth + 24;
    const boxH = 34;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x - boxW / 2, y - boxH / 2, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText(eng, x, y - 2);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.fillText(hindi, x, y + 12);

    ctx.restore();
  }

  drawBlueprintGrid(b) {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1;

    for (let x = b.x; x < b.x + b.w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, b.y);
      ctx.lineTo(x, b.y + b.h);
      ctx.stroke();
    }
    for (let y = b.y; y < b.y + b.h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(b.x, y);
      ctx.lineTo(b.x + b.w, y);
      ctx.stroke();
    }
  }
}

if (typeof window !== 'undefined') {
  window.JantarMantarDrawer = JantarMantarDrawer;
}
