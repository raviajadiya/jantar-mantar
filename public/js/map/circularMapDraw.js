// Circular Concentric Map & Central Jantar Mantar Visual Drawing Engine
class CircularMapDrawer {
  constructor(ctx, config, roadNetwork) {
    this.ctx = ctx;
    this.config = config;
    this.roadNetwork = roadNetwork;
    this.center = config.circularLayout.center;
    this.rings = config.circularLayout.rings;
    this.radials = config.circularLayout.radialAvenues;
    this.c = config.colors;
    this.roadW = config.world.roadWidth || 90;
    this.animTime = 0;
  }

  draw(mapMode = 'standard', deltaTime = 0.016, sunAngle = 1.1) {
    this.animTime += deltaTime;
    const ctx = this.ctx;

    // 1. Draw City Building Blocks in sectors between roads
    this.drawCityBuildingBlocks(mapMode);

    // 2. Draw Concentric Circular Roads & Radial Avenues
    this.drawRoadCorridors(mapMode);

    // 3. Draw Road Markings & Zebra Crossings
    this.drawRoadMarkings(mapMode);

    // 4. Draw Central Jantar Mantar Sanctuary (Samrat Yantra, Misra Yantra, Dharna Stage)
    this.drawCentralJantarMantar(mapMode, sunAngle);
  }

  // Draw curved building blocks situated between rings and radials
  drawCityBuildingBlocks(mapMode) {
    const ctx = this.ctx;
    const isBp = mapMode === 'blueprint';
    const numRadials = this.radials.length;
    const halfW = this.roadW / 2;

    const blockColors = ['#eae2d3', '#f1f5f9', '#fed7aa', '#e2e8f0', '#fef08a', '#e2d9cc'];
    const shopNames = [
      'RAJU DHABA', 'SHIV DHABA', 'AGARWAL SWEETS', 'KUMAR MOBILE',
      'CYBER CAFE', 'CHOLE KULCHE', 'LASSI BHANDAR', 'VIP TAILORS',
      'PG FOR BOYS', 'JOSHI FLATS', 'SHARMA CHAI', 'DELHI SWEETS'
    ];

    // For each pair of adjacent rings and radials, build a solid block
    for (let rIdx = 0; rIdx < this.rings.length - 1; rIdx++) {
      const innerR = this.rings[rIdx].radius + halfW + 6;
      const outerR = this.rings[rIdx + 1].radius - halfW - 6;

      if (outerR <= innerR) continue;

      for (let radIdx = 0; radIdx < numRadials; radIdx++) {
        const nextRadIdx = (radIdx + 1) % numRadials;
        const radA = this.radials[radIdx];
        const radB = this.radials[nextRadIdx];

        let startAngle = radA.angle + 0.07;
        let endAngle = radB.angle - 0.07;
        if (endAngle <= startAngle) endAngle += Math.PI * 2;

        ctx.save();

        // Building Shadow
        if (!isBp) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
          ctx.beginPath();
          ctx.arc(this.center.x + 8, this.center.y + 8, outerR, startAngle, endAngle);
          ctx.arc(this.center.x + 8, this.center.y + 8, innerR, endAngle, startAngle, true);
          ctx.closePath();
          ctx.fill();
        }

        // Building Block Base
        ctx.fillStyle = isBp ? '#0c4a6e' : blockColors[(rIdx * 3 + radIdx) % blockColors.length];
        ctx.strokeStyle = isBp ? '#38bdf8' : '#94a3b8';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, outerR, startAngle, endAngle);
        ctx.arc(this.center.x, this.center.y, innerR, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Parapet / Roof Details
        if (!isBp) {
          // Mid-angle for rooftop props
          const midA = (startAngle + endAngle) / 2;
          const midR = (innerR + outerR) / 2;
          const px = this.center.x + Math.cos(midA) * midR;
          const py = this.center.y + Math.sin(midA) * midR;

          // Black Sintex Water Tank
          this.drawSintexTank(px - 14, py - 14);
          this.drawSintexTank(px + 14, py + 14);

          // AC Unit
          ctx.fillStyle = '#e2e8f0';
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1;
          ctx.fillRect(px - 12, py - 6, 24, 12);
          ctx.strokeRect(px - 12, py - 6, 24, 12);

          // Shop Banner on the Outer Edge
          const shopIdx = (rIdx * numRadials + radIdx) % shopNames.length;
          this.drawCurvedShopSign(midA, outerR - 10, shopNames[shopIdx]);
        }

        ctx.restore();
      }
    }
  }

  // Draw Asphalt Roads (Rings & Radials)
  drawRoadCorridors(mapMode) {
    const ctx = this.ctx;
    const isBp = mapMode === 'blueprint';
    const halfW = this.roadW / 2;

    ctx.save();

    // 1. Draw Concentric Circular Road Rings
    this.rings.forEach(ring => {
      // Curb border
      ctx.strokeStyle = isBp ? '#0284c7' : this.c.footpath;
      ctx.lineWidth = this.roadW + 16;
      ctx.beginPath();
      ctx.arc(this.center.x, this.center.y, ring.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Asphalt Surface
      ctx.strokeStyle = isBp ? '#1e293b' : this.c.asphalt;
      ctx.lineWidth = this.roadW;
      ctx.beginPath();
      ctx.arc(this.center.x, this.center.y, ring.radius, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 2. Draw 8 Radial Avenues from Ring 0 to Ring 4
    const maxRadius = this.rings[this.rings.length - 1].radius;
    this.radials.forEach(rad => {
      const cosA = Math.cos(rad.angle);
      const sinA = Math.sin(rad.angle);

      // Curb border
      ctx.strokeStyle = isBp ? '#0284c7' : this.c.footpath;
      ctx.lineWidth = this.roadW + 16;
      ctx.beginPath();
      ctx.moveTo(this.center.x, this.center.y);
      ctx.lineTo(this.center.x + cosA * (maxRadius + 60), this.center.y + sinA * (maxRadius + 60));
      ctx.stroke();

      // Asphalt Surface
      ctx.strokeStyle = isBp ? '#1e293b' : this.c.asphalt;
      ctx.lineWidth = this.roadW;
      ctx.beginPath();
      ctx.moveTo(this.center.x, this.center.y);
      ctx.lineTo(this.center.x + cosA * (maxRadius + 60), this.center.y + sinA * (maxRadius + 60));
      ctx.stroke();
    });

    ctx.restore();
  }

  // Road Lane Divider Markings & Zebra Crossings
  drawRoadMarkings(mapMode) {
    const ctx = this.ctx;
    if (mapMode === 'blueprint') return;

    ctx.save();
    ctx.strokeStyle = this.c.roadMarking;
    ctx.lineWidth = 2.5;

    // A. Dashed Center Lines along Circular Rings
    this.rings.forEach((ring, idx) => {
      if (idx === 0) return; // Central circle has no divider
      ctx.setLineDash([18, 14]);
      ctx.beginPath();
      ctx.arc(this.center.x, this.center.y, ring.radius, 0, Math.PI * 2);
      ctx.stroke();
    });

    // B. Dashed Center Lines along Radial Avenues
    const maxR = this.rings[this.rings.length - 1].radius;
    this.radials.forEach(rad => {
      const cosA = Math.cos(rad.angle);
      const sinA = Math.sin(rad.angle);

      ctx.setLineDash([18, 14]);
      ctx.beginPath();
      ctx.moveTo(this.center.x + cosA * this.rings[0].radius, this.center.y + sinA * this.rings[0].radius);
      ctx.lineTo(this.center.x + cosA * maxR, this.center.y + sinA * maxR);
      ctx.stroke();
    });

    ctx.setLineDash([]); // Reset dash

    // C. Zebra Crossings at Intersections
    this.rings.forEach((ring, rIdx) => {
      if (rIdx === 0) return;
      this.radials.forEach(rad => {
        const ix = this.center.x + Math.cos(rad.angle) * ring.radius;
        const iy = this.center.y + Math.sin(rad.angle) * ring.radius;
        this.drawZebraCrossing(ix, iy, rad.angle + Math.PI / 2);
      });
    });

    ctx.restore();
  }

  drawZebraCrossing(x, y, angle) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = '#ffffff';

    for (let i = -30; i <= 30; i += 12) {
      ctx.fillRect(i, -12, 6, 24);
    }
    ctx.restore();
  }

  // Central Jantar Mantar Sanctuary (Victory Destination)
  drawCentralJantarMantar(mapMode, sunAngle) {
    const ctx = this.ctx;
    const jm = this.config.centerJantarMantar;
    const isBp = mapMode === 'blueprint';
    const c = this.center;
    const r = jm.radius;

    ctx.save();

    // 1. Lush Green Central Lawn
    ctx.fillStyle = isBp ? '#0c4a6e' : this.c.jmGrass;
    ctx.strokeStyle = isBp ? '#38bdf8' : this.c.jmSandstoneDark;
    ctx.lineWidth = isBp ? 3 : 8;

    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner Sanctuary Golden Victory Aura
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

    // 2. Vrihat Samrat Yantra (Center Monument)
    this.drawSamratYantra(c.x, c.y, jm.samratYantra, isBp, sunAngle);

    // 3. Misra Yantra (North-East)
    this.drawMisraYantra(jm.misraYantra.x, jm.misraYantra.y, isBp);

    // 4. Jai Prakash Yantra (South-West)
    this.drawJaiPrakashYantra(jm.jaiPrakashYantra, isBp);

    // 5. Ram Yantra (South-East)
    this.drawRamYantra(jm.ramYantra.tower1.x, jm.ramYantra.tower1.y, jm.ramYantra.tower1.radius, isBp);

    // 6. Central Dharna Dais (Victory Stage)
    this.drawCentralStage(jm.protestStage, isBp);

    // Perimeter Gates at each radial spoke
    this.radials.forEach(rad => {
      const gx = c.x + Math.cos(rad.angle) * r;
      const gy = c.y + Math.sin(rad.angle) * r;
      this.drawHeritageGate(gx, gy, rad.angle);
    });

    ctx.restore();
  }

  // Draw Samrat Yantra at Center
  drawSamratYantra(x, y, sy, isBp, sunAngle) {
    const ctx = this.ctx;
    ctx.save();

    // Shadow
    if (!isBp) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      const sLen = 90 * Math.cos(sunAngle);
      ctx.beginPath();
      ctx.moveTo(x - sy.gnomonWidth / 2, y + sy.gnomonLength / 2);
      ctx.lineTo(x + sy.gnomonWidth / 2, y + sy.gnomonLength / 2);
      ctx.lineTo(x + sy.gnomonWidth / 2 + sLen, y - sy.gnomonLength / 2);
      ctx.lineTo(x - sy.gnomonWidth / 2 + sLen, y - sy.gnomonLength / 2);
      ctx.closePath();
      ctx.fill();
    }

    // Marble Quadrants (West & East Arcs)
    ctx.strokeStyle = isBp ? '#bae6fd' : this.c.jmMarble;
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(x - sy.gnomonWidth / 2, y, sy.quadrantRadius, Math.PI * 0.5, Math.PI);
    ctx.arc(x + sy.gnomonWidth / 2, y, sy.quadrantRadius, 0, Math.PI * 0.5);
    ctx.stroke();

    // Central Triangular Gnomon Ramp
    ctx.fillStyle = isBp ? '#0284c7' : this.c.jmSandstone;
    ctx.strokeStyle = isBp ? '#38bdf8' : this.c.jmSandstoneDark;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(x - sy.gnomonWidth / 2, y - sy.gnomonLength / 2, sy.gnomonWidth, sy.gnomonLength, 4);
    ctx.fill();
    ctx.stroke();

    // Steps running up gnomon
    ctx.fillStyle = isBp ? '#ffffff' : this.c.jmMarble;
    const steps = 18;
    const stepH = sy.gnomonLength / steps;
    for (let i = 0; i < steps; i++) {
      ctx.fillRect(x - sy.gnomonWidth / 2 + 3, y - sy.gnomonLength / 2 + i * stepH, sy.gnomonWidth - 6, stepH - 1.5);
    }

    // Top Pavilion
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x, y - sy.gnomonLength / 2, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Misra Yantra
  drawMisraYantra(x, y, isBp) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = isBp ? '#0369a1' : this.c.jmSandstone;
    ctx.strokeStyle = isBp ? '#38bdf8' : '#7c2716';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(x - 30, y - 20, 60, 40, 6);
    ctx.fill();
    ctx.stroke();

    // Two heart arch wings
    ctx.fillStyle = isBp ? '#bae6fd' : this.c.jmMarble;
    ctx.beginPath();
    ctx.arc(x - 14, y - 5, 12, 0, Math.PI * 2);
    ctx.arc(x + 14, y - 5, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw Jai Prakash twin bowls
  drawJaiPrakashYantra(jp, isBp) {
    const ctx = this.ctx;
    [jp.bowl1, jp.bowl2].forEach(b => {
      ctx.save();
      ctx.fillStyle = isBp ? '#0c4a6e' : this.c.jmSandstone;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isBp ? '#bae6fd' : '#f8fafc';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      // Crosshairs
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(b.x - b.radius, b.y);
      ctx.lineTo(b.x + b.radius, b.y);
      ctx.moveTo(b.x, b.y - b.radius);
      ctx.lineTo(b.x, b.y + b.radius);
      ctx.stroke();
      ctx.restore();
    });
  }

  // Draw Ram Yantra
  drawRamYantra(x, y, radius, isBp) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = isBp ? '#0284c7' : this.c.jmSandstone;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isBp ? '#bae6fd' : this.c.jmMarble;
    ctx.beginPath();
    ctx.arc(x, y, radius - 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.c.jmSandstoneDark;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Central Dharna Victory Stage
  drawCentralStage(st, isBp) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#f97316';
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(st.x, st.y, st.w, st.h, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ JANTAR MANTAR DHARNA ★', st.x + st.w / 2, st.y + st.h / 2 + 3);
    ctx.restore();
  }

  drawHeritageGate(x, y, angle) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.fillStyle = this.c.jmSandstoneDark;
    ctx.fillRect(-10, -18, 20, 8);
    ctx.fillRect(-10, 10, 20, 8);
    ctx.restore();
  }

  drawCurvedShopSign(angle, radius, text) {
    const ctx = this.ctx;
    ctx.save();
    const sx = this.center.x + Math.cos(angle) * radius;
    const sy = this.center.y + Math.sin(angle) * radius;

    ctx.translate(sx, sy);
    ctx.rotate(angle + Math.PI / 2);

    ctx.fillStyle = '#b91c1c';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.fillRect(-35, -7, 70, 14);
    ctx.strokeRect(-35, -7, 70, 14);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 0, 3);

    ctx.restore();
  }

  drawSintexTank(x, y) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = this.c.sintexBlack;
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

if (typeof window !== 'undefined') {
  window.CircularMapDrawer = CircularMapDrawer;
}
