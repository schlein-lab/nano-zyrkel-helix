// ── BAM Viewer — Canvas-based read rendering engine ──────────────
// Renders pre-processed read regions (JSON) as an interactive pileup view.
// Used in Learn steps 2/3/7 and the Explore BAM sandbox.

export class BamViewer {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.region = null;
    this.reads = [];
    this.reference = '';
    this.variants = [];
    this.coverage = [];
    this.layoutRows = [];

    // Options
    this.showQuality = opts.showQuality || false;
    this.showStrand = opts.showStrand || false;
    this.highlightVariants = opts.highlightVariants !== false;
    this.isLongRead = opts.isLongRead || false;

    // Colors
    this.colors = {
      refBg: '#0a0e17',
      readFwd: '#1e3a5f',
      readRev: '#3a1e5f',
      readDefault: '#1e3a5f',
      match: '#94a3b8',
      mismatchA: '#ef4444',
      mismatchT: '#22d3ee',
      mismatchG: '#10b981',
      mismatchC: '#f59e0b',
      insertion: '#a855f7',
      deletion: '#ef4444',
      softClip: '#475569',
      coverageBar: '#06b6d4',
      coverageHigh: '#10b981',
      coverageLow: '#ef4444',
      variantHighlight: 'rgba(239, 68, 68, 0.3)',
    };

    this.baseColors = { A: '#ef4444', T: '#22d3ee', G: '#10b981', C: '#f59e0b' };

    // Interaction
    this.hoveredRead = null;
    this.selectedRead = null;
    this.onVariantClick = null;
    this.onReadHover = null;

    this._bindEvents();
  }

  _bindEvents() {
    this.canvas.addEventListener('mousemove', e => this._onMouseMove(e));
    this.canvas.addEventListener('click', e => this._onClick(e));
  }

  // ── Load region data ──────────────────────────────────────────

  loadRegion(data) {
    this.region = data.region || '';
    this.reference = data.reference || '';
    this.reads = data.reads || [];
    this.variants = data.variants || [];
    this.coverage = data.coverage || this._computeCoverage();
    this.layoutRows = this._layoutReads();
    this.render();
  }

  _computeCoverage() {
    const len = this.reference.length || 500;
    const cov = new Array(len).fill(0);
    for (const r of this.reads) {
      const readLen = r.seq ? r.seq.length : (r.length || 150);
      for (let i = r.start; i < Math.min(r.start + readLen, len); i++) {
        cov[i]++;
      }
    }
    return cov;
  }

  _layoutReads() {
    // Pileup layout: assign each read to a row so they don't overlap
    const sorted = [...this.reads].sort((a, b) => a.start - b.start);
    const rows = [];
    for (const read of sorted) {
      const readEnd = read.start + (read.seq ? read.seq.length : (read.length || 150));
      let placed = false;
      for (let r = 0; r < rows.length; r++) {
        if (rows[r] <= read.start) {
          rows[r] = readEnd + 1;
          read._row = r;
          placed = true;
          break;
        }
      }
      if (!placed) {
        read._row = rows.length;
        rows.push(readEnd + 1);
      }
    }
    return rows;
  }

  // ── Rendering ─────────────────────────────────────────────────

  render() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const refLen = this.reference.length || 500;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = this.colors.refBg;
    ctx.fillRect(0, 0, W, H);

    const bpWidth = W / refLen;
    const rowHeight = Math.min(12, Math.max(4, H / (this.layoutRows.length + 2)));
    const readGap = 1;

    // Highlight variant columns
    if (this.highlightVariants) {
      for (const v of this.variants) {
        const vStart = v.pos;
        const vEnd = v.end || (v.pos + (v.ref ? v.ref.length : 1));
        ctx.fillStyle = this.colors.variantHighlight;
        ctx.fillRect(vStart * bpWidth, 0, (vEnd - vStart) * bpWidth, H);
      }
    }

    // Draw reads
    for (const read of this.reads) {
      const row = read._row || 0;
      const x = read.start * bpWidth;
      const y = row * (rowHeight + readGap);
      const readLen = read.seq ? read.seq.length : (read.length || 150);
      const w = readLen * bpWidth;

      if (y + rowHeight > H) continue;

      // Read background
      let bgColor = this.colors.readDefault;
      if (this.showStrand) {
        bgColor = read.strand === '-' ? this.colors.readRev : this.colors.readFwd;
      }
      if (this.hoveredRead === read) {
        bgColor = '#2d4a6f';
      }

      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, w, rowHeight - readGap);

      // Draw bases if zoomed in enough
      if (bpWidth >= 4 && read.seq) {
        for (let i = 0; i < read.seq.length; i++) {
          const base = read.seq[i];
          const refBase = this.reference[read.start + i];
          const bx = (read.start + i) * bpWidth;

          if (refBase && base !== refBase) {
            // Mismatch — colored base
            ctx.fillStyle = this.baseColors[base] || '#fff';
            ctx.fillRect(bx, y, bpWidth, rowHeight - readGap);

            if (bpWidth >= 6) {
              ctx.fillStyle = '#000';
              ctx.font = `${Math.min(9, bpWidth)}px monospace`;
              ctx.textAlign = 'center';
              ctx.fillText(base, bx + bpWidth / 2, y + rowHeight - 2);
            }
          } else if (bpWidth >= 6) {
            // Match — show base letter at high zoom
            ctx.fillStyle = this.colors.match;
            ctx.font = `${Math.min(8, bpWidth - 1)}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(base, bx + bpWidth / 2, y + rowHeight - 2);
          }

          // Quality shading
          if (this.showQuality && read.qual && read.qual[i] !== undefined) {
            const q = read.qual[i];
            if (q < 20) {
              ctx.fillStyle = `rgba(239, 68, 68, ${0.3 * (1 - q / 20)})`;
              ctx.fillRect(bx, y, bpWidth, rowHeight - readGap);
            }
          }
        }
      } else if (!read.seq && read.length) {
        // Long read without base-level sequence — just show a bar
        ctx.fillStyle = bgColor;
        ctx.fillRect(x, y, w, rowHeight - readGap);

        // Mark breakpoint if present
        if (read.breakpoint_at !== undefined) {
          const bpx = read.breakpoint_at * bpWidth;
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(bpx - 1, y, 3, rowHeight - readGap);
        }
      }

      // Strand direction arrow
      if (this.showStrand && bpWidth >= 2) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        const arrowX = read.strand === '+' ? x + w - 4 : x;
        ctx.beginPath();
        if (read.strand === '+') {
          ctx.moveTo(arrowX, y + 1);
          ctx.lineTo(arrowX + 4, y + rowHeight / 2);
          ctx.lineTo(arrowX, y + rowHeight - readGap - 1);
        } else {
          ctx.moveTo(arrowX + 4, y + 1);
          ctx.lineTo(arrowX, y + rowHeight / 2);
          ctx.lineTo(arrowX + 4, y + rowHeight - readGap - 1);
        }
        ctx.fill();
      }
    }

    // Variant annotations at bottom
    for (const v of this.variants) {
      const vx = v.pos * bpWidth;
      ctx.fillStyle = '#ef4444';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      const label = v.type === 'SNV' ? `${v.ref}→${v.alt}` :
                    v.type === 'DEL' ? `DEL ${v.size || ''}bp` :
                    v.type === 'DUP' ? `DUP ${v.size || ''}bp` :
                    v.type || '';
      ctx.fillText(label, vx + 4, H - 2);
    }
  }

  // ── Coverage bar rendering ────────────────────────────────────

  renderCoverage(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cov = this.coverage;
    if (!cov.length) return;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, W, H);

    const maxCov = Math.max(...cov, 1);
    const binWidth = W / cov.length;

    for (let i = 0; i < cov.length; i++) {
      const h = (cov[i] / maxCov) * (H - 4);
      const x = i * binWidth;
      const y = H - 2 - h;

      // Color by coverage level
      if (cov[i] === 0) {
        ctx.fillStyle = this.colors.coverageLow;
      } else if (cov[i] > maxCov * 1.5) {
        ctx.fillStyle = this.colors.coverageHigh;
      } else {
        ctx.fillStyle = this.colors.coverageBar;
      }
      ctx.fillRect(x, y, Math.max(binWidth - 0.5, 0.5), h);
    }

    // Labels
    ctx.fillStyle = '#475569';
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`max: ${maxCov}x`, 2, 9);
  }

  // ── Split view rendering (Short vs Long Read) ─────────────────

  static renderSplitView(shortCanvas, longCanvas, shortData, longData) {
    const shortViewer = new BamViewer(shortCanvas, { showStrand: true });
    shortViewer.loadRegion(shortData);

    const longViewer = new BamViewer(longCanvas, { showStrand: true, isLongRead: true });
    longViewer.loadRegion(longData);

    return { shortViewer, longViewer };
  }

  // ── Interaction ───────────────────────────────────────────────

  _getReadAt(x, y) {
    const refLen = this.reference.length || 500;
    const bpWidth = this.canvas.width / refLen;
    const rowHeight = Math.min(12, Math.max(4, this.canvas.height / (this.layoutRows.length + 2)));

    for (const read of this.reads) {
      const rx = read.start * bpWidth;
      const ry = (read._row || 0) * (rowHeight + 1);
      const rw = (read.seq ? read.seq.length : (read.length || 150)) * bpWidth;
      if (x >= rx && x <= rx + rw && y >= ry && y <= ry + rowHeight) {
        return read;
      }
    }
    return null;
  }

  _onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const sy = (e.clientY - rect.top) * (this.canvas.height / rect.height);
    const read = this._getReadAt(sx, sy);
    if (read !== this.hoveredRead) {
      this.hoveredRead = read;
      this.render();
      if (this.onReadHover) this.onReadHover(read);
    }
  }

  _onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const sy = (e.clientY - rect.top) * (this.canvas.height / rect.height);
    const read = this._getReadAt(sx, sy);
    if (read) {
      this.selectedRead = read;
      this.render();
    }

    // Check if clicking on a variant position
    const refLen = this.reference.length || 500;
    const bpPos = Math.floor(sx / (this.canvas.width / refLen));
    for (const v of this.variants) {
      const vEnd = v.end || (v.pos + 1);
      if (bpPos >= v.pos && bpPos < vEnd) {
        if (this.onVariantClick) this.onVariantClick(v);
        break;
      }
    }
  }

  // ── Reference track rendering ─────────────────────────────────

  renderReference(el) {
    if (!el || !this.reference) return;
    let html = '';
    for (let i = 0; i < this.reference.length; i++) {
      const base = this.reference[i];
      const isVariant = this.variants.some(v => i >= v.pos && i < (v.end || v.pos + 1));
      const cls = isVariant ? ' class="ref-var"' : '';
      html += `<span${cls} style="color:${this.baseColors[base] || '#94a3b8'}">${base}</span>`;
    }
    el.innerHTML = html;
  }

  // ── Variant info panel ────────────────────────────────────────

  renderVariantInfo(el) {
    if (!el || !this.variants.length) {
      if (el) el.innerHTML = '';
      return;
    }

    let html = '';
    for (const v of this.variants) {
      const tag = v.type === 'artifact' ? 'Artifact' :
                  v.type === 'SNV' ? `${v.zygosity.toUpperCase()} SNV` :
                  v.type === 'DEL' ? `${v.zygosity.toUpperCase()} DEL` :
                  v.type === 'DUP' ? `${v.zygosity.toUpperCase()} DUP` : v.type;

      html += `<span class="var-tag">${tag}</span>`;
      if (v.gene) html += `<strong>${v.gene}</strong> `;
      if (v.hgvs_c) html += `${v.hgvs_c} `;
      if (v.hgvs_p) html += `(${v.hgvs_p}) `;
      if (v.disease) html += `<br><small style="color:var(--text-dim)">${v.disease}</small>`;
      if (v.note) html += `<br><small style="color:var(--warning)">${v.note}</small>`;
    }
    el.innerHTML = html;
  }

  // ── Utility ───────────────────────────────────────────────────

  setOption(key, value) {
    this[key] = value;
    this.render();
  }

  destroy() {
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('click', this._onClick);
  }
}

// ── Read demo for Step 1 (DNA → Reads visualization) ────────────

export function renderReadDemo(canvas, readLength, coverage) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0a0e17';
  ctx.fillRect(0, 0, W, H);

  const regionLen = 500; // bp
  const bpWidth = W / regionLen;
  const numReads = Math.round((coverage * regionLen) / readLength);
  const rowHeight = Math.max(3, Math.min(10, H / (numReads * 0.4)));

  // Generate pseudo-random read positions
  const reads = [];
  const seed = 42;
  for (let i = 0; i < numReads; i++) {
    const start = Math.floor(pseudoRandom(seed + i) * (regionLen - readLength));
    reads.push({ start, length: readLength, row: 0 });
  }

  // Layout
  reads.sort((a, b) => a.start - b.start);
  const rows = [];
  for (const r of reads) {
    const end = r.start + r.length;
    let placed = false;
    for (let row = 0; row < rows.length; row++) {
      if (rows[row] <= r.start) {
        rows[row] = end + 1;
        r.row = row;
        placed = true;
        break;
      }
    }
    if (!placed) {
      r.row = rows.length;
      rows.push(end + 1);
    }
  }

  // Color based on technology
  const isLong = readLength > 500;
  const readColor = isLong ? '#3a2e5f' : '#1e3a5f';
  const readBorder = isLong ? '#6d4daa' : '#2d5a8f';

  // Draw reads
  for (const r of reads) {
    const x = r.start * bpWidth;
    const y = r.row * (rowHeight + 1);
    const w = r.length * bpWidth;
    if (y + rowHeight > H) continue;

    ctx.fillStyle = readColor;
    ctx.fillRect(x, y, w, rowHeight - 1);
    ctx.strokeStyle = readBorder;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, y, w, rowHeight - 1);
  }

  // Coverage summary at bottom
  const covArr = new Array(regionLen).fill(0);
  for (const r of reads) {
    for (let i = r.start; i < r.start + r.length && i < regionLen; i++) {
      covArr[i]++;
    }
  }
  const avgCov = covArr.reduce((a, b) => a + b, 0) / regionLen;

  ctx.fillStyle = '#475569';
  ctx.font = '10px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${numReads} reads, avg ${avgCov.toFixed(0)}x`, W - 4, H - 4);
}

function pseudoRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
