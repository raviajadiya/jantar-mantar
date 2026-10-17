// Game HUD: Flags Tracker, Stealth/Chase Threat Meter, & Modals
class GameHUD {
  constructor(config, camera, player, flagManager, policeManager) {
    this.config = config;
    this.camera = camera;
    this.player = player;
    this.flagManager = flagManager;
    this.policeManager = policeManager;

    // Active HUD Elements
    this.flagsCountEl = document.getElementById('flags-collected-count');
    this.threatBadgeEl = document.getElementById('threat-status-badge');

    // Zoom & Camera Controls
    this.zoomInBtn = document.getElementById('btn-zoom-in');
    this.zoomOutBtn = document.getElementById('btn-zoom-out');
    this.resetCamBtn = document.getElementById('btn-reset-cam');

    // Game Outcome Modals
    this.victoryModal = document.getElementById('victory-modal');
    this.arrestModal = document.getElementById('arrest-modal');
    this.btnRestartVictory = document.getElementById('btn-restart-victory');
    this.btnRestartArrest = document.getElementById('btn-restart-arrest');

    // State
    this.gameMode = 'walk';
    this.viewMode = 'standard';
    this.isGameOver = false;

    this.initControls();
  }

  initControls() {
    // Zoom buttons
    if (this.zoomInBtn) this.zoomInBtn.addEventListener('click', () => this.camera.zoomBy(1.25));
    if (this.zoomOutBtn) this.zoomOutBtn.addEventListener('click', () => this.camera.zoomBy(0.8));
    if (this.resetCamBtn) {
      this.resetCamBtn.addEventListener('click', () => {
        this.camera.moveTo(this.player.x, this.player.y);
        this.camera.setZoom(1.0);
      });
    }

    // Modal Play Again / Restart buttons
    if (this.btnRestartVictory) this.btnRestartVictory.addEventListener('click', () => location.reload());
    if (this.btnRestartArrest) this.btnRestartArrest.addEventListener('click', () => location.reload());
  }

  update(deltaTime) {
    if (this.isGameOver) return;

    // 1. Flags Progress
    const collected = this.flagManager.getCollectedCount();
    const total = this.flagManager.getTotalCount();
    if (this.flagsCountEl) {
      this.flagsCountEl.textContent = `${collected} / ${total}`;
    }

    // 2. Threat Indicator
    if (this.threatBadgeEl) {
      if (this.policeManager.graceTimer > 0) {
        this.threatBadgeEl.className = 'threat-badge stealth';
        this.threatBadgeEl.innerHTML = `🛡️ SAFE START: (${Math.ceil(this.policeManager.graceTimer)}s Immunity)`;
      } else {
        const isChasing = this.policeManager.isAnyPoliceChasing();
        if (isChasing) {
          this.threatBadgeEl.className = 'threat-badge chase';
          this.threatBadgeEl.innerHTML = '🚨 CHASE ALERT: Police pursuing you! Turn corners to lose them!';
        } else {
          const closestDist = this.policeManager.getClosestPoliceDistance(this.player);
          if (closestDist < 260) {
            this.threatBadgeEl.className = 'threat-badge alert';
            this.threatBadgeEl.innerHTML = '⚠️ ALERT: Police patrolling nearby! Stay out of vision cone!';
          } else {
            this.threatBadgeEl.className = 'threat-badge stealth';
            this.threatBadgeEl.innerHTML = '🟢 STEALTH: Safe on road corridor (Police unaware)';
          }
        }
      }
    }

    // 3. Check Victory Condition: All flags collected + Reached Center (distPx < 220)
    const center = this.config.circularLayout.center;
    const dx = center.x - this.player.x;
    const dy = center.y - this.player.y;
    const distPx = Math.hypot(dx, dy);

    if (collected === total && distPx < 220 && !this.isGameOver) {
      this.triggerVictory();
    }
  }

  triggerVictory() {
    this.isGameOver = true;
    if (this.victoryModal) {
      this.victoryModal.classList.add('active');
    }
    this.logAction('🎉 VICTORY! All 6 flags collected and reached Center Jantar Mantar!');
  }

  triggerArrest(officer) {
    this.isGameOver = true;
    if (this.arrestModal) {
      const nameEl = document.getElementById('arresting-officer-name');
      if (nameEl) nameEl.textContent = (officer && officer.name) || 'Delhi Police';
      this.arrestModal.classList.add('active');
    }
    this.logAction(`🚨 DETAINED by ${(officer && officer.name) || 'Delhi Police'}! Protester captured.`);
  }

  logAction(msg) {
    console.log(`[HUD] ${msg}`);
  }
}

if (typeof window !== 'undefined') {
  window.GameHUD = GameHUD;
}
