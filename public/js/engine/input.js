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

    // Mobile Virtual Joystick & Touch Controls
    this.joystick = { x: 0, y: 0, active: false };
    this.isTouchSprinting = false;
    this.isPinching = false;
    this.pinchStartDist = 0;
    this.pinchStartZoom = 1;
    this.lastTouchClickTime = 0;

    this.initListeners();
    this.initMobileControls();
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
          // Steer towards mouse with slight throttle to prevent recalculation thrashing
          const now = performance.now();
          if (this.onWorldClick && (!this.lastMoveClickTime || now - this.lastMoveClickTime > 180)) {
            const dragDist = Math.hypot(e.clientX - this.dragStart.x, e.clientY - this.dragStart.y);
            if (dragDist > 25) {
              this.lastMoveClickTime = now;
              this.onWorldClick(this.mouse.worldX, this.mouse.worldY);
            }
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

    // Touch Support & Two-Finger Pinch-to-Zoom
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        this.isPinching = true;
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        this.pinchStartDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        this.pinchStartZoom = this.camera.zoom;
        return;
      }

      if (e.touches.length === 1 && !this.isPinching) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = touch.clientX - rect.left;
        this.mouse.y = touch.clientY - rect.top;
        const worldPos = this.camera.screenToWorld(this.mouse.x, this.mouse.y);
        this.mouse.worldX = worldPos.x;
        this.mouse.worldY = worldPos.y;
        this.mouse.isDown = true;

        const now = performance.now();
        // Double-tap to sprint on mobile
        if (this.lastTouchStartTime && (now - this.lastTouchStartTime < 350)) {
          this.isTouchSprinting = true;
        } else {
          this.isTouchSprinting = false;
        }
        this.lastTouchStartTime = now;
        this.lastTouchClickTime = now;

        if (this.gameMode === 'walk' && this.onWorldClick) {
          this.onWorldClick(this.mouse.worldX, this.mouse.worldY);
        }
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      // Pinch to Zoom
      if (e.touches.length === 2 && this.isPinching && this.pinchStartDist > 0) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const curDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const ratio = curDist / this.pinchStartDist;
        const targetZoom = Math.min(2.5, Math.max(0.4, this.pinchStartZoom * ratio));
        this.camera.setZoom(targetZoom);
        return;
      }

      // Drag on Road (throttled to 180ms to avoid pathfinding freeze)
      if (e.touches.length === 1 && !this.isPinching) {
        const now = performance.now();
        if (this.onWorldClick && (!this.lastTouchClickTime || now - this.lastTouchClickTime > 180)) {
          this.lastTouchClickTime = now;
          const touch = e.touches[0];
          const rect = this.canvas.getBoundingClientRect();
          this.mouse.x = touch.clientX - rect.left;
          this.mouse.y = touch.clientY - rect.top;
          const worldPos = this.camera.screenToWorld(this.mouse.x, this.mouse.y);
          this.mouse.worldX = worldPos.x;
          this.mouse.worldY = worldPos.y;
          this.onWorldClick(worldPos.x, worldPos.y);
        }
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) {
        this.isPinching = false;
      }
      if (e.touches.length === 0) {
        this.mouse.isDown = false;
      }
    });
  }

  // Initialize On-Screen Mobile Virtual Joystick & Touch Sprint Button
  initMobileControls() {
    // 1. Virtual Joystick
    const base = document.getElementById('joystick-base');
    const knob = document.getElementById('joystick-knob');
    if (base && knob) {
      let touchId = null;
      let baseRect = null;
      const maxRadius = 38;

      const onTouchStart = (e) => {
        if (touchId !== null) return;
        const touch = e.changedTouches[0];
        touchId = touch.identifier;
        baseRect = base.getBoundingClientRect();
        updateKnob(touch.clientX, touch.clientY);
      };

      const onTouchMove = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === touchId) {
            updateKnob(touch.clientX, touch.clientY);
            break;
          }
        }
      };

      const onTouchEnd = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === touchId) {
            touchId = null;
            this.joystick.x = 0;
            this.joystick.y = 0;
            this.joystick.active = false;
            knob.style.transform = 'translate(0px, 0px)';
            break;
          }
        }
      };

      const updateKnob = (clientX, clientY) => {
        if (!baseRect) baseRect = base.getBoundingClientRect();
        const centerX = baseRect.left + baseRect.width / 2;
        const centerY = baseRect.top + baseRect.height / 2;
        let dx = clientX - centerX;
        let dy = clientY - centerY;
        const dist = Math.hypot(dx, dy);

        if (dist > maxRadius) {
          dx = (dx / dist) * maxRadius;
          dy = (dy / dist) * maxRadius;
        }

        knob.style.transform = `translate(${dx}px, ${dy}px)`;
        this.joystick.x = dx / maxRadius;
        this.joystick.y = dy / maxRadius;
        this.joystick.active = (dist > 4);
      };

      base.addEventListener('touchstart', onTouchStart, { passive: false });
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd, { passive: false });
      window.addEventListener('touchcancel', onTouchEnd, { passive: false });
    }

    // 2. Mobile Sprint Button
    const sprintBtn = document.getElementById('btn-mobile-sprint');
    if (sprintBtn) {
      const startSprint = (e) => {
        e.preventDefault();
        this.isTouchSprinting = true;
        sprintBtn.classList.add('active');
      };
      const endSprint = (e) => {
        e.preventDefault();
        this.isTouchSprinting = false;
        sprintBtn.classList.remove('active');
      };
      sprintBtn.addEventListener('touchstart', startSprint, { passive: false });
      sprintBtn.addEventListener('touchend', endSprint, { passive: false });
      sprintBtn.addEventListener('touchcancel', endSprint, { passive: false });
      sprintBtn.addEventListener('mousedown', startSprint);
      window.addEventListener('mouseup', endSprint);
    }
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

    if (this.joystick && this.joystick.active) {
      dx += this.joystick.x;
      dy += this.joystick.y;
    }

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
