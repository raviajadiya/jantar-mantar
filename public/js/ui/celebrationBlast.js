// Celebration Confetti & Paper Card Blast Engine
class CelebrationBlastEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animId = null;
    this.isActive = false;
  }

  init() {
    if (!this.canvas) {
      this.canvas = document.getElementById('victory-confetti-canvas');
      if (this.canvas) {
        this.ctx = this.canvas.getContext('2d');
      }
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  blast() {
    this.init();
    if (!this.canvas || !this.ctx) return;

    this.stop();
    this.resize();
    this.isActive = true;
    this.particles = [];

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    // Burst 1: Primary Central Card & Star Explosion (140 particles)
    this.spawnBurst(cx, cy, 140, { minSpeed: 6, maxSpeed: 24, spread: Math.PI * 2, angle: 0 });

    // Burst 2: Left celebratory party cannon (at 180ms)
    setTimeout(() => {
      if (!this.isActive) return;
      this.spawnBurst(window.innerWidth * 0.18, window.innerHeight * 0.75, 65, {
        minSpeed: 10,
        maxSpeed: 25,
        spread: Math.PI * 0.45,
        angle: -Math.PI * 0.28
      });
    }, 180);

    // Burst 3: Right celebratory party cannon (at 360ms)
    setTimeout(() => {
      if (!this.isActive) return;
      this.spawnBurst(window.innerWidth * 0.82, window.innerHeight * 0.75, 65, {
        minSpeed: 10,
        maxSpeed: 25,
        spread: Math.PI * 0.45,
        angle: -Math.PI * 0.72
      });
    }, 360);

    // Burst 4: Shimmering gold star cascade (at 550ms)
    setTimeout(() => {
      if (!this.isActive) return;
      this.spawnStarsShower(cx, cy - 100, 45);
    }, 550);

    this.animate();
  }

  spawnBurst(originX, originY, count, opts) {
    const cardColors = [
      '#f97316', // Indian Saffron
      '#ffffff', // White
      '#16a34a', // Indian Green
      '#facc15', // Sparkling Gold
      '#38bdf8', // Sky Blue
      '#ec4899', // Festival Pink
      '#a855f7', // Royal Purple
      '#f59e0b', // Radiant Amber
      '#ef4444'  // Festive Red
    ];

    const starColors = ['#fde047', '#facc15', '#eab308', '#ffffff'];

    for (let i = 0; i < count; i++) {
      const typeRoll = Math.random();
      const isStar = typeRoll < 0.30;
      const isRibbon = typeRoll >= 0.30 && typeRoll < 0.48;
      const isCard = !isStar && !isRibbon;

      const angle = (opts.angle - opts.spread / 2) + Math.random() * opts.spread;
      const speed = opts.minSpeed + Math.random() * (opts.maxSpeed - opts.minSpeed);

      this.particles.push({
        x: originX + (Math.random() - 0.5) * 50,
        y: originY + (Math.random() - 0.5) * 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        type: isStar ? 'star' : (isRibbon ? 'ribbon' : 'card'),
        color: isStar ? starColors[Math.floor(Math.random() * starColors.length)] : cardColors[Math.floor(Math.random() * cardColors.length)],
        w: isCard ? (11 + Math.random() * 12) : (isRibbon ? 6 : 15),
        h: isCard ? (8 + Math.random() * 10) : (isRibbon ? (22 + Math.random() * 26) : 15),
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        spinX: (Math.random() - 0.5) * 0.28,
        spinY: (Math.random() - 0.5) * 0.28,
        spinZ: (Math.random() - 0.5) * 0.18,
        gravity: 0.36 + Math.random() * 0.18,
        drag: 0.965,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.05 + Math.random() * 0.08,
        wobbleAmp: 1.2 + Math.random() * 2.0,
        opacity: 1.0,
        fadeSpeed: 0.003 + Math.random() * 0.005,
        life: 0
      });
    }
  }

  spawnStarsShower(originX, originY, count) {
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
      const speed = 4 + Math.random() * 8;
      this.particles.push({
        x: originX + (Math.random() - 0.5) * 260,
        y: originY + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        type: 'star',
        color: '#facc15',
        w: 16,
        h: 16,
        rotX: 0,
        rotY: 0,
        rotZ: Math.random() * Math.PI * 2,
        spinX: 0,
        spinY: 0,
        spinZ: (Math.random() - 0.5) * 0.12,
        gravity: 0.24,
        drag: 0.98,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.08,
        wobbleAmp: 2.5,
        opacity: 1.0,
        fadeSpeed: 0.003,
        life: 0
      });
    }
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.fillStyle = color;
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
    ctx.fill();
  }

  animate() {
    if (!this.isActive) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;

      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.x += p.vx;
      p.y += p.vy;

      p.wobble += p.wobbleSpeed;
      p.x += Math.sin(p.wobble) * p.wobbleAmp;

      p.rotX += p.spinX;
      p.rotY += p.spinY;
      p.rotZ += p.spinZ;

      if (p.life > 140) {
        p.opacity -= p.fadeSpeed * 2.5;
      }

      if (p.y > this.canvas.height + 60 || p.opacity <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.opacity);

      if (p.type === 'star') {
        const starSize = (p.w / 2) * Math.abs(Math.cos(p.rotZ));
        this.drawStar(this.ctx, p.x, p.y, 5, Math.max(3, starSize), Math.max(1.5, starSize * 0.48), p.color);
      } else if (p.type === 'card' || p.type === 'ribbon') {
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotZ);
        this.ctx.scale(Math.cos(p.rotX), Math.sin(p.rotY));

        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);

        // Highlight shine on card edge
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, 2);
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0 && this.isActive) {
      this.animId = requestAnimationFrame(() => this.animate());
    } else {
      this.stop();
    }
  }

  stop() {
    this.isActive = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

if (typeof window !== 'undefined') {
  window.CelebrationBlast = new CelebrationBlastEngine();
}
