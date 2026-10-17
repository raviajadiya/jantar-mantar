// Delhi NPCs: Roaming Citizens, Patrolling Police, Auto-Rickshaws & Monkeys
class NPCManager {
  constructor(config) {
    this.config = config;
    this.citizens = [];
    this.police = [];
    this.vehicles = [];
    this.monkeys = [];

    this.initNPCs();
  }

  initNPCs() {
    // 1. Spawn Citizens across Connaught Place and Sansad Marg
    const citizenQuotes = [
      "Foreign funding hai sab, mujhe WhatsApp pe pata chala",
      "Purani Pension bahal karo!",
      "Rozgar mangne aaye the, chai mil gayi",
      "Bhaiya CP metro station kitni dur hai?",
      "Jantar Mantar me 300 saal purani ghadi hai!",
      "Sirf selfie lene aaya tha, dharna me fans gaya",
      "Garmi bahut hai bhai, shikanji pilado",
      "Lassi Bhandar khula hai kya?"
    ];

    for (let i = 0; i < 45; i++) {
      // Spawn clustered around CP, Sansad Marg, and Jantar Mantar
      let x, y;
      if (i < 15) {
        // Around CP
        const a = Math.random() * Math.PI * 2;
        const r = 260 + Math.random() * 140;
        x = 750 + Math.cos(a) * r;
        y = 750 + Math.sin(a) * r;
      } else if (i < 30) {
        // Along Sansad Marg
        const t = Math.random();
        x = 950 + t * (2100 - 950) + (Math.random() - 0.5) * 80;
        y = 950 + t * (2350 - 950) + (Math.random() - 0.5) * 80;
      } else {
        // Outside Jantar Mantar
        x = 1850 + Math.random() * 250;
        y = 2180 + Math.random() * 250;
      }

      this.citizens.push({
        id: `cit-${i}`,
        x,
        y,
        targetX: x,
        targetY: y,
        speed: 35 + Math.random() * 40,
        quote: citizenQuotes[i % citizenQuotes.length],
        showQuoteTime: Math.random() * 10,
        isRecruited: false,
        color: ['#f97316', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#eab308'][i % 6]
      });
    }

    // 2. Spawn Delhi Police Patrolling Officers
    const policeSpawns = [
      { x: 1450, y: 1550, patrolR: 120 },
      { x: 1650, y: 1850, patrolR: 100 },
      { x: 1750, y: 2150, patrolR: 80 },
      { x: 1980, y: 2250, patrolR: 90 },
      { x: 1050, y: 1100, patrolR: 100 },
      { x: 2100, y: 2450, patrolR: 110 }
    ];

    policeSpawns.forEach((p, idx) => {
      this.police.push({
        id: `pol-${idx}`,
        isPolice: true,
        x: p.x,
        y: p.y,
        originX: p.x,
        originY: p.y,
        targetX: p.x,
        targetY: p.y,
        patrolR: p.patrolR,
        speed: 60,
        chaseSpeed: 130,
        visionRadius: 150,
        isChasing: false,
        state: 'patrol'
      });
    });

    // 3. Auto-Rickshaws
    for (let v = 0; v < 4; v++) {
      this.vehicles.push({
        x: 1000 + v * 300,
        y: 1000 + v * 320,
        speed: 120 + Math.random() * 40,
        routeProgress: Math.random()
      });
    }

    // 4. Monkeys near Jantar Mantar walls
    for (let m = 0; m < 5; m++) {
      this.monkeys.push({
        x: 2100 + Math.random() * 60,
        y: 2200 + m * 90,
        anim: Math.random() * 5
      });
    }
  }

  update(deltaTime, player, onFollowerDetained) {
    // A. Update Citizens
    this.citizens.forEach(c => {
      if (c.isRecruited) return;

      c.showQuoteTime += deltaTime;
      const dx = c.targetX - c.x;
      const dy = c.targetY - c.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 8) {
        // Pick new random wander point
        c.targetX = c.x + (Math.random() - 0.5) * 120;
        c.targetY = c.y + (Math.random() - 0.5) * 120;
      } else {
        c.x += (dx / dist) * c.speed * deltaTime;
        c.y += (dy / dist) * c.speed * deltaTime;
      }

      // Proximity Recruitment to Player
      if (player) {
        const pDist = Math.hypot(player.x - c.x, player.y - c.y);
        if (pDist < 52) {
          c.isRecruited = true;
          player.addFollower({ x: c.x, y: c.y, angle: 0 });
        }
      }
    });

    // B. Update Police AI
    this.police.forEach(p => {
      let target = null;

      // Check if Player or Followers in vision radius
      if (player) {
        const pDist = Math.hypot(player.x - p.x, player.y - p.y);
        if (pDist < p.visionRadius) {
          target = player;
        } else if (player.followers) {
          for (let f of player.followers) {
            if (Math.hypot(f.x - p.x, f.y - p.y) < p.visionRadius) {
              target = f;
              break;
            }
          }
        }
      }

      if (target) {
        p.isChasing = true;
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 10) {
          p.x += (dx / dist) * p.chaseSpeed * deltaTime;
          p.y += (dy / dist) * p.chaseSpeed * deltaTime;
        }

        // Detention check: If touching a follower
        if (player && player.followers && player.followers.length > 0) {
          for (let i = player.followers.length - 1; i >= 0; i--) {
            const f = player.followers[i];
            if (Math.hypot(f.x - p.x, f.y - p.y) < 22) {
              player.removeFollower(i);
              if (onFollowerDetained) onFollowerDetained(p);
              break;
            }
          }
        }
      } else {
        p.isChasing = false;
        // Patrol around origin
        const pdx = p.targetX - p.x;
        const pdy = p.targetY - p.y;
        const pdist = Math.hypot(pdx, pdy);

        if (pdist < 10) {
          const a = Math.random() * Math.PI * 2;
          p.targetX = p.originX + Math.cos(a) * p.patrolR;
          p.targetY = p.originY + Math.sin(a) * p.patrolR;
        } else {
          p.x += (pdx / pdist) * p.speed * deltaTime;
          p.y += (pdy / pdist) * p.speed * deltaTime;
        }
      }
    });

    // C. Update Auto-Rickshaws
    this.vehicles.forEach(v => {
      v.routeProgress = (v.routeProgress + deltaTime * 0.05) % 1;
      // Follow Sansad Marg route
      v.x = 900 + v.routeProgress * (2100 - 900);
      v.y = 900 + v.routeProgress * (2350 - 900);
    });

    // D. Update Monkeys
    this.monkeys.forEach(m => {
      m.anim += deltaTime;
      m.y += Math.sin(m.anim * 3) * 0.3;
    });
  }

  draw(ctx, mapMode = 'standard') {
    // 1. Draw Citizens
    this.citizens.forEach(c => {
      if (c.isRecruited) return;
      this.drawCitizen(ctx, c);
    });

    // 2. Draw Police
    this.police.forEach(p => {
      this.drawPoliceOfficer(ctx, p);
    });

    // 3. Draw Auto-Rickshaws
    this.vehicles.forEach(v => {
      this.drawAutoRickshaw(ctx, v);
    });

    // 4. Draw Monkeys
    this.monkeys.forEach(m => {
      this.drawMonkey(ctx, m);
    });
  }

  drawCitizen(ctx, c) {
    ctx.save();
    ctx.translate(c.x, c.y);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 7, 7, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = c.color;
    ctx.fillRect(-5, -4, 10, 12);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -9, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Periodic Dialogue Bubble
    if (Math.sin(c.showQuoteTime * 0.8) > 0.6) {
      this.drawDialogueBubble(ctx, c.x, c.y - 22, c.quote);
    }
  }

  drawPoliceOfficer(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);

    // Vision cone (when chasing or alert)
    if (p.isChasing) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.beginPath();
      ctx.arc(0, 0, p.visionRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Khaki Uniform
    ctx.fillStyle = '#b49f7d'; // Delhi Police Khaki
    ctx.fillRect(-6, -5, 12, 14);

    // Police Red & Blue Beret Cap
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.arc(0, -11, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-3, -16, 6, 4);

    // Lathi (wooden stick)
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(7, -6);
    ctx.lineTo(13, 8);
    ctx.stroke();

    ctx.restore();

    // "DELHI POLICE" tag if chasing
    if (p.isChasing) {
      ctx.save();
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚨 POLICE ALERT!', p.x, p.y - 20);
      ctx.restore();
    }
  }

  drawAutoRickshaw(ctx, v) {
    ctx.save();
    ctx.translate(v.x, v.y);
    ctx.rotate(0.85); // Angle aligned with Sansad Marg

    // Auto Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.roundRect(-12, -8, 28, 18, 4);
    ctx.fill();

    // Yellow roof & Green base (Iconic Delhi CNG auto)
    ctx.fillStyle = '#15803d'; // Green bottom
    ctx.fillRect(-10, -7, 24, 14);

    ctx.fillStyle = '#f59e0b'; // Yellow roof
    ctx.beginPath();
    ctx.roundRect(-8, -6, 20, 12, 3);
    ctx.fill();

    // Windshield
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(8, -5, 3, 10);

    ctx.restore();
  }

  drawMonkey(ctx, m) {
    ctx.save();
    ctx.translate(m.x, m.y);

    // Monkey brown body
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    // Monkey tail curl
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(6, -2, 4, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  drawDialogueBubble(ctx, x, y, text) {
    ctx.save();
    ctx.font = '9px "Segoe UI", sans-serif';
    const tw = ctx.measureText(text).width;
    const bw = tw + 14;
    const bh = 18;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x - bw / 2, y - bh / 2, bw, bh, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y + 3);

    ctx.restore();
  }

  getAllEntities() {
    return [...this.citizens, ...this.police];
  }
}

if (typeof window !== 'undefined') {
  window.NPCManager = NPCManager;
}
