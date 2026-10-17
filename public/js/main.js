// Main Application Entry Point - Jantar Mantar 2.0 (Responsive Circular Road Movement)
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

  // 3. Spawn Protester Player on the Outer Ring (Sansad Marg West Spoke)
  const spawnNode = roadNetwork.nodes.find(n => n.ringIndex === 4 && n.radialIndex === 6) || roadNetwork.nodes[10];
  const player = new window.ProtesterPlayer(spawnNode.x, spawnNode.y, roadNetwork);
  camera.setFollow(player);

  // 4. Managers & Drawers
  const mapDrawer = new window.CircularMapDrawer(ctx, config, roadNetwork);
  const flagManager = new window.FlagManager(config, roadNetwork);
  const policeManager = new window.PoliceAIManager(config, roadNetwork);
  const minimap = new window.DilliMinimap('minimap-canvas', config.world.width, config.world.height, config, roadNetwork);
  const hud = new window.GameHUD(config, camera, player, flagManager, policeManager);

  // Minimap Click -> Set Player Destination
  minimap.onMinimapClick = (worldX, worldY) => {
    if (hud.gameMode === 'walk') {
      player.setDestination(worldX, worldY);
      hud.logAction(`📍 Path calculated to (${Math.floor(worldX)}, ${Math.floor(worldY)})`);
    } else {
      camera.moveTo(worldX, worldY);
    }
  };

  // World Canvas Click or Mouse Guidance -> Move Player along road network
  input.onWorldClick = (worldX, worldY) => {
    if (hud.gameMode === 'walk') {
      player.setDestination(worldX, worldY);
    }
  };

  // Police Catch Callback
  const onCatchProtester = (officer) => {
    hud.triggerArrest(officer);
  };

  // Flag Collect Callback
  const onFlagCollect = (flag) => {
    hud.logAction(`🚩 Picked up ${flag.name}! (${flagManager.getCollectedCount()}/${flagManager.getTotalCount()})`);
    if (flagManager.isAllCollected()) {
      hud.logAction(`🌟 ALL FLAGS COLLECTED! Head to Center Jantar Mantar Samrat Yantra!`);
    }
  };

  // Main Render Loop
  let lastTime = performance.now();
  let sunAngle = 0;

  function render(now) {
    const deltaTime = Math.min(0.08, (now - lastTime) / 1000);
    lastTime = now;
    sunAngle += deltaTime * 0.15;

    camera.resize(canvas.width, canvas.height);
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

    camera.update();

    // Update Entities
    if (!hud.isGameOver) {
      flagManager.update(deltaTime, player, onFlagCollect);
      policeManager.update(deltaTime, player, onCatchProtester);
    }
    hud.update(deltaTime);

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

    // 5. Draw Radar Minimap
    minimap.draw(camera, player, policeManager.officers, flagManager.flags);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
  hud.logAction('🚩 Mission Started: Move along circular roads to find flags!');
  hud.logAction('⚠️ Watch out for patrolling police! Move strictly on roads to reach Center Jantar Mantar.');
});
