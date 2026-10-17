// Protester Character: Road Movement, Slide Along Curbs & Waypoint Pathfinding
class ProtesterPlayer {
  constructor(startX, startY, roadNetwork) {
    this.x = startX;
    this.y = startY;
    this.roadNetwork = roadNetwork;

    this.speed = 190; // Walking speed
    this.runSpeed = 310; // Sprint speed
    this.angle = 0;
    this.animTime = 0;
    this.isMoving = false;
    this.isRunning = false;

    // Road Waypoint Path
    this.path = [];
    this.currentWaypointIndex = 0;

    // Player Identity & Selected Country Flag
    this.name = "Aam Aadmi";
    this.countryFlag = {
      code: 'IN',
      name: 'India',
      emoji: '🇮🇳',
      color: '#f97316',
      stripeColors: ['#ff9933', '#ffffff', '#138808']
    };
    this.speechText = "🇮🇳 Aam Aadmi";
  }

  // Update Player Profile & Flag Choice
  setNameAndFlag(name, flag) {
    if (name && typeof name === 'string' && name.trim()) {
      this.name = name.trim();
    }
    if (flag && flag.emoji) {
      this.countryFlag = flag;
    }
    const emoji = this.countryFlag ? this.countryFlag.emoji : '🚩';
    this.speechText = `${emoji} ${this.name}`;
  }

  // Set destination: Computes shortest path along road network
  setDestination(destX, destY) {
    const roadPoint = this.roadNetwork.findClosestRoadPoint(destX, destY);
    this.path = this.roadNetwork.findPath(this.x, this.y, roadPoint.x, roadPoint.y);
    this.currentWaypointIndex = 0;
  }

  // Direct manual move via WASD with wall sliding
  manualMove(dx, dy, deltaTime, isRunning) {
    this.isRunning = isRunning;
    const curSpeed = isRunning ? this.runSpeed : this.speed;
    const len = Math.hypot(dx, dy);
    if (len === 0) return;

    const step = (curSpeed * deltaTime);
    const stepX = (dx / len) * step;
    const stepY = (dy / len) * step;

    // 1. Try full diagonal step
    if (this.roadNetwork.isPointOnRoad(this.x + stepX, this.y + stepY)) {
      this.x += stepX;
      this.y += stepY;
      this.angle = Math.atan2(dy, dx);
      this.isMoving = true;
      this.path = [];
      return;
    }

    // 2. Try sliding along X only
    if (this.roadNetwork.isPointOnRoad(this.x + stepX, this.y)) {
      this.x += stepX;
      this.angle = Math.atan2(0, dx);
      this.isMoving = true;
      this.path = [];
      return;
    }

    // 3. Try sliding along Y only
    if (this.roadNetwork.isPointOnRoad(this.x, this.y + stepY)) {
      this.y += stepY;
      this.angle = Math.atan2(dy, 0);
      this.isMoving = true;
      this.path = [];
      return;
    }

    // 4. If slightly off-road, gently project back towards closest road point
    const closest = this.roadNetwork.findClosestNode(this.x, this.y);
    if (closest) {
      const cdx = closest.x - this.x;
      const cdy = closest.y - this.y;
      const cdist = Math.hypot(cdx, cdy);
      if (cdist > 1) {
        this.x += (cdx / cdist) * Math.min(cdist, step);
        this.y += (cdy / cdist) * Math.min(cdist, step);
        this.isMoving = true;
        this.path = [];
      }
    }
  }

  update(deltaTime, isRunning = false) {
    this.animTime += deltaTime;
    this.isRunning = isRunning;
    const curSpeed = isRunning ? this.runSpeed : this.speed;

    // Follow Waypoint Path if active
    if (this.path && this.path.length > 0 && this.currentWaypointIndex < this.path.length) {
      const target = this.path[this.currentWaypointIndex];
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 14) {
        this.currentWaypointIndex++;
        if (this.currentWaypointIndex >= this.path.length) {
          this.path = [];
          this.isMoving = false;
        }
      } else {
        this.isMoving = true;
        this.angle = Math.atan2(dy, dx);
        const step = Math.min(dist, curSpeed * deltaTime);
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
      }
    } else if (!this.path || this.path.length === 0) {
      if (!this.manualMovingThisFrame) {
        this.isMoving = false;
      }
    }
    this.manualMovingThisFrame = false;
  }

  draw(ctx, mapMode = 'standard') {
    ctx.save();

    // 1. Draw Active Waypoint Path Line
    if (this.path && this.path.length > 0 && this.currentWaypointIndex < this.path.length) {
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.5)';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      for (let i = this.currentWaypointIndex; i < this.path.length; i++) {
        ctx.lineTo(this.path[i].x, this.path[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Destination Bullseye
      const finalTarget = this.path[this.path.length - 1];
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(finalTarget.x, finalTarget.y, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Orange Walking Ring Indicator
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 22, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Protester Body
    ctx.translate(this.x, this.y);
    const sway = this.isMoving ? Math.sin(this.animTime * (this.isRunning ? 20 : 12)) * 3.5 : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(2, 10, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Feet
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-6 + sway, 8, 4, 6);
    ctx.fillRect(2 - sway, 8, 4, 6);

    // White Kurta
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-8, -6, 16, 16, 4);
    ctx.fill();
    ctx.stroke();

    // Nehru Jacket
    ctx.fillStyle = '#78716c';
    ctx.fillRect(-7, -4, 5, 12);
    ctx.fillRect(2, -4, 5, 12);

    // Head
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(0, -14, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Round Spectacles
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-2.5, -14, 2.5, 0, Math.PI * 2);
    ctx.arc(2.5, -14, 2.5, 0, Math.PI * 2);
    ctx.stroke();

    // White Gandhi Cap
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(0, -19, 7.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Protest Stick / Flagpole
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(9, -8);
    ctx.lineTo(9, 14);
    ctx.stroke();

    // Dynamic Country Flag Banner (with waving physics)
    const flagWave = Math.sin(this.animTime * (this.isMoving ? 14 : 7)) * 2.5;
    const flagW = 20;
    const flagH = 14;
    const stripeColors = (this.countryFlag && this.countryFlag.stripeColors && this.countryFlag.stripeColors.length > 0)
      ? this.countryFlag.stripeColors
      : ['#f97316', '#ffffff', '#16a34a'];

    const stripeH = flagH / stripeColors.length;
    for (let s = 0; s < stripeColors.length; s++) {
      ctx.fillStyle = stripeColors[s];
      ctx.beginPath();
      const topY = -22 + s * stripeH;
      const botY = topY + stripeH;
      ctx.moveTo(9, topY);
      ctx.lineTo(9 + flagW + flagWave, topY + flagWave * 0.4);
      ctx.lineTo(9 + flagW + flagWave, botY + flagWave * 0.4);
      ctx.lineTo(9, botY);
      ctx.closePath();
      ctx.fill();
    }

    // Flag crisp outline
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(9, -22);
    ctx.lineTo(9 + flagW + flagWave, -22 + flagWave * 0.4);
    ctx.lineTo(9 + flagW + flagWave, -22 + flagH + flagWave * 0.4);
    ctx.lineTo(9, -22 + flagH);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();

    // Role / Player Identity Bubble
    this.drawLabel(ctx, this.x, this.y - 36, this.speechText);
  }

  drawLabel(ctx, x, y, text) {
    ctx.save();
    ctx.font = 'bold 10px "Outfit", "Segoe UI", sans-serif';
    const tw = ctx.measureText(text).width;
    const bw = tw + 20;
    const bh = 22;

    const badgeBorder = (this.countryFlag && this.countryFlag.color) || '#f59e0b';

    // Dark glassmorphic capsule
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = badgeBorder;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(x - bw / 2, y - bh / 2, bw, bh, 6);
    ctx.fill();
    ctx.stroke();

    // Text with emoji
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);

    // Pointer notch
    ctx.fillStyle = badgeBorder;
    ctx.beginPath();
    ctx.moveTo(x, y + bh / 2 + 5);
    ctx.lineTo(x - 4, y + bh / 2);
    ctx.lineTo(x + 4, y + bh / 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

if (typeof window !== 'undefined') {
  window.ProtesterPlayer = ProtesterPlayer;
}
