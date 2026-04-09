// ── World Map for Evolution Migration ────────────────────────────
// Uses simplified Natural Earth land outlines (public domain).
// Equirectangular projection, 500x280 viewbox.

const WORLD_W = 500, WORLD_H = 280;

// Geographic population nodes — these represent geographic regions
// where human populations have lived, NOT discrete "races".
// Human genetic variation is clinal (gradual) and does not cluster
// into discrete groups. These nodes are a simplification for modeling.
const OOA_NODES = [
  { id: 'africa',       x: 270, y: 165, label: 'E. Africa' },
  { id: 'mideast',      x: 295, y: 120, label: 'W. Asia' },
  { id: 'europe',       x: 260, y: 85,  label: 'Europe' },
  { id: 'central_asia', x: 335, y: 90,  label: 'C. Asia' },
  { id: 'south_asia',   x: 340, y: 130, label: 'S. Asia' },
  { id: 'east_asia',    x: 395, y: 95,  label: 'E. Asia' },
  { id: 'se_asia',      x: 385, y: 140, label: 'SE Asia' },
  { id: 'australia',    x: 415, y: 210, label: 'Oceania' },
  { id: 'siberia',      x: 380, y: 55,  label: 'N. Asia' },
  { id: 'americas',     x: 100, y: 110, label: 'Americas' },
];

// Migration edges (stepping-stone gene flow)
const OOA_EDGES = [
  ['africa', 'mideast'],
  ['mideast', 'europe'],
  ['mideast', 'central_asia'],
  ['mideast', 'south_asia'],
  ['central_asia', 'south_asia'],
  ['central_asia', 'east_asia'],
  ['east_asia', 'se_asia'],
  ['se_asia', 'australia'],
  ['east_asia', 'siberia'],
  ['siberia', 'americas'],
  ['central_asia', 'europe'],
];

function renderWorldMap(svgId, populationFreqs, options = {}) {
  const svg = document.getElementById(svgId);
  if (!svg) return;

  const migrationRate = options.migrationRate || 0;
  const title = options.title || '';

  let html = '';

  // Ocean background
  html += `<rect x="0" y="0" width="${WORLD_W}" height="${WORLD_H}" fill="#080c14" rx="6"/>`;

  // Land masses
  if (typeof LAND_PATHS !== 'undefined') {
    for (const d of LAND_PATHS) {
      html += `<path d="${d}" fill="#14202e" stroke="#1e293b" stroke-width="0.3"/>`;
    }
  }

  // Migration edges with flow intensity
  OOA_EDGES.forEach(([fromId, toId]) => {
    const from = OOA_NODES.find(n => n.id === fromId);
    const to = OOA_NODES.find(n => n.id === toId);
    if (!from || !to) return;

    const fFrom = populationFreqs[fromId] || 0;
    const fTo = populationFreqs[toId] || 0;
    const flow = Math.abs(fFrom - fTo);
    const hasFlow = fFrom > 0.001 || fTo > 0.001;

    // Base line (always visible, dim)
    html += `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#1e3a5f" stroke-width="0.5" opacity="0.4"/>`;

    // Active flow line
    if (hasFlow && migrationRate > 0) {
      const width = Math.min(4, 0.5 + flow * 8);
      const opacity = Math.min(0.7, 0.1 + flow * 2);
      html += `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#06b6d4" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round"/>`;

      // Animated particles along edge
      if (flow > 0.005) {
        const nPart = Math.min(4, Math.ceil(flow * 15));
        for (let i = 0; i < nPart; i++) {
          // Direction: higher→lower frequency
          const [sx, sy, ex, ey] = fFrom > fTo ? [from.x, from.y, to.x, to.y] : [to.x, to.y, from.x, from.y];
          html += `<circle r="${1 + flow * 3}" fill="#06b6d4" opacity="${0.5 + flow}">
            <animateMotion dur="${1.5 + i * 0.7}s" repeatCount="indefinite" begin="${i * 0.4}s"
              path="M${sx},${sy} L${ex},${ey}" />
          </circle>`;
        }
      }
    }
  });

  // Population nodes
  OOA_NODES.forEach(node => {
    const freq = populationFreqs[node.id] || 0;
    const baseR = 5;
    const r = baseR + freq * 14;

    // Color interpolation: #1e293b (0%) → #06b6d4 (low) → #f59e0b (mid) → #ef4444 (high)
    let color;
    if (freq < 0.001) {
      color = '#334155';
    } else if (freq < 0.3) {
      const t = freq / 0.3;
      color = lerpColor('#0e7490', '#06b6d4', t);
    } else if (freq < 0.7) {
      const t = (freq - 0.3) / 0.4;
      color = lerpColor('#06b6d4', '#f59e0b', t);
    } else {
      const t = (freq - 0.7) / 0.3;
      color = lerpColor('#f59e0b', '#ef4444', Math.min(t, 1));
    }

    // Glow
    if (freq > 0.01) {
      html += `<circle cx="${node.x}" cy="${node.y}" r="${r + 6}" fill="${color}" opacity="0.12"/>`;
      html += `<circle cx="${node.x}" cy="${node.y}" r="${r + 3}" fill="${color}" opacity="0.08"/>`;
    }

    // Main dot
    html += `<circle cx="${node.x}" cy="${node.y}" r="${r}" fill="${color}" opacity="0.85" stroke="#080c14" stroke-width="1.5"/>`;

    // Frequency text inside or below
    if (freq > 0.005) {
      html += `<text x="${node.x}" y="${node.y + 3}" fill="#fff" font-size="7" text-anchor="middle" font-weight="700" font-family="monospace">${(freq * 100).toFixed(0)}%</text>`;
    }

    // Label above
    html += `<text x="${node.x}" y="${node.y - r - 4}" fill="#64748b" font-size="6.5" text-anchor="middle">${node.label}</text>`;
  });

  // Title
  if (title) {
    html += `<text x="8" y="14" fill="#94a3b8" font-size="9" font-weight="600">${title}</text>`;
  }

  svg.innerHTML = html;
}

// Convert simulation array to node-keyed frequencies
function simToNodeFreqs(migData, genIndex) {
  const freqs = {};
  const nodeOrder = ['africa', 'mideast', 'europe', 'central_asia', 'south_asia', 'east_asia', 'se_asia', 'australia', 'siberia', 'americas'];
  nodeOrder.forEach((nodeId, i) => {
    if (migData[i]) {
      const idx = Math.min(genIndex, migData[i].length - 1);
      freqs[nodeId] = migData[i][idx];
    }
  });
  return freqs;
}

// Color interpolation helper
function lerpColor(c1, c2, t) {
  const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t), g = Math.round(g1 + (g2 - g1) * t), b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}
