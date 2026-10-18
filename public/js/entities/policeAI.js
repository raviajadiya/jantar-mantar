// Delhi Police AI: Continuous Road Patrol, Line-of-Sight Chase & Disengage System
class PoliceAIManager {
  constructor(config, roadNetwork) {
    this.config = config;
    this.roadNetwork = roadNetwork;
    this.officers = [];
    this.animTime = 0;
    this.graceTimer = 0; // Safe immunity timer on game start

    this.initOfficers();
  }

  initOfficers(level = 1) {
    this.currentLevel = Math.max(1, parseInt(level) || 1);
    const center = this.config.circularLayout.center;
    const rings = this.config.circularLayout.rings;
    const radials = this.config.circularLayout.radialAvenues;
    const maxRingIdx = rings.length - 1;

    const baseNames = [
      'Const. Bhati', 'Const. Sharma', 'Const. Gupta', 'SI Verma',
      'Const. Yadav', 'ACP Malik', 'Insp. Chauhan', 'Const. Singh',
      'Const. Meena', 'Insp. Rawat', 'Const. Tomar', 'SI Tyagi',
      'Const. Tiwari', 'ACP Saxena', 'Insp. Rathore', 'Const. Joshi'
    ];

    // Scale count: Level 1: 8 officers, Level 2: 10, Level 3: 12, Level 4: 14...
    const count = Math.min(18, 8 + (this.currentLevel - 1) * 2);

    const configs = [];
    for (let i = 0; i < count; i++) {
      // Station on intermediate rings (never on the outermost ring where player starts)
      let ringIdx = 1 + (i % Math.max(1, maxRingIdx - 1));
      const radIdx = (i * 2 + 1) % radials.length;
      const radial = radials[radIdx];
      if (radial && radial.connects && !radial.connects.includes(ringIdx)) {
        ringIdx = radial.connects[0];
      }
      configs.push({
        ringIdx,
        radIdx,
        name: baseNames[i % baseNames.length] || `Officer #${i + 1}`,
        patrolType: (i % 2 === 0) ? 'ring' : 'radial',
        dir: (i % 3 === 0) ? -1 : 1,
        spoke: radIdx
      });
    }

    this.officers = configs.map((cfg, idx) => {
      const ring = rings[cfg.ringIdx] || rings[1];
      const radial = radials[cfg.radIdx];
      const x = center.x + Math.cos(radial.angle) * ring.radius;
      const y = center.y + Math.sin(radial.angle) * ring.radius;

      return {
        id: `pol-${idx}`,
        name: cfg.name,
        startX: x,
        startY: y,
        x,
        y,
        angle: radial.angle,
        state: 'patrol', // 'patrol', 'chase', 'lost'
        speed: 95, // Continuous patrol speed
        chaseSpeed: 165, // Chase speed
        visionRange: 145, // Reduced radius per user request (was 210)
        loseChaseRange: 260, // Proportional escape distance (was 360)
        
        // Navigation
        currentPath: [],
        waypointIndex: 0,
        patrolType: cfg.patrolType,
        ringIdx: cfg.ringIdx,
        patrolDir: cfg.dir || 1,
        spokeIdx: cfg.spoke !== undefined ? cfg.spoke : 0,

        // Status bubble
        bubbleText: "Patrolling road",
        bubbleTimer: 0
      };
    });
  }

  // Reset all officers to starting patrol positions and activate safe grace period
  resetToPatrol(playerSpawn) {
    this.graceTimer = 4.0; // 4 seconds of safe grace period
    const center = this.config.circularLayout.center;

    this.officers.forEach(officer => {
      officer.x = officer.startX;
      officer.y = officer.startY;

      // If any officer is stationed close to player's chosen spawn point (< 650px), relocate to opposite quadrant
      if (playerSpawn && Math.hypot(officer.x - playerSpawn.x, officer.y - playerSpawn.y) < 650) {
        officer.x = center.x - (officer.startX - center.x);
        officer.y = center.y - (officer.startY - center.y);
      }

      officer.state = 'patrol';
      officer.currentPath = [];
      officer.waypointIndex = 0;
      officer.bubbleText = 'Patrolling road';
      officer.bubbleTimer = 1.0;
    });
  }

  // Re-distribute officers across the new route network
  repositionOfficersForMap(roadNetwork) {
    if (!roadNetwork || !roadNetwork.nodes || !roadNetwork.nodes.length) return;
    const nodes = roadNetwork.nodes;
    const num = this.officers.length || 8;

    this.officers.forEach((officer, idx) => {
      const targetIdx = Math.floor((nodes.length * (idx + 1)) / (num + 1)) % nodes.length;
      const node = nodes[targetIdx] || nodes[idx % nodes.length];
      officer.startX = node.x;
      officer.startY = node.y;
      officer.x = node.x;
      officer.y = node.y;
      officer.state = 'patrol';
      officer.currentPath = [];
      officer.waypointIndex = 0;
      officer.bubbleText = 'Patrolling road';
      officer.bubbleTimer = 1.5;
    });
  }

  update(deltaTime, player, onCatchProtester, isGameActive = true, allFlagsCollected = false) {
    this.animTime += deltaTime;
    if (this.graceTimer > 0) {
      this.graceTimer -= deltaTime;
    }

    const center = (this.config.circularLayout && this.config.circularLayout.center) || { x: 1800, y: 1800 };
    const playerInSanctuary = Math.hypot(player.x - center.x, player.y - center.y) < 230;

    // Sanctuary Immunity: When all flags collected and player enters sanctuary, police cannot arrest!
    const isPlayerSafe = !isGameActive || (this.graceTimer > 0) || (allFlagsCollected && playerInSanctuary);
    const canDetectPlayer = !isPlayerSafe;

    this.officers.forEach(officer => {
      officer.bubbleTimer -= deltaTime;

      const distToPlayer = Math.hypot(player.x - officer.x, player.y - officer.y);
      const hasLOS = canDetectPlayer && distToPlayer < officer.visionRange && this.roadNetwork.hasRoadLineOfSight(officer.x, officer.y, player.x, player.y);

      // If player entered sanctuary with all flags, force chasing police to break off
      if (allFlagsCollected && playerInSanctuary && officer.state === 'chase') {
        officer.state = 'lost';
        officer.bubbleText = '⚠️ Sanctuary Zone! Cannot enter!';
        officer.bubbleTimer = 2.5;
        officer.currentPath = [];
      } else if (!canDetectPlayer && officer.state !== 'patrol') {
        officer.state = 'patrol';
        officer.currentPath = [];
      }

      // 1. Patrol State
      if (officer.state === 'patrol') {
        if (hasLOS) {
          officer.state = 'chase';
          officer.bubbleText = '🚨 RUKO! STOP!';
          officer.bubbleTimer = 2.5;
          officer.currentPath = this.roadNetwork.findPath(officer.x, officer.y, player.x, player.y);
          officer.waypointIndex = 0;
        } else {
          // Continuously Patrol Along Road
          this.patrolContinuous(officer, deltaTime);
        }
      } 
      // 2. Chase State
      else if (officer.state === 'chase') {
        if (!canDetectPlayer || distToPlayer > officer.loseChaseRange) {
          // Protester successfully ran away or grace active!
          officer.state = 'lost';
          officer.bubbleText = '❓ Lost him! Resuming patrol';
          officer.bubbleTimer = 2.0;
          officer.currentPath = [];
        } else {
          // Update chase path periodically
          if (Math.random() < 0.15 || !officer.currentPath || officer.currentPath.length === 0) {
            officer.currentPath = this.roadNetwork.findPath(officer.x, officer.y, player.x, player.y);
            officer.waypointIndex = 0;
          }

          this.followPath(officer, officer.chaseSpeed, deltaTime);

          // Catch Condition (adapted for enlarged figurine scale: < 46px on mobile, < 34px on desktop)
          const catchDist = (typeof window !== 'undefined' && window.innerWidth <= 768) ? 46 : 34;
          if (canDetectPlayer && distToPlayer < catchDist && onCatchProtester) {
            onCatchProtester(officer);
          }
        }
      } 
      // 3. Lost State
      else if (officer.state === 'lost') {
        if (officer.bubbleTimer <= 0) {
          officer.state = 'patrol';
        } else {
          // Keep moving slowly while looking around
          this.patrolContinuous(officer, deltaTime * 0.6);
        }
      }
    });
  }

  // Smooth, continuous patrol along road rings or radial avenues
  patrolContinuous(officer, deltaTime) {
    if (!officer.currentPath || officer.waypointIndex >= officer.currentPath.length) {
      // Find current node and pick next smooth patrol waypoint
      const curNode = this.roadNetwork.findClosestNode(officer.x, officer.y);
      if (curNode) {
        const neighbors = this.roadNetwork.edges.get(curNode.id) || [];
        if (neighbors.length > 0) {
          // Filter out center sanctuary nodes so police don't patrol inside the Gandhi Cap area
          const validNeighbors = neighbors.filter(id => {
            const n = this.roadNetwork.nodes[id];
            return n && !n.isCenter && !n.isCenterAvenue;
          });
          const pool = validNeighbors.length > 0 ? validNeighbors : neighbors;
          const nextId = pool[Math.floor(Math.random() * pool.length)];
          const nextNode = this.roadNetwork.nodes[nextId] || (this.roadNetwork.nodes && this.roadNetwork.nodes.find(n => n && n.id === nextId));
          if (nextNode) {
            officer.currentPath = [{ x: nextNode.x, y: nextNode.y }];
            officer.waypointIndex = 0;
          }
        }
      }
    }

    this.followPath(officer, officer.speed, deltaTime);
  }

  followPath(officer, speed, deltaTime) {
    if (!officer.currentPath || officer.waypointIndex >= officer.currentPath.length) return;

    const target = officer.currentPath[officer.waypointIndex];
    if (!target) return;

    const dx = target.x - officer.x;
    const dy = target.y - officer.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 8) {
      officer.waypointIndex++;
      if (officer.waypointIndex >= officer.currentPath.length) {
        officer.currentPath = [];
      }
    } else if (dist > 0) {
      officer.angle = Math.atan2(dy, dx);
      const step = Math.min(dist, speed * deltaTime);
      officer.x += (dx / dist) * step;
      officer.y += (dy / dist) * step;
    }
  }

  draw(ctx, mapMode = 'standard') {
    this.officers.forEach(pol => {
      this.drawOfficer(ctx, pol, mapMode);
    });
  }

  drawOfficer(ctx, pol, mapMode) {
    const isMobile = (typeof window !== 'undefined' && window.innerWidth <= 768);
    // Substantially enlarged character figurine (putlu) so it's prominent and crystal clear
    const charScale = isMobile ? 4.5 : 3.0;

    ctx.save();
    ctx.translate(pol.x, pol.y);

    // ==========================================
    // POLICE DETECTION AREA COVER (Luminous & Clearly Visible)
    // ==========================================
    if (pol.state === 'chase') {
      // 1. Red Alert Coverage Field
      const chaseGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, pol.visionRange);
      chaseGrad.addColorStop(0, 'rgba(239, 68, 68, 0.42)');
      chaseGrad.addColorStop(0.65, 'rgba(220, 38, 38, 0.22)');
      chaseGrad.addColorStop(1, 'rgba(185, 28, 28, 0.08)');
      ctx.fillStyle = chaseGrad;
      ctx.beginPath();
      ctx.arc(0, 0, pol.visionRange, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing Crimson Perimeter Ring
      const pulse = 1 + Math.sin(this.animTime * 12) * 0.04;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = isMobile ? 4.5 : 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, pol.visionRange * pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Alternating Siren Flash Beam along facing angle
      const isRed = Math.floor(this.animTime * 10) % 2 === 0;
      const sirenGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, pol.visionRange);
      sirenGrad.addColorStop(0, isRed ? 'rgba(239, 68, 68, 0.55)' : 'rgba(59, 130, 246, 0.55)');
      sirenGrad.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
      ctx.fillStyle = sirenGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, pol.visionRange, pol.angle - 0.75, pol.angle + 0.75);
      ctx.closePath();
      ctx.fill();
    } else {
      // 1. Illuminated Warm Searchlight Field (Full detection radius)
      const lightGrad = ctx.createRadialGradient(0, 0, 12, 0, 0, pol.visionRange);
      lightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.32)'); // Warm luminous core
      lightGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.18)'); // Golden visibility band
      lightGrad.addColorStop(0.85, 'rgba(245, 158, 11, 0.10)');
      lightGrad.addColorStop(1, 'rgba(245, 158, 11, 0.03)');
      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.arc(0, 0, pol.visionRange, 0, Math.PI * 2);
      ctx.fill();

      // 2. Focused Flashlight / Torch Search Beam in front of police (along pol.angle)
      const beamGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, pol.visionRange);
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.50)'); // Bright searchlight
      beamGrad.addColorStop(0.55, 'rgba(251, 191, 36, 0.30)');
      beamGrad.addColorStop(1, 'rgba(245, 158, 11, 0.05)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, pol.visionRange, pol.angle - 0.7, pol.angle + 0.7);
      ctx.closePath();
      ctx.fill();

      // 3. Bright Perimeter Security Border (Dashed tactical ring so area boundary is 100% visible)
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.90)';
      ctx.lineWidth = isMobile ? 3.5 : 2.5;
      ctx.setLineDash([10, 7]);
      ctx.beginPath();
      ctx.arc(0, 0, pol.visionRange, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 4. Subtle outward radar light sweep wave
      const sweepRadius = ((this.animTime * 0.55) % 1) * pol.visionRange;
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, sweepRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Police character highlight aura ring (distinct from civilian protester)
    if (pol.state === 'chase') {
      const pulse = 1 + Math.sin(this.animTime * 10) * 0.12;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.95)';
      ctx.lineWidth = isMobile ? 4 : 3;
      ctx.beginPath();
      ctx.arc(0, 0, 12 * charScale * pulse, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(30, 64, 175, 0.75)';
      ctx.lineWidth = isMobile ? 3.5 : 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 12 * charScale, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Scale officer graphics
    ctx.save();
    if (charScale !== 1.0) {
      ctx.scale(charScale, charScale);
    }

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 9, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Uniform (Khaki)
    ctx.fillStyle = '#b49f7d';
    ctx.fillRect(-6, -5, 12, 14);

    // Uniform Belt & Badge
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-6, 3, 12, 2.5);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-1, 3, 2, 2.5);

    // Police Cap (Navy blue with Red band)
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.arc(0, -11, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-3, -16, 6, 3);

    // Lathi (Police baton)
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(7, -6);
    ctx.lineTo(13, 8);
    ctx.stroke();

    // Flashing Siren above cap during chase
    if (pol.state === 'chase') {
      const isRed = Math.floor(this.animTime * 8) % 2 === 0;
      ctx.fillStyle = isRed ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(0, -20, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore(); // restore charScale

    ctx.restore(); // restore translate

    // Bubble Text
    if (pol.bubbleTimer > 0) {
      const bubbleY = pol.y - (25 * charScale + (isMobile ? 18 : 12));
      this.drawBubble(ctx, pol.x, bubbleY, pol.bubbleText, pol.state === 'chase', isMobile);
    }
  }

  drawBubble(ctx, x, y, text, isAlert, isMobile = false) {
    ctx.save();
    const fontSize = isMobile ? (isAlert ? 13 : 12) : (isAlert ? 10.5 : 9.5);
    ctx.font = isAlert ? `bold ${fontSize}px sans-serif` : `${fontSize}px sans-serif`;
    const tw = ctx.measureText(text).width;
    const bw = tw + (isMobile ? 24 : 16);
    const bh = isMobile ? 24 : 20;

    ctx.fillStyle = isAlert ? '#dc2626' : 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = isMobile ? 1.8 : 1.2;
    ctx.beginPath();
    ctx.roundRect(x - bw / 2, y - bh / 2, bw, bh, isMobile ? 7 : 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  isAnyPoliceChasing() {
    if (this.graceTimer > 0) return false;
    return this.officers.some(o => o.state === 'chase');
  }

  getClosestPoliceDistance(player) {
    let minDist = Infinity;
    this.officers.forEach(o => {
      const d = Math.hypot(player.x - o.x, player.y - o.y);
      if (d < minDist) minDist = d;
    });
    return minDist;
  }
}

if (typeof window !== 'undefined') {
  window.PoliceAIManager = PoliceAIManager;
}
