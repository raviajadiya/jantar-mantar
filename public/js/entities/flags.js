// Protest Flag Collection System along Road Network
class FlagManager {
  constructor(config, roadNetwork) {
    this.config = config;
    this.roadNetwork = roadNetwork;
    this.flags = [];
    this.particles = [];
    this.animTime = 0;

    this.countryFlag = null;
    this.initFlags();
  }

  // Update all map flags to match chosen country
  setCountryFlag(countryFlag) {
    if (!countryFlag) return;
    this.countryFlag = countryFlag;
    this.flags.forEach((f, idx) => {
      f.countryEmoji = countryFlag.emoji;
      f.countryName = countryFlag.name;
      f.stripeColors = countryFlag.stripeColors || [countryFlag.color || '#f97316'];
      f.color = countryFlag.color || (countryFlag.stripeColors && countryFlag.stripeColors[0]) || '#f97316';
      f.name = `${countryFlag.emoji} Flag #${idx + 1} (${countryFlag.name})`;
    });
  }

  hexToRgb(hex) {
    if (!hex || hex[0] !== '#') return '245, 158, 11';
    let c = hex.substring(1);
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
  }

  initFlags(level = 1) {
    this.currentLevel = Math.max(1, parseInt(level) || 1);
    const center = this.config.circularLayout.center;
    const rings = this.config.circularLayout.rings;
    const radials = this.config.circularLayout.radialAvenues;
    const numRings = rings.length;

    // Number of flags increases with each level: Level 1: 6, Level 2: 8, Level 3: 10...
    const count = 4 + this.currentLevel * 2;
    const country = this.countryFlag || {
      emoji: '🇮🇳',
      name: 'India',
      color: '#f97316',
      stripeColors: ['#f97316', '#ffffff', '#16a34a']
    };

    const newFlags = [];
    for (let i = 0; i < count; i++) {
      // Distribute from ring 1 up to outermost ring, spreading across radials
      const ringIdx = 1 + (i % (numRings - 1));
      const radIdx = (i * 3 + 1) % radials.length;
      const ring = rings[ringIdx] || rings[rings.length - 1];
      const radial = radials[radIdx];

      const x = center.x + Math.cos(radial.angle) * ring.radius;
      const y = center.y + Math.sin(radial.angle) * ring.radius;

      newFlags.push({
        id: `flag-lvl${this.currentLevel}-${i + 1}`,
        name: `${country.emoji} Flag #${i + 1} (${country.name})`,
        label: `${radial.name ? radial.name.split(' ')[0] : 'Delhi'} Flag`,
        color: country.color || '#ef4444',
        stripeColors: country.stripeColors || ['#f97316', '#ffffff', '#16a34a'],
        countryEmoji: country.emoji,
        x,
        y,
        isCollected: false,
        pulseOffset: i * 0.65
      });
    }

    this.flags = newFlags;
    this.particles = [];
  }

  // Position flags on the active route map's specific road coordinates
  initFlagsForMap(mapTheme) {
    if (!mapTheme || !mapTheme.flagLocations) {
      this.initFlags();
      return;
    }
    const locs = mapTheme.flagLocations;
    const country = this.countryFlag || {
      emoji: '🇮🇳',
      name: 'India',
      color: '#f97316',
      stripeColors: ['#f97316', '#ffffff', '#16a34a']
    };

    this.flags = locs.map((loc, idx) => ({
      id: loc.id || `flag-${idx + 1}`,
      name: `${country.emoji} Flag #${idx + 1} (${country.name})`,
      label: loc.name,
      color: country.color || loc.color || '#ef4444',
      stripeColors: country.stripeColors || ['#f97316', '#ffffff', '#16a34a'],
      countryEmoji: country.emoji,
      x: loc.x,
      y: loc.y,
      isCollected: false,
      pulseOffset: idx * 0.7
    }));
  }

  update(deltaTime, player, onCollect) {
    this.animTime += deltaTime;

    // Check player proximity to uncollected flags (generous pickup radius along road)
    this.flags.forEach(f => {
      if (f.isCollected) return;

      const dist = Math.hypot(player.x - f.x, player.y - f.y);
      if (dist < 65) {
        f.isCollected = true;
        this.spawnCollectParticles(f.x, f.y, f.stripeColors || [f.color]);
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

  spawnCollectParticles(x, y, colors) {
    const colorList = Array.isArray(colors) ? colors : [colors || '#f59e0b'];
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 150;
      const c = colorList[Math.floor(Math.random() * colorList.length)];
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: c,
        life: 0.9 + Math.random() * 0.5,
        size: 3 + Math.random() * 4
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

    // Glowing base aura with country color
    const auraColor = (this.countryFlag && this.countryFlag.color) || '#f59e0b';
    const pulse = Math.sin(this.animTime * 4 + f.pulseOffset) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(${this.hexToRgb(auraColor)}, ${pulse * 0.38})`;
    ctx.beginPath();
    ctx.arc(0, 0, 26 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Flagpole base stone
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Golden Flagpole
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-2, -38, 4, 40);

    // Waving Banner Cloth with Dynamic Country Stripes
    const wave = Math.sin(this.animTime * 6 + f.pulseOffset) * 4;
    const flagW = 32;
    const flagH = 20;

    const stripes = (f.stripeColors && f.stripeColors.length > 0)
      ? f.stripeColors
      : ((this.countryFlag && this.countryFlag.stripeColors) || ['#f97316', '#ffffff', '#16a34a']);

    const stripeH = flagH / stripes.length;
    for (let s = 0; s < stripes.length; s++) {
      ctx.fillStyle = stripes[s];
      ctx.beginPath();
      const topY = -38 + s * stripeH;
      const botY = topY + stripeH;
      ctx.moveTo(2, topY);
      ctx.lineTo(2 + flagW + wave, topY + wave * 0.5);
      ctx.lineTo(2 + flagW + wave, botY + wave * 0.5);
      ctx.lineTo(2, botY);
      ctx.closePath();
      ctx.fill();
    }

    // Flag crisp outline
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(2, -38);
    ctx.lineTo(2 + flagW + wave, -38 + wave * 0.5);
    ctx.lineTo(2 + flagW + wave, -38 + flagH + wave * 0.5);
    ctx.lineTo(2, -38 + flagH);
    ctx.closePath();
    ctx.stroke();

    // Flag Label Tag with Country Emoji
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = auraColor;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(-46, -60, 92, 18, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9.5px "Outfit", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tagEmoji = f.countryEmoji || (this.countryFlag ? this.countryFlag.emoji : '🚩');
    ctx.fillText(`${tagEmoji} ${f.label || f.name}`, 0, -50);

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
