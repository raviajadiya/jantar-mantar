// Protest Flag Collection System along Road Network
class FlagManager {
  constructor(config, roadNetwork) {
    this.config = config;
    this.roadNetwork = roadNetwork;
    this.flags = [];
    this.particles = [];
    this.animTime = 0;

    this.initFlags();
  }

  initFlags() {
    const rawFlags = this.config.flagLocations;
    const center = this.config.circularLayout.center;
    const rings = this.config.circularLayout.rings;
    const radials = this.config.circularLayout.radialAvenues;

    this.flags = rawFlags.map((rf, idx) => {
      const ring = rings[rf.ringIndex];
      const radial = radials[rf.radialIndex];
      const x = center.x + Math.cos(radial.angle) * ring.radius;
      const y = center.y + Math.sin(radial.angle) * ring.radius;

      return {
        id: rf.id,
        name: rf.name,
        label: rf.label,
        color: rf.color || '#ef4444',
        x,
        y,
        isCollected: false,
        pulseOffset: idx * 0.7
      };
    });
  }

  update(deltaTime, player, onCollect) {
    this.animTime += deltaTime;

    // Check player proximity to uncollected flags (generous pickup radius along road)
    this.flags.forEach(f => {
      if (f.isCollected) return;

      const dist = Math.hypot(player.x - f.x, player.y - f.y);
      if (dist < 65) {
        f.isCollected = true;
        this.spawnCollectParticles(f.x, f.y, f.color);
        if (onCollect) onCollect(f);
      }
    });

    // Update collect particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.life -= deltaTime;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  spawnCollectParticles(x, y, color) {
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 0.8 + Math.random() * 0.4,
        size: 3 + Math.random() * 3
      });
    }
  }

  draw(ctx, mapMode = 'standard') {
    // 1. Draw Flags
    this.flags.forEach(f => {
      if (f.isCollected) return;
      this.drawFlag(ctx, f);
    });

    // 2. Draw Particles
    this.particles.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawFlag(ctx, f) {
    ctx.save();
    ctx.translate(f.x, f.y);

    // Glowing base aura
    const pulse = Math.sin(this.animTime * 4 + f.pulseOffset) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(245, 158, 11, ${pulse * 0.35})`;
    ctx.beginPath();
    ctx.arc(0, 0, 24 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Flagpole base stone
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Golden Flagpole
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-2, -36, 4, 38);

    // Waving Banner Cloth
    const wave = Math.sin(this.animTime * 6 + f.pulseOffset) * 4;
    const flagW = 28;
    const flagH = 18;

    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.moveTo(2, -36);
    ctx.lineTo(2 + flagW + wave, -36 + wave * 0.5);
    ctx.lineTo(2 + flagW + wave, -36 + flagH + wave * 0.5);
    ctx.lineTo(2, -36 + flagH);
    ctx.closePath();
    ctx.fill();

    // Flag Label Tag
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-40, -56, 80, 16, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8.5px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(f.name, 0, -45);

    ctx.restore();
  }

  getCollectedCount() {
    return this.flags.filter(f => f.isCollected).length;
  }

  getTotalCount() {
    return this.flags.length;
  }

  isAllCollected() {
    return this.getCollectedCount() === this.getTotalCount();
  }
}

if (typeof window !== 'undefined') {
  window.FlagManager = FlagManager;
}
