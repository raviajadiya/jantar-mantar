// Road Network Engine: Graph, Dijkstra Pathfinding & Road Boundary Verification
class RoadNetwork {
  constructor(config) {
    this.config = config;
    this.center = config.circularLayout.center;
    this.rings = config.circularLayout.rings;
    this.radials = config.circularLayout.radialAvenues;
    this.roadWidth = config.world.roadWidth || 90;
    this.halfRoadWidth = this.roadWidth / 2;

    this.nodes = [];
    this.edges = new Map(); // nodeId -> [neighborNodeId, ...]

    this.buildGraph();
  }

  buildGraph() {
    this.nodes = [];
    this.edges.clear();
    let nodeIdCounter = 0;

    // Center Node (Ring 0 Center)
    const centerNode = {
      id: nodeIdCounter++,
      x: this.center.x,
      y: this.center.y,
      ringIndex: 0,
      radialIndex: -1,
      angle: 0,
      radius: 0,
      isCenter: true
    };
    this.nodes.push(centerNode);
    this.edges.set(centerNode.id, []);

    // For each ring, create nodes at intersections and along arcs
    const ringNodeMap = []; // [ringIdx][radialIdx] -> main intersection node

    this.rings.forEach((ring, rIdx) => {
      ringNodeMap[rIdx] = [];
      const numRadials = this.radials.length;
      const subSegmentsPerSector = 4; // Sub-nodes between radials for smooth circular movement

      this.radials.forEach((radial, radIdx) => {
        const angle = radial.angle;
        const x = this.center.x + Math.cos(angle) * ring.radius;
        const y = this.center.y + Math.sin(angle) * ring.radius;

        const node = {
          id: nodeIdCounter++,
          x,
          y,
          ringIndex: rIdx,
          radialIndex: radIdx,
          angle,
          radius: ring.radius,
          isIntersection: true
        };
        this.nodes.push(node);
        this.edges.set(node.id, []);
        ringNodeMap[rIdx][radIdx] = node;
      });

      // Connect nodes around the ring with intermediate sub-nodes
      for (let radIdx = 0; radIdx < numRadials; radIdx++) {
        const nextRadIdx = (radIdx + 1) % numRadials;
        const startNode = ringNodeMap[rIdx][radIdx];
        const endNode = ringNodeMap[rIdx][nextRadIdx];

        let startA = this.radials[radIdx].angle;
        let endA = this.radials[nextRadIdx].angle;
        if (endA <= startA) endA += Math.PI * 2;

        let prevNode = startNode;
        for (let s = 1; s < subSegmentsPerSector; s++) {
          const t = s / subSegmentsPerSector;
          const arcAngle = startA + t * (endA - startA);
          const subX = this.center.x + Math.cos(arcAngle) * ring.radius;
          const subY = this.center.y + Math.sin(arcAngle) * ring.radius;

          const subNode = {
            id: nodeIdCounter++,
            x: subX,
            y: subY,
            ringIndex: rIdx,
            radialIndex: -1,
            angle: arcAngle,
            radius: ring.radius,
            isArcSubNode: true
          };
          this.nodes.push(subNode);
          this.edges.set(subNode.id, []);

          this.connect(prevNode.id, subNode.id);
          prevNode = subNode;
        }
        this.connect(prevNode.id, endNode.id);
      }
    });

    // Connect radial spokes from Ring 0 to Ring 4
    this.radials.forEach((radial, radIdx) => {
      // Connect center node to Ring 0 intersection
      const ring0Node = ringNodeMap[0][radIdx];
      this.connect(centerNode.id, ring0Node.id);

      // Connect outwards from ring 0 to ring 4
      for (let rIdx = 0; rIdx < this.rings.length - 1; rIdx++) {
        const innerNode = ringNodeMap[rIdx][radIdx];
        const outerNode = ringNodeMap[rIdx + 1][radIdx];

        const innerR = this.rings[rIdx].radius;
        const outerR = this.rings[rIdx + 1].radius;
        const angle = radial.angle;

        const midR1 = innerR + (outerR - innerR) * 0.33;
        const midR2 = innerR + (outerR - innerR) * 0.66;

        const midNode1 = {
          id: nodeIdCounter++,
          x: this.center.x + Math.cos(angle) * midR1,
          y: this.center.y + Math.sin(angle) * midR1,
          ringIndex: -1,
          radialIndex: radIdx,
          angle,
          radius: midR1
        };
        const midNode2 = {
          id: nodeIdCounter++,
          x: this.center.x + Math.cos(angle) * midR2,
          y: this.center.y + Math.sin(angle) * midR2,
          ringIndex: -1,
          radialIndex: radIdx,
          angle,
          radius: midR2
        };

        this.nodes.push(midNode1, midNode2);
        this.edges.set(midNode1.id, []);
        this.edges.set(midNode2.id, []);

        this.connect(innerNode.id, midNode1.id);
        this.connect(midNode1.id, midNode2.id);
        this.connect(midNode2.id, outerNode.id);
      }
    });
  }

  connect(idA, idB) {
    if (!this.edges.has(idA)) this.edges.set(idA, []);
    if (!this.edges.has(idB)) this.edges.set(idB, []);

    if (!this.edges.get(idA).includes(idB)) this.edges.get(idA).push(idB);
    if (!this.edges.get(idB).includes(idA)) this.edges.get(idB).push(idA);
  }

  // Check if coordinates (x, y) are on a valid road corridor or central plaza
  isPointOnRoad(x, y, padding = 25) {
    const dx = x - this.center.x;
    const dy = y - this.center.y;
    const distToCenter = Math.hypot(dx, dy);

    // 1. Center Jantar Mantar Plaza is walkable
    if (distToCenter <= this.rings[0].radius + this.halfRoadWidth + padding) {
      return true;
    }

    // 2. Beyond outermost ring is off-bounds
    if (distToCenter > this.rings[this.rings.length - 1].radius + this.halfRoadWidth + padding) {
      return false;
    }

    // 3. Proximity to any circular ring
    for (const ring of this.rings) {
      if (Math.abs(distToCenter - ring.radius) <= this.halfRoadWidth + padding) {
        return true;
      }
    }

    // 4. Proximity to any radial avenue spoke
    let angle = Math.atan2(dy, dx);
    for (const radial of this.radials) {
      let diff = Math.abs(angle - radial.angle);
      while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);

      const arcDist = diff * distToCenter;
      if (arcDist <= this.halfRoadWidth + padding) {
        return true;
      }
    }

    return false;
  }

  // Find closest node in road graph
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
    const node = this.findClosestNode(x, y);
    if (!node) return { x: this.center.x, y: this.center.y };
    return { x: node.x, y: node.y, nodeId: node.id };
  }

  // Ultra-Fast, Bulletproof Dijkstra Pathfinding (Guaranteed Termination, No Infinite Loops)
  findPath(startX, startY, targetX, targetY) {
    const startNode = this.findClosestNode(startX, startY);
    const targetNode = this.findClosestNode(targetX, targetY);

    if (!startNode || !targetNode) return [{ x: targetX, y: targetY }];
    if (startNode.id === targetNode.id) return [{ x: targetX, y: targetY }];

    const dist = new Map();
    const parent = new Map();
    const unvisited = new Set();

    for (let i = 0; i < this.nodes.length; i++) {
      dist.set(this.nodes[i].id, Infinity);
      unvisited.add(this.nodes[i].id);
    }
    dist.set(startNode.id, 0);

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let currentId = null;
      let minD = Infinity;
      for (const id of unvisited) {
        const d = dist.get(id);
        if (d < minD) {
          minD = d;
          currentId = id;
        }
      }

      // Reached destination or remaining nodes unreachable
      if (currentId === null || currentId === targetNode.id || minD === Infinity) {
        break;
      }

      unvisited.delete(currentId);
      const currNode = this.nodes[currentId];
      const neighbors = this.edges.get(currentId) || [];

      for (let i = 0; i < neighbors.length; i++) {
        const neighborId = neighbors[i];
        if (!unvisited.has(neighborId)) continue;

        const neighborNode = this.nodes[neighborId];
        const stepDist = Math.hypot(currNode.x - neighborNode.x, currNode.y - neighborNode.y);
        const alt = minD + stepDist;

        if (alt < dist.get(neighborId)) {
          dist.set(neighborId, alt);
          parent.set(neighborId, currentId);
        }
      }
    }

    // Reconstruct path
    if (!parent.has(targetNode.id) && startNode.id !== targetNode.id) {
      return [{ x: targetNode.x, y: targetNode.y }];
    }

    const path = [{ x: targetX, y: targetY }];
    let curr = targetNode.id;
    while (curr !== undefined) {
      const n = this.nodes[curr];
      path.unshift({ x: n.x, y: n.y, id: n.id });
      curr = parent.get(curr);
    }

    return path;
  }

  // Line of sight check between two road points
  hasRoadLineOfSight(x1, y1, x2, y2) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(4, Math.floor(dist / 35));

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const testX = x1 + (x2 - x1) * t;
      const testY = y1 + (y2 - y1) * t;
      if (!this.isPointOnRoad(testX, testY, -10)) {
        return false;
      }
    }
    return true;
  }
}

if (typeof window !== 'undefined') {
  window.RoadNetwork = RoadNetwork;
}
