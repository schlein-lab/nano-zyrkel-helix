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
      variantHighlight: 'rgba(255, 80, 80, 0.45)',
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

    // Determine read row height based on mode
    let rowHeight, readGap;
    if (this.isLongRead) {
      // Long reads: thin horizontal lines
      rowHeight = 3;
      readGap = 1;
    } else {
      rowHeight = Math.min(10, Math.max(5, H / (this.layoutRows.length + 4)));
      readGap = 1;
    }

    // ── Variant column highlight (prominent) ──
    if (this.highlightVariants) {
      for (const v of this.variants) {
        const vStart = v.pos;
        const vEnd = v.end || (v.pos + (v.ref ? v.ref.length : 1));
        const highlightW = Math.max((vEnd - vStart) * bpWidth, 4);
        const highlightX = vStart * bpWidth - (highlightW - (vEnd - vStart) * bpWidth) / 2;

        // Bright wide column
        ctx.fillStyle = 'rgba(255, 80, 80, 0.25)';
        ctx.fillRect(highlightX - 2, 0, highlightW + 4, H);
        ctx.fillStyle = this.colors.variantHighlight;
        ctx.fillRect(highlightX, 0, highlightW, H);

        // Bright border lines
        ctx.strokeStyle = 'rgba(255, 80, 80, 0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(highlightX, 0);
        ctx.lineTo(highlightX, H);
        ctx.moveTo(highlightX + highlightW, 0);
        ctx.lineTo(highlightX + highlightW, H);
        ctx.stroke();
      }
    }

    // ── Draw reads ──
    for (const read of this.reads) {
      const row = read._row || 0;
      const x = read.start * bpWidth;
      const y = row * (rowHeight + readGap);
      const readLen = read.seq ? read.seq.length : (read.length || 150);
      const w = readLen * bpWidth;

      if (y + rowHeight > H) continue;

      // Read background color
      let bgColor = this.colors.readDefault;
      if (this.showStrand) {
        bgColor = read.strand === '-' ? this.colors.readRev : this.colors.readFwd;
      }
      if (this.hoveredRead === read) {
        bgColor = '#2d4a6f';
      }

      // Artifact warning: if the read is flagged or part of an artifact variant
      const isArtifactRead = read.isArtifact || read.strandBias;
      if (isArtifactRead) {
        bgColor = '#4a2020'; // dark red-ish background for artifact reads
      }

      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, w, rowHeight - readGap);

      // Artifact border
      if (isArtifactRead) {
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, w, rowHeight - readGap);
      }

      // ── Mismatches: ALWAYS visible regardless of zoom ──
      if (read.seq) {
        for (let i = 0; i < read.seq.length; i++) {
          const base = read.seq[i];
          const refBase = this.reference[read.start + i];
          const bx = (read.start + i) * bpWidth;

          if (refBase && base !== refBase) {
            const color = this.baseColors[base] || '#fff';

            if (bpWidth >= 4) {
              // Zoomed in: fill full base width, show letter
              ctx.fillStyle = color;
              ctx.fillRect(bx, y, bpWidth, rowHeight - readGap);
              if (bpWidth >= 6) {
                ctx.fillStyle = '#000';
                ctx.font = `${Math.min(9, bpWidth)}px monospace`;
                ctx.textAlign = 'center';
                ctx.fillText(base, bx + bpWidth / 2, y + rowHeight - 2);
              }
            } else {
              // Zoomed out: draw a colored dot/rectangle that is always visible
              const dotW = Math.max(2, bpWidth);
              const dotH = rowHeight - readGap;
              ctx.fillStyle = color;
              ctx.fillRect(bx, y, dotW, dotH);
            }

            // Quality shading for mismatches
            if (this.showQuality && read.qual && read.qual[i] !== undefined) {
              const q = read.qual[i];
              if (q < 20) {
                ctx.fillStyle = `rgba(239, 68, 68, ${0.3 * (1 - q / 20)})`;
                ctx.fillRect(bx, y, Math.max(bpWidth, 2), rowHeight - readGap);
              }
            }
          } else if (bpWidth >= 6) {
            // Match at high zoom: show base letter
            ctx.fillStyle = this.colors.match;
            ctx.font = `${Math.min(8, bpWidth - 1)}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(base, bx + bpWidth / 2, y + rowHeight - 2);
          }
        }
      }

      // Long read without base-level sequence: mark breakpoints
      if (!read.seq && read.length) {
        if (read.breakpoint_at !== undefined) {
          const bpx = read.breakpoint_at * bpWidth;
          ctx.fillStyle = '#ff2020';
          ctx.fillRect(bpx - 1, y, 3, rowHeight - readGap);
          // Red tick above the read
          ctx.fillRect(bpx - 1, Math.max(0, y - 2), 3, 2);
        }
      }

      // Strand direction arrow (only if reads are tall enough)
      if (this.showStrand && rowHeight >= 5 && bpWidth >= 2) {
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

    // ── Allele fraction annotation next to variant column ──
    for (const v of this.variants) {
      const vx = v.pos * bpWidth;

      // Count supporting reads
      let totalReads = 0;
      let altReads = 0;
      for (const read of this.reads) {
        const readLen = read.seq ? read.seq.length : (read.length || 150);
        if (read.start <= v.pos && read.start + readLen > v.pos) {
          totalReads++;
          if (read.seq) {
            const idx = v.pos - read.start;
            if (idx >= 0 && idx < read.seq.length && v.alt && read.seq[idx] === v.alt[0]) {
              altReads++;
            }
          } else if (read.supportsAlt) {
            altReads++;
          }
        }
      }

      // Use provided counts if available
      const aReads = v.altReads !== undefined ? v.altReads : altReads;
      const tReads = v.totalReads !== undefined ? v.totalReads : totalReads;
      const af = tReads > 0 ? (aReads / tReads) : 0;
      const afPct = (af * 100).toFixed(0);

      // Determine interpretation
      let interp = '';
      if (v.type === 'artifact' || af < 0.15) {
        interp = 'artifact?';
      } else if (af >= 0.35 && af <= 0.65) {
        interp = 'het';
      } else if (af >= 0.85) {
        interp = 'hom';
      } else {
        interp = af < 0.35 ? 'low-freq?' : 'het?';
      }

      // Draw allele fraction label
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      const label1 = `${aReads}/${tReads} = ${afPct}%`;
      const label2 = interp;

      // Background for readability
      const labelX = vx + 6;
      const labelY = 14;
      const metrics1 = ctx.measureText(label1);
      const metrics2 = ctx.measureText(label2);
      const boxW = Math.max(metrics1.width, metrics2.width) + 6;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(labelX - 3, 2, boxW, 24);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(label1, labelX, labelY);
      ctx.fillStyle = v.type === 'artifact' || af < 0.15 ? '#ff6b6b' : af >= 0.85 ? '#10b981' : '#f59e0b';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(label2, labelX, labelY + 11);
      ctx.restore();

      // Variant type label at bottom
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      const typeLabel = v.type === 'SNV' ? `${v.ref || ''}>${v.alt || ''}` :
                        v.type === 'DEL' ? `DEL ${v.size || ''}bp` :
                        v.type === 'DUP' ? `DUP ${v.size || ''}bp` :
                        v.type || '';
      ctx.fillText(typeLabel, vx + 4, H - 2);
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
    const avgCov = cov.reduce((a, b) => a + b, 0) / cov.length;
    const minCov = Math.min(...cov);

    // Y-axis label area
    const yAxisW = 35;
    const plotW = W - yAxisW;
    const plotH = H - 14; // leave room for bottom label
    const plotTop = 2;

    const binWidth = plotW / cov.length;

    // Grid lines and y-axis labels
    const yTicks = _niceYTicks(maxCov, 4);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.5;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    for (const tick of yTicks) {
      const yPos = plotTop + plotH - (tick / maxCov) * plotH;
      ctx.beginPath();
      ctx.moveTo(yAxisW, yPos);
      ctx.lineTo(W, yPos);
      ctx.stroke();
      ctx.fillText(`${tick}x`, yAxisW - 3, yPos + 3);
    }

    // Average line
    const avgY = plotTop + plotH - (avgCov / maxCov) * plotH;
    ctx.strokeStyle = 'rgba(255, 200, 50, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(yAxisW, avgY);
    ctx.lineTo(W, avgY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffc832';
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`avg ${avgCov.toFixed(0)}x`, yAxisW + 2, avgY - 3);

    // Draw coverage bars
    for (let i = 0; i < cov.length; i++) {
      const h = (cov[i] / maxCov) * plotH;
      const x = yAxisW + i * binWidth;
      const y = plotTop + plotH - h;

      // Color by coverage level relative to average
      if (cov[i] === 0) {
        ctx.fillStyle = '#ef4444';
      } else if (cov[i] < avgCov * 0.3) {
        ctx.fillStyle = '#f97316'; // low coverage warning
      } else if (cov[i] > avgCov * 2.0) {
        ctx.fillStyle = '#10b981'; // high coverage
      } else {
        ctx.fillStyle = '#06b6d4';
      }
      ctx.fillRect(x, y, Math.max(binWidth - 0.3, 0.5), h);
    }

    // Bottom stats label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`min: ${minCov}x  avg: ${avgCov.toFixed(0)}x  max: ${maxCov}x`, W / 2, H - 2);
  }

  // ── Split view rendering (Short vs Long Read) ─────────────────

  static renderSplitView(shortCanvas, longCanvas, shortData, longData) {
    const shortViewer = new BamViewer(shortCanvas, { showStrand: true });
    shortViewer.loadRegion(shortData);

    const longViewer = new BamViewer(longCanvas, { showStrand: true, isLongRead: true });
    longViewer.loadRegion(longData);

    return { shortViewer, longViewer };
  }

  /**
   * Generate synthetic split-view data for a region with a variant/SV.
   * Returns { shortData, longData } ready for renderSplitView.
   */
  static generateSplitViewData(regionLen, variant) {
    const regionStart = variant.pos - Math.floor(regionLen / 2);

    // Generate reference
    const bases = 'ACGT';
    let ref = '';
    for (let i = 0; i < regionLen; i++) {
      ref += bases[Math.floor(pseudoRandom(i + 7) * 4)];
    }

    // ── Short reads (Illumina): many 150bp fragments ──
    const shortReads = [];
    const shortCoverage = 30;
    const shortReadLen = 150;
    const numShort = Math.round((shortCoverage * regionLen) / shortReadLen);
    for (let i = 0; i < numShort; i++) {
      const start = Math.floor(pseudoRandom(i * 3 + 11) * (regionLen - shortReadLen));
      const strand = pseudoRandom(i * 7 + 3) > 0.5 ? '+' : '-';

      // Generate sequence with possible mismatch at variant pos
      let seq = '';
      for (let j = 0; j < shortReadLen; j++) {
        const refIdx = start + j;
        if (refIdx >= 0 && refIdx < regionLen) {
          const globalPos = regionStart + refIdx;
          if (variant && globalPos === variant.pos && pseudoRandom(i + 99) < 0.5) {
            seq += variant.alt ? variant.alt[0] : ref[refIdx];
          } else {
            seq += ref[refIdx] || 'N';
          }
        } else {
          seq += 'N';
        }
      }

      shortReads.push({ start, seq, strand, length: shortReadLen });
    }

    // ── Long reads (PacBio HiFi): few reads spanning full region ──
    const longReads = [];
    const longReadCount = 8;
    for (let i = 0; i < longReadCount; i++) {
      const readLen = Math.floor(regionLen * 0.7 + pseudoRandom(i + 55) * regionLen * 0.5);
      const maxStart = Math.max(0, regionLen - readLen);
      const start = Math.floor(pseudoRandom(i * 5 + 22) * maxStart);
      const strand = pseudoRandom(i * 11 + 1) > 0.5 ? '+' : '-';
      const bpRel = variant ? variant.pos - regionStart : undefined;

      longReads.push({
        start,
        length: Math.min(readLen, regionLen - start),
        strand,
        breakpoint_at: (bpRel !== undefined && bpRel >= start && bpRel < start + readLen) ? bpRel : undefined,
      });
    }

    return {
      shortData: {
        region: `synth:${regionStart}-${regionStart + regionLen}`,
        reference: ref,
        reads: shortReads,
        variants: variant ? [{ ...variant, pos: variant.pos - regionStart }] : [],
      },
      longData: {
        region: `synth:${regionStart}-${regionStart + regionLen}`,
        reference: ref,
        reads: longReads,
        variants: variant ? [{ ...variant, pos: variant.pos - regionStart }] : [],
      },
    };
  }

  // ── Interaction ───────────────────────────────────────────────

  _getReadAt(x, y) {
    const refLen = this.reference.length || 500;
    const bpWidth = this.canvas.width / refLen;
    let rowHeight;
    if (this.isLongRead) {
      rowHeight = 3;
    } else {
      rowHeight = Math.min(10, Math.max(5, this.canvas.height / (this.layoutRows.length + 4)));
    }

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

  // ── Variant info panel (rich teaching context) ────────────────

  renderVariantInfo(el) {
    if (!el || !this.variants.length) {
      if (el) el.innerHTML = '';
      return;
    }

    const explanations = {
      SNV: {
        het: `<strong>Heterozygous SNV</strong> — One copy of the gene has the variant, the other has the reference allele.
              In the BAM viewer, roughly ~50% of reads at this position show the alternate base.
              This is the most common genotype for pathogenic variants in autosomal dominant disorders.`,
        hom: `<strong>Homozygous SNV</strong> — Both copies carry the variant (nearly 100% of reads show the alt base).
              Common in autosomal recessive disorders or in consanguineous families.
              In the viewer, almost all reads at this position will show the same non-reference base.`,
        artifact: `<strong>Sequencing Artifact</strong> — A false-positive variant call. Only a small fraction of reads (&lt;15%)
              show the alternate allele, and they often cluster on one strand direction.
              Key clue: check strand bias (all supporting reads are forward OR reverse, not both).
              These are filtered out during variant calling QC.`,
      },
      DEL: {
        het: `<strong>Heterozygous Deletion</strong> — One chromosome has a segment missing. In short reads,
              you'll see split reads (clipped at breakpoints) and a coverage drop in the deleted region.
              Long reads will span the entire deletion with a clear breakpoint signature.`,
        hom: `<strong>Homozygous Deletion</strong> — Both chromosomes have the segment missing.
              Coverage drops to zero in the deleted region. All spanning reads show the deletion.`,
      },
      DUP: {
        het: `<strong>Heterozygous Duplication</strong> — One chromosome has an extra copy of a segment.
              Coverage increases (~1.5x in the duplicated region). Long reads may show tandem
              arrangement with breakpoints at duplication boundaries.`,
        hom: `<strong>Homozygous Duplication</strong> — Both chromosomes have extra copies.
              Coverage approximately doubles (~2x) in the duplicated region.`,
      },
      INV: {
        het: `<strong>Heterozygous Inversion</strong> — A segment is flipped in orientation on one chromosome.
              Split reads show discordant alignment directions at the breakpoints.
              Long reads can span the full inversion, showing both breakpoints.`,
      },
      BND: {
        het: `<strong>Translocation/Breakend</strong> — DNA from two different chromosomal regions is joined.
              Reads at the breakpoint align partially to two different genomic locations.
              Long reads are especially valuable for resolving complex translocations.`,
      },
    };

    let html = '';
    for (const v of this.variants) {
      const zyg = v.zygosity || 'het';
      const vtype = v.type === 'artifact' ? 'SNV' : (v.type || 'SNV');
      const zygKey = v.type === 'artifact' ? 'artifact' : zyg;

      // Tag badge
      const tagColor = v.type === 'artifact' ? '#ef4444' :
                       zyg === 'hom' ? '#10b981' : '#f59e0b';
      const tagText = v.type === 'artifact' ? 'ARTIFACT' :
                      `${zyg.toUpperCase()} ${vtype}`;

      html += `<div style="margin-bottom:12px;padding:8px;border-left:3px solid ${tagColor};background:rgba(255,255,255,0.03);border-radius:4px">`;
      html += `<span style="display:inline-block;padding:2px 8px;border-radius:3px;background:${tagColor};color:#000;font-weight:bold;font-size:11px;margin-bottom:4px">${tagText}</span> `;

      if (v.gene) html += `<strong style="color:#e2e8f0">${v.gene}</strong> `;
      if (v.hgvs_c) html += `<code style="color:#94a3b8;font-size:12px">${v.hgvs_c}</code> `;
      if (v.hgvs_p) html += `<span style="color:#f59e0b">(${v.hgvs_p})</span> `;

      // Allele fraction if available
      if (v.altReads !== undefined && v.totalReads !== undefined) {
        const af = (v.altReads / v.totalReads * 100).toFixed(0);
        html += `<br><span style="color:#94a3b8;font-size:11px">Allele fraction: ${v.altReads}/${v.totalReads} = ${af}%</span> `;
      }

      if (v.disease) {
        html += `<br><span style="color:#f59e0b;font-size:12px">Associated: ${v.disease}</span>`;
      }
      if (v.note) {
        html += `<br><span style="color:#ff6b6b;font-size:12px">${v.note}</span>`;
      }

      // Teaching explanation
      const explGroup = explanations[vtype] || {};
      const expl = explGroup[zygKey] || explGroup['het'] || '';
      if (expl) {
        html += `<div style="margin-top:6px;padding:6px 8px;background:rgba(6,182,212,0.08);border-radius:3px;font-size:11px;color:#94a3b8;line-height:1.5">${expl}</div>`;
      }

      html += `</div>`;
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

// ── Read demo for Step 1 (DNA -> Reads visualization) ────────────

export function renderReadDemo(canvas, readLength, coverage) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0a0e17';
  ctx.fillRect(0, 0, W, H);

  // Fixed 500bp region, always the same genomic window
  const regionLen = 500;
  const bpWidth = W / regionLen;

  // Number of reads is derived from coverage: coverage = (numReads * readLength) / regionLen
  const numReads = Math.max(1, Math.round((coverage * regionLen) / readLength));

  // Fixed read height of ~5px
  const readH = 5;
  const readGap = 1;

  // Reserve bottom 20% for coverage histogram
  const covHistH = Math.floor(H * 0.20);
  const readsAreaH = H - covHistH - 16; // 16px for bottom stats text

  // Generate pseudo-random read positions
  const reads = [];
  for (let i = 0; i < numReads; i++) {
    const maxStart = Math.max(0, regionLen - readLength);
    const start = Math.floor(pseudoRandom(42 + i) * maxStart);
    reads.push({ start, length: readLength, row: 0 });
  }

  // Pileup layout
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

  // Color based on read length (technology)
  const isLong = readLength > 500;
  const readColor = isLong ? '#3a2e5f' : '#1e3a5f';
  const readBorder = isLong ? '#6d4daa' : '#2d5a8f';

  // Draw reads (scroll if too many rows, but cap visible rows)
  const maxVisibleRows = Math.floor(readsAreaH / (readH + readGap));
  for (const r of reads) {
    if (r.row >= maxVisibleRows) continue;
    const x = r.start * bpWidth;
    const y = r.row * (readH + readGap);
    const w = r.length * bpWidth;

    ctx.fillStyle = readColor;
    ctx.fillRect(x, y, w, readH);
    ctx.strokeStyle = readBorder;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, y, w, readH);
  }

  // ── Coverage histogram at the bottom ──
  const covArr = new Array(regionLen).fill(0);
  for (const r of reads) {
    for (let i = r.start; i < r.start + r.length && i < regionLen; i++) {
      covArr[i]++;
    }
  }
  const maxCov = Math.max(...covArr, 1);
  const avgCov = covArr.reduce((a, b) => a + b, 0) / regionLen;

  const histTop = H - covHistH - 12;
  const histH = covHistH;

  // Histogram background
  ctx.fillStyle = 'rgba(6, 182, 212, 0.05)';
  ctx.fillRect(0, histTop, W, histH);

  // Separator line
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, histTop);
  ctx.lineTo(W, histTop);
  ctx.stroke();

  // Draw coverage bars (bin into pixels for performance)
  const binSize = Math.max(1, Math.floor(regionLen / W));
  for (let px = 0; px < W; px++) {
    const bpStart = Math.floor((px / W) * regionLen);
    const bpEnd = Math.min(Math.floor(((px + 1) / W) * regionLen), regionLen);
    let sum = 0;
    let count = 0;
    for (let j = bpStart; j < bpEnd; j++) {
      sum += covArr[j];
      count++;
    }
    const covVal = count > 0 ? sum / count : 0;
    const barH = (covVal / maxCov) * (histH - 2);

    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(px, histTop + histH - barH, 1, barH);
  }

  // Coverage Y-axis labels
  ctx.fillStyle = '#94a3b8';
  ctx.font = '8px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`${maxCov}x`, 2, histTop + 8);
  ctx.fillText('0x', 2, histTop + histH - 1);

  // Bottom stats
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${numReads} reads | ${readLength}bp each | avg ${avgCov.toFixed(1)}x coverage`, W - 4, H - 2);

  // Technology label
  ctx.textAlign = 'left';
  ctx.fillStyle = isLong ? '#6d4daa' : '#2d5a8f';
  ctx.font = 'bold 10px monospace';
  ctx.fillText(isLong ? 'PacBio HiFi / ONT' : 'Illumina short-read', 4, H - 2);
}

function pseudoRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ── Helper: compute nice Y-axis tick values ─────────────────────

function _niceYTicks(maxVal, targetCount) {
  if (maxVal <= 0) return [0];
  const rough = maxVal / targetCount;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const residual = rough / mag;
  let niceStep;
  if (residual <= 1.5) niceStep = mag;
  else if (residual <= 3.5) niceStep = 2 * mag;
  else if (residual <= 7.5) niceStep = 5 * mag;
  else niceStep = 10 * mag;

  const ticks = [];
  for (let v = 0; v <= maxVal; v += niceStep) {
    ticks.push(Math.round(v));
  }
  if (ticks[ticks.length - 1] < maxVal) {
    ticks.push(Math.round(maxVal));
  }
  return ticks;
}
