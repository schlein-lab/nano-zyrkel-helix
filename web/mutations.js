// ── Mutations Lab ────────────────────────────────────────────────
// Three modes: Learn (guided tour), Explore (real ClinVar/gnomAD), Quiz.

import init, {
  predict_mutation as wasmPredictMutation,
  predict_indel_effect as wasmPredictIndel,
  compare_protein_effect as wasmCompareProteins,
  predict_nmd_risk as wasmPredictNmd,
  translate as wasmTranslate,
} from './pkg/helix.js';

let wasmReady = false;
async function loadWasm() {
  try {
    await init();
    wasmReady = true;
    console.log('WASM loaded for mutations');
  } catch (e) {
    console.warn('WASM not available, falling back to JS:', e.message);
  }
}

// ── Constants ────────────────────────────────────────────────────

const VUS_TRACKER_API = 'https://vus.zyrkel.com/api/v1';
const VUS_TRACKER_KEY = '781a2daba1bac1a74bcf3e58a630732fb3a63fec9dcb232b623e4cc5c8491ec4';
const VUS_INDEX_URL = 'https://schlein-lab.github.io/nano-zyrkel-vusTracker/data/index.json';
const GNOMAD_API = 'https://gnomad.broadinstitute.org/api';
const ENSEMBL_API = 'https://rest.ensembl.org';

// Built-in JS codon table (fallback if WASM unavailable)
const CODON_TABLE = {
  TTT:'F',TTC:'F',TTA:'L',TTG:'L',CTT:'L',CTC:'L',CTA:'L',CTG:'L',
  ATT:'I',ATC:'I',ATA:'I',ATG:'M',GTT:'V',GTC:'V',GTA:'V',GTG:'V',
  TCT:'S',TCC:'S',TCA:'S',TCG:'S',CCT:'P',CCC:'P',CCA:'P',CCG:'P',
  ACT:'T',ACC:'T',ACA:'T',ACG:'T',GCT:'A',GCC:'A',GCA:'A',GCG:'A',
  TAT:'Y',TAC:'Y',TAA:'*',TAG:'*',CAT:'H',CAC:'H',CAA:'Q',CAG:'Q',
  AAT:'N',AAC:'N',AAA:'K',AAG:'K',GAT:'D',GAC:'D',GAA:'E',GAG:'E',
  TGT:'C',TGC:'C',TGA:'*',TGG:'W',CGT:'R',CGC:'R',CGA:'R',CGG:'R',
  AGT:'S',AGC:'S',AGA:'R',AGG:'R',GGT:'G',GGC:'G',GGA:'G',GGG:'G',
};
const AA_FULL_NAME = {
  A: 'Alanin', R: 'Arginin', N: 'Asparagin', D: 'Aspartinsäure',
  C: 'Cystein', E: 'Glutaminsäure', Q: 'Glutamin', G: 'Glycin',
  H: 'Histidin', I: 'Isoleucin', L: 'Leucin', K: 'Lysin',
  M: 'Methionin', F: 'Phenylalanin', P: 'Prolin', S: 'Serin',
  T: 'Threonin', W: 'Tryptophan', Y: 'Tyrosin', V: 'Valin', '*': 'Stop',
};

function jsTranslate(dna) {
  const seq = dna.toUpperCase();
  let protein = '';
  for (let i = 0; i + 3 <= seq.length; i += 3) {
    const codon = seq.substr(i, 3);
    protein += CODON_TABLE[codon] || '?';
  }
  return protein;
}

function translate(dna) {
  if (wasmReady) return wasmTranslate(dna);
  return jsTranslate(dna);
}

// ── State ────────────────────────────────────────────────────────

const state = {
  mode: 'learn',
  depth: 'klinisch',
  learnStep: 1,
  // Step 1+2 sequence (built so it has interesting codons + a clear stop)
  baseCds: 'ATGGAGTGGGCCTACATCGCCAAGCTGTAA', // M E W A Y I A K L *
  translateProgress: 0,           // for step 1 animated translation
  // Step 2 mutation state
  mutateCds: 'ATGGAGTGGGCCTACATCGCCAAGCTGTAA',
  lastMutatedPos: null,           // position of the most recent click (for focused effect card)
  // Step 3 indel state
  indelOriginal: 'ATGGAGTGGGCCTACATCGCCAAGCTGTAA',
  indelMutated:  'ATGGAGTGGGCCTACATCGCCAAGCTGTAA',
  // Cases (loaded from JSON)
  teachingCases: [],
  // Explore state
  exploreGeneIndex: null, // VUS tracker gene index
  currentGene: null,
  currentVariants: [],
  // Quiz state
  quiz: null,
};

// ── Init ─────────────────────────────────────────────────────────

async function init_app() {
  if (new URLSearchParams(location.search).has('embed')) {
    document.body.classList.add('embed');
  }

  // Mode tabs
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => switchMode(tab.dataset.mode));
  });

  // Depth selector
  document.getElementById('depth-select').addEventListener('change', (e) => {
    state.depth = e.target.value;
    // re-render anything depth-sensitive
    if (state.mode === 'learn' && state.learnStep === 4) renderLearnCases();
    if (state.mode === 'explore') refreshVariantDetail();
  });

  // Step navigation in learn mode
  document.querySelectorAll('.step').forEach(s => {
    s.addEventListener('click', () => goToLearnStep(parseInt(s.dataset.step)));
  });
  document.querySelectorAll('.next-step-btn[data-go]').forEach(btn => {
    btn.addEventListener('click', () => goToLearnStep(parseInt(btn.dataset.go)));
  });
  document.querySelectorAll('.prev-step-btn').forEach(btn => {
    btn.addEventListener('click', () => goToLearnStep(parseInt(btn.dataset.go)));
  });

  // Learn step 1 controls
  document.getElementById('translate-step-btn').addEventListener('click', translateNext);
  document.getElementById('translate-all-btn').addEventListener('click', translateAll);
  document.getElementById('translate-reset-btn').addEventListener('click', translateReset);

  // Learn step 3 indel controls
  document.querySelectorAll('.indel-btn').forEach(btn => {
    btn.addEventListener('click', () => applyIndelDemo(btn.dataset.action));
  });

  // Explore mode init
  initExplore();

  // Quiz mode init
  initQuiz();

  // Goto explore button
  document.getElementById('goto-explore').addEventListener('click', (e) => {
    e.preventDefault();
    switchMode('explore');
  });

  // Load teaching cases
  try {
    const res = await fetch('data/teaching_cases.json');
    state.teachingCases = await res.json();
  } catch (e) {
    console.warn('Could not load teaching cases', e);
    state.teachingCases = [];
  }

  await loadWasm();

  // Initial renders
  renderLearnStep1();
  renderLearnStep2();
  renderLearnStep3();
}

function switchMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
  document.querySelectorAll('.mode-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('mode-' + mode).classList.add('active');
}

// ═══════════════════════════════════════════════════════════════
// LEARN MODE
// ═══════════════════════════════════════════════════════════════

function goToLearnStep(step) {
  state.learnStep = step;
  document.querySelectorAll('.step').forEach(s => {
    const n = parseInt(s.dataset.step);
    s.classList.toggle('active', n === step);
    s.classList.toggle('completed', n < step);
  });
  document.querySelectorAll('.learn-step').forEach(p => {
    p.classList.toggle('active', parseInt(p.dataset.step) === step);
  });
  if (step === 4) renderLearnCases();
}

// ── Step 1: Stepwise translation ─────────────────────────────────

function renderLearnStep1() {
  const viewer = document.getElementById('learn-cds-viewer');
  const proteinViewer = document.getElementById('learn-protein-viewer');
  const cds = state.baseCds;
  const codons = chunkCdsToCodons(cds);
  const explain = document.getElementById('learn-explain-1');

  viewer.innerHTML = '';
  codons.forEach((codon, idx) => {
    const group = document.createElement('span');
    group.className = 'codon-group';
    if (idx === 0) group.classList.add('start');
    if (codon === 'TAA' || codon === 'TAG' || codon === 'TGA') group.classList.add('stop');
    if (idx < state.translateProgress) group.classList.add('translated');
    if (idx === state.translateProgress) group.classList.add('active');

    [...codon].forEach(b => {
      const baseEl = document.createElement('span');
      baseEl.className = 'base ' + b;
      baseEl.textContent = b;
      group.appendChild(baseEl);
    });

    // Make codon group clickable — clicking advances translation to (and including) this codon
    group.style.cursor = 'pointer';
    group.title = 'Klick um bis hier zu übersetzen';
    group.addEventListener('click', () => {
      // Translate up to and including this codon, capped at stop
      const target = idx + 1;
      translateTo(target);
    });

    viewer.appendChild(group);
  });

  // Build protein view from already-translated codons
  proteinViewer.innerHTML = '';
  for (let i = 0; i < state.translateProgress; i++) {
    const aa = CODON_TABLE[codons[i]] || '?';
    const aaEl = document.createElement('span');
    aaEl.className = 'aa';
    if (i === 0) aaEl.classList.add('start');
    if (aa === '*') aaEl.classList.add('stop');
    aaEl.textContent = aa;
    aaEl.title = AA_FULL_NAME[aa] || aa;
    proteinViewer.appendChild(aaEl);
  }

  // Explanation text
  if (state.translateProgress === 0) {
    explain.innerHTML = 'Klick auf das grüne Start-Codon (oder auf "Nächstes Codon") um die Translation zu starten. Das Start-Codon <strong>ATG</strong> markiert den Anfang jedes Proteins und codiert Methionin.';
    explain.classList.remove('empty');
  } else if (state.translateProgress < codons.length) {
    const lastCodon = codons[state.translateProgress - 1];
    const aa = CODON_TABLE[lastCodon];
    const extra = state.translateProgress === 1 ? ' Methionin ist die erste Aminosäure jedes Proteins — nach der Translation wird es bei vielen Proteinen wieder abgespalten.' : '';
    explain.innerHTML = `Codon ${state.translateProgress}: <strong>${lastCodon}</strong> → <strong>${aa}</strong> (${AA_FULL_NAME[aa] || aa}).${extra}`;
  } else {
    explain.innerHTML = 'Translation komplett! Du hast aus 30 DNA-Basen ein 9-Aminosäuren langes Protein gebaut. Das <strong>Stop-Codon</strong> (TAA) wird nicht in eine Aminosäure übersetzt — es signalisiert dem Ribosom: "Stopp, fertig hier."';
  }
}

function translateTo(targetCount) {
  const codons = chunkCdsToCodons(state.baseCds);
  let t = Math.min(targetCount, codons.length);
  // If the target crosses a stop codon, cap at the stop
  for (let i = 0; i < t; i++) {
    if (CODON_TABLE[codons[i]] === '*') { t = i + 1; break; }
  }
  state.translateProgress = t;
  renderLearnStep1();
}

function translateNext() {
  const codons = chunkCdsToCodons(state.baseCds);
  // Stop after the stop codon (don't add an asterisk beyond)
  if (state.translateProgress < codons.length) {
    state.translateProgress++;
    // If we just translated the stop codon, we're done
    const lastIdx = state.translateProgress - 1;
    if (CODON_TABLE[codons[lastIdx]] === '*') {
      state.translateProgress = codons.length;
    }
  }
  renderLearnStep1();
}

function translateAll() {
  state.translateProgress = chunkCdsToCodons(state.baseCds).length;
  renderLearnStep1();
}

function translateReset() {
  state.translateProgress = 0;
  renderLearnStep1();
}

function chunkCdsToCodons(cds) {
  const out = [];
  for (let i = 0; i + 3 <= cds.length; i += 3) {
    out.push(cds.substr(i, 3));
  }
  return out;
}

// ── Step 2: Point mutation playground ────────────────────────────

let activeBasePicker = null;

function renderLearnStep2() {
  const viewer = document.getElementById('mutate-cds-viewer');
  const cds = state.mutateCds;
  const original = state.baseCds;
  viewer.innerHTML = '';

  const codons = chunkCdsToCodons(cds);
  codons.forEach((codon, ci) => {
    const group = document.createElement('span');
    group.className = 'codon-group';
    if (ci === 0) group.classList.add('start');
    if (CODON_TABLE[codon] === '*') group.classList.add('stop');

    [...codon].forEach((b, bi) => {
      const baseEl = document.createElement('span');
      baseEl.className = 'base ' + b;
      baseEl.textContent = b;
      const cdsPos = ci * 3 + bi;
      baseEl.dataset.pos = cdsPos;

      // Mark changed bases vs original
      if (original[cdsPos] && original[cdsPos] !== b) {
        baseEl.classList.add('changed');
      }

      baseEl.addEventListener('click', (e) => openBasePicker(e, cdsPos));
      group.appendChild(baseEl);
    });
    viewer.appendChild(group);
  });

  // Render proteins (top: original, bottom: mutated, with diffs highlighted)
  const origProtein = translate(original).replace(/\*.*$/, '*');
  const mutProtein = translate(cds).replace(/\*.*$/, '*');
  renderProteinComparison('mutate-protein-orig', 'mutate-protein-mut', origProtein, mutProtein);

  renderEffectCard('mutate-effect-card', original, cds, state.lastMutatedPos);
}

function openBasePicker(event, cdsPos) {
  event.stopPropagation();
  if (activeBasePicker) { activeBasePicker.remove(); activeBasePicker = null; }
  const baseEl = event.target;
  const current = baseEl.textContent;

  const picker = document.createElement('div');
  picker.className = 'base-picker';
  ['A','T','G','C'].forEach(b => {
    const opt = document.createElement('div');
    opt.className = 'base-opt';
    if (b === current) opt.classList.add('current');
    opt.textContent = b;
    opt.addEventListener('click', () => {
      changeMutateBase(cdsPos, b);
      picker.remove();
      activeBasePicker = null;
    });
    picker.appendChild(opt);
  });

  // Position picker near the clicked base
  const rect = baseEl.getBoundingClientRect();
  const widget = document.querySelector('.widget').getBoundingClientRect();
  picker.style.left = (rect.left - widget.left) + 'px';
  picker.style.top = (rect.bottom - widget.top + 4) + 'px';
  document.querySelector('.widget').appendChild(picker);
  activeBasePicker = picker;

  setTimeout(() => {
    document.addEventListener('click', closeBasePicker, { once: true });
  }, 50);
}

function closeBasePicker() {
  if (activeBasePicker) { activeBasePicker.remove(); activeBasePicker = null; }
}

function changeMutateBase(pos, newBase) {
  const arr = state.mutateCds.split('');
  arr[pos] = newBase;
  state.mutateCds = arr.join('');
  state.lastMutatedPos = pos;
  renderLearnStep2();
}

function renderProteinComparison(origElId, mutElId, origProtein, mutProtein) {
  const origEl = document.getElementById(origElId);
  const mutEl = document.getElementById(mutElId);
  origEl.innerHTML = '';
  mutEl.innerHTML = '';
  const maxLen = Math.max(origProtein.length, mutProtein.length);
  for (let i = 0; i < maxLen; i++) {
    const oc = origProtein[i] || ' ';
    const mc = mutProtein[i] || ' ';
    const oSpan = document.createElement('span');
    oSpan.className = 'aa-letter';
    if (oc === '*') oSpan.classList.add('stop');
    oSpan.textContent = oc;
    origEl.appendChild(oSpan);

    const mSpan = document.createElement('span');
    mSpan.className = 'aa-letter';
    if (mc === '*') mSpan.classList.add('stop');
    if (oc !== mc) mSpan.classList.add('diff');
    mSpan.textContent = mc;
    mutEl.appendChild(mSpan);
  }
}

function renderEffectCard(targetId, originalCds, mutatedCds, focusPos) {
  const card = document.getElementById(targetId);
  if (originalCds === mutatedCds) {
    card.innerHTML = '<span class="effect-badge silent">Keine Mutation</span><span class="effect-explain">Die Sequenz entspricht dem Original. Klick auf eine Base um eine Mutation einzuführen.</span>';
    card.classList.add('show');
    return;
  }

  // Detect type of change
  const lenDiff = mutatedCds.length - originalCds.length;
  let html = '';

  if (lenDiff === 0) {
    // Substitution(s). Focus on the position the user most recently clicked,
    // or fall back to the first diff.
    let targetPos = focusPos;
    if (targetPos == null || originalCds[targetPos] === mutatedCds[targetPos]) {
      targetPos = -1;
      for (let i = 0; i < originalCds.length; i++) {
        if (originalCds[i] !== mutatedCds[i]) { targetPos = i; break; }
      }
    }
    if (targetPos < 0) { card.classList.remove('show'); return; }

    const codonStart = Math.floor(targetPos / 3) * 3;
    const origCodon = originalCds.substr(codonStart, 3);
    const mutCodon = mutatedCds.substr(codonStart, 3);
    const origAA = CODON_TABLE[origCodon];
    const mutAA = CODON_TABLE[mutCodon];

    // Count total substitutions for context
    let totalSubs = 0;
    for (let i = 0; i < originalCds.length; i++) {
      if (originalCds[i] !== mutatedCds[i]) totalSubs++;
    }

    let badge = 'silent';
    let title = 'Silent';
    let body = '';

    if (origCodon === mutCodon) {
      // User reverted this position back
      badge = 'silent';
      title = 'Rückgängig';
      body = `Du hast diese Position wieder auf das Original gesetzt. Dieses Codon ist jetzt identisch zum Wildtyp: <strong>${origCodon}</strong> (${AA_FULL_NAME[origAA] || origAA}).`;
    } else if (origAA === mutAA) {
      badge = 'silent';
      title = 'Silent (synonyme Mutation)';
      body = `Das Codon <strong>${origCodon}</strong> wurde zu <strong>${mutCodon}</strong>. Beide codieren <strong>${AA_FULL_NAME[origAA]} (${origAA})</strong>. Die Aminosäure ändert sich nicht — der genetische Code ist redundant (Wobble-Position).`;
    } else if (mutAA === '*') {
      badge = 'nonsense';
      title = 'Nonsense (vorzeitiges Stop)';
      body = `Das Codon <strong>${origCodon}</strong> (${AA_FULL_NAME[origAA]}) wurde zu <strong>${mutCodon}</strong> — ein <strong>Stop-Codon</strong>! Die Translation bricht hier ab, das Protein ist verkürzt. Solche Mutationen führen oft zu komplettem Funktionsverlust und können Nonsense-Mediated-Decay (NMD) auslösen.`;
    } else if (origAA === '*') {
      badge = 'in-frame';
      title = 'Stop-Loss';
      body = `Du hast das Stop-Codon <strong>${origCodon}</strong> zerstört! Statt zu stoppen, wird jetzt <strong>${AA_FULL_NAME[mutAA]} (${mutAA})</strong> eingebaut — die Translation läuft über die normale Grenze hinaus, bis das Ribosom zufällig auf ein anderes Stop-Codon trifft.`;
    } else {
      badge = 'missense';
      title = 'Missense';
      body = `Das Codon <strong>${origCodon}</strong> wurde zu <strong>${mutCodon}</strong>. Statt <strong>${AA_FULL_NAME[origAA]} (${origAA})</strong> wird nun <strong>${AA_FULL_NAME[mutAA]} (${mutAA})</strong> eingebaut. Ob das pathogen ist, hängt davon ab, wie ähnlich die Aminosäuren sind (Ladung, Größe, Hydrophobizität) und wo sie im Protein liegen (Funktionsdomäne? Aktives Zentrum?).`;
    }

    html = `<span class="effect-badge ${badge}">${title}</span><span class="effect-explain">${body}</span>`;
    html += `<div class="effect-meta">
      <span>Codon: <strong>${Math.floor(targetPos/3)+1}</strong></span>
      <span>CDS-Position: <strong>c.${targetPos+1}</strong></span>
      ${totalSubs > 1 ? `<span>Gesamt: <strong>${totalSubs} Substitutionen</strong></span>` : ''}
    </div>`;
  } else {
    // Indel — use WASM if possible
    const indelInfo = computeIndelInfo(originalCds, mutatedCds);
    let badge = indelInfo.is_frameshift ? 'frameshift' : 'in-frame';
    let title = indelInfo.label || (indelInfo.is_frameshift ? 'Frameshift' : 'In-frame Indel');
    let body;

    if (indelInfo.is_frameshift) {
      body = `Du hast den <strong>Leserahmen verschoben</strong>! Ab der Mutation wird die ganze nachfolgende Sequenz falsch abgelesen. Nach <strong>${(indelInfo.mutated_protein_len - (indelInfo.first_changed_aa_pos || 0))}</strong> falschen Aminosäuren entsteht ein vorzeitiges Stop-Codon. Das Protein ist von <strong>${indelInfo.original_protein_len}</strong> auf <strong>${indelInfo.mutated_protein_len}</strong> Aminosäuren verkürzt.`;
    } else if (lenDiff < 0) {
      body = `Du hast <strong>${-lenDiff} Basen</strong> gelöscht — das sind ${-lenDiff/3} Codon(s). Der Leserahmen bleibt erhalten (in-frame), aber das Protein hat <strong>${-lenDiff/3} Aminosäure(n) weniger</strong>. Ob das pathogen ist, hängt davon ab, ob die fehlende Aminosäure strukturell wichtig ist (klassisches Beispiel: CFTR p.Phe508del).`;
    } else {
      body = `Du hast <strong>${lenDiff} Basen</strong> eingefügt — das sind ${lenDiff/3} Codon(s). Der Leserahmen bleibt erhalten (in-frame), das Protein hat <strong>${lenDiff/3} Aminosäure(n) mehr</strong>. Solche Insertionen können die Proteinstruktur stören (Beispiel: Polyalanin-Expansionen in HOX-Genen).`;
    }

    html = `<span class="effect-badge ${badge}">${title}</span><span class="effect-explain">${body}</span>`;
    html += `<div class="effect-meta">
      <span>Original-Länge: <strong>${indelInfo.original_protein_len} AA</strong></span>
      <span>Mutiertes Protein: <strong>${indelInfo.mutated_protein_len} AA</strong></span>
      <span>Netto: <strong>${indelInfo.net_change > 0 ? '+' : ''}${indelInfo.net_change} bp</strong></span>
    </div>`;
  }

  card.innerHTML = html;
  card.classList.add('show');
}

function computeIndelInfo(originalCds, mutatedCds) {
  if (wasmReady) {
    // Find the first divergence point (approximate position)
    let pos = 0;
    while (pos < Math.min(originalCds.length, mutatedCds.length) && originalCds[pos] === mutatedCds[pos]) pos++;
    const lenDiff = mutatedCds.length - originalCds.length;
    let inserted = '';
    let deleted = 0;
    if (lenDiff > 0) inserted = mutatedCds.substr(pos, lenDiff);
    if (lenDiff < 0) deleted = -lenDiff;
    return JSON.parse(wasmPredictIndel(originalCds, pos, inserted, deleted));
  } else {
    // JS fallback
    const origProt = translate(originalCds).replace(/\*.*$/, '*');
    const mutProt = translate(mutatedCds).replace(/\*.*$/, '*');
    const lenDiff = mutatedCds.length - originalCds.length;
    return {
      is_frameshift: (lenDiff % 3) !== 0,
      net_change: lenDiff,
      original_protein_len: origProt.replace('*', '').length,
      mutated_protein_len: mutProt.replace('*', '').length,
      first_changed_aa_pos: null,
      new_stop_codon_pos: null,
      label: (lenDiff % 3 === 0) ? (lenDiff < 0 ? 'In-frame deletion' : 'In-frame insertion') : 'Frameshift',
    };
  }
}

// ── Step 3: Indel demo ──────────────────────────────────────────

function renderLearnStep3() {
  const viewer = document.getElementById('indel-cds-viewer');
  const cds = state.indelMutated;
  const original = state.indelOriginal;
  viewer.innerHTML = '';

  // Visualize insertions/deletions by comparing to original (simple position-based diff)
  let html = '';
  let i = 0, j = 0;
  while (i < original.length || j < cds.length) {
    const o = original[i];
    const m = cds[j];
    if (o === m) {
      html += `<span class="base ${m}">${m}</span>`;
      i++; j++;
    } else if (cds.length > original.length && cds.substr(j, cds.length - original.length) && i < original.length && cds[j + (cds.length - original.length)] === o) {
      // Inserted block
      const insLen = cds.length - original.length;
      for (let k = 0; k < insLen; k++) {
        html += `<span class="base inserted">${cds[j+k]}</span>`;
      }
      j += insLen;
    } else if (cds.length < original.length && j < cds.length && original[i + (original.length - cds.length)] === m) {
      // Deleted block
      const delLen = original.length - cds.length;
      for (let k = 0; k < delLen; k++) {
        html += `<span class="base deleted">${original[i+k]}</span>`;
      }
      i += delLen;
    } else {
      // Generic mismatch — just show mutated base
      if (m) html += `<span class="base ${m} changed">${m}</span>`;
      i++; j++;
    }
  }
  viewer.innerHTML = html;

  // Protein comparison
  const origProtein = translate(original).replace(/\*.*$/, '*');
  const mutProtein = translate(cds).replace(/\*.*$/, '*');
  renderProteinComparison('indel-protein-orig', 'indel-protein-mut', origProtein, mutProtein);

  renderEffectCard('indel-effect-card', original, cds);
}

function applyIndelDemo(action) {
  const original = state.indelOriginal;
  // Apply changes after the start codon (position 3+)
  const insertPoint = 6; // after MEW
  switch (action) {
    case 'del1':
      state.indelMutated = original.substr(0, insertPoint) + original.substr(insertPoint + 1);
      break;
    case 'del3':
      state.indelMutated = original.substr(0, insertPoint) + original.substr(insertPoint + 3);
      break;
    case 'ins1':
      state.indelMutated = original.substr(0, insertPoint) + 'A' + original.substr(insertPoint);
      break;
    case 'ins3':
      state.indelMutated = original.substr(0, insertPoint) + 'GCC' + original.substr(insertPoint);
      break;
    case 'reset':
      state.indelMutated = original;
      break;
  }
  document.querySelectorAll('.indel-btn').forEach(b => b.classList.toggle('active', b.dataset.action === action && action !== 'reset'));
  renderLearnStep3();
}

// ── Step 4: Real teaching cases ──────────────────────────────────

function renderLearnCases() {
  const grid = document.getElementById('learn-case-grid');
  grid.innerHTML = '';

  // Pick 6 representative cases for the learn step (variety of types)
  const types = ['missense', 'nonsense', 'frameshift', 'in-frame deletion', 'splice-site', 'silent'];
  const featured = [];
  for (const t of types) {
    const c = state.teachingCases.find(c => c.type === t || c.type.startsWith(t));
    if (c && !featured.includes(c)) featured.push(c);
  }
  // Pad if not enough
  for (const c of state.teachingCases) {
    if (featured.length >= 6) break;
    if (!featured.includes(c)) featured.push(c);
  }

  featured.slice(0, 6).forEach(c => {
    const card = document.createElement('div');
    card.className = 'case-card';
    card.innerHTML = `
      <div class="case-gene">${c.gene}</div>
      <div class="case-hgvs">${c.hgvs_p || c.hgvs_c}</div>
      <div class="case-condition">${c.condition || ''}</div>
      <div class="case-type">${c.type}</div>
    `;
    card.addEventListener('click', () => showCaseDetail(c));
    grid.appendChild(card);
  });
}

function showCaseDetail(c) {
  const detail = document.getElementById('learn-case-detail');
  const teaching = c.teaching[state.depth] || c.teaching.basis || '';
  detail.innerHTML = `
    <div class="cd-header">
      <div>
        <div class="cd-gene">${c.gene}</div>
        <div class="cd-hgvs">${c.hgvs_c} ${c.hgvs_p ? '· ' + c.hgvs_p : ''}</div>
      </div>
      <button class="cd-close">&times;</button>
    </div>
    <div class="cd-condition">${c.condition || ''} ${c.inheritance ? '· ' + c.inheritance : ''}</div>
    <div class="cd-teaching">${teaching}</div>
  `;
  detail.style.display = '';
  detail.querySelector('.cd-close').addEventListener('click', () => { detail.style.display = 'none'; });
}

// ═══════════════════════════════════════════════════════════════
// EXPLORE MODE
// ═══════════════════════════════════════════════════════════════

function initExplore() {
  const input = document.getElementById('explore-gene-input');
  const ac = document.getElementById('explore-autocomplete');

  let searchTimeout;
  input.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const q = input.value.trim();
    if (q.length < 2) { ac.classList.remove('open'); return; }
    searchTimeout = setTimeout(() => searchGene(q), 250);
  });
  input.addEventListener('blur', () => setTimeout(() => ac.classList.remove('open'), 200));

  // Quick gene buttons
  document.querySelectorAll('.quick-gene').forEach(btn => {
    btn.addEventListener('click', () => loadGene(btn.dataset.gene));
  });
}

async function searchGene(query) {
  const ac = document.getElementById('explore-autocomplete');

  // Lazy-load gene index
  if (!state.exploreGeneIndex) {
    try {
      const res = await fetch(VUS_INDEX_URL);
      const data = await res.json();
      state.exploreGeneIndex = data.gene_breakdowns || {};
    } catch (e) {
      ac.innerHTML = '<div class="ac-item"><span class="gene" style="color:var(--text-dim)">Gen-Index nicht verfügbar</span></div>';
      ac.classList.add('open');
      return;
    }
  }

  const ql = query.toLowerCase();
  const matches = Object.entries(state.exploreGeneIndex)
    .filter(([g]) => g.toLowerCase().includes(ql))
    .sort(([a, ai], [b, bi]) => {
      const aStarts = a.toLowerCase().startsWith(ql) ? 1 : 0;
      const bStarts = b.toLowerCase().startsWith(ql) ? 1 : 0;
      return bStarts - aStarts || (bi.total || 0) - (ai.total || 0);
    })
    .slice(0, 8);

  if (matches.length === 0) {
    ac.innerHTML = '<div class="ac-item"><span class="gene" style="color:var(--text-dim)">Keine Treffer</span></div>';
  } else {
    ac.innerHTML = matches.map(([g, info]) =>
      `<div class="ac-item" data-gene="${g}"><span class="gene">${g}</span><span class="count">${info.total || 0} Varianten</span></div>`
    ).join('');
    ac.querySelectorAll('.ac-item[data-gene]').forEach(item => {
      item.addEventListener('mousedown', () => {
        loadGene(item.dataset.gene);
        ac.classList.remove('open');
      });
    });
  }
  ac.classList.add('open');
}

async function loadGene(gene) {
  state.currentGene = gene;
  state.currentVariants = [];
  document.getElementById('explore-gene-input').value = gene;

  const content = document.getElementById('explore-content');
  content.innerHTML = `
    <div class="gene-header">
      <span class="gh-name">${gene}</span>
      <span class="gh-count">Lade Varianten…</span>
    </div>
    <div class="vdp-loading">Hole ClinVar-Daten vom VUS Tracker…</div>
  `;

  try {
    const res = await fetch(`${VUS_TRACKER_API}/genes/${gene}/variants?api_key=${VUS_TRACKER_KEY}&per_page=100`);
    const data = await res.json();
    state.currentVariants = (data.data || data.variants || []).map(v => ({
      hgvs: v.hgvs || `${v.chromosome}-${v.position}-${v.ref_allele}-${v.alt_allele}`,
      classification: v.classification || 'uncertain_significance',
      condition: v.condition || '',
      chr: v.chromosome,
      pos: v.position,
      ref: v.ref_allele,
      alt: v.alt_allele,
      gnomadId: v.chromosome && v.position ? `${v.chromosome.replace('chr','')}-${v.position}-${v.ref_allele}-${v.alt_allele}` : null,
      raw: v,
    }));
    renderGenePage(gene);
  } catch (e) {
    content.innerHTML = `<div class="vdp-error">Fehler beim Laden: ${e.message}</div>`;
  }
}

function renderGenePage(gene) {
  const content = document.getElementById('explore-content');
  content.innerHTML = `
    <div class="gene-header">
      <span class="gh-name">${gene}</span>
      <span class="gh-count">${state.currentVariants.length} Varianten</span>
    </div>
    <div class="variants-filter">
      <input type="text" id="variant-filter" placeholder="Filter (c./p./Klassifikation)…">
      <select id="class-filter">
        <option value="">Alle Klassen</option>
        <option value="pathogenic">Pathogen</option>
        <option value="likely_pathogenic">Wahrscheinlich pathogen</option>
        <option value="uncertain_significance">VUS</option>
        <option value="likely_benign">Wahrscheinlich benign</option>
        <option value="benign">Benign</option>
      </select>
    </div>
    <div class="variant-list" id="variant-list"></div>
    <div id="variant-detail-container"></div>
  `;

  document.getElementById('variant-filter').addEventListener('input', renderVariantList);
  document.getElementById('class-filter').addEventListener('change', renderVariantList);
  renderVariantList();
}

function renderVariantList() {
  const list = document.getElementById('variant-list');
  if (!list) return;
  const filterText = (document.getElementById('variant-filter')?.value || '').toLowerCase();
  const filterClass = document.getElementById('class-filter')?.value || '';

  let items = state.currentVariants;
  if (filterText) {
    items = items.filter(v => (v.hgvs.toLowerCase().includes(filterText) || (v.condition || '').toLowerCase().includes(filterText)));
  }
  if (filterClass) {
    items = items.filter(v => (v.classification || '').toLowerCase() === filterClass);
  }

  const shown = items.slice(0, 50);
  if (shown.length === 0) {
    list.innerHTML = '<div class="vdp-loading">Keine passenden Varianten</div>';
    return;
  }

  list.innerHTML = shown.map((v, i) => {
    const cls = (v.classification || '').toLowerCase();
    const clsLabel = cls.replace('_', ' ').replace('uncertain significance', 'VUS');
    const hgvsShort = v.hgvs.replace(/^[^:]+:/, '');
    return `<div class="variant-item" data-idx="${i}">
      <span class="vi-hgvs" title="${v.hgvs}">${hgvsShort}</span>
      <span class="vi-class ${cls}">${clsLabel}</span>
    </div>`;
  }).join('');

  list.querySelectorAll('.variant-item').forEach(el => {
    el.addEventListener('click', () => showVariantDetail(shown[parseInt(el.dataset.idx)]));
  });
}

let currentVariantDetail = null;

async function showVariantDetail(v) {
  currentVariantDetail = v;
  const container = document.getElementById('variant-detail-container');
  const hgvsShort = v.hgvs.replace(/^[^:]+:/, '');

  container.innerHTML = `
    <div class="variant-detail-panel">
      <div class="vdp-header">
        <span class="vdp-hgvs">${hgvsShort}</span>
        <button class="vdp-close">&times;</button>
      </div>
      <div class="vdp-section">
        <div class="vdp-section-title">ClinVar</div>
        <div class="vdp-section-body">
          <strong>${(v.classification || '').replace(/_/g, ' ')}</strong>${v.condition ? ' &mdash; ' + v.condition : ''}
        </div>
      </div>
      <div class="vdp-section" id="vdp-explain"></div>
      <div class="vdp-section" id="vdp-gnomad"><div class="vdp-loading">Lade gnomAD-Frequenzen…</div></div>
    </div>
  `;
  container.querySelector('.vdp-close').addEventListener('click', () => {
    container.innerHTML = '';
    currentVariantDetail = null;
  });

  renderVariantExplanation(v);
  if (v.gnomadId) {
    fetchGnomadFrequencies(v.gnomadId);
  } else {
    document.getElementById('vdp-gnomad').innerHTML = `
      <div class="vdp-section-title">gnomAD</div>
      <div class="vdp-section-body" style="color:var(--text-dim)">Keine genomischen Koordinaten verfügbar</div>
    `;
  }
}

function refreshVariantDetail() {
  if (currentVariantDetail) renderVariantExplanation(currentVariantDetail);
}

function renderVariantExplanation(v) {
  const el = document.getElementById('vdp-explain');
  if (!el) return;

  // Classify by HGVS pattern
  const hgvs = v.hgvs.toLowerCase();
  let mutationType = 'unbekannt';
  let basisExplain = '';
  let klinischExplain = '';
  let experteExplain = '';

  if (hgvs.match(/[acgt]>[acgt]/)) {
    if (hgvs.includes('p.') && hgvs.match(/p\.[a-z]+\d+\*/)) {
      mutationType = 'Nonsense';
      basisExplain = 'Eine einzelne Base ändert sich und erzeugt ein vorzeitiges Stop-Codon. Die Translation bricht ab → das Protein ist verkürzt und meist funktionslos.';
      klinischExplain = 'Nonsense-Mutationen führen zu Loss-of-Function. Wenn die Mutation NMD auslöst, wird die mRNA abgebaut → Haploinsuffizienz. Wenn nicht, wird ein trunkiertes Protein produziert (manchmal dominant-negativ).';
      experteExplain = 'NMD-Vorhersage essentiell: PTC mehr als 50 nt upstream der letzten Exon-Exon-Junction → NMD wahrscheinlich. Letztes Exon oder Single-Exon-Gen → NMD-Escape, trunkiertes Protein wird produziert.';
    } else if (hgvs.includes('p.') && !hgvs.match(/p\..*=$/)) {
      mutationType = 'Missense';
      basisExplain = 'Eine einzelne Base ändert sich, dadurch wird eine andere Aminosäure eingebaut. Das Protein hat die gleiche Länge, aber an einer Stelle eine andere Aminosäure.';
      klinischExplain = 'Ob eine Missense-Mutation pathogen ist, hängt davon ab: Wo im Protein? In einer Funktionsdomäne? Ähnlichkeit der Aminosäuren (Ladung, Größe, Hydrophobizität)? Konservierung? Computational Predictions (CADD, REVEL, AlphaMissense) helfen bei der Einschätzung.';
      experteExplain = 'ACMG-Kriterien für Missense: PM1 (Mutational Hotspot), PM5 (gleiche Position bekannt pathogen), PP3 (computational evidence), BP4 (computational benign). Funktionsstudien (PS3) sind der Goldstandard, aber selten verfügbar.';
    } else if (hgvs.match(/p\..*=$/) || hgvs.match(/p\.\([^)]*\)/)) {
      mutationType = 'Silent';
      basisExplain = 'Die DNA-Base ändert sich, aber wegen der Redundanz des genetischen Codes (Wobble-Position) bleibt die Aminosäure gleich. Klinisch meist irrelevant.';
      klinischExplain = 'Vorsicht: Manche scheinbar stillen Mutationen verändern Splice-Enhancer/Silencer-Motive und können Exon-Skipping auslösen. SpliceAI-Vorhersage empfohlen.';
      experteExplain = 'Codon Usage Bias kann theoretisch die Translationsgeschwindigkeit beeinflussen → veränderte Protein-Faltung. In der Praxis fast nie klinisch relevant. ACMG: BP7 (synonyme Variante mit niedrigem Splice-Impact).';
    }
  } else if (hgvs.includes('del')) {
    if (hgvs.includes('fs') || hgvs.includes('frameshift')) {
      mutationType = 'Frameshift (Deletion)';
      basisExplain = 'Eine oder mehrere Basen werden gelöscht, und die Anzahl ist nicht durch 3 teilbar → der Leserahmen verschiebt sich. Ab der Mutation wird alles falsch abgelesen, bis ein neues Stop-Codon kommt.';
      klinischExplain = 'Frameshift-Mutationen sind fast immer pathogen (Loss-of-Function). NMD wird häufig ausgelöst → Haploinsuffizienz. Bei Genen, in denen Haploinsuffizienz nicht zu Krankheit führt, können sie aber tolerabel sein.';
      experteExplain = 'PVS1 (Very Strong Pathogenic) gilt für Null-Varianten in Genen, in denen LoF der bekannte Pathomechanismus ist. PVS1 muss auf Strong/Moderate herabgestuft werden, wenn: PTC im letzten Exon (kein NMD), NMD-Escape, alternative Spleißvarianten den Bereich umgehen.';
    } else {
      mutationType = 'In-frame Deletion';
      basisExplain = 'Eine oder mehrere Basen werden gelöscht, aber die Anzahl ist durch 3 teilbar → der Leserahmen bleibt erhalten. Das Protein ist um eine oder mehrere Aminosäuren verkürzt, behält aber seine Grundstruktur.';
      klinischExplain = 'In-frame Deletionen können pathogen (z. B. CFTR p.Phe508del) oder benign sein, abhängig davon, ob die fehlende Region funktionell wichtig ist. Pathomechanismus oft Protein-Misfolding statt kompletter LoF.';
      experteExplain = 'PM4 (Protein-Länge verändert in non-repeat Region) bei in-frame Indels in funktionellen Domänen. Funktionelle Studien besonders wichtig, da die Pathogenität nicht aus der Sequenz allein vorhersagbar ist.';
    }
  } else if (hgvs.includes('ins') || hgvs.includes('dup')) {
    if (hgvs.includes('fs')) {
      mutationType = 'Frameshift (Insertion)';
      basisExplain = 'Basen werden eingefügt, und die Anzahl ist nicht durch 3 teilbar → Frameshift. Der Leserahmen verschiebt sich, downstream alles falsch.';
      klinischExplain = 'Wie bei Deletions-Frameshifts: meist Loss-of-Function durch NMD oder Protein-Trunkierung.';
      experteExplain = 'Duplikationen sind häufig durch Slippage in repetitiven Regionen. ACMG-Bewertung wie bei anderen Frameshifts (PVS1).';
    } else {
      mutationType = 'In-frame Insertion';
      basisExplain = 'Basen werden eingefügt, Anzahl durch 3 teilbar → in-frame. Das Protein wird um eine oder mehrere Aminosäuren länger.';
      klinischExplain = 'In-frame Insertionen in funktionellen Domänen können die Proteinstruktur stören. Beispiel: Polyalanin-Expansionen in Transkriptionsfaktoren (HOX-Gene).';
      experteExplain = 'PM4 anwendbar. Bei Duplikationen ganzer Exons: Prüfen ob Reading Frame erhalten bleibt.';
    }
  } else if (hgvs.includes('+1') || hgvs.includes('-1') || hgvs.includes('+2') || hgvs.includes('-2')) {
    mutationType = 'Splice-Site (kanonisch)';
    basisExplain = 'Die Mutation liegt direkt an der Splice-Site (GT-Donor oder AG-Akzeptor). Diese Stellen sind essentiell für korrektes Spleißen — eine Mutation hier zerstört das Splicen fast immer.';
    klinischExplain = 'Folgen: Exon-Skipping, kryptischer Splice-Site oder Intron-Retention. Wenn das Skipping einen Frameshift erzeugt → wahrscheinlich NMD. Wenn in-frame → verkürztes Protein.';
    experteExplain = 'PVS1_Strong für kanonische Splice-Sites (±1, ±2). Die genaue Konsequenz auf RNA-Ebene hängt vom Kontext ab — RNA-Analyse aus Patientenblut ist der Goldstandard.';
  }

  const depthLabel = { basis: 'Basis', klinisch: 'Klinisch', experte: 'Experte' }[state.depth] || state.depth;
  el.innerHTML = `
    <div class="vdp-section-title">Erklärung · ${depthLabel}</div>
    <div class="vdp-section-body">
      <strong>${mutationType}</strong><br>
      ${state.depth === 'basis' ? basisExplain : state.depth === 'klinisch' ? klinischExplain : experteExplain}
    </div>
  `;
}

async function fetchGnomadFrequencies(variantId) {
  const el = document.getElementById('vdp-gnomad');
  if (!el) return;

  const gqlQuery = `{
    variant(variantId: "${variantId}", dataset: gnomad_r4) {
      variant_id pos ref alt
      exome { ac an populations { id ac an } }
      genome { ac an populations { id ac an } }
    }
  }`;

  try {
    const res = await fetch(GNOMAD_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: gqlQuery }),
    });
    const data = await res.json();
    const v = data?.data?.variant;
    if (!v) {
      el.innerHTML = `<div class="vdp-section-title">gnomAD v4</div><div class="vdp-section-body" style="color:var(--text-dim)">Variante zu selten oder nicht in gnomAD vorhanden.</div>`;
      return;
    }

    const ex = v.exome || { ac: 0, an: 0, populations: [] };
    const gn = v.genome || { ac: 0, an: 0, populations: [] };
    const totalAc = (ex.ac || 0) + (gn.ac || 0);
    const totalAn = (ex.an || 0) + (gn.an || 0);
    const af = totalAn > 0 ? totalAc / totalAn : 0;

    const POP_NAMES = { afr: 'AFR', amr: 'AMR', eas: 'EAS', nfe: 'EUR', sas: 'SAS', fin: 'FIN', asj: 'ASJ' };
    const popMap = {};
    [...(ex.populations || []), ...(gn.populations || [])].forEach(p => {
      const id = p.id.toLowerCase().replace('gnomad_', '');
      if (!POP_NAMES[id]) return;
      if (!popMap[id]) popMap[id] = { ac: 0, an: 0 };
      popMap[id].ac += p.ac || 0;
      popMap[id].an += p.an || 0;
    });

    let popHtml = '';
    Object.entries(popMap).forEach(([id, d]) => {
      if (d.an > 0) {
        const pAf = d.ac / d.an;
        popHtml += `<div class="vdp-freq-item">
          <div class="vfi-pop">${POP_NAMES[id]}</div>
          <div class="vfi-val">${pAf < 0.0001 ? pAf.toExponential(1) : (pAf * 100).toFixed(3) + '%'}</div>
          <div class="vfi-count">${d.ac}/${d.an}</div>
        </div>`;
      }
    });

    el.innerHTML = `
      <div class="vdp-section-title">gnomAD v4 — Allelfrequenzen</div>
      <div class="vdp-section-body" style="margin-bottom:0.4rem;">
        Global: <strong>${af < 0.0001 ? af.toExponential(2) : (af * 100).toFixed(4) + '%'}</strong> (${totalAc}/${totalAn} Allele)
      </div>
      <div class="vdp-freq-grid">${popHtml}</div>
    `;
  } catch (e) {
    el.innerHTML = `<div class="vdp-section-title">gnomAD</div><div class="vdp-error">Fehler: ${e.message}</div>`;
  }
}

// ═══════════════════════════════════════════════════════════════
// QUIZ MODE
// ═══════════════════════════════════════════════════════════════

function initQuiz() {
  document.querySelectorAll('.quiz-level').forEach(btn => {
    btn.addEventListener('click', () => startQuiz(parseInt(btn.dataset.level)));
  });
  document.getElementById('quiz-quit-btn').addEventListener('click', quitQuiz);
  document.getElementById('quiz-next-btn').addEventListener('click', nextQuizQuestion);
  document.getElementById('quiz-restart-btn').addEventListener('click', () => {
    document.getElementById('quiz-result').style.display = 'none';
    document.getElementById('quiz-start').style.display = '';
  });
}

function startQuiz(level) {
  state.quiz = {
    level,
    questions: buildQuizQuestions(level),
    currentIdx: 0,
    score: 0,
    answered: false,
  };
  document.getElementById('quiz-start').style.display = 'none';
  document.getElementById('quiz-game').style.display = '';
  document.getElementById('quiz-result').style.display = 'none';
  renderQuizQuestion();
}

function buildQuizQuestions(level) {
  const cases = state.teachingCases;
  const out = [];

  if (level === 1) {
    // Basics: ask for mutation type given HGVS
    cases.forEach(c => {
      if (c.quiz_questions && c.quiz_questions[0]) {
        out.push({
          context: `<strong>${c.gene}</strong> · ${c.hgvs_c} ${c.hgvs_p ? '(' + c.hgvs_p + ')' : ''}`,
          q: c.quiz_questions[0].q,
          options: c.quiz_questions[0].options,
          correct: c.quiz_questions[0].correct,
          explanation: c.quiz_questions[0].explanation,
          case: c,
        });
      }
    });
  } else if (level === 2) {
    // Clinical cases: use second question if available, otherwise first
    cases.forEach(c => {
      if (c.quiz_questions) {
        const qIdx = c.quiz_questions.length > 1 ? 1 : 0;
        const q = c.quiz_questions[qIdx];
        if (q) {
          out.push({
            context: `<strong>${c.gene}</strong> · ${c.hgvs_c}<br>${c.condition || ''} · ${c.inheritance || ''}`,
            q: q.q,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation,
            case: c,
          });
        }
      }
    });
  } else {
    // Level 3: interpretation - use teaching text to generate "would you classify this as..."
    cases.forEach(c => {
      if (!c.clinvar) return;
      const correctClass = (c.clinvar || '').toLowerCase().includes('pathogen') ? 0
        : (c.clinvar || '').toLowerCase().includes('benign') ? 2
        : 1;
      out.push({
        context: `<strong>${c.gene}</strong> · ${c.hgvs_c}<br>${c.condition || ''}<br><em style="font-size:0.7rem">${(c.teaching.experte || c.teaching.klinisch || '').substring(0, 200)}…</em>`,
        q: 'Wie würdest du diese Variante nach ACMG klassifizieren?',
        options: ['Pathogen / Likely Pathogen', 'VUS', 'Benign / Likely Benign'],
        correct: correctClass,
        explanation: `ClinVar: <strong>${c.clinvar}</strong>. ${c.teaching.experte || c.teaching.klinisch || ''}`,
        case: c,
      });
    });
  }

  // Shuffle and limit
  return shuffleArray(out).slice(0, 10);
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderQuizQuestion() {
  const q = state.quiz.questions[state.quiz.currentIdx];
  if (!q) { finishQuiz(); return; }
  state.quiz.answered = false;

  document.getElementById('quiz-progress-text').textContent = `Frage ${state.quiz.currentIdx + 1} von ${state.quiz.questions.length}`;
  document.getElementById('quiz-progress-fill').style.width = ((state.quiz.currentIdx) / state.quiz.questions.length * 100) + '%';
  document.getElementById('quiz-score-text').textContent = `Score: ${state.quiz.score}`;

  document.getElementById('quiz-question').innerHTML = `
    <span class="q-context">${q.context}</span>
    <span class="q-text">${q.q}</span>
  `;

  const optsEl = document.getElementById('quiz-options');
  optsEl.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.addEventListener('click', () => answerQuiz(i));
    optsEl.appendChild(btn);
  });

  document.getElementById('quiz-feedback').classList.remove('show', 'correct', 'wrong');
  document.getElementById('quiz-feedback').textContent = '';
  document.getElementById('quiz-next-btn').style.display = 'none';
}

function answerQuiz(choice) {
  if (state.quiz.answered) return;
  state.quiz.answered = true;
  const q = state.quiz.questions[state.quiz.currentIdx];
  const correct = choice === q.correct;
  if (correct) state.quiz.score++;

  const buttons = document.querySelectorAll('#quiz-options button');
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add('correct');
    else if (i === choice) btn.classList.add('wrong');
  });

  const fb = document.getElementById('quiz-feedback');
  fb.innerHTML = (correct ? '<strong>Richtig!</strong> ' : '<strong>Leider falsch.</strong> ') + (q.explanation || '');
  fb.classList.add('show', correct ? 'correct' : 'wrong');

  document.getElementById('quiz-next-btn').style.display = '';
  document.getElementById('quiz-score-text').textContent = `Score: ${state.quiz.score}`;
}

function nextQuizQuestion() {
  state.quiz.currentIdx++;
  if (state.quiz.currentIdx >= state.quiz.questions.length) {
    finishQuiz();
  } else {
    renderQuizQuestion();
  }
}

function finishQuiz() {
  document.getElementById('quiz-game').style.display = 'none';
  document.getElementById('quiz-result').style.display = '';
  const total = state.quiz.questions.length;
  const score = state.quiz.score;
  const pct = total > 0 ? (score / total * 100) : 0;
  document.getElementById('quiz-final-score').textContent = `${score} / ${total}`;
  let feedback;
  if (pct >= 90) feedback = 'Exzellent! Du beherrschst die Mutations-Interpretation auf hohem Niveau.';
  else if (pct >= 70) feedback = 'Gut gemacht! Solides Verständnis. Schau dir die falschen Antworten an, um deine Wissenslücken zu schließen.';
  else if (pct >= 50) feedback = 'Ordentlich, aber noch Luft nach oben. Probier den Learn-Modus, um die Konzepte interaktiv zu vertiefen.';
  else feedback = 'Lass dich nicht entmutigen! Mutations-Interpretation ist komplex. Schau dir den Learn-Modus an und versuche es dann nochmal.';
  document.getElementById('quiz-final-feedback').textContent = feedback;
}

function quitQuiz() {
  state.quiz = null;
  document.getElementById('quiz-game').style.display = 'none';
  document.getElementById('quiz-start').style.display = '';
}

// ── Go ───────────────────────────────────────────────────────────
init_app();
