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
  camera.setZoom(0.85);

  // 3. Spawn Protester Player on the Outer Ring (Sansad Marg West Spoke)
  const spawnNode = roadNetwork.nodes.find(n => n.ringIndex === 4 && n.radialIndex === 6) || roadNetwork.nodes[10];
  const player = new window.ProtesterPlayer(spawnNode.x, spawnNode.y, roadNetwork);

  // 4. Managers & Drawers
  const mapDrawer = new window.CircularMapDrawer(ctx, config, roadNetwork);
  const flagManager = new window.FlagManager(config, roadNetwork);
  const policeManager = new window.PoliceAIManager(config, roadNetwork);
  const minimap = new window.DilliMinimap('minimap-canvas', config.world.width, config.world.height, config, roadNetwork);
  const hud = new window.GameHUD(config, camera, player, flagManager, policeManager);

  // ========================================================
  // COUNTRY FLAGS & RANDOM NAMES DATABASE
  // ========================================================
  const COUNTRY_FLAGS = [
    { code: 'IN', name: 'India', emoji: '🇮🇳', color: '#f97316', stripeColors: ['#ff9933', '#ffffff', '#138808'] },
    { code: 'US', name: 'USA', emoji: '🇺🇸', color: '#3b82f6', stripeColors: ['#b22234', '#ffffff', '#3c3b6e'] },
    { code: 'GB', name: 'United Kingdom', emoji: '🇬🇧', color: '#1d4ed8', stripeColors: ['#012169', '#ffffff', '#c8102e'] },
    { code: 'CA', name: 'Canada', emoji: '🇨🇦', color: '#ef4444', stripeColors: ['#ff0000', '#ffffff', '#ff0000'] },
    { code: 'JP', name: 'Japan', emoji: '🇯🇵', color: '#dc2626', stripeColors: ['#ffffff', '#bc002d', '#ffffff'] },
    { code: 'DE', name: 'Germany', emoji: '🇩🇪', color: '#eab308', stripeColors: ['#000000', '#dd0000', '#ffce00'] },
    { code: 'FR', name: 'France', emoji: '🇫🇷', color: '#2563eb', stripeColors: ['#0055a4', '#ffffff', '#ef4135'] },
    { code: 'AU', name: 'Australia', emoji: '🇦🇺', color: '#0284c7', stripeColors: ['#00008b', '#ff0000', '#ffffff'] },
    { code: 'BR', name: 'Brazil', emoji: '🇧🇷', color: '#16a34a', stripeColors: ['#009c3b', '#ffdf00', '#002776'] },
    { code: 'ZA', name: 'South Africa', emoji: '🇿🇦', color: '#059669', stripeColors: ['#007749', '#e03c31', '#001489'] },
    { code: 'AE', name: 'UAE', emoji: '🇦🇪', color: '#dc2626', stripeColors: ['#00732f', '#ffffff', '#000000'] },
    { code: 'IT', name: 'Italy', emoji: '🇮🇹', color: '#16a34a', stripeColors: ['#009246', '#ffffff', '#ce2b37'] },
    { code: 'ES', name: 'Spain', emoji: '🇪🇸', color: '#eab308', stripeColors: ['#aa151b', '#f1bf00', '#aa151b'] },
    { code: 'UN', name: 'Peace & Freedom', emoji: '🏳️‍🌈', color: '#8b5cf6', stripeColors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'] }
  ];

  const RANDOM_NAMES = [
    "Aam Aadmi", "Dilli Rebel", "Azad Hind", "Kisan Sena",
    "Satyagrahi", "Bharat Veer", "Freedom Voice", "Inquilab",
    "Metro Commuter", "CP Walker", "Nayi Dilli Guy", "Desh Premi"
  ];

  // Game Lifecycle State
  let isGameStarted = false;
  let cinematicAngle = 0;
  let selectedCountryFlag = COUNTRY_FLAGS[0]; // Default India 🇮🇳

  // ========================================================
  // START MODAL & CHARACTER CUSTOMIZER DOM WIRING
  // ========================================================
  const startModal = document.getElementById('start-modal');
  const playerNameInput = document.getElementById('player-name-input');
  const btnRandomName = document.getElementById('btn-random-name');
  const flagsContainer = document.getElementById('flags-picker-container');
  const btnStartGame = document.getElementById('btn-start-game');

  // Preview elements
  const previewHeroTag = document.getElementById('preview-hero-tag');
  const previewCountryEmoji = document.getElementById('preview-country-emoji');
  const previewCountryTitle = document.getElementById('preview-country-title');
  const previewStripe1 = document.getElementById('preview-stripe-1');
  const previewStripe2 = document.getElementById('preview-stripe-2');
  const previewStripe3 = document.getElementById('preview-stripe-3');

  // HUD elements
  const hudTopBar = document.getElementById('hud-top-bar');
  const hudZoomBar = document.getElementById('hud-zoom-bar');
  const hudMinimapBar = document.getElementById('hud-minimap-bar');
  const hudPlayerFlag = document.getElementById('hud-player-flag');
  const hudPlayerName = document.getElementById('hud-player-name');
  const hudPlayerBadge = document.getElementById('hud-player-badge');
  const btnCustomHero = document.getElementById('btn-custom-hero');

  // Render Country Flag Chips
  if (flagsContainer) {
    flagsContainer.innerHTML = '';
    COUNTRY_FLAGS.forEach((flag, idx) => {
      const chip = document.createElement('div');
      chip.className = `flag-chip-item ${idx === 0 ? 'selected' : ''}`;
      chip.dataset.code = flag.code;
      chip.title = `${flag.name} (${flag.emoji})`;
      chip.innerHTML = `
        <span class="flag-chip-emoji">${flag.emoji}</span>
        <span class="flag-chip-name">${flag.name}</span>
      `;
      chip.addEventListener('click', () => {
        document.querySelectorAll('.flag-chip-item').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        selectedCountryFlag = flag;
        updateHeroPreview();
      });
      flagsContainer.appendChild(chip);
    });
  }

  // Update Live Preview Card
  function updateHeroPreview() {
    const rawName = playerNameInput ? playerNameInput.value.trim() : '';
    const name = rawName || 'Aam Aadmi';

    if (previewHeroTag) previewHeroTag.textContent = `${selectedCountryFlag.emoji} ${name}`;
    if (previewCountryEmoji) previewCountryEmoji.textContent = selectedCountryFlag.emoji;
    if (previewCountryTitle) previewCountryTitle.textContent = selectedCountryFlag.name;

    const stripes = selectedCountryFlag.stripeColors || ['#f97316', '#ffffff', '#16a34a'];
    if (previewStripe1) previewStripe1.style.background = stripes[0] || '#f97316';
    if (previewStripe2) previewStripe2.style.background = stripes[1] || stripes[0] || '#ffffff';
    if (previewStripe3) previewStripe3.style.background = stripes[2] || stripes[1] || stripes[0] || '#16a34a';
  }

  // Name Input Listeners
  if (playerNameInput) {
    playerNameInput.addEventListener('input', updateHeroPreview);
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
      const randIdx = Math.floor(Math.random() * RANDOM_NAMES.length);
      playerNameInput.value = RANDOM_NAMES[randIdx];
      updateHeroPreview();
    });
  }

  // Start Game Trigger
  function startGame() {
    const rawName = playerNameInput ? playerNameInput.value.trim() : '';
    const finalName = rawName || 'Aam Aadmi';

    // Apply Identity & Flag to Player Entity
    player.setNameAndFlag(finalName, selectedCountryFlag);

    // Update Top-Left HUD Pill
    if (hudPlayerFlag) hudPlayerFlag.textContent = selectedCountryFlag.emoji;
    if (hudPlayerName) hudPlayerName.textContent = finalName;

    // Hide Start Dialog
    if (startModal) {
      startModal.classList.remove('active');
    }

    // Set Game Active
    isGameStarted = true;

    // Smoothly Reveal HUD & Minimap
    if (hudTopBar) hudTopBar.classList.remove('hud-hidden');
    if (hudZoomBar) hudZoomBar.classList.remove('hud-hidden');
    if (hudMinimapBar) hudMinimapBar.classList.remove('hud-hidden');

    // Smooth Camera Transition to Player
    camera.moveTo(player.x, player.y);
    camera.setZoom(1.1);
    camera.setFollow(player);

    hud.logAction(`✊ Hero ${player.name} deployed representing ${selectedCountryFlag.name} ${selectedCountryFlag.emoji}!`);
    hud.logAction('🚩 Mission Started: Move along circular roads to find 6 flags!');
    hud.logAction('⚠️ Watch out for patrolling police! Move strictly on roads to reach Center Jantar Mantar.');
  }

  if (btnStartGame) {
    btnStartGame.addEventListener('click', startGame);
  }

  // Reopen Customization Modal anytime via HUD badge or Hero button
  function openCustomizer() {
    if (startModal) {
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

  // Initial Preview Call
  updateHeroPreview();

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
    hud.triggerArrest(officer);
  };

  // Flag Collect Callback
  const onFlagCollect = (flag) => {
    if (!isGameStarted) return;
    hud.logAction(`🚩 Picked up ${flag.name}! (${flagManager.getCollectedCount()}/${flagManager.getTotalCount()})`);
    if (flagManager.isAllCollected()) {
      hud.logAction(`🌟 ALL FLAGS COLLECTED! Head to Center Jantar Mantar Samrat Yantra!`);
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
      camera.setZoom(0.88);

      // AI updates in background for live real-time simulation
      policeManager.update(deltaTime, player, null);
    } else {
      input.setGameMode(hud.gameMode);

      // Manual Keyboard (WASD / Arrows) Movement
      let kx = 0;
      let ky = 0;
      if (input.keys['w'] || input.keys['arrowup']) ky -= 1;
      if (input.keys['s'] || input.keys['arrowdown']) ky += 1;
      if (input.keys['a'] || input.keys['arrowleft']) kx -= 1;
      if (input.keys['d'] || input.keys['arrowright']) kx += 1;

      if (hud.gameMode === 'walk') {
        if (kx !== 0 || ky !== 0) {
          player.manualMovingThisFrame = true;
          player.manualMove(kx, ky, deltaTime, input.mouse.rightDown);
        }
        player.update(deltaTime, input.mouse.rightDown);
      } else {
        input.update(deltaTime);
      }

      // Update Entities
      if (!hud.isGameOver) {
        flagManager.update(deltaTime, player, onFlagCollect);
        policeManager.update(deltaTime, player, onCatchProtester);
      }
      hud.update(deltaTime);
    }

    camera.update();

    // Render Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background color
    ctx.fillStyle = hud.viewMode === 'blueprint' ? '#091524' : config.colors.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    camera.apply(ctx);

    // 1. Draw Circular Road Network, Buildings, & Central Jantar Mantar
    mapDrawer.draw(hud.viewMode, deltaTime, sunAngle);

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
