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
    this.currentMapId = themeId || 'jantar';
    const themes = window.MAP_THEMES || {};
    const theme = themes[this.currentMapId] || themes['jantar'] || {
      id: 'jantar',
      bgCanvas: '#e3dfd3',
      roadAsphalt: '#3d444d',
      curbColor: '#bfb5a2',
      roadMarking: '#f4ede2',
      centerGrass: '#4a7c3f',
      centerBorder: '#932d19',
      centerAura: 'rgba(245, 158, 11, 0.45)',
      blockColors: ['#eae2d3', '#f1f5f9', '#fed7aa', '#e2e8f0', '#fef08a', '#e2d9cc'],
      shopNames: ['RAJU DHABA', 'SHIV DHABA', 'AGARWAL SWEETS', 'KUMAR MOBILE']
    };

    this.theme = theme;
    this.c.asphalt = theme.roadAsphalt;
    this.c.footpath = theme.curbColor;
    this.c.roadMarking = theme.roadMarking;
    this.config.world.bgColor = theme.bgCanvas;
    this.blockColors = theme.blockColors;
    this.shopNames = theme.shopNames;
  }

  draw(mapMode = 'standard', deltaTime = 0.016, sunAngle = 1.1) {
    this.animTime += deltaTime;
    const ctx = this.ctx;

    // 1. Draw City Building Blocks for Jantar Mantar
    this.drawJantarBlocks(mapMode);

    // 2. Draw Distinct Road Corridors from roadNetwork.segments
    this.drawRoadCorridors(mapMode);

    // 3. Draw Road Markings & Lane Dividers
    this.drawRoadMarkings(mapMode);

    // 4. Draw Central Jantar Mantar Sanctuary Landmark
    this.drawCentralJantarMantar(mapMode, sunAngle);
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
      ctx.beginPath();
      if (seg.type === 'line') {
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
      } else if (seg.type === 'arc') {
        if (seg.radius > 260) {
          ctx.arc(seg.cx, seg.cy, seg.radius, seg.startAngle, seg.endAngle);
        }
      }
      ctx.stroke();
    });

    ctx.setLineDash([]);
    ctx.restore();
  }

  // ========================================================
  // CITY BUILDING BLOCKS GENERATOR (TAILORED PER ROUTE MAP)
  // ========================================================
  // Jantar Mantar: 5-Ring & 8-Radial Curved Sectors
  drawJantarBlocks(mapMode) {
    const rings = [240, 480, 760, 1080, 1400];
    const numRadials = 8;
    this.drawConcentricBlockGrid(rings, numRadials, 90, mapMode);
  }

  // Generic circular concentric block grid drawer
  drawConcentricBlockGrid(rings, numRadials, roadW, mapMode, isColonnade = false) {
    const ctx = this.ctx;
    const isBp = mapMode === 'blueprint';
    const halfW = roadW / 2;
    const blockColors = this.blockColors || ['#eae2d3', '#f1f5f9', '#fed7aa'];
    const shopNames = this.shopNames || ['DELHI STORE'];

    for (let rIdx = 0; rIdx < rings.length - 1; rIdx++) {
      const innerR = rings[rIdx] + halfW + 6;
      const outerR = rings[rIdx + 1] - halfW - 6;
      if (outerR <= innerR) continue;

      for (let radIdx = 0; radIdx < numRadials; radIdx++) {
        const a1 = (radIdx * Math.PI * 2) / numRadials + 0.06;
        const a2 = ((radIdx + 1) * Math.PI * 2) / numRadials - 0.06;

        ctx.save();
        // Shadow
        if (!isBp) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
          ctx.beginPath();
          ctx.arc(this.center.x + 8, this.center.y + 8, outerR, a1, a2);
          ctx.arc(this.center.x + 8, this.center.y + 8, innerR, a2, a1, true);
          ctx.closePath();
          ctx.fill();
        }

        // Block Base
        ctx.fillStyle = isBp ? '#0c4a6e' : blockColors[(rIdx * 3 + radIdx) % blockColors.length];
        ctx.strokeStyle = isBp ? '#38bdf8' : (isColonnade ? '#cbd5e1' : '#94a3b8');
        ctx.lineWidth = 2.5;

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
  drawCentralJantarMantar(mapMode, sunAngle) {
    const ctx = this.ctx;
    const jm = this.config.centerJantarMantar;
    const isBp = mapMode === 'blueprint';
    const c = this.center;
    const r = 240;

    ctx.save();
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

    // Pathways
    ctx.fillStyle = isBp ? '#0369a1' : '#d6c8b0';
    ctx.fillRect(c.x - 14, c.y - r, 28, r * 2);
    ctx.fillRect(c.x - r, c.y - 14, r * 2, 28);

    // Monuments
    this.drawSamratYantra(c.x, c.y, jm.samratYantra, isBp, sunAngle);
    this.drawMisraYantra(jm.misraYantra.x, jm.misraYantra.y, isBp);
    this.drawJaiPrakashYantra(jm.jaiPrakashYantra, isBp);
    this.drawRamYantra(jm.ramYantra.tower1.x, jm.ramYantra.tower1.y, jm.ramYantra.tower1.radius, isBp);
    this.drawCentralStage(jm.protestStage, isBp);

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
