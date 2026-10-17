// Road Network Engine: 100% Interconnected Graph & Strict Way-to-Way Road Constraints
class RoadNetwork {
  constructor(config) {
    this.config = config;
    this.center = config.circularLayout.center || { x: 1800, y: 1800 };
    this.roadWidth = config.world.roadWidth || 85;
    this.halfRoadWidth = this.roadWidth / 2;

    this.nodes = [];
    this.edges = new Map();
    this.segments = []; // All road segments: lines & arcs for collision & drawing
    this.nodeIdCounter = 0;
    this.currentMapId = 'jantar';

    this.buildGraphForMap('jantar');
  }

  // Build the complete graph for the Jantar Mantar layout
  buildGraphForMap() {
    this.currentMapId = 'jantar';
    this.nodes = [];
    this.edges.clear();
    this.segments = [];
    this.nodeIdCounter = 0;
    this.buildJantarMantarNetwork();
  }

  // ========================================================
  // MAP 1: Jantar Mantar (5 Concentric Rings & 8 Radial Spokes)
  // Radial roads start strictly at Ring 0 (radius 240); center is monument sanctuary
  // ========================================================
  buildJantarMantarNetwork() {
    const cx = this.center.x;
    const cy = this.center.y;
    const rings = [240, 480, 760, 1080, 1400];
    const radials = [
      -Math.PI / 2, -Math.PI / 4, 0, Math.PI / 4,
      Math.PI / 2, (3 * Math.PI) / 4, Math.PI, -(3 * Math.PI) / 4
    ];
    const numRadials = radials.length;

    // 1. Register Segments: 5 Circular Ring Roads
    rings.forEach(r => {
      this.segments.push({ type: 'arc', cx, cy, radius: r, startAngle: 0, endAngle: Math.PI * 2, width: 90 });
    });

    // 8 Radial Avenues from Ring 0 (240) to Ring 4 (1400)
    // NEVER cut through the central monument (radius < 240)
    radials.forEach(a => {
      this.segments.push({
        type: 'line',
        x1: cx + Math.cos(a) * rings[0],
        y1: cy + Math.sin(a) * rings[0],
        x2: cx + Math.cos(a) * (rings[rings.length - 1] + 30),
        y2: cy + Math.sin(a) * (rings[rings.length - 1] + 30),
        width: 90
      });
    });

    // 2. Exact Intersection Nodes Matrix: [ringIdx][radIdx]
    const matrix = [];
    for (let r = 0; r < rings.length; r++) {
      matrix[r] = [];
      for (let a = 0; a < numRadials; a++) {
        const angle = radials[a];
        const node = this.createNode(cx + Math.cos(angle) * rings[r], cy + Math.sin(angle) * rings[r]);
        node.ringIndex = r;
        node.radialIndex = a;
        node.isIntersection = true;
        matrix[r][a] = node;
      }
    }

    // 3. Connect radially between rings (from Ring 0 outwards to Ring 4)
    for (let a = 0; a < numRadials; a++) {
      for (let r = 0; r < rings.length - 1; r++) {
        const n1 = matrix[r][a];
        const n2 = matrix[r + 1][a];
        const mid1 = this.createNode(n1.x + (n2.x - n1.x) * 0.33, n1.y + (n2.y - n1.y) * 0.33);
        const mid2 = this.createNode(n1.x + (n2.x - n1.x) * 0.67, n1.y + (n2.y - n1.y) * 0.67);
        this.connect(n1.id, mid1.id);
        this.connect(mid1.id, mid2.id);
        this.connect(mid2.id, n2.id);
      }
    }

    // 4. Connect circularly along each ring
    // Fine arc divisions keep chords strictly within the asphalt corridor (sagitta < 3px)
    const arcDivisions = [3, 4, 6, 8, 11];
    for (let r = 0; r < rings.length; r++) {
      const radius = rings[r];
      const div = arcDivisions[r] || 4;
      for (let a = 0; a < numRadials; a++) {
        const nextA = (a + 1) % numRadials;
        const startNode = matrix[r][a];
        const endNode = matrix[r][nextA];

        let startAngle = radials[a];
        let endAngle = radials[nextA];
        if (endAngle <= startAngle) endAngle += Math.PI * 2;

        let prev = startNode;
        for (let s = 1; s < div; s++) {
          const t = s / div;
          const arcAngle = startAngle + t * (endAngle - startAngle);
          const subNode = this.createNode(cx + Math.cos(arcAngle) * radius, cy + Math.sin(arcAngle) * radius);
          subNode.ringIndex = r;
          this.connect(prev.id, subNode.id);
          prev = subNode;
        }
        this.connect(prev.id, endNode.id);
      }
    }
  }

  // Get all nodes located on the outermost (last) ring (radius 1400)
  getOuterRingNodes() {
    return this.nodes.filter(n => n.ringIndex === 4);
  }

  // Get the 8 main spoke intersection nodes on the outermost (last) ring
  getOuterRingSpokeNodes() {
    return this.nodes.filter(n => n.ringIndex === 4 && n.isIntersection);
  }



  // ========================================================
  // ROAD GRAPH UTILITIES & AUTOMATIC INTERSECTION SNAPPING
  // ========================================================

  addHighway(x1, y1, x2, y2, stepDist = 70) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(1, Math.round(dist / stepDist));

    let prevNode = this.getOrCreateNode(x1, y1);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const nx = x1 + (x2 - x1) * t;
      const ny = y1 + (y2 - y1) * t;
      const currNode = this.getOrCreateNode(nx, ny);
      this.connect(prevNode.id, currNode.id);
      prevNode = currNode;
    }
  }

  createNode(x, y, isCenter = false) {
    const newNode = {
      id: this.nodeIdCounter++,
      x,
      y,
      isCenter
    };
    this.nodes.push(newNode);
    this.edges.set(newNode.id, []);
    return newNode;
  }

  getOrCreateNode(x, y, isCenter = false, threshold = 22) {
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      if (Math.hypot(n.x - x, n.y - y) <= threshold) {
        return n;
      }
    }
    return this.createNode(x, y, isCenter);
  }

  connect(idA, idB) {
    if (idA === idB) return;
    if (!this.edges.has(idA)) this.edges.set(idA, []);
    if (!this.edges.has(idB)) this.edges.set(idB, []);

    const listA = this.edges.get(idA);
    const listB = this.edges.get(idB);

    if (!listA.includes(idB)) listA.push(idB);
    if (!listB.includes(idA)) listB.push(idA);
  }

  // ========================================================
  // PRECISE POINT-ON-ROAD COLLISION DETECTION
  // Strictly checks actual road corridors; no middle shortcuts
  // ========================================================

  distToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  isPointOnRoad(x, y, padding = 15) {
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i];
      const halfW = (seg.width / 2) + padding;

      if (seg.type === 'line') {
        const d = this.distToSegment(x, y, seg.x1, seg.y1, seg.x2, seg.y2);
        if (d <= halfW) return true;
      } else if (seg.type === 'arc') {
        const dToC = Math.hypot(x - seg.cx, y - seg.cy);
        if (Math.abs(dToC - seg.radius) <= halfW) {
          if (Math.abs(seg.endAngle - seg.startAngle) >= Math.PI * 1.95) return true;
          let a = Math.atan2(y - seg.cy, x - seg.cx);
          if (a < 0) a += Math.PI * 2;
          let s = seg.startAngle % (Math.PI * 2);
          if (s < 0) s += Math.PI * 2;
          let e = seg.endAngle % (Math.PI * 2);
          if (e < 0) e += Math.PI * 2;
          if (s <= e) {
            if (a >= s - 0.05 && a <= e + 0.05) return true;
          } else {
            if (a >= s - 0.05 || a <= e + 0.05) return true;
          }
        }
      }
    }
    return false;
  }

  // Find the exact closest coordinate ON A ROAD to any arbitrary point (px, py)
  // Guarantees snapping to road corridor for any clicked location
  findClosestPointOnRoad(px, py) {
    let bestDist = Infinity;
    let bestPoint = { x: px, y: py };

    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i];
      if (seg.type === 'line') {
        const dx = seg.x2 - seg.x1;
        const dy = seg.y2 - seg.y1;
        const lenSq = dx * dx + dy * dy;
        let t = lenSq === 0 ? 0 : ((px - seg.x1) * dx + (py - seg.y1) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        const projX = seg.x1 + t * dx;
        const projY = seg.y1 + t * dy;
        const dist = Math.hypot(px - projX, py - projY);
        if (dist < bestDist) {
          bestDist = dist;
          bestPoint = { x: projX, y: projY };
        }
      } else if (seg.type === 'arc') {
        let a = Math.atan2(py - seg.cy, px - seg.cx);
        const projX = seg.cx + Math.cos(a) * seg.radius;
        const projY = seg.cy + Math.sin(a) * seg.radius;
        const dist = Math.hypot(px - projX, py - projY);
        if (dist < bestDist) {
          bestDist = dist;
          bestPoint = { x: projX, y: projY };
        }
      }
    }
    return bestPoint;
  }

  findClosestNode(x, y) {
    let closest = null;
    let minDist = Infinity;

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      const d = Math.hypot(node.x - x, node.y - y);
      if (d < minDist) {
        minDist = d;
        closest = node;
      }
    }
    return closest;
  }

  findClosestRoadPoint(x, y) {
    return this.findClosestPointOnRoad(x, y);
  }

  // Line of sight check between two road points (ensures full line remains on road pavement)
  hasRoadLineOfSight(x1, y1, x2, y2) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    if (dist < 8) return true;
    if (dist > 350) return false;
    const steps = Math.max(6, Math.ceil(dist / 22));

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const testX = x1 + (x2 - x1) * t;
      const testY = y1 + (y2 - y1) * t;
      if (!this.isPointOnRoad(testX, testY, -6)) {
        return false;
      }
    }
    return true;
  }

  // ========================================================
  // ULTRA-FAST DIJKSTRA PATHFINDING STRICTLY ALONG ROADS
  // Guarantees strictly way-to-way navigation without cutting across buildings
  // ========================================================
  findPath(startX, startY, targetX, targetY) {
    // 1. If direct road line-of-sight exists along the same straight street
    if (this.hasRoadLineOfSight(startX, startY, targetX, targetY)) {
      return [{ x: targetX, y: targetY }];
    }

    const startNode = this.findClosestNode(startX, startY);
    const targetNode = this.findClosestNode(targetX, targetY);

    if (!startNode || !targetNode) return [];

    // 2. Same junction/intersection area: step through junction node to avoid cutting corners
    if (startNode.id === targetNode.id) {
      const res = [];
      if (Math.hypot(startX - startNode.x, startY - startNode.y) > 12) {
        res.push({ x: startNode.x, y: startNode.y });
      }
      res.push({ x: targetX, y: targetY });
      return res;
    }

    // 3. Dijkstra shortest path through interconnected road graph
    const dist = new Map();
    const parent = new Map();
    const unvisited = new Set();

    for (let i = 0; i < this.nodes.length; i++) {
      dist.set(this.nodes[i].id, Infinity);
      unvisited.add(this.nodes[i].id);
    }
    dist.set(startNode.id, 0);

    while (unvisited.size > 0) {
      let currentId = null;
      let minD = Infinity;
      for (const id of unvisited) {
        const d = dist.get(id);
        if (d < minD) {
          minD = d;
          currentId = id;
        }
      }

      if (currentId === null || minD === Infinity) break;
      if (currentId === targetNode.id) break;

      unvisited.delete(currentId);
      const currNode = this.nodes[currentId];
      const neighbors = this.edges.get(currentId) || [];

      for (let i = 0; i < neighbors.length; i++) {
        const nId = neighbors[i];
        if (!unvisited.has(nId)) continue;

        const neighborNode = this.nodes[nId];
        const stepDist = Math.hypot(neighborNode.x - currNode.x, neighborNode.y - currNode.y);
        const alt = minD + stepDist;

        if (alt < dist.get(nId)) {
          dist.set(nId, alt);
          parent.set(nId, currentId);
        }
      }
    }

    // Unreachable: return empty (NEVER cut through buildings)
    if (!parent.has(targetNode.id)) {
      return [];
    }

    // Reconstruct path of nodes
    const nodePath = [];
    let curr = targetNode.id;
    while (curr !== undefined) {
      const n = this.nodes[curr];
      nodePath.unshift({ x: n.x, y: n.y, id: n.id });
      curr = parent.get(curr);
    }

    const fullPath = [];

    // Avoid backtracking if player already has road line-of-sight to second node
    let startIndex = 0;
    if (nodePath.length > 1 && this.hasRoadLineOfSight(startX, startY, nodePath[1].x, nodePath[1].y)) {
      startIndex = 1;
    }

    for (let i = startIndex; i < nodePath.length; i++) {
      fullPath.push({ x: nodePath[i].x, y: nodePath[i].y });
    }

    // Append final road point
    if (Math.hypot(targetX - targetNode.x, targetY - targetNode.y) > 8) {
      fullPath.push({ x: targetX, y: targetY });
    }

    return fullPath;
  }
}

if (typeof window !== 'undefined') {
  window.RoadNetwork = RoadNetwork;
}
