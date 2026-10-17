// Responsive Input Management: Click-to-Move, Mouse Drag, Zoom & Keyboard
class InputManager {
  constructor(canvas, camera) {
    this.canvas = canvas;
    this.camera = camera;
    this.keys = {};
    this.mouse = { x: 0, y: 0, worldX: 0, worldY: 0, isDown: false, rightDown: false };
    this.dragStart = { x: 0, y: 0, camX: 0, camY: 0 };
    this.isDragging = false;
    this.gameMode = 'walk'; // 'walk' or 'explore'

    this.onWorldClick = null;

    this.initListeners();
  }

  setGameMode(mode) {
    this.gameMode = mode;
  }

  initListeners() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Mouse Move
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;

      const worldPos = this.camera.screenToWorld(this.mouse.x, this.mouse.y);
      this.mouse.worldX = worldPos.x;
      this.mouse.worldY = worldPos.y;

      if (this.mouse.isDown) {
        if (this.gameMode === 'explore') {
          // Pan camera in explore mode
          const dx = (e.clientX - this.dragStart.x);
          const dy = (e.clientY - this.dragStart.y);
          this.camera.targetX = this.dragStart.camX - dx / this.camera.zoom;
          this.camera.targetY = this.dragStart.camY - dy / this.camera.zoom;
        } else if (this.gameMode === 'walk') {
          // Continuously steer player towards mouse in walk mode
          if (this.onWorldClick) {
            this.onWorldClick(this.mouse.worldX, this.mouse.worldY);
          }
        }
      }
    });

    // Mouse Down (Immediate response!)
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      const worldPos = this.camera.screenToWorld(this.mouse.x, this.mouse.y);
      this.mouse.worldX = worldPos.x;
      this.mouse.worldY = worldPos.y;

      if (e.button === 0) { // Left click
        this.mouse.isDown = true;
        this.dragStart.x = e.clientX;
        this.dragStart.y = e.clientY;
        this.dragStart.camX = this.camera.targetX;
        this.dragStart.camY = this.camera.targetY;

        // Trigger move immediately upon click!
        if (this.gameMode === 'walk' && this.onWorldClick) {
          this.onWorldClick(this.mouse.worldX, this.mouse.worldY);
        }
      } else if (e.button === 2) { // Right click for running sprint
        this.mouse.rightDown = true;
      }
    });

    // Prevent default context menu
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Mouse Up
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.mouse.isDown = false;
        this.isDragging = false;
      } else if (e.button === 2) {
        this.mouse.rightDown = false;
      }
    });

    // Zoom on Wheel
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      this.camera.zoomBy(zoomFactor, this.mouse.x, this.mouse.y);
    }, { passive: false });

    // Touch Support for mobile / touchpads
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = touch.clientX - rect.left;
        this.mouse.y = touch.clientY - rect.top;
        const worldPos = this.camera.screenToWorld(this.mouse.x, this.mouse.y);
        this.mouse.worldX = worldPos.x;
        this.mouse.worldY = worldPos.y;
        this.mouse.isDown = true;

        if (this.gameMode === 'walk' && this.onWorldClick) {
          this.onWorldClick(this.mouse.worldX, this.mouse.worldY);
        }
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = touch.clientX - rect.left;
        this.mouse.y = touch.clientY - rect.top;
        const worldPos = this.camera.screenToWorld(this.mouse.x, this.mouse.y);
        this.mouse.worldX = worldPos.x;
        this.mouse.worldY = worldPos.y;

        if (this.gameMode === 'walk' && this.onWorldClick) {
          this.onWorldClick(this.mouse.worldX, this.mouse.worldY);
        }
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', () => {
      this.mouse.isDown = false;
    });
  }

  // Update camera motion via keyboard in free explore mode
  update(deltaTime) {
    const panSpeed = (600 / this.camera.zoom) * deltaTime;
    let dx = 0;
    let dy = 0;

    if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
    if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      this.camera.targetX += (dx / len) * panSpeed;
      this.camera.targetY += (dy / len) * panSpeed;
    }
  }
}

if (typeof window !== 'undefined') {
  window.InputManager = InputManager;
}
