// Interactive Circular Concentric Dilli Radar Minimap
class DilliMinimap {
  constructor(canvasId, worldWidth, worldHeight, config, roadNetwork) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.config = config;
    this.roadNetwork = roadNetwork;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.theme = null;
    this.onMinimapClick = null;
    this.initClick();
  }

  setMapTheme(theme) {
    if (typeof theme === 'string' && window.MAP_THEMES) {
      this.theme = window.MAP_THEMES[theme] || window.MAP_THEMES['jantar_dark'];
    } else {
      this.theme = theme;
    }
  }

  setWorldSize(worldWidth, worldHeight) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
  }

  initClick() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const worldX = (clickX / this.width) * this.worldWidth;
      const worldY = (clickY / this.height) * this.worldHeight;

      if (this.onMinimapClick) {
        this.onMinimapClick(worldX, worldY);
      }
    });
  }

  draw(camera, player, policeOfficers = [], flags = []) {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Background
    ctx.fillStyle = this.theme ? this.theme.bgCanvas : '#0b1120';
    ctx.fillRect(0, 0, w, h);

    const scaleX = w / this.worldWidth;
    const scaleY = h / this.worldHeight;
    const cx = this.config.circularLayout.center.x * scaleX;
    const cy = this.config.circularLayout.center.y * scaleY;

    // 1. Draw All Road Network Segments of the Active Route Map
    ctx.strokeStyle = this.theme ? (this.theme.curbColor || '#334155') : '#334155';
    ctx.lineWidth = 2.8;

    const segments = (this.roadNetwork && this.roadNetwork.segments) || [];
    segments.forEach(seg => {
      ctx.beginPath();
      if (seg.type === 'line') {
        ctx.moveTo(seg.x1 * scaleX, seg.y1 * scaleY);
        ctx.lineTo(seg.x2 * scaleX, seg.y2 * scaleY);
      } else if (seg.type === 'arc') {
        ctx.arc(seg.cx * scaleX, seg.cy * scaleY, seg.radius * scaleX, seg.startAngle, seg.endAngle);
      }
      ctx.stroke();
    });

    // 3. Central Sanctuary Circle & Golden Cap/Star
    const allSecured = flags.length > 0 && flags.every(f => f.isCollected);
    ctx.fillStyle = this.theme ? this.theme.centerGrass : '#86efac';
    ctx.beginPath();
    ctx.arc(cx, cy, (this.config.circularLayout.rings[0] ? this.config.circularLayout.rings[0].radius : 240) * scaleX, 0, Math.PI * 2);
    ctx.fill();

    if (allSecured) {
      // Golden pulsing beacon on radar
      const pR = 10 + Math.sin(Date.now() / 150) * 4;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, pR, 0, Math.PI * 2);
      ctx.stroke();
      this.drawStar(cx, cy, 5, 10, 5, '#facc15');
    } else {
      this.drawStar(cx, cy, 5, 8, 4, this.theme ? this.theme.accent : '#eab308');
    }

    // 4. Draw Uncollected Protest Flags
    flags.forEach(f => {
      if (f.isCollected) return;
      const fx = f.x * scaleX;
      const fy = f.y * scaleY;

      ctx.fillStyle = f.color || '#ef4444';
      ctx.beginPath();
      ctx.arc(fx, fy, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    const isMobile = (typeof window !== 'undefined' && window.innerWidth <= 768);

    // 5. Draw Police Officers (Red Dots with Alert Pulse)
    policeOfficers.forEach(p => {
      const px = p.x * scaleX;
      const py = p.y * scaleY;
      const pRad = p.state === 'chase' ? (isMobile ? 5 : 4) : (isMobile ? 3.5 : 2.5);

      ctx.fillStyle = p.state === 'chase' ? '#ef4444' : '#f97316';
      ctx.beginPath();
      ctx.arc(px, py, pRad, 0, Math.PI * 2);
      ctx.fill();

      if (p.state === 'chase') {
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = isMobile ? 1.5 : 1;
        ctx.stroke();
      }
    });

    // 6. Draw Player (Green Dot)
    if (player) {
      const plx = player.x * scaleX;
      const ply = player.y * scaleY;

      ctx.fillStyle = '#16a34a';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = isMobile ? 2 : 1.5;
      ctx.beginPath();
      ctx.arc(plx, ply, isMobile ? 6 : 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // 7. Camera Viewport Box on Radar
    const camBounds = camera.getVisibleBounds();
    const bx = camBounds.minX * scaleX;
    const by = camBounds.minY * scaleY;
    const bw = (camBounds.maxX - camBounds.minX) * scaleX;
    const bh = (camBounds.maxY - camBounds.minY) * scaleY;

    ctx.strokeStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(bx, by, bw, bh);
  }

  drawStar(cx, cy, spikes, outerRadius, innerRadius, color) {
    const ctx = this.ctx;
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
}

if (typeof window !== 'undefined') {
  window.DilliMinimap = DilliMinimap;
}
