// ── Simplified World Map SVG paths ──────────────────────────────
// Rough continent outlines for the evolution migration visualization.
// Not geographically precise — optimized for visual clarity at small widget size.

const WORLD_W = 500, WORLD_H = 280;

// Simplified continent paths (SVG path d)
const CONTINENTS = [
  // Africa
  { d: 'M230,120 L245,110 L260,115 L270,120 L275,135 L280,155 L275,175 L265,190 L250,200 L240,195 L230,185 L225,170 L220,150 L222,135 Z', fill: '#1a2332' },
  // Europe
  { d: 'M240,65 L250,60 L265,55 L280,58 L285,65 L280,75 L270,85 L260,90 L250,95 L240,90 L235,80 L238,70 Z', fill: '#1a2332' },
  // Asia
  { d: 'M285,55 L310,45 L340,40 L370,45 L395,55 L405,65 L400,80 L390,90 L380,95 L360,100 L340,95 L320,100 L300,95 L285,90 L280,75 L285,65 Z', fill: '#1a2332' },
  // South Asia / India
  { d: 'M320,100 L335,105 L340,120 L335,135 L325,130 L315,120 L315,110 Z', fill: '#1a2332' },
  // Southeast Asia
  { d: 'M360,100 L375,105 L385,115 L380,130 L370,125 L360,115 Z', fill: '#1a2332' },
  // Australia
  { d: 'M370,180 L395,170 L415,175 L420,190 L410,205 L390,210 L375,200 L370,190 Z', fill: '#1a2332' },
  // North America
  { d: 'M40,40 L80,30 L120,35 L140,50 L145,70 L135,85 L120,95 L105,100 L85,95 L65,90 L50,80 L40,65 L35,50 Z', fill: '#1a2332' },
  // Central America
  { d: 'M85,100 L100,105 L105,115 L100,125 L90,120 L85,110 Z', fill: '#1a2332' },
  // South America
  { d: 'M100,130 L115,125 L130,135 L135,155 L130,175 L120,195 L110,210 L100,215 L90,205 L85,185 L88,165 L90,145 Z', fill: '#1a2332' },
];

// Out-of-Africa migration route nodes (approximate positions on our map)
// Geographic population nodes — these represent geographic regions
// where human populations have lived, NOT discrete "races".
// Human genetic variation is clinal (gradual) and does not cluster
// into discrete groups. These nodes are a simplification for modeling.
const OOA_NODES = [
  { id: 'africa',      x: 250, y: 155, label: 'E. Africa',     pop: 'AFR' },
  { id: 'mideast',     x: 285, y: 100, label: 'W. Asia',       pop: null },
  { id: 'europe',      x: 255, y: 72,  label: 'Europe',        pop: 'EUR' },
  { id: 'central_asia',x: 325, y: 70,  label: 'C. Asia',       pop: null },
  { id: 'south_asia',  x: 325, y: 115, label: 'S. Asia',       pop: 'SAS' },
  { id: 'east_asia',   x: 380, y: 70,  label: 'E. Asia',       pop: 'EAS' },
  { id: 'se_asia',     x: 375, y: 115, label: 'SE. Asia',      pop: null },
  { id: 'australia',   x: 395, y: 190, label: 'Oceania',       pop: null },
  { id: 'siberia',     x: 370, y: 45,  label: 'N. Asia',       pop: null },
  { id: 'americas',    x: 90,  y: 80,  label: 'Americas',      pop: 'AMR' },
];

// Migration edges (bidirectional gene flow paths)
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

  const showEdges = options.showEdges !== false;
  const animate = options.animate || false;
  const migrationRate = options.migrationRate || 0;
  const title = options.title || '';

  let html = '';

  // Background ocean
  html += `<rect x="0" y="0" width="${WORLD_W}" height="${WORLD_H}" fill="#0a0e17" rx="6"/>`;

  // Continents
  CONTINENTS.forEach(c => {
    html += `<path d="${c.d}" fill="${c.fill}" stroke="#1e293b" stroke-width="0.5"/>`;
  });

  // Migration edges
  if (showEdges) {
    OOA_EDGES.forEach(([fromId, toId]) => {
      const from = OOA_NODES.find(n => n.id === fromId);
      const to = OOA_NODES.find(n => n.id === toId);
      if (!from || !to) return;

      const fFrom = populationFreqs[fromId] || 0;
      const fTo = populationFreqs[toId] || 0;
      const flow = Math.abs(fFrom - fTo);
      const opacity = migrationRate > 0 ? Math.min(0.8, 0.1 + flow * 3 + migrationRate * 5) : 0.15;
      const width = migrationRate > 0 ? Math.min(3, 0.5 + flow * 5 + migrationRate * 10) : 0.5;

      html += `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#06b6d4" stroke-width="${width}" opacity="${opacity}"/>`;

      // Animated particles along edge (if there's flow)
      if (animate && flow > 0.01 && migrationRate > 0) {
        const dx = to.x - from.x, dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const numParticles = Math.min(3, Math.ceil(flow * 10));
        for (let i = 0; i < numParticles; i++) {
          const offset = (i / numParticles);
          html += `<circle r="1.5" fill="#06b6d4" opacity="0.8">
            <animateMotion dur="${2 + i}s" repeatCount="indefinite" begin="${offset * 2}s"
              path="M${from.x},${from.y} L${to.x},${to.y}" />
          </circle>`;
        }
      }
    });
  }

  // Population nodes
  OOA_NODES.forEach(node => {
    const freq = populationFreqs[node.id] || 0;
    const radius = 4 + freq * 12; // bigger = higher frequency

    // Color: green(0%) → cyan → yellow → red(100%)
    const r = Math.round(Math.min(255, freq * 3 * 255));
    const g = Math.round(Math.max(50, 180 - freq * 2 * 130));
    const b = Math.round(Math.max(50, 212 - freq * 2 * 160));
    const color = `rgb(${r},${g},${b})`;

    // Glow effect
    if (freq > 0.01) {
      html += `<circle cx="${node.x}" cy="${node.y}" r="${radius + 4}" fill="${color}" opacity="0.15"/>`;
    }
    html += `<circle cx="${node.x}" cy="${node.y}" r="${radius}" fill="${color}" opacity="0.8" stroke="#0a0e17" stroke-width="1"/>`;

    // Frequency label
    if (freq > 0.001) {
      html += `<text x="${node.x}" y="${node.y + radius + 10}" fill="#94a3b8" font-size="7" text-anchor="middle">${(freq * 100).toFixed(1)}%</text>`;
    }

    // Node label
    html += `<text x="${node.x}" y="${node.y - radius - 3}" fill="#475569" font-size="6.5" text-anchor="middle">${node.label}</text>`;
  });

  // Title
  if (title) {
    html += `<text x="${WORLD_W / 2}" y="14" fill="#94a3b8" font-size="9" text-anchor="middle" font-weight="600">${title}</text>`;
  }

  svg.innerHTML = html;
}

// Convert simulation array data to node-keyed frequencies
function simToNodeFreqs(migData, genIndex) {
  const freqs = {};
  // Map simulation populations to OOA nodes
  // Sim pop 0 = africa (origin), then spreading outward
  const nodeOrder = ['africa', 'mideast', 'europe', 'central_asia', 'south_asia', 'east_asia', 'se_asia', 'australia', 'siberia', 'americas'];
  nodeOrder.forEach((nodeId, i) => {
    if (migData[i]) {
      const idx = Math.min(genIndex, migData[i].length - 1);
      freqs[nodeId] = migData[i][idx];
    } else {
      freqs[nodeId] = 0;
    }
  });
  return freqs;
}
