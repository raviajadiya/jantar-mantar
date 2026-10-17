// Main Application Entry Point - Jantar Mantar 2.0 (Live Background & Character Customizer)
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('map-canvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const config = window.CONFIG;

  // 1. Build Circular Road Network & Graph
  const roadNetwork = new window.RoadNetwork(config);

  // 2. Camera System
  const camera = new window.Camera2D(canvas.width, canvas.height, config.world.width, config.world.height);
  const input = new window.InputManager(canvas, camera);
  input.setGameMode('walk');

  // Center position for cinematic overview
  const centerPos = config.circularLayout.center; // (1800, 1800)
  camera.moveTo(centerPos.x, centerPos.y, true);
  camera.setZoom(window.innerWidth <= 768 ? 0.36 : 0.85);

  // 3. Spawn Protester Player on the Last (Outermost) Ring (Ring 4, radius 1400)
  const outerSpokeNodes = roadNetwork.getOuterRingSpokeNodes();
  const initialSpawn = (outerSpokeNodes && outerSpokeNodes.length > 0)
    ? (outerSpokeNodes.find(n => n.radialIndex === 6) || outerSpokeNodes[0])
    : (roadNetwork.getOuterRingNodes()[0] || { x: 400, y: 1800 });
  const player = new window.ProtesterPlayer(initialSpawn.x, initialSpawn.y, roadNetwork);

  // 4. Managers & Drawers
  const mapDrawer = new window.CircularMapDrawer(ctx, config, roadNetwork);
  const flagManager = new window.FlagManager(config, roadNetwork);
  const policeManager = new window.PoliceAIManager(config, roadNetwork);
  const minimap = new window.DilliMinimap('minimap-canvas', config.world.width, config.world.height, config, roadNetwork);
  const hud = new window.GameHUD(config, camera, player, flagManager, policeManager);

  // ========================================================
  // WEB AUDIO RETRO ARCADE SYNTHESIZER
  // ========================================================
  const AudioEngine = {
    ctx: null,
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    },
    playHover() {
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(760, this.ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
      } catch (e) {}
    },
    playSelect() {
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(680, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(920, this.ctx.currentTime + 0.07);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.07);
      } catch (e) {}
    },
    playDeploy() {
      try {
        this.init();
        if (!this.ctx) return;
        const chords = [392, 523.25, 659.25, 783.99, 1046.50];
        chords.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.05);
          gain.gain.setValueAtTime(0.06, this.ctx.currentTime + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.05 + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(this.ctx.currentTime + i * 0.05);
          osc.stop(this.ctx.currentTime + i * 0.05 + 0.35);
        });
      } catch (e) {}
    },
    playCollect() {
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, this.ctx.currentTime);
        osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.22);
      } catch (e) {}
    },
    playFanfare() {
      try {
        this.init();
        if (!this.ctx) return;
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.09, this.ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(this.ctx.currentTime + idx * 0.08);
          osc.stop(this.ctx.currentTime + idx * 0.08 + 0.4);
        });
      } catch (e) {}
    },
    // Realistic Authentic Delhi Police Siren Wail + Whistle + Handcuff Snap
    playPoliceSiren() {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // 1. Sharp Police Whistle Chirps (high metal vibration)
        const whistleFreqs = [2400, 2750];
        whistleFreqs.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.setValueAtTime(freq + 50, now + 0.06);
          osc.frequency.setValueAtTime(freq, now + 0.12);
          osc.frequency.setValueAtTime(freq + 65, now + 0.18);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.3);
        });

        // 2. Handcuffs Metallic Latch Click
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(180, now + 0.04);
        clickOsc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
        clickGain.gain.setValueAtTime(0.2, now + 0.04);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        clickOsc.connect(clickGain);
        clickGain.connect(this.ctx.destination);
        clickOsc.start(now + 0.04);
        clickOsc.stop(now + 0.12);

        // 3. Piercing Two-Tone Emergency Police Vehicle Siren (WEE-WOO)
        const s1 = this.ctx.createOscillator();
        const s2 = this.ctx.createOscillator();
        const sirenGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        s1.type = 'sawtooth';
        s2.type = 'triangle';

        // Frequency sweep Cycle 1 & 2
        s1.frequency.setValueAtTime(640, now + 0.1);
        s1.frequency.exponentialRampToValueAtTime(1150, now + 0.45);
        s1.frequency.exponentialRampToValueAtTime(660, now + 0.75);
        s1.frequency.exponentialRampToValueAtTime(1180, now + 1.1);
        s1.frequency.exponentialRampToValueAtTime(620, now + 1.45);

        s2.frequency.setValueAtTime(648, now + 0.1);
        s2.frequency.exponentialRampToValueAtTime(1162, now + 0.45);
        s2.frequency.exponentialRampToValueAtTime(668, now + 0.75);
        s2.frequency.exponentialRampToValueAtTime(1194, now + 1.1);
        s2.frequency.exponentialRampToValueAtTime(628, now + 1.45);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(920, now);
        filter.Q.setValueAtTime(2.2, now);

        sirenGain.gain.setValueAtTime(0.001, now + 0.1);
        sirenGain.gain.exponentialRampToValueAtTime(0.2, now + 0.28);
        sirenGain.gain.setValueAtTime(0.2, now + 1.15);
        sirenGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        s1.connect(filter);
        s2.connect(filter);
        filter.connect(sirenGain);
        sirenGain.connect(this.ctx.destination);

        s1.start(now + 0.1);
        s2.start(now + 0.1);
        s1.stop(now + 1.5);
        s2.stop(now + 1.5);
      } catch (e) {
        console.warn('AudioEngine error:', e);
      }
    },
    // Celebratory Party Popper Cannon Blast
    playBlastPop() {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Cannon Thump / Popper Pop
        const pOsc = this.ctx.createOscillator();
        const pGain = this.ctx.createGain();
        pOsc.type = 'sine';
        pOsc.frequency.setValueAtTime(320, now);
        pOsc.frequency.exponentialRampToValueAtTime(50, now + 0.22);
        pGain.gain.setValueAtTime(0.3, now);
        pGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        pOsc.connect(pGain);
        pGain.connect(this.ctx.destination);
        pOsc.start(now);
        pOsc.stop(now + 0.25);

        // Crackle & Sparkles
        [880, 1174, 1396, 1760, 2093].forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + 0.04 + i * 0.03);
          gain.gain.setValueAtTime(0.08, now + 0.04 + i * 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35 + i * 0.04);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + 0.04 + i * 0.03);
          osc.stop(now + 0.35 + i * 0.04);
        });
      } catch (e) {}
    }
  };

  // Expose AudioEngine globally for HUD and callbacks
  window.AudioEngine = AudioEngine;

  // ========================================================
  // COUNTRY FACTIONS DATABASE (With Tactical Perks)
  // ========================================================
  const COUNTRY_FLAGS = [
    { code: 'IND', name: 'India', emoji: '🇮🇳', perk: '⚡ Satyagraha Aura (+Speed)', color: '#f97316', stripeColors: ['#ff9933', '#ffffff', '#138808'] },
    { code: 'USA', name: 'USA', emoji: '🇺🇸', perk: '🦅 Eagle Eye (+Minimap Radar)', color: '#3b82f6', stripeColors: ['#b22234', '#ffffff', '#3c3b6e'] },
    { code: 'GBR', name: 'United Kingdom', emoji: '🇬🇧', perk: '🛡️ London Shroud (+Stealth)', color: '#1d4ed8', stripeColors: ['#012169', '#ffffff', '#c8102e'] },
    { code: 'CAN', name: 'Canada', emoji: '🇨🇦', perk: '🍁 Maple Rush (+Agility)', color: '#ef4444', stripeColors: ['#ff0000', '#ffffff', '#ff0000'] },
    { code: 'JPN', name: 'Japan', emoji: '🇯🇵', perk: '⛩️ Shinobi Step (-Detection)', color: '#dc2626', stripeColors: ['#ffffff', '#bc002d', '#ffffff'] },
    { code: 'DEU', name: 'Germany', emoji: '🇩🇪', perk: '⚙️ Autobahn Precision', color: '#eab308', stripeColors: ['#000000', '#dd0000', '#ffce00'] },
    { code: 'FRA', name: 'France', emoji: '🇫🇷', perk: '⚜️ Bastille Call (+Morale)', color: '#2563eb', stripeColors: ['#0055a4', '#ffffff', '#ef4135'] },
    { code: 'AUS', name: 'Australia', emoji: '🇦🇺', perk: '🦘 Outback Endurance', color: '#0284c7', stripeColors: ['#00008b', '#ff0000', '#ffffff'] },
    { code: 'BRA', name: 'Brazil', emoji: '🇧🇷', perk: '⚡ Carnival Dash (+Sprint)', color: '#16a34a', stripeColors: ['#009c3b', '#ffdf00', '#002776'] },
    { code: 'ZAF', name: 'South Africa', emoji: '🇿🇦', perk: '🌈 Rainbow Nation Unity', color: '#059669', stripeColors: ['#007749', '#e03c31', '#001489'] },
    { code: 'ARE', name: 'UAE', emoji: '🇦🇪', perk: '🦅 Falcon Vision Glide', color: '#dc2626', stripeColors: ['#00732f', '#ffffff', '#000000'] },
    { code: 'ITA', name: 'Italy', emoji: '🇮🇹', perk: '🍕 Vespa Drift Stamina', color: '#16a34a', stripeColors: ['#009246', '#ffffff', '#ce2b37'] },
    { code: 'ESP', name: 'Spain', emoji: '🇪🇸', perk: '🐂 Matador Corner Dodge', color: '#eab308', stripeColors: ['#aa151b', '#f1bf00', '#aa151b'] },
    { code: 'GLO', name: 'Global Unity', emoji: '🏳️‍🌈', perk: '🌟 Ultimate Harmony Shield', color: '#8b5cf6', stripeColors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'] }
  ];

  const RANDOM_NAMES = [
    "Aam Aadmi", "Dilli Rebel", "Azad Hind", "Kisan Sena",
    "Satyagrahi", "Bharat Veer", "Freedom Voice", "Inquilab",
    "Metro Commuter", "CP Walker", "Nayi Dilli Guy", "Desh Premi"
  ];

  // Game Lifecycle State
  let currentLevel = 1;
  let isGameStarted = false;
  let cinematicAngle = 0;
  let selectedCountryFlag = COUNTRY_FLAGS[0]; // Default India 🇮🇳

  // Initialize all map flags to default country immediately
  flagManager.setCountryFlag(selectedCountryFlag);

  // ========================================================
  // COMPACT GAME CARD UI DOM WIRING
  // ========================================================
  const startModal = document.getElementById('start-modal');
  const playerNameInput = document.getElementById('player-name-input');
  const btnRandomName = document.getElementById('btn-random-name');
  const countryFlagSelect = document.getElementById('country-flag-select');
  const btnStartGame = document.getElementById('btn-start-game');

  // Banner & Preview elements
  const bannerFighterFlag = document.getElementById('banner-fighter-flag');
  const fs1 = document.getElementById('f-s1');
  const fs2 = document.getElementById('f-s2');
  const fs3 = document.getElementById('f-s3');

  // HUD elements
  const hudHelpBar = document.getElementById('hud-help-bar');
  const hudTopBar = document.getElementById('hud-top-bar');
  const hudZoomBar = document.getElementById('hud-zoom-bar');
  const hudPlayerFlag = document.getElementById('hud-player-flag');
  const hudPlayerName = document.getElementById('hud-player-name');
  const hudPlayerBadge = document.getElementById('hud-player-badge');
  const btnCustomHero = document.getElementById('btn-custom-hero');
  const helpMapModal = document.getElementById('help-map-modal');
  const btnHelpToggle = document.getElementById('btn-help-toggle');
  const btnCloseHelp = document.getElementById('btn-close-help');
  const btnResumeGame = document.getElementById('btn-resume-game');
  const btnZoomToggle = document.getElementById('btn-zoom-toggle');
  const zoomDropdownMenu = document.getElementById('zoom-dropdown-menu');

  // Update Game Card Preview on Nation / Flag Change
  function updateGameCardPreview() {
    if (bannerFighterFlag) bannerFighterFlag.textContent = selectedCountryFlag.emoji;
    const stripes = selectedCountryFlag.stripeColors || ['#f97316', '#ffffff', '#16a34a'];
    if (fs1) fs1.style.background = stripes[0] || '#f97316';
    if (fs2) fs2.style.background = stripes[1] || stripes[0] || '#ffffff';
    if (fs3) fs3.style.background = stripes[2] || stripes[1] || stripes[0] || '#16a34a';
  }

  // Country Flag Dropdown Change Listener
  if (countryFlagSelect) {
    countryFlagSelect.addEventListener('change', () => {
      const code = countryFlagSelect.value;
      const found = COUNTRY_FLAGS.find(f => f.code === code) || COUNTRY_FLAGS[0];
      selectedCountryFlag = found;

      // Instantly update all 6 world flags in the map!
      flagManager.setCountryFlag(selectedCountryFlag);
      player.setNameAndFlag(playerNameInput ? playerNameInput.value : '', selectedCountryFlag);

      AudioEngine.playSelect();
      updateGameCardPreview();
    });
  }

  // Name Input Listeners
  if (playerNameInput) {
    playerNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        startGame();
      }
    });
  }

  // Random Name Dice Button
  if (btnRandomName && playerNameInput) {
    btnRandomName.addEventListener('click', () => {
      AudioEngine.playSelect();
      const randIdx = Math.floor(Math.random() * RANDOM_NAMES.length);
      playerNameInput.value = RANDOM_NAMES[randIdx];
    });
  }

  // Initial Preview
  updateGameCardPreview();

  // Start Game Trigger
  function startGame() {
    AudioEngine.playDeploy();
    const rawName = playerNameInput ? playerNameInput.value.trim() : '';
    const finalName = rawName || 'Aam Aadmi';

    // 1. Start from a point on the LAST (outermost) ring (Ring 4, radius 1400)
    const outerRingNodes = roadNetwork.getOuterRingNodes();
    const spawnNode = (outerRingNodes && outerRingNodes.length > 0)
      ? outerRingNodes[Math.floor(Math.random() * outerRingNodes.length)]
      : initialSpawn;

    player.x = spawnNode.x;
    player.y = spawnNode.y;
    player.path = [];
    player.isMoving = false;

    // Apply Identity & Flag to Player Entity AND all 6 map collection flags
    player.setNameAndFlag(finalName, selectedCountryFlag);
    flagManager.setCountryFlag(selectedCountryFlag);

    // Update Top-Left HUD Pill
    if (hudPlayerFlag) hudPlayerFlag.textContent = selectedCountryFlag.emoji;
    if (hudPlayerName) hudPlayerName.textContent = finalName;

    // Hide Start Dialog
    if (startModal) {
      startModal.classList.remove('active');
    }

    // Set Game Active
    isGameStarted = true;

    // Reset police officers to distant patrol stations with 4s safe grace immunity
    policeManager.resetToPatrol(spawnNode);

    // Smoothly Reveal HUD & Mobile Controls
    if (hudHelpBar) hudHelpBar.classList.remove('hud-hidden');
    if (hudTopBar) hudTopBar.classList.remove('hud-hidden');
    if (hudZoomBar) hudZoomBar.classList.remove('hud-hidden');

    const mobileControls = document.getElementById('mobile-controls-container');
    if (mobileControls) {
      if (window.innerWidth <= 768) {
        mobileControls.style.display = 'none';
      } else {
        mobileControls.classList.remove('hud-hidden');
      }
    }

    // Smooth Camera Transition to Player on the Last Ring (comfortably zoomed out on mobile)
    camera.moveTo(player.x, player.y);
    camera.setZoom(window.innerWidth <= 768 ? 0.36 : 1.10);
    camera.setFollow(player);

    hud.logAction(`✊ Hero ${player.name} deployed on the Perimeter Ring representing ${selectedCountryFlag.name} ${selectedCountryFlag.emoji}!`);
    hud.logAction(`🚩 MISSION: Find and secure all flags to unlock the Center Gandhi Cap!`);
    hud.logAction('💡 TIP: Tap any road to walk or double-tap to sprint!');
  }

  // Help & Radar Map Modal Handlers
  function toggleHelpModal() {
    if (!helpMapModal) return;
    AudioEngine.playSelect();
    helpMapModal.classList.toggle('active');
  }

  function closeHelpModal() {
    if (!helpMapModal) return;
    helpMapModal.classList.remove('active');
  }

  if (btnHelpToggle) {
    btnHelpToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleHelpModal();
    });
  }
  if (btnCloseHelp) btnCloseHelp.addEventListener('click', closeHelpModal);
  if (btnResumeGame) btnResumeGame.addEventListener('click', closeHelpModal);
  if (helpMapModal) {
    helpMapModal.addEventListener('click', (e) => {
      if (e.target === helpMapModal) closeHelpModal();
    });
  }

  // Zoom Button Toggle & Click-Outside to Hide
  if (btnZoomToggle && zoomDropdownMenu) {
    btnZoomToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioEngine.playSelect();
      zoomDropdownMenu.classList.toggle('hidden');
    });

    // Close zoom dropdown when clicking or touching anywhere outside
    window.addEventListener('click', (e) => {
      if (!zoomDropdownMenu.classList.contains('hidden')) {
        if (!zoomDropdownMenu.contains(e.target) && e.target !== btnZoomToggle && !btnZoomToggle.contains(e.target)) {
          zoomDropdownMenu.classList.add('hidden');
        }
      }
    });

    window.addEventListener('touchstart', (e) => {
      if (!zoomDropdownMenu.classList.contains('hidden')) {
        if (!zoomDropdownMenu.contains(e.target) && e.target !== btnZoomToggle && !btnZoomToggle.contains(e.target)) {
          zoomDropdownMenu.classList.add('hidden');
        }
      }
    }, { passive: true });
  }

  if (btnStartGame) {
    btnStartGame.addEventListener('mouseenter', () => AudioEngine.playHover());
    btnStartGame.addEventListener('click', startGame);
  }

  // Reopen Customization Modal anytime via HUD badge or Hero button
  function openCustomizer() {
    if (startModal) {
      AudioEngine.playSelect();
      startModal.classList.add('active');
      if (playerNameInput) playerNameInput.focus();
    }
  }

  if (hudPlayerBadge) hudPlayerBadge.addEventListener('click', openCustomizer);
  if (btnCustomHero) btnCustomHero.addEventListener('click', openCustomizer);

  // Global Enter Key Handler for Start Modal
  window.addEventListener('keydown', (e) => {
    if (!isGameStarted && e.key === 'Enter') {
      startGame();
    }
  });

  // Initialize Jantar Mantar Map on load
  roadNetwork.buildGraphForMap('jantar');
  mapDrawer.setMapTheme('jantar');
  minimap.setMapTheme(window.MAP_THEMES ? window.MAP_THEMES.jantar : null);

  // ========================================================
  // MINIMAP & CANVAS INTERACTION
  // ========================================================
  minimap.onMinimapClick = (worldX, worldY) => {
    if (!isGameStarted) return;
    if (hud.gameMode === 'walk') {
      player.setDestination(worldX, worldY);
      hud.logAction(`📍 Path calculated to (${Math.floor(worldX)}, ${Math.floor(worldY)})`);
    } else {
      camera.moveTo(worldX, worldY);
    }
  };

  input.onWorldClick = (worldX, worldY) => {
    if (!isGameStarted) return;
    if (hud.gameMode === 'walk') {
      player.setDestination(worldX, worldY);
    }
  };

  // Police Catch Callback
  const onCatchProtester = (officer) => {
    if (!isGameStarted) return;
    AudioEngine.playPoliceSiren();
    hud.triggerArrest(officer);
  };

  // Flag Collect Callback
  const onFlagCollect = (flag) => {
    if (!isGameStarted) return;
    AudioEngine.playCollect();
    hud.logAction(`🚩 Secured ${flag.name}! (${flagManager.getCollectedCount()}/${flagManager.getTotalCount()})`);
    if (flagManager.isAllCollected()) {
      AudioEngine.playFanfare();
      hud.logAction(`✨ 🧢 ALL ${selectedCountryFlag.name} FLAGS SECURED! The Gandhi Cap is now UNLOCKED at Center! Go claim it!`);
      // Automatically direct the protester towards the center Gandhi Cap!
      const center = roadNetwork.center || config.circularLayout.center;
      player.setDestination(center.x, center.y);
    }
  };

  // ========================================================
  // LEVEL ADVANCEMENT & EXPANDING CIRCULAR MAP ENGINE
  // ========================================================
  hud.onContinueLevel = () => {
    currentLevel++;
    AudioEngine.playDeploy();

    // 1. Calculate Expanded Dimensions for Next Level (Expands every 5 levels: 5, 10, 15, 20...)
    const extraRings = Math.floor(currentLevel / 5);
    const baseRings = [240, 480, 760, 1080, 1400];
    const rings = [...baseRings];
    for (let i = 1; i <= extraRings; i++) {
      rings.push(1400 + i * 320);
    }
    const maxR = rings[rings.length - 1];
    const worldSize = Math.max(3600, (maxR + 420) * 2);
    const newCenter = { x: worldSize / 2, y: worldSize / 2 };

    config.world.width = worldSize;
    config.world.height = worldSize;
    config.world.center = newCenter;
    config.circularLayout.center = newCenter;
    config.circularLayout.rings = rings.map((r, i) => ({ id: `ring-${i}`, radius: r, name: `Ring ${i}` }));

    // 2. Rebuild Road Network with progressive rings
    roadNetwork.center = newCenter;
    roadNetwork.buildGraphForMap(currentLevel);

    // 3. Update Camera and Minimap World Size
    camera.setWorldSize(worldSize, worldSize);
    minimap.setWorldSize(worldSize, worldSize);

    // 4. Regenerate Flags for New Level (Flags increase on every single level: 1, 2, 3, 4, 5...)
    flagManager.initFlags(currentLevel);
    flagManager.setCountryFlag(selectedCountryFlag);

    // 5. Scale Police AI for New Level
    policeManager.initOfficers(currentLevel);

    // 6. Spawn Protester Player on the Outermost Ring
    const outerRingNodes = roadNetwork.getOuterRingNodes();
    const spawnNode = (outerRingNodes && outerRingNodes.length > 0)
      ? outerRingNodes[Math.floor(Math.random() * outerRingNodes.length)]
      : roadNetwork.nodes[roadNetwork.nodes.length - 1];

    player.x = spawnNode.x;
    player.y = spawnNode.y;
    player.path = [];
    player.isMoving = false;

    // Safe grace immunity
    policeManager.resetToPatrol(spawnNode);

    // Smoothly focus camera on player on the new ring
    camera.moveTo(player.x, player.y);
    camera.setZoom(window.innerWidth <= 768 ? 0.36 : 1.05);
    camera.setFollow(player);

    // Update HUD Level Badge
    hud.setLevel(currentLevel);

    const isMapExpanded = (currentLevel % 5 === 0);
    if (isMapExpanded) {
      hud.logAction(`🌟 MILESTONE REACHED! Map expanded to ${rings.length} rings with ${flagManager.getTotalCount()} flags!`);
    } else {
      const nextExpandIn = 5 - (currentLevel % 5);
      hud.logAction(`🚀 LEVEL ${currentLevel} BEGUN! Flags increased to ${flagManager.getTotalCount()}! (Map expands at Level ${currentLevel + nextExpandIn})`);
    }
  };

  // ========================================================
  // MAIN RENDER LOOP (Realtime Map Motion)
  // ========================================================
  let lastTime = performance.now();
  let sunAngle = 0;

  function render(now) {
    const deltaTime = Math.min(0.08, (now - lastTime) / 1000);
    lastTime = now;
    sunAngle += deltaTime * 0.15;

    camera.resize(canvas.width, canvas.height);

    if (!isGameStarted) {
      // Real-time cinematic camera glide across the circular roads & Jantar Mantar
      cinematicAngle += deltaTime * 0.16;
      const radius = 640;
      const camX = centerPos.x + Math.cos(cinematicAngle) * radius;
      const camY = centerPos.y + Math.sin(cinematicAngle * 0.8) * (radius * 0.65);
      camera.moveTo(camX, camY);
      camera.setZoom(window.innerWidth <= 768 ? 0.36 : 0.88);

      // AI updates in background for live real-time simulation (game not started: never detect or chase player)
      policeManager.update(deltaTime, player, null, false);
    } else {
      input.setGameMode(hud.gameMode);

      // Manual Keyboard (WASD / Arrows) Movement & Mobile Virtual Joystick
      let kx = 0;
      let ky = 0;
      if (input.keys['w'] || input.keys['arrowup']) ky -= 1;
      if (input.keys['s'] || input.keys['arrowdown']) ky += 1;
      if (input.keys['a'] || input.keys['arrowleft']) kx -= 1;
      if (input.keys['d'] || input.keys['arrowright']) kx += 1;

      if (input.joystick && input.joystick.active) {
        kx += input.joystick.x;
        ky += input.joystick.y;
      }

      const isSprinting = input.mouse.rightDown || (input.isTouchSprinting === true);

      if (hud.gameMode === 'walk') {
        if (kx !== 0 || ky !== 0) {
          player.manualMovingThisFrame = true;
          player.manualMove(kx, ky, deltaTime, isSprinting);
        }
        player.update(deltaTime, isSprinting);
      } else {
        input.update(deltaTime);
      }

      // Update Entities
      if (!hud.isGameOver) {
        flagManager.update(deltaTime, player, onFlagCollect);
        policeManager.update(deltaTime, player, onCatchProtester, true, flagManager.isAllCollected());
      }
      hud.update(deltaTime);
    }

    camera.update();

    // Render Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background color
    const activeBg = (mapDrawer.theme && mapDrawer.theme.bgCanvas) || config.colors.bgColor || '#e3dfd3';
    ctx.fillStyle = hud.viewMode === 'blueprint' ? '#091524' : activeBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    camera.apply(ctx);

    // 1. Draw Circular Road Network, Buildings, Central Jantar Mantar, & Victory Gandhi Cap
    mapDrawer.draw(hud.viewMode, deltaTime, sunAngle, flagManager.isAllCollected());

    // 2. Draw Flags
    flagManager.draw(ctx, hud.viewMode);

    // 3. Draw Police AI
    policeManager.draw(ctx, hud.viewMode);

    // 4. Draw Player
    player.draw(ctx, hud.viewMode);

    camera.restore(ctx);

    // 5. Draw Radar Minimap (only if game is active or minimap visible)
    if (isGameStarted) {
      minimap.draw(camera, player, policeManager.officers, flagManager.flags);
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
});
