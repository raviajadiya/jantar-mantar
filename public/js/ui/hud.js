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

    // Game Outcome Modals & Elements
    this.victoryModal = document.getElementById('victory-modal');
    this.arrestModal = document.getElementById('arrest-modal');
    this.btnRestartVictory = document.getElementById('btn-restart-victory');
    this.btnRestartArrest = document.getElementById('btn-restart-arrest');
    this.btnContinueLevel = document.getElementById('btn-continue-level');
    this.levelBadgeEl = document.getElementById('hud-level-badge');
    this.victoryModalTitle = document.getElementById('victory-modal-title');
    this.victoryModalSubtitle = document.getElementById('victory-modal-subtitle');
    this.victoryModalDesc = document.getElementById('victory-modal-desc');

    // State
    this.level = 1;
    this.gameMode = 'walk';
    this.viewMode = 'standard';
    this.isGameOver = false;
    this.onContinueLevel = null;

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
    if (this.btnRestartVictory) {
      this.btnRestartVictory.addEventListener('click', () => {
        if (window.CelebrationBlast) window.CelebrationBlast.stop();
        location.reload();
      });
    }
    if (this.btnRestartArrest) this.btnRestartArrest.addEventListener('click', () => location.reload());

    // Continue to Next Level Button
    if (this.btnContinueLevel) {
      this.btnContinueLevel.addEventListener('click', () => {
        if (window.CelebrationBlast) window.CelebrationBlast.stop();
        if (this.onContinueLevel) {
          this.onContinueLevel();
        }
      });
    }
  }

  setLevel(lvl) {
    this.level = lvl;
    this.isGameOver = false;
    if (window.CelebrationBlast) window.CelebrationBlast.stop();
    if (this.victoryModal) this.victoryModal.classList.remove('active');
    if (this.levelBadgeEl) this.levelBadgeEl.textContent = `⭐ LEVEL ${lvl}`;
  }

  update(deltaTime) {
    if (this.isGameOver) return;

    // 1. Flags Progress
    const collected = this.flagManager.getCollectedCount();
    const total = this.flagManager.getTotalCount();
    if (this.flagsCountEl) {
      this.flagsCountEl.textContent = `${collected} / ${total}`;
    }

    // Distance to Center Cap
    const center = (this.player.roadNetwork && this.player.roadNetwork.center) || (this.config.circularLayout && this.config.circularLayout.center) || { x: 1800, y: 1800 };
    const dx = center.x - this.player.x;
    const dy = center.y - this.player.y;
    const distPx = Math.hypot(dx, dy);

    // 2. Threat Indicator & Objective Guide
    if (this.threatBadgeEl) {
      if (this.policeManager.graceTimer > 0) {
        this.threatBadgeEl.className = 'threat-badge stealth';
        this.threatBadgeEl.innerHTML = `🛡️ SAFE START: (${Math.ceil(this.policeManager.graceTimer)}s Immunity)`;
      } else if (collected === total) {
        // All flags collected! Direct player to the Cap in the center!
        this.threatBadgeEl.className = 'threat-badge alert';
        this.threatBadgeEl.style.background = 'linear-gradient(135deg, #f59e0b, #ea580c)';
        this.threatBadgeEl.innerHTML = '✨ 🧢 ALL FLAGS SECURED! Touch the Gandhi Cap at Center to Win!';
      } else {
        this.threatBadgeEl.style.background = '';
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

    // 3. Victory Condition: All flags collected + Reached the Gandhi Cap at Center (distPx < 60)
    if (collected === total && distPx < 60 && !this.isGameOver) {
      this.triggerVictory();
    }
  }

  triggerVictory() {
    this.isGameOver = true;

    // 1. Play Victory Sounds (Confetti Popper Blast Pop + Fanfare)
    if (window.AudioEngine) {
      if (window.AudioEngine.playBlastPop) window.AudioEngine.playBlastPop();
      if (window.AudioEngine.playFanfare) window.AudioEngine.playFanfare();
    }

    // 2. Trigger Paper Card & Golden Star Celebration Blast Animation
    if (window.CelebrationBlast && window.CelebrationBlast.blast) {
      window.CelebrationBlast.blast();
    }

    if (this.victoryModal) {
      const total = this.flagManager.getTotalCount();
      const nextLevel = this.level + 1;
      const isNextMapExpanded = (nextLevel % 5 === 0);

      if (this.victoryModalTitle) this.victoryModalTitle.textContent = `LEVEL ${this.level} COMPLETED! 🏆`;
      if (this.victoryModalSubtitle) this.victoryModalSubtitle.textContent = `All ${total} Flags Secured & Center Gandhi Cap Claimed! 🧢`;
      if (this.victoryModalDesc) {
        if (isNextMapExpanded) {
          this.victoryModalDesc.innerHTML = `🌟 <strong>MILESTONE!</strong> Click Continue to enter <strong>Level ${nextLevel}</strong>: The <strong>MAP WILL EXPAND</strong> with an extra circular ring and more flags!`;
        } else {
          const nextExpand = 5 - (nextLevel % 5);
          this.victoryModalDesc.innerHTML = `Outstanding navigation! Click Continue to advance to <strong>Level ${nextLevel}</strong> with <strong>more flags</strong>! (Map expands at Level ${nextLevel + nextExpand})`;
        }
      }
      if (this.btnContinueLevel) {
        if (isNextMapExpanded) {
          this.btnContinueLevel.innerHTML = `▶ CONTINUE TO LEVEL ${nextLevel} (🌟 મોટો મેપ & વધુ ફ્લેગ્સ)`;
        } else {
          this.btnContinueLevel.innerHTML = `▶ CONTINUE TO LEVEL ${nextLevel} (🚩 વધુ ફ્લેગ્સ)`;
        }
      }
      this.victoryModal.classList.add('active');
    }
    this.logAction(`🎉 VICTORY! Grabbed Gandhi Cap at Center for Level ${this.level}!`);
  }

  triggerArrest(officer) {
    this.isGameOver = true;

    // Play Authentic Police Siren & Whistle Audio
    if (window.AudioEngine && window.AudioEngine.playPoliceSiren) {
      window.AudioEngine.playPoliceSiren();
    }

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
