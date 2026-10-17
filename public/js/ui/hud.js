// Game HUD: Flags Tracker, Stealth/Chase Threat Meter, Navigation Compass, & Modals
class GameHUD {
  constructor(config, camera, player, flagManager, policeManager) {
    this.config = config;
    this.camera = camera;
    this.player = player;
    this.flagManager = flagManager;
    this.policeManager = policeManager;

    // DOM Elements
    this.flagsCountEl = document.getElementById('flags-collected-count');
    this.flagsBarEl = document.getElementById('flags-bar');
    this.threatBadgeEl = document.getElementById('threat-status-badge');
    this.timerEl = document.getElementById('round-timer');
    this.distanceEl = document.getElementById('distance-text');
    this.arrowEl = document.getElementById('nav-arrow');
    this.actionLogsEl = document.getElementById('action-logs');
    this.newsTickerEl = document.getElementById('ticker-marquee');

    // Controls
    this.modeToggleBtn = document.getElementById('btn-mode-toggle');
    this.viewModeSelect = document.getElementById('select-view-mode');
    this.landmarkSelect = document.getElementById('select-landmark-jump');
    this.zoomInBtn = document.getElementById('btn-zoom-in');
    this.zoomOutBtn = document.getElementById('btn-zoom-out');
    this.resetCamBtn = document.getElementById('btn-reset-cam');

    // Game Modals
    this.victoryModal = document.getElementById('victory-modal');
    this.arrestModal = document.getElementById('arrest-modal');
    this.btnRestartVictory = document.getElementById('btn-restart-victory');
    this.btnRestartArrest = document.getElementById('btn-restart-arrest');

    // State
    this.gameMode = 'walk'; // 'walk' or 'explore'
    this.viewMode = 'standard';
    this.secondsElapsed = 0;
    this.isGameOver = false;

    this.initControls();
    this.initNewsTicker();
  }

  initControls() {
    // Mode toggle
    if (this.modeToggleBtn) {
      this.modeToggleBtn.addEventListener('click', () => {
        if (this.gameMode === 'walk') {
          this.gameMode = 'explore';
          this.camera.clearFollow();
          this.modeToggleBtn.innerHTML = '🚶 Switch to Protester Walk';
          this.modeToggleBtn.classList.add('btn-active');
          this.logAction('🗺️ Switched to Map Explorer Mode (Drag to pan circular roads)');
        } else {
          this.gameMode = 'walk';
          this.camera.setFollow(this.player);
          this.modeToggleBtn.innerHTML = '🗺️ Switch to Map Explorer';
          this.modeToggleBtn.classList.remove('btn-active');
          this.logAction('🚶 Switched to Protester Mode (Move along roads to collect flags)');
        }
      });
    }

    // View mode select
    if (this.viewModeSelect) {
      this.viewModeSelect.addEventListener('change', (e) => {
        this.viewMode = e.target.value;
        this.logAction(`🎨 View changed to: ${e.target.options[e.target.selectedIndex].text}`);
      });
    }

    // Landmark jumper dropdown
    if (this.landmarkSelect) {
      this.landmarkSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (!val) return;

        let target = null;
        const center = this.config.circularLayout.center;
        if (val === 'center') target = { x: center.x, y: center.y, zoom: 1.2 };
        else if (val === 'ring4') target = { x: center.x, y: center.y - 1400, zoom: 0.8 };
        else if (val === 'ring3') target = { x: center.x + 1080, y: center.y, zoom: 0.9 };
        else if (val === 'ring2') target = { x: center.x, y: center.y + 760, zoom: 1.0 };
        else if (val === 'ring1') target = { x: center.x - 480, y: center.y, zoom: 1.1 };

        if (target) {
          this.camera.clearFollow();
          this.gameMode = 'explore';
          if (this.modeToggleBtn) this.modeToggleBtn.innerHTML = '🚶 Switch to Protester Walk';
          this.camera.moveTo(target.x, target.y);
          this.camera.setZoom(target.zoom);
          this.logAction(`✈️ Camera navigated to ${e.target.options[e.target.selectedIndex].text}`);
        }
      });
    }

    // Zoom buttons
    if (this.zoomInBtn) this.zoomInBtn.addEventListener('click', () => this.camera.zoomBy(1.25));
    if (this.zoomOutBtn) this.zoomOutBtn.addEventListener('click', () => this.camera.zoomBy(0.8));
    if (this.resetCamBtn) {
      this.resetCamBtn.addEventListener('click', () => {
        this.camera.moveTo(this.player.x, this.player.y);
        this.camera.setZoom(1.0);
      });
    }

    // Restart buttons
    if (this.btnRestartVictory) this.btnRestartVictory.addEventListener('click', () => location.reload());
    if (this.btnRestartArrest) this.btnRestartArrest.addEventListener('click', () => location.reload());
  }

  initNewsTicker() {
    if (this.newsTickerEl && this.config.newsHeadlines) {
      const fullText = this.config.newsHeadlines.join(' &nbsp;&nbsp;◆&nbsp;&nbsp; ');
      this.newsTickerEl.innerHTML = fullText;
    }
  }

  update(deltaTime) {
    if (this.isGameOver) return;

    this.secondsElapsed += deltaTime;
    const mins = Math.floor(this.secondsElapsed / 60);
    const secs = Math.floor(this.secondsElapsed % 60);
    if (this.timerEl) {
      this.timerEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // 1. Flags Progress
    const collected = this.flagManager.getCollectedCount();
    const total = this.flagManager.getTotalCount();
    if (this.flagsCountEl) {
      this.flagsCountEl.textContent = `${collected} / ${total}`;
    }

    // 2. Threat Indicator
    const isChasing = this.policeManager.isAnyPoliceChasing();
    if (this.threatBadgeEl) {
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

    // 3. Navigation Arrow to Center Jantar Mantar (1800, 1800)
    const center = this.config.circularLayout.center;
    const dx = center.x - this.player.x;
    const dy = center.y - this.player.y;
    const distPx = Math.hypot(dx, dy);
    const distKm = (distPx / 1200).toFixed(1);

    if (this.distanceEl) {
      if (collected < total) {
        this.distanceEl.textContent = `Collect ${total - collected} more flags! (Center: ${distKm} km)`;
      } else {
        this.distanceEl.textContent = `⚡ ALL FLAGS COLLECTED! Head to Center (${distKm} km)`;
      }
    }

    if (this.arrowEl) {
      const angleRad = Math.atan2(dy, dx);
      const angleDeg = angleRad * (180 / Math.PI) - 90;
      this.arrowEl.style.transform = `rotate(${angleDeg}deg)`;
    }

    // 4. Check Victory Condition: All flags collected + Reached Center (distPx < 220)
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
      if (nameEl) nameEl.textContent = officer.name || 'Delhi Police';
      this.arrestModal.classList.add('active');
    }
    this.logAction(`🚨 DETAINED by ${officer.name}! Protester captured.`);
  }

  logAction(msg) {
    if (!this.actionLogsEl) return;
    const item = document.createElement('div');
    item.className = 'log-item';
    item.innerHTML = `• ${msg}`;
    this.actionLogsEl.prepend(item);

    while (this.actionLogsEl.children.length > 4) {
      this.actionLogsEl.removeChild(this.actionLogsEl.lastChild);
    }
  }
}

if (typeof window !== 'undefined') {
  window.GameHUD = GameHUD;
}
