// 2D Camera Engine with Smooth Pan, Zoom, and Follow Capabilities
class Camera2D {
  constructor(canvasWidth, canvasHeight, worldWidth, worldHeight) {
    this.viewportWidth = canvasWidth;
    this.viewportHeight = canvasHeight;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;

    this.x = 2400; // Default centered on Jantar Mantar
    this.y = 2500;
    this.targetX = this.x;
    this.targetY = this.y;

    this.zoom = 1.0;
    this.targetZoom = 1.0;
    this.minZoom = 0.35; // See entire Delhi CP + Jantar Mantar
    this.maxZoom = 2.4;  // Close-up detail of sundial scales

    this.followTarget = null;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.cameraStartX = 0;
    this.cameraStartY = 0;

    this.lerpSpeed = 0.12;
  }

  resize(w, h) {
    this.viewportWidth = w;
    this.viewportHeight = h;
  }

  setFollow(target) {
    this.followTarget = target;
  }

  clearFollow() {
    this.followTarget = null;
  }

  moveTo(worldX, worldY, instant = false) {
    this.targetX = worldX;
    this.targetY = worldY;
    if (instant) {
      this.x = worldX;
      this.y = worldY;
    }
  }

  setZoom(zoomLevel) {
    this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoomLevel));
  }

  zoomBy(delta, cursorX = this.viewportWidth / 2, cursorY = this.viewportHeight / 2) {
    // Zoom toward cursor position
    const worldPosBefore = this.screenToWorld(cursorX, cursorY);
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom * delta));
    this.targetZoom = newZoom;
    this.zoom = newZoom; // Immediate responsiveness on wheel

    const worldPosAfter = this.screenToWorld(cursorX, cursorY);
    this.targetX += (worldPosBefore.x - worldPosAfter.x);
    this.targetY += (worldPosBefore.y - worldPosAfter.y);
    this.x = this.targetX;
    this.y = this.targetY;
  }

  update() {
    // Follow target entity if attached
    if (this.followTarget && !this.isDragging) {
      this.targetX = this.followTarget.x;
      this.targetY = this.followTarget.y;
    }

    // Smooth Lerp Camera Position
    this.x += (this.targetX - this.x) * this.lerpSpeed;
    this.y += (this.targetY - this.y) * this.lerpSpeed;

    // Smooth Lerp Zoom
    this.zoom += (this.targetZoom - this.zoom) * this.lerpSpeed;

    // Clamp to world bounds
    const halfVW = (this.viewportWidth / 2) / this.zoom;
    const halfVH = (this.viewportHeight / 2) / this.zoom;

    this.x = Math.max(halfVW, Math.min(this.worldWidth - halfVW, this.x));
    this.y = Math.max(halfVH, Math.min(this.worldHeight - halfVH, this.y));
  }

  apply(ctx) {
    ctx.save();
    // Center viewport
    ctx.translate(this.viewportWidth / 2, this.viewportHeight / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }

  restore(ctx) {
    ctx.restore();
  }

  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.viewportWidth / 2) / this.zoom + this.x,
      y: (screenY - this.viewportHeight / 2) / this.zoom + this.y
    };
  }

  worldToScreen(worldX, worldY) {
    return {
      x: (worldX - this.x) * this.zoom + this.viewportWidth / 2,
      y: (worldY - this.y) * this.zoom + this.viewportHeight / 2
    };
  }

  getVisibleBounds() {
    const halfVW = (this.viewportWidth / 2) / this.zoom;
    const halfVH = (this.viewportHeight / 2) / this.zoom;
    return {
      minX: this.x - halfVW - 100,
      maxX: this.x + halfVW + 100,
      minY: this.y - halfVH - 100,
      maxY: this.y + halfVH + 100
    };
  }
}

if (typeof window !== 'undefined') {
  window.Camera2D = Camera2D;
}
