// Visual Drawing Engine: Renders 4 Distinct Delhi Route Networks & Geometries
class CircularMapDrawer {
  constructor(ctx, config, roadNetwork) {
    this.ctx = ctx;
    this.config = config;
    this.roadNetwork = roadNetwork;
    this.center = config.circularLayout.center || { x: 1800, y: 1800 };
    this.c = Object.assign({}, config.colors);
    this.animTime = 0;

    // Active map theme setup
    this.currentMapId = 'jantar';
    this.theme = null;
    this.setMapTheme('jantar');
  }

  setMapTheme(themeId) {
    this.currentMapId = themeId || 'jantar_dark';
    const themes = window.MAP_THEMES || {};
    const theme = themes[this.currentMapId] || themes['jantar'] || themes['jantar_dark'];

    this.theme = theme;
    this.c.asphalt = theme.roadAsphalt;
    this.c.footpath = theme.curbColor;
    this.c.roadMarking = theme.roadMarking;
    this.c.jmGrass = theme.centerGrass;
    this.c.jmSandstoneDark = theme.centerBorder;
    this.config.world.bgColor = theme.bgCanvas;
    this.blockColors = theme.blockColors;
    this.blockBorder = theme.blockBorder || (theme.mode === 'light' ? '#94a3b8' : '#2d3d54');
    this.blockShadow = theme.blockShadow || (theme.mode === 'light' ? 'rgba(0, 0, 0, 0.22)' : 'rgba(0, 0, 0, 0.45)');
    this.shopNames = theme.shopNames;
  }

  draw(mapMode = 'standard', deltaTime = 0.016, sunAngle = 1.1, allFlagsCollected = false) {
    this.animTime += deltaTime;
    const ctx = this.ctx;

    // Keep center synced with roadNetwork.center
    if (this.roadNetwork && this.roadNetwork.center) {
      this.center = this.roadNetwork.center;
    }

    // 1. Draw City Building Blocks for Jantar Mantar
    this.drawJantarBlocks(mapMode);

    // 2. Draw Distinct Road Corridors from roadNetwork.segments
    this.drawRoadCorridors(mapMode);

    // 3. Draw Road Markings & Lane Dividers
    this.drawRoadMarkings(mapMode);

    // 4. Draw Central Jantar Mantar Sanctuary Landmark & Victory Gandhi Cap
    this.drawCentralJantarMantar(mapMode, sunAngle, allFlagsCollected);
  }

  // Draw Distinct Road Corridors directly from the active map's graph segments
  drawRoadCorridors(mapMode) {
    const ctx = this.ctx;
    const isBp = mapMode === 'blueprint';
    const segments = this.roadNetwork.segments || [];

    ctx.save();

    // Pass 1: Curbs / Sidewalk borders (draw wider)
    segments.forEach(seg => {
      ctx.strokeStyle = isBp ? '#0284c7' : this.c.footpath;
      ctx.lineWidth = seg.width + 16;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      if (seg.type === 'line') {
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
      } else if (seg.type === 'arc') {
        ctx.arc(seg.cx, seg.cy, seg.radius, seg.startAngle, seg.endAngle);
      } else if (seg.type === 'circle') {
        ctx.arc(seg.cx, seg.cy, seg.radius + 8, 0, Math.PI * 2);
      }
      ctx.stroke();
    });

    // Pass 2: Asphalt Surface
    segments.forEach(seg => {
      ctx.strokeStyle = isBp ? '#1e293b' : this.c.asphalt;
      ctx.lineWidth = seg.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      if (seg.type === 'line') {
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
      } else if (seg.type === 'arc') {
        ctx.arc(seg.cx, seg.cy, seg.radius, seg.startAngle, seg.endAngle);
      } else if (seg.type === 'circle') {
        ctx.arc(seg.cx, seg.cy, seg.radius, 0, Math.PI * 2);
      }
      ctx.stroke();
    });

    ctx.restore();
  }

  // Road Lane Divider Markings along all segments
  drawRoadMarkings(mapMode) {
    if (mapMode === 'blueprint') return;
    const ctx = this.ctx;
    const segments = this.roadNetwork.segments || [];

    ctx.save();
    ctx.strokeStyle = this.c.roadMarking;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([18, 14]);

    segments.forEach(seg => {
      if (seg.type === 'line') {
        const d1 = Math.hypot(seg.x1 - this.center.x, seg.y1 - this.center.y);
        const d2 = Math.hypot(seg.x2 - this.center.x, seg.y2 - this.center.y);
        if (Math.min(d1, d2) >= 200) {
          ctx.beginPath();
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
          ctx.stroke();
        }
      } else if (seg.type === 'arc') {
        if (seg.radius > 260) {
          ctx.beginPath();
          ctx.arc(seg.cx, seg.cy, seg.radius, seg.startAngle, seg.endAngle);
          ctx.stroke();
        }
      }
    });

    ctx.setLineDash([]);
    ctx.restore();
  }

  // ========================================================
  // CITY BUILDING BLOCKS GENERATOR (TAILORED PER ROUTE MAP)
  // ========================================================
  // Jantar Mantar: Progressive Multi-Ring Curved Sectors
  drawJantarBlocks(mapMode) {
    const rings = (this.roadNetwork && this.roadNetwork.rings) || [240, 480, 760, 1080, 1400];
    this.drawConcentricBlockGrid(rings, 90, mapMode);
  }

  // Generic circular concentric block grid drawer
  drawConcentricBlockGrid(rings, roadW, mapMode, isColonnade = false) {
    const ctx = this.ctx;
    const isBp = mapMode === 'blueprint';
    const halfW = roadW / 2;
    const blockColors = this.blockColors || ['#eae2d3', '#f1f5f9', '#fed7aa'];

    for (let rIdx = 0; rIdx < rings.length - 1; rIdx++) {
      const innerR = rings[rIdx] + halfW + 6;
      const outerR = rings[rIdx + 1] - halfW - 6;
      if (outerR <= innerR) continue;

      // Inner rings (0 and 1) have 8 sectors
      // Outer rings (2 and above) have 16 sectors (halved by intermediate radial avenues)
      const numSectors = (rIdx < 2) ? 8 : 16;
      const angleStep = (Math.PI * 2) / numSectors;

      // Angular margin to leave precise road corridor clearance (road width 90 + curbs)
      const angleMargin = Math.max(0.038, 52 / outerR);

      for (let sIdx = 0; sIdx < numSectors; sIdx++) {
        // Aligned with avenues starting from North (-Math.PI / 2)
        const startRad = -Math.PI / 2 + sIdx * angleStep;
        const endRad = startRad + angleStep;
        const a1 = startRad + angleMargin;
        const a2 = endRad - angleMargin;
        if (a2 <= a1) continue;

        ctx.save();
        // Shadow
        if (!isBp) {
          ctx.fillStyle = this.blockShadow || 'rgba(0, 0, 0, 0.45)';
          ctx.beginPath();
          ctx.arc(this.center.x + 8, this.center.y + 8, outerR, a1, a2);
          ctx.arc(this.center.x + 8, this.center.y + 8, innerR, a2, a1, true);
          ctx.closePath();
          ctx.fill();
        }

        // Block Base
        ctx.fillStyle = isBp ? '#0c4a6e' : blockColors[(rIdx * 3 + sIdx) % blockColors.length];
        ctx.strokeStyle = isBp ? '#38bdf8' : (isColonnade ? '#475569' : (this.blockBorder || '#2d3d54'));
        ctx.lineWidth = 2.2;

        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, outerR, a1, a2);
        ctx.arc(this.center.x, this.center.y, innerR, a2, a1, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
    }
  }



  // ========================================================
  // MAP 1: Central Jantar Mantar Observatory Sanctuary
  // ========================================================
  drawCentralJantarMantar(mapMode, sunAngle, allFlagsCollected = false) {
    const ctx = this.ctx;
    const isBp = mapMode === 'blueprint';
    const c = this.center;
    const r = 240;

    ctx.save();
    // 1. Sanctuary Outer Grass Base
    ctx.fillStyle = isBp ? '#0c4a6e' : this.c.jmGrass;
    ctx.strokeStyle = isBp ? '#38bdf8' : this.c.jmSandstoneDark;
    ctx.lineWidth = isBp ? 3 : 8;

    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const pulse = (Math.sin(this.animTime * 3) + 1) * 0.5;
    ctx.strokeStyle = `rgba(245, 158, 11, ${0.4 + pulse * 0.35})`;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r - 8, 0, Math.PI * 2);
    ctx.stroke();

    // 2. 8 Grand Sandstone Radial Walkways connecting Ring 0 into the Center Plaza
    const radials = [
      -Math.PI / 2, -Math.PI / 4, 0, Math.PI / 4,
      Math.PI / 2, (3 * Math.PI) / 4, Math.PI, -(3 * Math.PI) / 4
    ];

    radials.forEach(a => {
      ctx.save();
      // Outer sandstone curb
      ctx.strokeStyle = isBp ? '#0284c7' : '#c4b59d';
      ctx.lineWidth = 56;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r);
      ctx.stroke();

      // Paved walkway surface
      ctx.strokeStyle = isBp ? '#0369a1' : '#ded5c5';
      ctx.lineWidth = 44;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r);
      ctx.stroke();
      ctx.restore();
    });

    // 3. Grand Central Plaza Courtyard (Spacious circular paved terrace)
    ctx.fillStyle = isBp ? '#0284c7' : '#c4b59d';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 66, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isBp ? '#075985' : '#eae2d3';
    ctx.strokeStyle = isBp ? '#38bdf8' : '#bfa588';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner decorative compass rose ring
    ctx.strokeStyle = isBp ? '#38bdf8' : 'rgba(180, 150, 120, 0.5)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 42, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Historical Instruments in Garden Quadrants (Never blocking pathways)
    const sy = { gnomonWidth: 24, gnomonLength: 90, quadrantRadius: 55 };
    this.drawSamratYantra(c.x - 110, c.y - 110, sy, isBp, sunAngle);
    this.drawMisraYantra(c.x + 110, c.y - 110, isBp);
    this.drawJaiPrakashYantra({ bowl1: { x: c.x - 115, y: c.y + 110, radius: 22 }, bowl2: { x: c.x - 70, y: c.y + 125, radius: 22 } }, isBp);
    this.drawRamYantra(c.x + 110, c.y + 110, 26, isBp);
    this.drawCentralStage({ x: c.x - 45, y: c.y - 170, w: 90, h: 36 }, isBp);

    // 5. Draw Central Victory Protest Gandhi Cap
    this.drawGandhiCap(c.x, c.y, allFlagsCollected);

    ctx.restore();
  }

  // Draw Central Gandhi Protest Cap (White Gandhi Cap 🧢)
  drawGandhiCap(x, y, isUnlocked) {
    const ctx = this.ctx;
    ctx.save();
    const t = this.animTime;

    if (isUnlocked) {
      // 1. Radiant spinning starburst rays
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * 0.7);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.28)';
      ctx.lineWidth = 3.5;
      for (let i = 0; i < 12; i++) {
        const ang = (i * Math.PI * 2) / 12;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ang) * 95, Math.sin(ang) * 95);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Pulsing golden beacon ring
      const pulseR = 36 + Math.sin(t * 5) * 8;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(x, y, pulseR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.beginPath();
      ctx.arc(x, y, pulseR, 0, Math.PI * 2);
      ctx.fill();

      // 3. Floating Gandhi Cap (with bounce)
      const hoverY = y + Math.sin(t * 4) * 6;

      ctx.save();
      ctx.translate(x, hoverY);

      // Shadow below floating cap
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 16 - Math.sin(t * 4) * 3, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw Iconic White Khadi Gandhi Cap
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(-22, 6);
      ctx.quadraticCurveTo(-10, -18, 0, -22);
      ctx.quadraticCurveTo(10, -18, 22, 6);
      ctx.quadraticCurveTo(0, 10, -22, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Central Fold Line of Cap
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(0, 8);
      ctx.stroke();

      // Tricolor ribbon band at bottom of cap
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-18, 4, 36, 2.5);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(-18, 6.5, 36, 2.5);

      // Overhead animated arrow pointing to the Cap
      const arrowY = -34 + Math.sin(t * 6) * 4;
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⬇', 0, arrowY);

      // Claim Cap Victory Label
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-80, -62, 160, 22, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 10.5px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ CLAIM CAP TO WIN! ★', 0, -47);

      ctx.restore();
    } else {
      // Locked state: Cap sits on altar inside translucent barrier
      ctx.save();
      ctx.translate(x, y);

      // Altar base
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Semi-transparent cap inside
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-16, 4);
      ctx.quadraticCurveTo(-7, -12, 0, -15);
      ctx.quadraticCurveTo(7, -12, 16, 4);
      ctx.quadraticCurveTo(0, 7, -16, 4);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Small Lock Tag
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(-66, -34, 132, 18, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 9px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔒 COLLECT ALL FLAGS FIRST', 0, -21);

      ctx.restore();
    }

    ctx.restore();
  }



  // Jantar Mantar Instruments
  drawSamratYantra(x, y, sy, isBp, sunAngle) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = isBp ? '#bae6fd' : this.c.jmMarble;
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(x - sy.gnomonWidth / 2, y, sy.quadrantRadius, Math.PI * 0.5, Math.PI);
    ctx.arc(x + sy.gnomonWidth / 2, y, sy.quadrantRadius, 0, Math.PI * 0.5);
    ctx.stroke();

    ctx.fillStyle = isBp ? '#0284c7' : this.c.jmSandstone;
    ctx.strokeStyle = isBp ? '#38bdf8' : this.c.jmSandstoneDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - sy.gnomonWidth / 2, y - sy.gnomonLength / 2, sy.gnomonWidth, sy.gnomonLength, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawMisraYantra(x, y, isBp) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = isBp ? '#0369a1' : this.c.jmSandstone;
    ctx.fillRect(x - 30, y - 20, 60, 40);
    ctx.restore();
  }

  drawJaiPrakashYantra(jp, isBp) {
    const ctx = this.ctx;
    [jp.bowl1, jp.bowl2].forEach(b => {
      ctx.save();
      ctx.fillStyle = isBp ? '#bae6fd' : '#f8fafc';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawRamYantra(x, y, radius, isBp) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = isBp ? '#bae6fd' : this.c.jmMarble;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawCentralStage(st, isBp) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#f97316';
    ctx.fillRect(st.x, st.y, st.w, st.h);
    ctx.restore();
  }
}

if (typeof window !== 'undefined') {
  window.CircularMapDrawer = CircularMapDrawer;
}
