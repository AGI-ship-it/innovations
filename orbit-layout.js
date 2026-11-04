/* Pure geometry shared by the scene and its layout checks. No DOM or data access. */
(function (root) {
  'use strict';

  function positions(items, layout, seconds, previous = null, elapsed = 0) {
    const { x, y, width, height, top, rings, centre } = layout;
    const nodes = items.map((item, index) => {
      const ring = rings[item.ring];
      let angle = item.angle + seconds * Math.PI * 2 / ring.period;
      let radius = 1;
      if (previous) {
        const dx = (previous[index].x - x) / ring.rx;
        const dy = (previous[index].y - y) / ring.ry;
        angle = Math.atan2(dy, dx) + elapsed * Math.PI * 2 / ring.period;
        // Preserve each planet's continuous path after label separation. A slow
        // radial correction returns it to its track without snapping positions.
        radius = 1 + (Math.hypot(dx, dy) - 1) * Math.exp(-elapsed * .04);
      }
      return {
        x: x + Math.cos(angle) * ring.rx * radius,
        y: y + Math.sin(angle) * ring.ry * radius,
        width: item.width,
        height: item.height,
      };
    });
    const constrain = node => {
      node.x = Math.max(node.width / 2 + 12, Math.min(width - node.width / 2 - 12, node.x));
      node.y = Math.max(top + node.height / 2, Math.min(height - node.height / 2 - 24, node.y));
    };
    if (previous) {
      const current = previous.map(node => ({ ...node }));
      const centreObstacle = {
        x, y: y + (centre.offsetY || 0), width: centre.width, height: centre.height,
      };
      // Sweep short horizontal/vertical steps against existing labels. Unlike
      // re-solving every frame, this cannot swap neighbouring cards or snap them
      // to opposite sides of a collision. Ease towards a neighbouring label
      // before reaching its safety margin, rather than stopping at a hard edge.
      for (let index = 0; index < current.length; index++) {
        const currentNode = current[index], target = nodes[index];
        constrain(target);
        const obstacles = current.filter((_, other) => other !== index).concat(centreObstacle);
        for (const axis of ['x', 'y']) {
          const cross = axis === 'x' ? 'y' : 'x';
          const size = axis === 'x' ? 'width' : 'height';
          const crossSize = axis === 'x' ? 'height' : 'width';
          let movement = Math.max(-100 * elapsed, Math.min(100 * elapsed, target[axis] - currentNode[axis]));
          for (const obstacle of obstacles) {
            if (Math.abs(currentNode[cross] - obstacle[cross]) >=
              (currentNode[crossSize] + obstacle[crossSize]) / 2 + 6) continue;
            const separation = (currentNode[size] + obstacle[size]) / 2 + 6;
            const approach = 1 - Math.exp(-elapsed * 2.5);
            if (movement > 0 && currentNode[axis] < obstacle[axis]) {
              movement = Math.min(movement, Math.max(0, obstacle[axis] - separation - currentNode[axis]) * approach);
            } else if (movement < 0 && currentNode[axis] > obstacle[axis]) {
              movement = Math.max(movement, Math.min(0, obstacle[axis] + separation - currentNode[axis]) * approach);
            }
          }
          currentNode[axis] += movement;
        }
      }
      return current;
    }
    // Place long titles first and find the closest clear point to each orbital
    // target. A golden-angle search avoids rows while guaranteeing separation.
    const placed = [];
    const centreObstacle = { x, y: y + (centre.offsetY || 0), width: centre.width, height: centre.height };
    const available = candidate => {
      if (candidate.x - candidate.width / 2 < 12 || candidate.x + candidate.width / 2 > width - 12
        || candidate.y - candidate.height / 2 < top || candidate.y + candidate.height / 2 > height - 24) return false;
      return placed.concat(centreObstacle).every(other =>
        Math.abs(candidate.x - other.x) >= (candidate.width + other.width) / 2 + 12
        || Math.abs(candidate.y - other.y) >= (candidate.height + other.height) / 2 + 12);
    };
    [...nodes].sort((a, b) => b.height - a.height).forEach(node => {
      const target = { ...node };
      let found = false;
      for (let attempt = 0; attempt < 20000; attempt++) {
        const distance = 8 * Math.sqrt(attempt);
        const angle = attempt * 2.399963229728653;
        node.x = target.x + Math.cos(angle) * distance;
        node.y = target.y + Math.sin(angle) * distance;
        if (available(node)) { found = true; break; }
      }
      // Very narrow screens can need more vertical travel than the local search.
      if (!found) {
        let best = null, bestDistance = Infinity;
        for (let cy = top + node.height / 2; cy <= height - node.height / 2 - 24; cy += 12) {
          for (let cx = node.width / 2 + 12; cx <= width - node.width / 2 - 12; cx += 12) {
            const candidate = { ...node, x: cx, y: cy };
            if (!available(candidate)) continue;
            const distance = Math.hypot(cx - target.x, cy - target.y);
            if (distance < bestDistance) { best = candidate; bestDistance = distance; }
          }
        }
        if (best) { node.x = best.x; node.y = best.y; found = true; }
      }
      if (!found) throw new Error('Orbital field has insufficient room for the measured labels.');
      placed.push(node);
    });
    return nodes;
  }

  const api = { positions };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AtlasOrbits = api;
})(typeof window === 'object' ? window : globalThis);
