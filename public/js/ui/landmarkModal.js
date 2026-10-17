// Interactive Landmark Information Modal (History, Astronomy, & Game Lore)
class LandmarkModal {
  constructor() {
    this.modalEl = document.getElementById('landmark-modal');
    this.titleEl = document.getElementById('modal-title');
    this.hindiTitleEl = document.getElementById('modal-hindi-title');
    this.typeBadgeEl = document.getElementById('modal-type-badge');
    this.descEl = document.getElementById('modal-desc');
    this.historyEl = document.getElementById('modal-history');
    this.loreEl = document.getElementById('modal-game-role');
    this.closeBtn = document.getElementById('modal-close-btn');
    this.teleportBtn = document.getElementById('modal-teleport-btn');

    this.currentLandmark = null;
    this.onTeleport = null;

    this.initEvents();
  }

  initEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.hide());
    }

    if (this.teleportBtn) {
      this.teleportBtn.addEventListener('click', () => {
        if (this.currentLandmark && this.onTeleport) {
          this.onTeleport(this.currentLandmark);
          this.hide();
        }
      });
    }

    // Close on outside backdrop click
    if (this.modalEl) {
      this.modalEl.addEventListener('click', (e) => {
        if (e.target === this.modalEl) {
          this.hide();
        }
      });
    }

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hide();
    });
  }

  show(landmark) {
    this.currentLandmark = landmark;
    if (!this.modalEl) return;

    this.titleEl.textContent = landmark.name;
    this.hindiTitleEl.textContent = landmark.hindiName || landmark.hindi || '';
    this.typeBadgeEl.textContent = (landmark.type || 'HERITAGE').toUpperCase();
    this.descEl.textContent = landmark.description || landmark.desc || '';
    this.historyEl.textContent = landmark.historicalFact || 'Built in 1724 by Maharaja Jai Singh II of Jaipur.';
    this.loreEl.textContent = landmark.gameRole || 'Safe gathering sanctuary zone.';

    this.modalEl.classList.add('active');
  }

  hide() {
    if (this.modalEl) {
      this.modalEl.classList.remove('active');
    }
  }
}

if (typeof window !== 'undefined') {
  window.LandmarkModal = LandmarkModal;
}
