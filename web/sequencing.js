// ── Sequencing Lab ─────────────────────────────────────────────
// Three modes: Learn (8 guided lessons), Explore (5 sandboxes), Quiz.

import init, {
  layout_reads as wasmLayoutReads,
  compute_coverage as wasmCoverage,
  filter_variants as wasmFilterVariants,
  classify_acmg as wasmClassifyAcmg,
  detect_cnv as wasmDetectCnv,
  simulate_pathway as wasmSimulatePathway,
} from './pkg/helix.js';

import { BamViewer, renderReadDemo } from './bam-viewer.js';

// ── i18n ─────────────────────────────────────────────────────────

const I18N = {
  de: {
    seq_header: 'Sequenzierungs-Labor',
    seq_subtitle: 'BAM-Reads · Varianten-Filterung · ACMG · CNV · Short vs Long Read',
    mode_learn: 'Lernen', mode_explore: 'Erkunden', mode_quiz: 'Quiz',
    seq_s1_label: 'Reads', seq_s2_label: 'SNV', seq_s3_label: 'CNV',
    seq_s4_label: 'Panel/Exom/Genom', seq_s5_label: 'Filter', seq_s6_label: 'ACMG',
    seq_s7_label: 'Short/Long', seq_s8_label: 'Pathway',

    seq_s1_intro: 'Genomische Daten beginnen als <strong>Reads</strong> — kurze Fragmente der DNA, die von einem Sequenziergerät gelesen werden. Jeder Read ist typischerweise <strong>150 bp</strong> lang (Illumina Short-Read) oder <strong>10.000+ bp</strong> (ONT/PacBio Long-Read). Viele Reads übereinander ergeben die <strong>Coverage</strong> — die Abdeckungstiefe. Stell dir vor: Wir suchen die Ursache einer PKU bei einem Neugeborenen.',
    seq_s2_intro: 'Hier siehst du echte Reads in einem <strong>BAM-Viewer</strong>. Jeder horizontale Balken ist ein Read. Wenn an einer Position etwa die Hälfte der Reads ein <strong>alternatives Allel</strong> zeigt, ist der Patient dort <strong>heterozygot</strong>. Wähle verschiedene Fälle und lerne, echte Varianten von Artefakten zu unterscheiden.',
    seq_s3_intro: 'Bei einer <strong>Copy Number Variation</strong> (CNV) fehlen oder verdoppeln sich ganze Genomabschnitte. Im BAM sieht man das als plötzlichen <strong>Coverage-Abfall</strong> (Deletion) oder <strong>Coverage-Anstieg</strong> (Duplikation). Long-Reads können den Breakpoint direkt überspannen.',
    seq_s4_intro: 'Drei Strategien, ein Patient: <strong>Panel</strong> (50 Gene, 500x, ~300€), <strong>Exom</strong> (20.000 Gene, 100x, ~800€), <strong>Genom</strong> (alles, 30x, ~1500€). Jede findet andere Varianten. Eine tief-intronische Splice-Variante? Nur das Genom sieht sie.',
    seq_s5_intro: 'Ein Genom liefert <strong>4,5 Millionen Varianten</strong>. Die meisten sind harmlos. Durch systematische Filter engt man die Kandidaten ein: Qualität, Allel-Frequenz, Protein-Effekt, Gen-Liste, Segregation. <strong>Achtung:</strong> Bei MCADD hat die häufigste pathogene Variante eine MAF von 1,4% — ein zu strenger MAF-Filter wirft sie raus!',
    seq_s6_intro: 'Das <strong>ACMG-Klassifikationssystem</strong> bewertet Varianten anhand von Evidenz-Kriterien. Jedes Kriterium gibt Punkte — die Summe bestimmt die Klasse: <strong>Pathogenic, Likely Pathogenic, VUS, Likely Benign, Benign</strong>. Probiere es aus: Wähle Kriterien an und beobachte, wie sich die Klassifikation ändert.',
    seq_s7_intro: '<strong>Links:</strong> Illumina Short-Read (150 bp, niedrige Fehlerrate). <strong>Rechts:</strong> Oxford Nanopore Long-Read (~10 kb, höhere Fehlerrate). Gleiche Region, gleicher Patient — aber beachte: In der repetitiven Alu-Region kann Short-Read den Breakpoint nicht auflösen. Ein einzelner Long-Read überspannt den gesamten Bereich.',
    seq_s8_intro: 'Von der Variante zurück zur Klinik: <strong>Warum</strong> suchen wir diese Variante? Weil ein blockiertes Enzym den Stoffwechselweg stört — Substrat akkumuliert, Produkt fehlt. Wähle eine Erkrankung und blockiere das Enzym.',

    seq_read_length: 'Read-Länge', seq_coverage: 'Coverage',
    seq_to_snv: 'SNVs erkennen →', seq_to_cnv: 'CNVs erkennen →',
    seq_to_strategy: 'Strategien →', seq_to_filter: 'Varianten filtern →',
    seq_to_acmg: 'ACMG-Klassifikation →', seq_to_shortlong: 'Short vs Long Read →',
    seq_to_pathway: 'Klinischer Kontext →',
    seq_switch_longread: 'Long-Read',
    seq_show_quality: 'Qualität', seq_show_strand: 'Strang',
    seq_block_enzyme: 'Enzym blockieren',
    seq_genes: 'Gene',
    back: '← Zurück', reset: 'Zurücksetzen',
    explore_real_data: 'Echte Daten erkunden →',
    all_modules: '← Alle Module',
    powered_by: 'powered by <a href="https://github.com/schlein-lab/nano-zyrkel-helix" target="_blank">nano-zyrkel</a>',

    case_pah_het: 'PAH — het SNV (PKU)',
    case_pah_hom: 'PAH — hom SNV',
    case_pah_comphet: 'PAH — Compound-Het',
    case_artifact: 'Sequenzier-Artefakt',
    case_galt_del: 'GALT — Exon-Deletion (Galaktosämie)',
    case_ldlr_dup: 'LDLR — Alu-Duplikation (FH)',
    case_mcadd_filter: 'MCADD — MAF-Falle (c.985A>G)',
    case_pku_filter: 'PKU — Standard AR-Fall',
    case_fh_filter: 'FH — AD, dominant',

    seq_exp_bam: 'BAM-Viewer', seq_exp_filter: 'Filter-Werkbank',
    seq_exp_acmg: 'ACMG-Klassifikator', seq_exp_coverage: 'Coverage-Vergleich',
    seq_exp_pathway: 'Pathway-Explorer',

    filt_raw: 'Roh-Varianten', filt_quality: 'Qualität (PASS)',
    filt_maf: 'MAF < ', filt_coding: 'Kodierend / Splice',
    filt_effect: 'Protein-Effekt', filt_genelist: 'Gen-Liste',
    filt_segregation: 'Segregation (AR)', filt_acmg: 'ACMG-Bewertung',
    filt_maf_thresh: 'MAF-Schwelle', filt_effect_filter: 'Effekt-Filter',
    filt_inheritance: 'Vererbung',
    filt_all: 'Alle', filt_nonsyn: 'Nicht-synonym', filt_lof: 'Nur LoF',
    filt_none: 'Keiner', filt_ar: 'AR (hom/comp-het)', filt_ad: 'AD (het)', filt_denovo: 'De novo',

    acmg_pvs1: 'Null-Variante', acmg_ps1: 'Bekannter AS-Austausch', acmg_ps3: 'Funktionelle Studie',
    acmg_pm1: 'Hotspot', acmg_pm2: 'Absent in gnomAD', acmg_pp3: 'In silico', acmg_pp5: 'ClinVar P',
    acmg_ba1: 'MAF >5%', acmg_bs1: 'MAF zu hoch', acmg_bs3: 'Funkt. normal',
    acmg_bp1: 'Missense (LoF-Gen)', acmg_bp4: 'In silico benigne',

    seq_quiz_title: 'Sequenzierung & Genomanalyse Quiz',
    seq_quiz_sub: 'Von der Read-Interpretation bis zur ACMG-Klassifikation — teste dein diagnostisches Können.',
    seq_ql1_title: 'Read-Grundlagen', seq_ql1_desc: 'Varianten im BAM erkennen, Zygotie, Artefakte',
    seq_ql2_title: 'Diagnostische Strategie', seq_ql2_desc: 'Panel vs Exom vs Genom, Filterung, CNV-Erkennung',
    seq_ql3_title: 'Klinische Interpretation', seq_ql3_desc: 'ACMG-Klassifikation, klinische Vignetten, Staatsexamen-Stil',
    quiz_next: 'Nächste Frage →', quiz_quit: 'Quiz beenden',
    quiz_finished: 'Quiz beendet!', quiz_restart: 'Neues Quiz',

    mcadd_warning: '⚠ Die häufigste pathogene MCADD-Variante (c.985A>G) hat eine MAF von ~1,4% in Europäern. Ein MAF-Filter <1% wirft sie fälschlich raus! Bei autosomal-rezessiven Erkrankungen muss der MAF-Schwellenwert höher angesetzt werden.',

    pathway_pku: 'Phenylalanin → <strong>[PAH blockiert]</strong> → Tyrosin fehlt. Phenylalanin akkumuliert → neurotoxisch. Klassische PKU.',
    pathway_mcadd: 'Mittelkettige Fettsäuren → <strong>[ACADM blockiert]</strong> → Acetyl-CoA fehlt. Energiekrise bei Fasten. Hypoglykämie.',
    pathway_galactosemia: 'Galaktose-1-P → <strong>[GALT blockiert]</strong> → UDP-Glucose fehlt. Galaktose-1-P akkumuliert → Leberschaden, Katarakt.',
    pathway_fh: 'LDL im Blut → <strong>[LDLR defekt]</strong> → LDL kann nicht aufgenommen werden. LDL-Cholesterin ↑↑ → Atherosklerose.',
  },
  en: {
    seq_header: 'Sequencing Lab',
    seq_subtitle: 'BAM reads · variant filtering · ACMG · CNV · short vs long read',
    mode_learn: 'Learn', mode_explore: 'Explore', mode_quiz: 'Quiz',
    seq_s1_label: 'Reads', seq_s2_label: 'SNV', seq_s3_label: 'CNV',
    seq_s4_label: 'Panel/Exome/Genome', seq_s5_label: 'Filter', seq_s6_label: 'ACMG',
    seq_s7_label: 'Short/Long', seq_s8_label: 'Pathway',

    seq_s1_intro: 'Genomic data starts as <strong>reads</strong> — short fragments of DNA read by a sequencing machine. Each read is typically <strong>150 bp</strong> (Illumina short-read) or <strong>10,000+ bp</strong> (ONT/PacBio long-read). Many overlapping reads create <strong>coverage</strong> — the depth of sequencing. Imagine: we are looking for the cause of PKU in a newborn.',
    seq_s2_intro: 'Here you see actual reads in a <strong>BAM viewer</strong>. Each horizontal bar is a read. When about half the reads show an <strong>alternate allele</strong> at a position, the patient is <strong>heterozygous</strong> there. Select different cases and learn to distinguish real variants from artifacts.',
    seq_s3_intro: 'In a <strong>Copy Number Variation</strong> (CNV), entire genomic segments are deleted or duplicated. In the BAM you see a sudden <strong>coverage drop</strong> (deletion) or <strong>coverage increase</strong> (duplication). Long reads can span the breakpoint directly.',
    seq_s4_intro: 'Three strategies, one patient: <strong>Panel</strong> (50 genes, 500x, ~€300), <strong>Exome</strong> (20,000 genes, 100x, ~€800), <strong>Genome</strong> (everything, 30x, ~€1,500). Each finds different variants. A deep-intronic splice variant? Only the genome sees it.',
    seq_s5_intro: 'A genome yields <strong>4.5 million variants</strong>. Most are harmless. Systematic filters narrow down candidates: quality, allele frequency, protein effect, gene list, segregation. <strong>Watch out:</strong> In MCADD, the most common pathogenic variant has a MAF of 1.4% — a strict MAF filter will discard it!',
    seq_s6_intro: 'The <strong>ACMG classification system</strong> evaluates variants based on evidence criteria. Each criterion gives points — the sum determines the class: <strong>Pathogenic, Likely Pathogenic, VUS, Likely Benign, Benign</strong>. Try it: select criteria and watch the classification change.',
    seq_s7_intro: '<strong>Left:</strong> Illumina short-read (150 bp, low error rate). <strong>Right:</strong> Oxford Nanopore long-read (~10 kb, higher error rate). Same region, same patient — but note: in the repetitive Alu region, short-read cannot resolve the breakpoint. A single long read spans the entire region.',
    seq_s8_intro: 'From variant back to clinic: <strong>Why</strong> are we looking for this variant? Because a blocked enzyme disrupts the metabolic pathway — substrate accumulates, product is missing. Select a disease and block the enzyme.',

    seq_read_length: 'Read length', seq_coverage: 'Coverage',
    seq_to_snv: 'Detect SNVs →', seq_to_cnv: 'Detect CNVs →',
    seq_to_strategy: 'Strategies →', seq_to_filter: 'Filter variants →',
    seq_to_acmg: 'ACMG classification →', seq_to_shortlong: 'Short vs Long Read →',
    seq_to_pathway: 'Clinical context →',
    seq_switch_longread: 'Long-Read',
    seq_show_quality: 'Quality', seq_show_strand: 'Strand',
    seq_block_enzyme: 'Block enzyme',
    seq_genes: 'genes',
    back: '← Back', reset: 'Reset',
    explore_real_data: 'Explore real data →',
    all_modules: '← All modules',
    powered_by: 'powered by <a href="https://github.com/schlein-lab/nano-zyrkel-helix" target="_blank">nano-zyrkel</a>',

    case_pah_het: 'PAH — het SNV (PKU)',
    case_pah_hom: 'PAH — hom SNV',
    case_pah_comphet: 'PAH — compound het',
    case_artifact: 'Sequencing artifact',
    case_galt_del: 'GALT — exon deletion (galactosemia)',
    case_ldlr_dup: 'LDLR — Alu duplication (FH)',
    case_mcadd_filter: 'MCADD — MAF trap (c.985A>G)',
    case_pku_filter: 'PKU — standard AR case',
    case_fh_filter: 'FH — AD, dominant',

    seq_exp_bam: 'BAM Viewer', seq_exp_filter: 'Filter Workbench',
    seq_exp_acmg: 'ACMG Classifier', seq_exp_coverage: 'Coverage Compare',
    seq_exp_pathway: 'Pathway Explorer',

    filt_raw: 'Raw variants', filt_quality: 'Quality (PASS)',
    filt_maf: 'MAF < ', filt_coding: 'Coding / Splice',
    filt_effect: 'Protein effect', filt_genelist: 'Gene list',
    filt_segregation: 'Segregation (AR)', filt_acmg: 'ACMG evaluation',
    filt_maf_thresh: 'MAF threshold', filt_effect_filter: 'Effect filter',
    filt_inheritance: 'Inheritance',
    filt_all: 'All', filt_nonsyn: 'Non-synonymous', filt_lof: 'LoF only',
    filt_none: 'None', filt_ar: 'AR (hom/comp-het)', filt_ad: 'AD (het)', filt_denovo: 'De novo',

    acmg_pvs1: 'Null variant', acmg_ps1: 'Known AA change', acmg_ps3: 'Functional study',
    acmg_pm1: 'Hotspot', acmg_pm2: 'Absent in gnomAD', acmg_pp3: 'In silico', acmg_pp5: 'ClinVar P',
    acmg_ba1: 'MAF >5%', acmg_bs1: 'MAF too high', acmg_bs3: 'Func. normal',
    acmg_bp1: 'Missense (LoF gene)', acmg_bp4: 'In silico benign',

    seq_quiz_title: 'Sequencing & Genome Analysis Quiz',
    seq_quiz_sub: 'From read interpretation to ACMG classification — test your diagnostic skills.',
    seq_ql1_title: 'Read Basics', seq_ql1_desc: 'Identify variants in BAM, zygosity, artifacts',
    seq_ql2_title: 'Diagnostic Strategy', seq_ql2_desc: 'Panel vs exome vs genome, filtering, CNV recognition',
    seq_ql3_title: 'Clinical Interpretation', seq_ql3_desc: 'ACMG classification, clinical vignettes, Staatsexamen-style',
    quiz_next: 'Next question →', quiz_quit: 'End quiz',
    quiz_finished: 'Quiz finished!', quiz_restart: 'New quiz',

    mcadd_warning: '⚠ The most common pathogenic MCADD variant (c.985A>G) has a MAF of ~1.4% in Europeans. A MAF filter <1% will incorrectly discard it! For autosomal recessive diseases, the MAF threshold must be set higher.',

    pathway_pku: 'Phenylalanine → <strong>[PAH blocked]</strong> → Tyrosine missing. Phenylalanine accumulates → neurotoxic. Classical PKU.',
    pathway_mcadd: 'Medium-chain fatty acids → <strong>[ACADM blocked]</strong> → Acetyl-CoA missing. Energy crisis during fasting. Hypoglycemia.',
    pathway_galactosemia: 'Galactose-1-P → <strong>[GALT blocked]</strong> → UDP-glucose missing. Galactose-1-P accumulates → liver damage, cataracts.',
    pathway_fh: 'Blood LDL → <strong>[LDLR defective]</strong> → LDL cannot be cleared. LDL cholesterol ↑↑ → atherosclerosis.',
  },
};

helixI18n.registerI18n(I18N);

// ── State ────────────────────────────────────────────────────────

const state = {
  currentMode: 'learn',
  currentStep: 1,
  wasmReady: false,
  bamViewers: {},
  regionCache: {},
  vcfCache: {},
  acmgState: { selectedCriteria: new Set(), points: 0 },
  quiz: { level: 0, questions: [], current: 0, score: 0 },
  currentExplore: 'bam',
  filterState: { maf: 1.0, quality: true, coding: true, effect: true, genelist: true, segregation: true },
};

// ── Initialize ──────────────────────────────────────────────────

async function main() {
  try {
    await init();
    state.wasmReady = true;
  } catch (_) {
    // WASM may not be built yet — run in JS-only mode
    console.warn('WASM not available, running in JS-only mode');
  }

  setupModes();
  setupSteps();
  setupExplore();
  setupQuiz();
  setupACMG();
  setupFilterFunnel();
  setupPathway();
  applyI18n();

  // Load initial step
  loadStep(1);
}

// ── i18n application ────────────────────────────────────────────

function applyI18n() {
  const t = helixI18n.t;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}
window.addEventListener('helix:lang-changed', applyI18n);

// ── Mode switching ──────────────────────────────────────────────

function setupModes() {
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.mode;
      state.currentMode = mode;
      document.querySelectorAll('.mode-tab').forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.mode-panel').forEach(p =>
        p.classList.toggle('active', p.id === `mode-${mode}`)
      );
      if (mode === 'explore') loadExploreTab(state.currentExplore);
    });
  });

  // Goto-explore link
  const gotoExplore = document.getElementById('goto-explore');
  if (gotoExplore) {
    gotoExplore.addEventListener('click', e => {
      e.preventDefault();
      document.querySelector('[data-mode="explore"]').click();
    });
  }
}

// ── Step navigation ─────────────────────────────────────────────

function setupSteps() {
  document.querySelectorAll('.step').forEach(s => {
    s.addEventListener('click', () => loadStep(parseInt(s.dataset.step)));
  });
  document.querySelectorAll('.next-step-btn, .prev-step-btn').forEach(btn => {
    if (btn.dataset.go) {
      btn.addEventListener('click', e => {
        e.preventDefault();
        loadStep(parseInt(btn.dataset.go));
      });
    }
  });
}

function loadStep(step) {
  state.currentStep = step;
  document.querySelectorAll('.step').forEach(s => {
    const sn = parseInt(s.dataset.step);
    s.classList.toggle('active', sn === step);
    s.classList.toggle('completed', sn < step);
  });
  document.querySelectorAll('.learn-step').forEach(ls => {
    ls.classList.toggle('active', parseInt(ls.dataset.step) === step);
  });

  // Initialize step content
  switch (step) {
    case 1: initStep1(); break;
    case 2: initStep2(); break;
    case 3: initStep3(); break;
    case 4: initStep4(); break;
    case 5: initStep5(); break;
    case 6: initStep6(); break;
    case 7: initStep7(); break;
    case 8: initStep8(); break;
  }
}

// ── Step 1: What is a Read? ─────────────────────────────────────

function initStep1() {
  const canvas = document.getElementById('seq-read-canvas');
  const lenSlider = document.getElementById('read-len-slider');
  const covSlider = document.getElementById('coverage-slider');
  const lenVal = document.getElementById('read-len-val');
  const covVal = document.getElementById('coverage-val');
  const explainEl = document.getElementById('seq-explain-1');

  function update() {
    const readLen = parseInt(lenSlider.value);
    const coverage = parseInt(covSlider.value);
    lenVal.textContent = readLen >= 1000 ? `${(readLen / 1000).toFixed(1)} kb` : `${readLen} bp`;
    covVal.textContent = `${coverage}x`;
    renderReadDemo(canvas, readLen, coverage);

    const t = helixI18n.t;
    const isLong = readLen > 500;
    const tech = isLong ? 'Long-Read (ONT/PacBio)' : 'Short-Read (Illumina)';
    explainEl.innerHTML = isLong
      ? `<strong>${tech}</strong>: ${readLen >= 1000 ? (readLen/1000).toFixed(1) + ' kb' : readLen + ' bp'} Reads. Weniger Reads nötig, aber höhere Fehlerrate (~5-15%). Ideal für Strukturvarianten und repetitive Regionen.`
      : `<strong>${tech}</strong>: ${readLen} bp Reads. Hohe Genauigkeit (~0.1% Fehlerrate), aber kurze Fragmente. Standard für SNV- und kleine Indel-Detektion.`;
  }

  lenSlider.addEventListener('input', update);
  covSlider.addEventListener('input', update);

  // Reference track
  const refTrack = document.getElementById('seq-ref-track');
  const refSeq = 'ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG';
  refTrack.textContent = `chr12:103,234,200  ${refSeq.substring(0, 80)}...`;

  update();
}

// ── Step 2: SNV in Reads ────────────────────────────────────────

async function initStep2() {
  const caseSelect = document.getElementById('bam-s2-case');
  const canvas = document.getElementById('bam-s2-canvas');
  const refEl = document.getElementById('bam-s2-ref');
  const infoEl = document.getElementById('bam-s2-info');

  async function loadCase(caseName) {
    const data = await fetchRegion(`data/regions/${caseName}.json`);
    if (!data) return;
    const viewer = new BamViewer(canvas, { showStrand: true, highlightVariants: true });
    viewer.loadRegion(data);
    viewer.renderReference(refEl);
    viewer.renderVariantInfo(infoEl);
    state.bamViewers.step2 = viewer;
  }

  caseSelect.addEventListener('change', () => loadCase(caseSelect.value));
  await loadCase(caseSelect.value);
}

// ── Step 3: CNV ─────────────────────────────────────────────────

async function initStep3() {
  const caseSelect = document.getElementById('bam-s3-case');
  const canvas = document.getElementById('bam-s3-canvas');
  const covCanvas = document.getElementById('bam-s3-cov-canvas');
  const infoEl = document.getElementById('bam-s3-info');
  const techToggle = document.getElementById('s3-tech-toggle');
  let isLongRead = false;

  async function loadCase(caseName) {
    const path = isLongRead ? `data/regions_longread/${caseName}_ont.json` : `data/regions/${caseName}.json`;
    const data = await fetchRegion(path);
    if (!data) return;
    const viewer = new BamViewer(canvas, { showStrand: true, isLongRead });
    viewer.loadRegion(data);
    viewer.renderCoverage(covCanvas);
    viewer.renderVariantInfo(infoEl);
    state.bamViewers.step3 = viewer;

    // Mark CNV region
    if (data.variants && data.variants[0]) {
      const v = data.variants[0];
      const refLen = data.reference ? data.reference.length : 1000;
      const marker = document.getElementById('bam-s3-cnv-marker');
      if (marker && v.pos !== undefined && v.end !== undefined) {
        const pctLeft = (v.pos / refLen) * 100;
        const pctWidth = ((v.end - v.pos) / refLen) * 100;
        marker.style.left = `${pctLeft}%`;
        marker.style.width = `${pctWidth}%`;
      }
    }
  }

  techToggle.addEventListener('click', () => {
    isLongRead = !isLongRead;
    techToggle.classList.toggle('active', isLongRead);
    loadCase(caseSelect.value);
  });
  caseSelect.addEventListener('change', () => loadCase(caseSelect.value));
  await loadCase(caseSelect.value);
}

// ── Step 4: Panel vs Exome vs Genome ────────────────────────────

function initStep4() {
  const cards = document.querySelectorAll('.strategy-card');
  const findingEl = document.getElementById('strategy-finding');
  const canvas = document.getElementById('strategy-cov-canvas');
  const ctx = canvas.getContext('2d');
  const t = helixI18n.t;

  const findings = {
    panel: {
      de: '<strong>Panel (50 Gene, 500x):</strong> Hohe Coverage in Ziel-Genen → sehr sensitive SNV-Detektion. Aber: nur bekannte Gene. Neue Gen-Entdeckung unmöglich. Deep-intronische Varianten unsichtbar. Schnell, günstig, ideal als Erstlinien-Diagnostik.',
      en: '<strong>Panel (50 genes, 500x):</strong> High coverage in target genes → very sensitive SNV detection. But: only known genes. New gene discovery impossible. Deep-intronic variants invisible. Fast, affordable, ideal as first-line diagnostics.',
    },
    exome: {
      de: '<strong>Exom (20.000 Gene, 100x):</strong> Breite Abdeckung aller kodierenden Regionen. Kann neue Kandidatengene finden. Aber: GC-reiche Exons können schlecht abgedeckt sein. Intronische Varianten fehlen. Repetitive Regionen problematisch.',
      en: '<strong>Exome (20,000 genes, 100x):</strong> Broad coverage of all coding regions. Can discover new candidate genes. But: GC-rich exons may have poor coverage. Intronic variants missed. Repetitive regions problematic.',
    },
    genome: {
      de: '<strong>Genom (alles, 30x):</strong> Findet ALLES — SNVs, CNVs, SVs, deep-intronische Varianten, regulatorische Elemente. Aber: 4,5 Mio Varianten zu filtern. Niedrigere Coverage pro Position. Teurer. Der MSUD-Fall hier: Die deep-intronische BCKDHA-Variante wäre NUR im Genom sichtbar.',
      en: '<strong>Genome (everything, 30x):</strong> Finds EVERYTHING — SNVs, CNVs, SVs, deep-intronic variants, regulatory elements. But: 4.5M variants to filter. Lower coverage per position. More expensive. The MSUD case here: the deep-intronic BCKDHA variant would ONLY be visible in the genome.',
    },
  };

  function selectStrategy(strategy) {
    cards.forEach(c => c.classList.toggle('active', c.dataset.strategy === strategy));
    const lang = helixI18n.getLang();
    findingEl.innerHTML = findings[strategy][lang] || findings[strategy].en;
    renderStrategyCanvas(ctx, canvas, strategy);
  }

  cards.forEach(c => c.addEventListener('click', () => selectStrategy(c.dataset.strategy)));
  selectStrategy('panel');
}

function renderStrategyCanvas(ctx, canvas, strategy) {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0a0e17';
  ctx.fillRect(0, 0, W, H);

  // Simulate coverage profile for a gene region
  const bins = 100;
  const exonRegions = [[10, 20], [30, 35], [50, 58], [70, 78], [85, 95]]; // exon positions as fraction of bins

  const coverages = { panel: [], exome: [], genome: [] };
  for (let i = 0; i < bins; i++) {
    const inExon = exonRegions.some(([s, e]) => i >= s && i <= e);
    coverages.panel.push(inExon ? 500 + (Math.sin(i) * 50) : 0);
    coverages.exome.push(inExon ? 100 + (Math.sin(i * 2) * 30) : Math.random() * 3);
    coverages.genome.push(30 + (Math.sin(i * 3) * 5));
  }

  const data = coverages[strategy];
  const maxCov = Math.max(...data, 1);
  const binW = W / bins;

  // Exon background
  for (const [s, e] of exonRegions) {
    ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
    ctx.fillRect(s * binW, 0, (e - s + 1) * binW, H);
  }

  // Coverage bars
  for (let i = 0; i < bins; i++) {
    const h = (data[i] / maxCov) * (H - 15);
    ctx.fillStyle = data[i] === 0 ? '#ef4444' : '#06b6d4';
    ctx.fillRect(i * binW, H - 10 - h, binW - 0.5, h);
  }

  // Labels
  ctx.fillStyle = '#475569';
  ctx.font = '8px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`${strategy.toUpperCase()} | max: ${maxCov.toFixed(0)}x`, 4, 9);

  // Exon labels
  ctx.fillStyle = '#06b6d4';
  ctx.font = '7px sans-serif';
  ctx.textAlign = 'center';
  exonRegions.forEach(([s, e], idx) => {
    ctx.fillText(`E${idx + 1}`, ((s + e) / 2) * binW, H - 2);
  });
}

// ── Step 5: Filter Funnel ───────────────────────────────────────

function setupFilterFunnel() {
  const mafSlider = document.getElementById('maf-slider');
  const mafDisplay = document.getElementById('maf-threshold-display');
  const warningEl = document.getElementById('filter-warning');
  const caseSelect = document.getElementById('filter-case');

  // Filter counts per case
  const filterData = {
    mcadd: {
      counts: [4500000, 3800000, 45000, 800, 350, 12, 2, 1],
      mafTrap: true,
      causalMaf: 0.014,
    },
    pku: {
      counts: [4500000, 3800000, 42000, 780, 340, 10, 2, 1],
      mafTrap: false,
    },
    fh: {
      counts: [4500000, 3800000, 44000, 810, 360, 8, 3, 1],
      mafTrap: false,
    },
  };

  function updateFunnel() {
    const caseName = caseSelect.value;
    const data = filterData[caseName];
    const maf = parseFloat(mafSlider.value);
    mafDisplay.textContent = `${maf}%`;

    // Adjust count for MAF step based on slider
    const baseMafCount = data.counts[2];
    const adjustedMafCount = Math.round(baseMafCount * (maf / 1.0));

    const counts = [...data.counts];
    counts[2] = adjustedMafCount;
    // Propagate changes
    for (let i = 3; i < counts.length; i++) {
      counts[i] = Math.round(data.counts[i] * (adjustedMafCount / data.counts[2]));
    }

    // Check MAF trap
    if (data.mafTrap && maf < data.causalMaf * 100) {
      warningEl.innerHTML = helixI18n.t('mcadd_warning');
      warningEl.classList.add('visible');
      // The causal variant gets filtered out
      counts[counts.length - 1] = 0;
      counts[counts.length - 2] = Math.max(0, counts[counts.length - 2] - 1);
    } else {
      warningEl.classList.remove('visible');
    }

    // Update display
    for (let i = 0; i <= 7; i++) {
      const countEl = document.getElementById(`filt-count-${i}`);
      if (countEl) {
        countEl.textContent = counts[i].toLocaleString('de-DE');
      }
    }
  }

  if (mafSlider) mafSlider.addEventListener('input', updateFunnel);
  if (caseSelect) caseSelect.addEventListener('change', updateFunnel);
  document.querySelectorAll('.filt-check').forEach(cb => {
    cb.addEventListener('change', updateFunnel);
  });

  updateFunnel();
}

function initStep5() {
  setupFilterFunnel();
}

// ── Step 6: ACMG Classification ─────────────────────────────────

function setupACMG() {
  const grid = document.getElementById('acmg-criteria-grid');
  if (!grid) return;

  grid.querySelectorAll('.acmg-crit').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      updateACMGResult();
    });
  });

  // Load default variant card (CBS VUS)
  const card = document.getElementById('acmg-variant-card');
  if (card) {
    card.innerHTML = `
      <span class="av-gene">CBS</span>
      <span class="av-hgvs">c.833T>C (p.Ile278Thr)</span>
      <div class="av-info">Homocystinuria case — VUS, evaluate evidence</div>
    `;
  }
}

function updateACMGResult() {
  const grid = document.getElementById('acmg-criteria-grid');
  let points = 0;
  grid.querySelectorAll('.acmg-crit.selected').forEach(btn => {
    points += parseInt(btn.dataset.points) || 0;
  });

  const classEl = document.getElementById('acmg-classification');
  const ptsEl = document.getElementById('acmg-points-text');
  const markerEl = document.getElementById('acmg-bar-marker');

  let classification, cssClass;
  if (points >= 10) { classification = 'Pathogenic'; cssClass = 'pathogenic'; }
  else if (points >= 6) { classification = 'Likely Pathogenic'; cssClass = 'likely-pathogenic'; }
  else if (points >= -5) { classification = 'VUS'; cssClass = 'vus'; }
  else if (points >= -7) { classification = 'Likely Benign'; cssClass = 'likely-benign'; }
  else { classification = 'Benign'; cssClass = 'benign'; }

  if (classEl) {
    classEl.textContent = classification;
    classEl.className = `acmg-classification ${cssClass}`;
  }
  if (ptsEl) ptsEl.textContent = `${points} points`;

  // Move marker on bar (range: -12 to +16)
  if (markerEl) {
    const pct = Math.min(100, Math.max(0, ((points + 12) / 28) * 100));
    markerEl.style.left = `${pct}%`;
  }
}

function initStep6() {
  // Reset criteria
  document.querySelectorAll('#acmg-criteria-grid .acmg-crit').forEach(btn => {
    btn.classList.remove('selected');
  });
  updateACMGResult();
}

// ── Step 7: Short vs Long Read ──────────────────────────────────

async function initStep7() {
  const shortCanvas = document.getElementById('split-short-canvas');
  const longCanvas = document.getElementById('split-long-canvas');
  const infoEl = document.getElementById('split-info');

  // Load both datasets
  const shortData = await fetchRegion('data/regions/ldlr_dup.json');
  const longData = await fetchRegion('data/regions_longread/ldlr_dup_ont.json');

  if (shortData) {
    const sv = new BamViewer(shortCanvas, { showStrand: true });
    sv.loadRegion(shortData);
  }
  if (longData) {
    const lv = new BamViewer(longCanvas, { showStrand: true, isLongRead: true });
    lv.loadRegion(longData);
  }

  const lang = helixI18n.getLang();
  if (infoEl) {
    infoEl.innerHTML = lang === 'de'
      ? '<strong>Links (Illumina):</strong> Viele kurze Reads — Coverage gleichmäßig, SNVs präzise. Aber in der Alu-Region: Reads können nicht eindeutig gemappt werden, Breakpoint unklar.<br><strong>Rechts (ONT):</strong> Wenige lange Reads — ein Read spannt den gesamten Breakpoint. Strukturvariante sofort sichtbar.'
      : '<strong>Left (Illumina):</strong> Many short reads — coverage uniform, SNVs precise. But in the Alu region: reads cannot be uniquely mapped, breakpoint unclear.<br><strong>Right (ONT):</strong> Few long reads — one read spans the entire breakpoint. Structural variant immediately visible.';
  }
}

// ── Step 8: Metabolic Pathway ───────────────────────────────────

function setupPathway() {
  const blockBtn = document.getElementById('pathway-block-btn');
  const resetBtn = document.getElementById('pathway-reset-btn');
  const diseaseSelect = document.getElementById('pathway-disease');

  if (blockBtn) blockBtn.addEventListener('click', () => renderPathway(true));
  if (resetBtn) resetBtn.addEventListener('click', () => renderPathway(false));
  if (diseaseSelect) diseaseSelect.addEventListener('change', () => renderPathway(false));
}

function initStep8() {
  renderPathway(false);
}

function renderPathway(blocked) {
  const svg = document.getElementById('pathway-svg');
  const explainEl = document.getElementById('pathway-explain');
  const diseaseSelect = document.getElementById('pathway-disease');
  if (!svg || !diseaseSelect) return;

  const disease = diseaseSelect.value;
  const t = helixI18n.t;

  const pathways = {
    pku: {
      nodes: ['Phe', 'PAH', 'Tyr', 'Melanin'],
      enzyme: 1,
      colors: blocked ? ['#ef4444', '#ef4444', '#475569', '#475569'] : ['#06b6d4', '#10b981', '#06b6d4', '#06b6d4'],
    },
    mcadd: {
      nodes: ['C8-FA', 'ACADM', 'Acetyl-CoA', 'Energy'],
      enzyme: 1,
      colors: blocked ? ['#ef4444', '#ef4444', '#475569', '#475569'] : ['#06b6d4', '#10b981', '#06b6d4', '#06b6d4'],
    },
    galactosemia: {
      nodes: ['Gal-1-P', 'GALT', 'UDP-Glc', 'Glycogen'],
      enzyme: 1,
      colors: blocked ? ['#ef4444', '#ef4444', '#475569', '#475569'] : ['#06b6d4', '#10b981', '#06b6d4', '#06b6d4'],
    },
    fh: {
      nodes: ['LDL', 'LDLR', 'Uptake', 'Clearance'],
      enzyme: 1,
      colors: blocked ? ['#ef4444', '#ef4444', '#475569', '#475569'] : ['#06b6d4', '#10b981', '#06b6d4', '#06b6d4'],
    },
  };

  const pw = pathways[disease];
  if (!pw) return;

  const nodeWidth = 80;
  const gap = 30;
  const startX = 40;
  const y = 80;

  let svgContent = '';
  pw.nodes.forEach((name, i) => {
    const x = startX + i * (nodeWidth + gap);
    const isEnzyme = i === pw.enzyme;
    const color = pw.colors[i];
    const strokeColor = isEnzyme && blocked ? '#ef4444' : (isEnzyme ? '#10b981' : 'none');
    const strokeWidth = isEnzyme ? 2 : 0;
    const shape = isEnzyme
      ? `<rect x="${x}" y="${y - 15}" width="${nodeWidth}" height="30" rx="15" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="0.3"/>`
      : `<rect x="${x}" y="${y - 15}" width="${nodeWidth}" height="30" rx="5" fill="${color}" opacity="0.2"/>`;

    svgContent += shape;
    svgContent += `<text x="${x + nodeWidth/2}" y="${y + 4}" text-anchor="middle" fill="${color}" font-size="11" font-weight="600">${name}</text>`;

    // Arrow
    if (i < pw.nodes.length - 1) {
      const ax = x + nodeWidth + 2;
      const arrowColor = blocked && i >= pw.enzyme ? '#475569' : '#06b6d4';
      svgContent += `<line x1="${ax}" y1="${y}" x2="${ax + gap - 4}" y2="${y}" stroke="${arrowColor}" stroke-width="2" marker-end="url(#arrow)"/>`;
    }

    // Accumulation indicator
    if (blocked && i < pw.enzyme) {
      svgContent += `<text x="${x + nodeWidth/2}" y="${y - 22}" text-anchor="middle" fill="#ef4444" font-size="16" font-weight="700">↑↑</text>`;
    }
    if (blocked && i > pw.enzyme) {
      svgContent += `<text x="${x + nodeWidth/2}" y="${y - 22}" text-anchor="middle" fill="#475569" font-size="14">↓</text>`;
    }
    if (blocked && i === pw.enzyme) {
      svgContent += `<line x1="${x + 10}" y1="${y - 10}" x2="${x + nodeWidth - 10}" y2="${y + 10}" stroke="#ef4444" stroke-width="3"/>`;
      svgContent += `<line x1="${x + 10}" y1="${y + 10}" x2="${x + nodeWidth - 10}" y2="${y - 10}" stroke="#ef4444" stroke-width="3"/>`;
    }
  });

  // Arrow marker definition
  svg.innerHTML = `
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4"/>
      </marker>
    </defs>
    ${svgContent}
  `;

  // Explanation text
  if (blocked && explainEl) {
    explainEl.innerHTML = t(`pathway_${disease}`);
  } else if (explainEl) {
    explainEl.innerHTML = '';
  }
}

// ── Explore mode ────────────────────────────────────────────────

function setupExplore() {
  document.querySelectorAll('.explore-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const explore = tab.dataset.explore;
      state.currentExplore = explore;
      document.querySelectorAll('.explore-tab').forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.explore-panel').forEach(p =>
        p.classList.toggle('active', p.dataset.explore === explore)
      );
      loadExploreTab(explore);
    });
  });
}

async function loadExploreTab(tab) {
  switch (tab) {
    case 'bam': await loadExploreBam(); break;
    case 'filter': await loadExploreFilter(); break;
    case 'acmg': loadExploreACMG(); break;
    case 'coverage': loadExploreCoverage(); break;
    case 'pathway': loadExplorePathway(); break;
  }
}

async function loadExploreBam() {
  const regionSelect = document.getElementById('exp-bam-region');
  if (!regionSelect) return;

  // Populate region selector
  const regions = [
    { file: 'pah_snv_het', label: 'PAH — het SNV (PKU)' },
    { file: 'pah_snv_hom', label: 'PAH — hom SNV' },
    { file: 'pah_compound_het', label: 'PAH — compound het' },
    { file: 'artifact', label: 'Sequencing artifact' },
    { file: 'galt_exon_del', label: 'GALT — exon deletion' },
    { file: 'ldlr_dup', label: 'LDLR — Alu duplication' },
  ];

  if (regionSelect.options.length === 0) {
    regions.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.file;
      opt.textContent = r.label;
      regionSelect.appendChild(opt);
    });
  }

  const canvas = document.getElementById('exp-bam-canvas');
  const refEl = document.getElementById('exp-bam-ref');
  const infoEl = document.getElementById('exp-bam-info');
  const covEl = document.getElementById('exp-bam-coverage');
  const showQ = document.getElementById('exp-show-quality');
  const showS = document.getElementById('exp-show-strand');
  const techToggle = document.getElementById('exp-tech-toggle');
  let isLong = false;

  async function loadRegion() {
    const file = regionSelect.value;
    const path = isLong ? `data/regions_longread/${file}_ont.json` : `data/regions/${file}.json`;
    const data = await fetchRegion(path);
    if (!data) return;
    const viewer = new BamViewer(canvas, {
      showQuality: showQ && showQ.checked,
      showStrand: showS && showS.checked,
      isLongRead: isLong,
    });
    viewer.loadRegion(data);
    viewer.renderReference(refEl);
    viewer.renderVariantInfo(infoEl);
    state.bamViewers.explore = viewer;
  }

  regionSelect.addEventListener('change', loadRegion);
  if (techToggle) {
    techToggle.addEventListener('click', () => {
      isLong = !isLong;
      techToggle.classList.toggle('active', isLong);
      loadRegion();
    });
  }
  if (showQ) showQ.addEventListener('change', () => {
    if (state.bamViewers.explore) {
      state.bamViewers.explore.setOption('showQuality', showQ.checked);
    }
  });
  if (showS) showS.addEventListener('change', () => {
    if (state.bamViewers.explore) {
      state.bamViewers.explore.setOption('showStrand', showS.checked);
    }
  });

  await loadRegion();
}

async function loadExploreFilter() {
  const caseSelect = document.getElementById('exp-filter-case');
  const resultsEl = document.getElementById('exp-filter-results');
  const countEl = document.getElementById('exp-filter-count');
  if (!caseSelect || !resultsEl) return;

  const cases = [
    { file: 'case_ar_mcadd', label: 'MCADD — AR (MAF trap)' },
    { file: 'case_ar_pku', label: 'PKU — AR (compound het)' },
    { file: 'case_ad_fh', label: 'FH — AD (dominant)' },
    { file: 'case_denovo', label: 'De novo — CBS' },
  ];

  if (caseSelect.options.length === 0) {
    cases.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.file;
      opt.textContent = c.label;
      caseSelect.appendChild(opt);
    });
  }

  const mafSlider = document.getElementById('exp-maf');
  const mafVal = document.getElementById('exp-maf-val');
  const effectFilter = document.getElementById('exp-effect-filter');
  const inheritanceFilter = document.getElementById('exp-inheritance');

  async function loadAndFilter() {
    const data = await fetchVcf(`data/vcf_cases/${caseSelect.value}.json`);
    if (!data || !data.variants) return;

    const maf = parseFloat(mafSlider.value) / 100;
    const effect = effectFilter.value;
    const inheritance = inheritanceFilter.value;

    if (mafVal) mafVal.textContent = `${mafSlider.value}%`;

    let filtered = data.variants.filter(v => v.quality === 'PASS');
    if (maf > 0) filtered = filtered.filter(v => (v.maf_gnomad || 0) <= maf);
    if (effect === 'nonsynonymous') filtered = filtered.filter(v => v.effect !== 'synonymous' && v.effect !== 'intronic');
    if (effect === 'lof') filtered = filtered.filter(v => ['frameshift', 'nonsense', 'splice'].includes(v.effect));
    if (inheritance === 'ar') filtered = filtered.filter(v => v.zygosity === 'hom' || data.variants.filter(v2 => v2.gene === v.gene && v2.zygosity === 'het').length >= 2);
    if (inheritance === 'ad') filtered = filtered.filter(v => v.zygosity === 'het');
    if (inheritance === 'denovo') filtered = filtered.filter(v => v.in_father === false && v.in_mother === false);

    if (countEl) countEl.textContent = `${filtered.length} / ${data.variants.length}`;

    // Render table
    let html = `<div class="frt-row frt-header">
      <span>Gene</span><span>HGVS</span><span>MAF</span><span>Effect</span><span>ACMG</span>
    </div>`;
    filtered.slice(0, 50).forEach(v => {
      const acmgClass = { P: 'p', LP: 'lp', VUS: 'vus', LB: 'lb', B: 'b' }[v.acmg_classification] || 'vus';
      html += `<div class="frt-row${v.is_causal ? ' style="background:rgba(239,68,68,0.08)"' : ''}">
        <span class="frt-gene">${v.gene}</span>
        <span class="frt-hgvs" title="${v.hgvs_c} ${v.hgvs_p || ''}">${v.hgvs_c}</span>
        <span class="frt-maf">${v.maf_gnomad !== undefined ? v.maf_gnomad.toFixed(4) : '—'}</span>
        <span class="frt-effect">${v.effect}</span>
        <span class="frt-acmg ${acmgClass}">${v.acmg_classification}</span>
      </div>`;
    });
    resultsEl.innerHTML = html;
  }

  caseSelect.addEventListener('change', loadAndFilter);
  if (mafSlider) mafSlider.addEventListener('input', loadAndFilter);
  if (effectFilter) effectFilter.addEventListener('change', loadAndFilter);
  if (inheritanceFilter) inheritanceFilter.addEventListener('change', loadAndFilter);

  await loadAndFilter();
}

function loadExploreACMG() {
  // Reuses the same ACMG grid logic from Step 6
  // In the explore panel, we'll load different variants from acmg_variants.json
  const variantSelect = document.getElementById('exp-acmg-variant');
  if (!variantSelect || variantSelect.options.length > 0) return;

  fetchJSON('data/acmg_variants.json').then(data => {
    if (!data) return;
    data.slice(0, 20).forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = `${v.gene} ${v.hgvs_c} (${v.correct_classification})`;
      opt.dataset.variant = JSON.stringify(v);
      variantSelect.appendChild(opt);
    });
  });
}

function loadExploreCoverage() {
  const geneSelect = document.getElementById('exp-cov-gene');
  if (!geneSelect || geneSelect.options.length > 0) return;

  const genes = ['PAH', 'ACADM', 'GALT', 'LDLR', 'CBS', 'BCKDHA', 'FTO'];
  genes.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.toLowerCase();
    opt.textContent = g;
    geneSelect.appendChild(opt);
  });

  // Canvas rendering will use coverage_profiles.json
  geneSelect.addEventListener('change', () => renderCoverageCompare());
  renderCoverageCompare();
}

function renderCoverageCompare() {
  const canvas = document.getElementById('exp-cov-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0a0e17';
  ctx.fillRect(0, 0, W, H);

  const showPanel = document.getElementById('exp-cov-panel')?.checked;
  const showExome = document.getElementById('exp-cov-exome')?.checked;
  const showGenome = document.getElementById('exp-cov-genome')?.checked;

  // Generate synthetic coverage for demonstration
  const bins = 200;
  const exons = [[20, 40], [60, 75], [90, 110], [130, 145], [160, 180]];

  const draw = (data, color, maxVal) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = (i / bins) * W;
      const y = H - 5 - (data[i] / maxVal) * (H - 15);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  const panelData = [], exomeData = [], genomeData = [];
  for (let i = 0; i < bins; i++) {
    const inExon = exons.some(([s, e]) => i >= s && i <= e);
    panelData.push(inExon ? 450 + Math.random() * 100 : 0);
    exomeData.push(inExon ? 80 + Math.random() * 40 : Math.random() * 5);
    genomeData.push(28 + Math.random() * 8);
  }

  const maxVal = 600;
  if (showGenome) draw(genomeData, '#10b981', maxVal);
  if (showExome) draw(exomeData, '#f59e0b', maxVal);
  if (showPanel) draw(panelData, '#06b6d4', maxVal);

  // Exon regions
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  exons.forEach(([s, e]) => {
    ctx.fillRect((s / bins) * W, 0, ((e - s) / bins) * W, H);
  });

  // Update legend
  const legend = document.getElementById('exp-cov-legend');
  if (legend) {
    legend.innerHTML = [
      showPanel && '<span class="cov-legend-item"><span class="cov-legend-dot" style="background:#06b6d4"></span>Panel (500x)</span>',
      showExome && '<span class="cov-legend-item"><span class="cov-legend-dot" style="background:#f59e0b"></span>Exome (100x)</span>',
      showGenome && '<span class="cov-legend-item"><span class="cov-legend-dot" style="background:#10b981"></span>Genome (30x)</span>',
    ].filter(Boolean).join('');
  }
}

function loadExplorePathway() {
  // Reuses the pathway rendering from Step 8
}

// ── Quiz ────────────────────────────────────────────────────────

function setupQuiz() {
  document.querySelectorAll('.quiz-level').forEach(btn => {
    btn.addEventListener('click', () => startQuiz(parseInt(btn.dataset.level)));
  });

  const nextBtn = document.getElementById('quiz-next-btn');
  const quitBtn = document.getElementById('quiz-quit-btn');
  const restartBtn = document.getElementById('quiz-restart-btn');

  if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
  if (quitBtn) quitBtn.addEventListener('click', endQuiz);
  if (restartBtn) restartBtn.addEventListener('click', () => {
    document.getElementById('quiz-result').style.display = 'none';
    document.getElementById('quiz-start').style.display = '';
  });
}

function startQuiz(level) {
  state.quiz = { level, questions: generateQuizQuestions(level), current: 0, score: 0 };
  document.getElementById('quiz-start').style.display = 'none';
  document.getElementById('quiz-game').style.display = '';
  showQuestion();
}

function generateQuizQuestions(level) {
  const t = helixI18n.t;
  const lang = helixI18n.getLang();

  const questions = {
    1: [ // Read Basics
      {
        q: lang === 'de' ? 'In einem BAM-Viewer zeigen 15 von 30 Reads an Position chr12:103234280 ein T statt C. Was ist die wahrscheinlichste Interpretation?' : 'In a BAM viewer, 15 of 30 reads at position chr12:103234280 show T instead of C. What is the most likely interpretation?',
        options: [
          lang === 'de' ? 'Homozygote Variante' : 'Homozygous variant',
          lang === 'de' ? 'Heterozygote Variante' : 'Heterozygous variant',
          lang === 'de' ? 'Sequenzierartefakt' : 'Sequencing artifact',
          lang === 'de' ? 'Somatische Mosaik-Variante' : 'Somatic mosaic variant',
        ],
        correct: 1,
        feedback: lang === 'de' ? '~50% der Reads mit alternativer Base = heterozygot. Bei homozygot wären ~100% alternativ, bei Artefakt typischerweise <10% und nur auf einem Strang.' : '~50% of reads with alternate base = heterozygous. Homozygous would be ~100% alternate, artifacts typically <10% and strand-biased.',
      },
      {
        q: lang === 'de' ? '3 von 30 Reads zeigen eine Insertion, alle auf dem gleichen Strang (+). Was deutet das an?' : '3 of 30 reads show an insertion, all on the same strand (+). What does this suggest?',
        options: [
          lang === 'de' ? 'Echte heterozygote Insertion' : 'True heterozygous insertion',
          lang === 'de' ? 'Sequenzierartefakt (Strandbias)' : 'Sequencing artifact (strand bias)',
          lang === 'de' ? 'Somatisches Mosaik' : 'Somatic mosaic',
          lang === 'de' ? 'Homopolymer-Fehler' : 'Homopolymer error',
        ],
        correct: 1,
        feedback: lang === 'de' ? 'Strandbias ist ein klassisches Zeichen für ein Artefakt: Die Variante erscheint nur auf Reads eines Strangs und bei niedrigem Anteil (<10%). Echte Varianten zeigen beide Strangrichtungen proportional.' : 'Strand bias is a classic sign of an artifact: the variant appears only on reads from one strand and at low allele fraction (<10%). True variants show both strand directions proportionally.',
      },
      {
        q: lang === 'de' ? 'Was bedeutet eine Coverage von 30x an einer Position?' : 'What does 30x coverage at a position mean?',
        options: [
          lang === 'de' ? '30 verschiedene Reads decken diese Position ab' : '30 different reads cover this position',
          lang === 'de' ? 'Die Qualität beträgt Phred 30' : 'The quality is Phred 30',
          lang === 'de' ? '30% des Genoms wurden sequenziert' : '30% of the genome was sequenced',
          lang === 'de' ? '30 Varianten wurden gefunden' : '30 variants were found',
        ],
        correct: 0,
        feedback: lang === 'de' ? 'Coverage (Abdeckungstiefe) gibt an, wie viele Reads eine bestimmte Position überlappen. 30x bedeutet: 30 unabhängige Reads liefern Information über diese Base.' : 'Coverage (depth) indicates how many reads overlap a given position. 30x means: 30 independent reads provide information about this base.',
      },
      {
        q: lang === 'de' ? 'Patient mit PAH c.1222C>T het und PAH c.1066-11G>A het. Wie nennt man diesen Genotyp?' : 'Patient with PAH c.1222C>T het and PAH c.1066-11G>A het. What is this genotype called?',
        options: [
          lang === 'de' ? 'Homozygot' : 'Homozygous',
          lang === 'de' ? 'Compound-heterozygot' : 'Compound heterozygous',
          lang === 'de' ? 'Hemizygot' : 'Hemizygous',
          lang === 'de' ? 'Doppel-heterozygot' : 'Double heterozygous',
        ],
        correct: 1,
        feedback: lang === 'de' ? 'Compound-heterozygot: zwei verschiedene pathogene Varianten im gleichen Gen, jeweils auf einem Allel (in trans). Typisch für autosomal-rezessive Erkrankungen.' : 'Compound heterozygous: two different pathogenic variants in the same gene, each on one allele (in trans). Typical for autosomal recessive diseases.',
      },
      {
        q: lang === 'de' ? 'Was ist der Vorteil von Long-Read-Sequenzierung (ONT/PacBio) gegenüber Short-Read (Illumina)?' : 'What is the advantage of long-read sequencing (ONT/PacBio) over short-read (Illumina)?',
        options: [
          lang === 'de' ? 'Niedrigere Fehlerrate bei SNVs' : 'Lower error rate for SNVs',
          lang === 'de' ? 'Bessere Erkennung von Strukturvarianten und Phasing' : 'Better detection of structural variants and phasing',
          lang === 'de' ? 'Höhere Coverage bei gleichem Preis' : 'Higher coverage at the same price',
          lang === 'de' ? 'Schnellere Bibliotheksvorbereitung' : 'Faster library preparation',
        ],
        correct: 1,
        feedback: lang === 'de' ? 'Long-Reads spannen repetitive Regionen und SV-Breakpoints. Ein einzelner Read kann eine ganze Duplikation oder Deletion überspannen. Phasing (Zuordnung zu Allelen) wird direkt möglich.' : 'Long reads span repetitive regions and SV breakpoints. A single read can span an entire duplication or deletion. Phasing (allele assignment) becomes directly possible.',
      },
    ],
    2: [ // Diagnostic Strategy
      {
        q: lang === 'de' ? 'Ein Patient mit V.a. Stoffwechselerkrankung. Neugeborenenscreening auffällig (C8↑). Welche Sequenzierungsstrategie empfehlen Sie als Erstlinien-Diagnostik?' : 'A patient with suspected metabolic disease. Abnormal newborn screening (C8↑). Which sequencing strategy do you recommend as first-line diagnostics?',
        options: [
          lang === 'de' ? 'Genomsequenzierung (30x)' : 'Genome sequencing (30x)',
          lang === 'de' ? 'Stoffwechsel-Gen-Panel (50 Gene, 500x)' : 'Metabolic gene panel (50 genes, 500x)',
          lang === 'de' ? 'Exomsequenzierung (100x)' : 'Exome sequencing (100x)',
          lang === 'de' ? 'Sanger-Sequenzierung von ACADM' : 'Sanger sequencing of ACADM',
        ],
        correct: 1,
        feedback: lang === 'de' ? 'Bei klarem klinischem Verdacht (C8↑ → V.a. MCADD) ist ein zielgerichtetes Panel die Erstlinien-Wahl: hohe Coverage (500x), schnell, günstig. Sanger wäre zu eng (nur 1 Gen). Exom/Genom sind Reserve für unklare Fälle.' : 'With clear clinical suspicion (C8↑ → suspected MCADD), a targeted panel is first-line: high coverage (500x), fast, affordable. Sanger would be too narrow (1 gene only). Exome/genome are reserved for unclear cases.',
      },
      {
        q: lang === 'de' ? 'Die MCADD-Variante c.985A>G (p.Lys329Glu) hat eine gnomAD-MAF von 1,4% bei Europäern. Ihr MAF-Filter ist auf <1% gesetzt. Was passiert?' : 'The MCADD variant c.985A>G (p.Lys329Glu) has a gnomAD MAF of 1.4% in Europeans. Your MAF filter is set to <1%. What happens?',
        options: [
          lang === 'de' ? 'Die Variante wird korrekt als pathogen erkannt' : 'The variant is correctly identified as pathogenic',
          lang === 'de' ? 'Die Variante wird herausgefiltert (falsch-negativ!)' : 'The variant is filtered out (false negative!)',
          lang === 'de' ? 'Die Variante erscheint als VUS' : 'The variant appears as VUS',
          lang === 'de' ? 'Die Variante wird als benigne klassifiziert' : 'The variant is classified as benign',
        ],
        correct: 1,
        feedback: lang === 'de' ? 'KRITISCHER Lehrpunkt: Bei AR-Erkrankungen können pathogene Varianten eine hohe Trägerfrequenz haben (Heterozygoten-Vorteil, Founder-Effekt). Der MAF-Filter muss für AR-Erkrankungen höher gesetzt werden (z.B. <2-5%).' : 'CRITICAL teaching point: In AR diseases, pathogenic variants can have high carrier frequencies (heterozygote advantage, founder effect). The MAF filter must be set higher for AR diseases (e.g., <2-5%).',
      },
      {
        q: lang === 'de' ? 'In der Coverage-Analyse eines Exoms sehen Sie bei GALT einen plötzlichen Abfall von 100x auf 0x über 2 Exons. Was ist die wahrscheinlichste Ursache?' : 'In the coverage analysis of an exome, you see a sudden drop from 100x to 0x over 2 exons in GALT. What is the most likely cause?',
        options: [
          lang === 'de' ? 'Technisches Problem bei der Sequenzierung' : 'Technical sequencing problem',
          lang === 'de' ? 'Homozygote Exon-Deletion (CNV)' : 'Homozygous exon deletion (CNV)',
          lang === 'de' ? 'GC-reiche Region mit schlechter Abdeckung' : 'GC-rich region with poor coverage',
          lang === 'de' ? 'Mapping-Artefakt' : 'Mapping artifact',
        ],
        correct: 1,
        feedback: lang === 'de' ? 'Ein vollständiger Coverage-Abfall auf 0 über mehrere Exons spricht für eine homozygote Deletion. Bei heterozygoter Deletion wäre die Coverage auf ~50% reduziert. GC-Dropout betrifft meist einzelne Exons, nicht konsekutive.' : 'A complete coverage drop to 0 over multiple exons indicates homozygous deletion. Heterozygous deletion would reduce coverage to ~50%. GC dropout typically affects single exons, not consecutive ones.',
      },
      {
        q: lang === 'de' ? 'Exom und Panel waren negativ bei einem Patienten mit klinisch gesicherter MSUD. Was ist der nächste diagnostische Schritt?' : 'Exome and panel were negative in a patient with clinically confirmed MSUD. What is the next diagnostic step?',
        options: [
          lang === 'de' ? 'Wiederholung des Panels' : 'Repeat the panel',
          lang === 'de' ? 'Genomsequenzierung (deep-intronische Varianten?)' : 'Genome sequencing (deep-intronic variants?)',
          lang === 'de' ? 'RNA-Sequenzierung' : 'RNA sequencing',
          lang === 'de' ? 'Chromosomale Microarray' : 'Chromosomal microarray',
        ],
        correct: 1,
        feedback: lang === 'de' ? 'Wenn Exom und Panel negativ sind, können deep-intronische Varianten vorliegen, die kryptische Splice-Sites aktivieren. Nur die Genomsequenzierung erfasst den nicht-kodierenden Bereich. RNA-Seq wäre ebenfalls sinnvoll als komplementärer Ansatz.' : 'When exome and panel are negative, deep-intronic variants may be present that activate cryptic splice sites. Only genome sequencing captures the non-coding region. RNA-Seq would also be useful as a complementary approach.',
      },
      {
        q: lang === 'de' ? 'Was zeigt ein Coverage-Anstieg auf ~60x in einer Region, die normalerweise 30x hat (Genomsequenzierung)?' : 'What does a coverage increase to ~60x indicate in a region that normally has 30x (genome sequencing)?',
        options: [
          lang === 'de' ? 'Sequenzierartefakt' : 'Sequencing artifact',
          lang === 'de' ? 'Heterozygote Duplikation' : 'Heterozygous duplication',
          lang === 'de' ? 'Homozygote Duplikation' : 'Homozygous duplication',
          lang === 'de' ? 'Kontamination mit fremder DNA' : 'Contamination with foreign DNA',
        ],
        correct: 1,
        feedback: lang === 'de' ? '~2x Coverage-Anstieg = heterozygote Duplikation (3 Kopien statt 2, also 30x × 1.5 = ~45x, oder bei Tandem-Duplikation bis ~60x). Homozygote Duplikation würde ~90x zeigen (4 Kopien).' : '~2x coverage increase = heterozygous duplication (3 copies instead of 2, so 30x × 1.5 = ~45x, or up to ~60x for tandem duplication). Homozygous duplication would show ~90x (4 copies).',
      },
    ],
    3: [ // Clinical Interpretation
      {
        q: lang === 'de' ? 'Variante: CBS c.833T>C (p.Ile278Thr). gnomAD-MAF: 0.00003. CADD: 27. REVEL: 0.72. Funktionelle Studie: 15% Restaktivität. Korrekte ACMG-Klassifikation?' : 'Variant: CBS c.833T>C (p.Ile278Thr). gnomAD MAF: 0.00003. CADD: 27. REVEL: 0.72. Functional study: 15% residual activity. Correct ACMG classification?',
        options: ['Pathogenic', 'Likely Pathogenic', 'VUS', 'Likely Benign'],
        correct: 1,
        feedback: lang === 'de' ? 'PS3 (funktionelle Studie: reduzierte Aktivität) + PM2 (absent/selten in gnomAD) + PP3 (in silico: CADD 27, REVEL 0.72 stützen Pathogenität) = Likely Pathogenic. Für Pathogenic fehlt ein weiteres starkes Kriterium.' : 'PS3 (functional study: reduced activity) + PM2 (absent/rare in gnomAD) + PP3 (in silico: CADD 27, REVEL 0.72 support pathogenicity) = Likely Pathogenic. For Pathogenic, an additional strong criterion is needed.',
      },
      {
        q: lang === 'de' ? '3 Tage altes NG, Trinkschwäche, Lethargie. Tandem-MS: C8↑, C8/C10-Ratio↑. Genetik: ACADM c.985A>G homozygot. Welche Diagnose?' : '3-day-old newborn, poor feeding, lethargy. Tandem-MS: C8↑, C8/C10 ratio↑. Genetics: ACADM c.985A>G homozygous. What is the diagnosis?',
        options: ['PKU', 'MCADD', 'MSUD', 'Galactosemia'],
        correct: 1,
        feedback: lang === 'de' ? 'C8 (Octanoylcarnitin) erhöht + C8/C10-Ratio + ACADM-Variante = MCADD (Medium-Chain Acyl-CoA Dehydrogenase Deficiency). Häufigste Fettsäureoxidationsstörung. Die c.985A>G ist die häufigste europäische Founder-Variante.' : 'C8 (octanoylcarnitine) elevated + C8/C10 ratio + ACADM variant = MCADD (Medium-Chain Acyl-CoA Dehydrogenase Deficiency). Most common fatty acid oxidation disorder. c.985A>G is the most common European founder variant.',
      },
      {
        q: lang === 'de' ? 'LDL-Cholesterin: 380 mg/dl (Norm <130). Familienanamnese: Vater MI mit 42J. Genetik: LDLR c.682G>A het. Welche Therapie ist am relevantesten?' : 'LDL cholesterol: 380 mg/dl (normal <130). Family history: father MI at 42y. Genetics: LDLR c.682G>A het. Which therapy is most relevant?',
        options: [
          lang === 'de' ? 'Nur Diät' : 'Diet only',
          lang === 'de' ? 'Statin-Hochdosis + PCSK9-Inhibitor' : 'High-dose statin + PCSK9 inhibitor',
          lang === 'de' ? 'Aspirin' : 'Aspirin',
          lang === 'de' ? 'Gentherapie' : 'Gene therapy',
        ],
        correct: 1,
        feedback: lang === 'de' ? 'Heterozygote FH mit LDL 380 und positiver Familienanamnese: Hochdosis-Statin als Basis + PCSK9-Inhibitor (Evolocumab/Alirocumab) für zusätzliche 50-60% LDL-Senkung. Frühzeitige aggressive Therapie reduziert kardiovaskuläres Risiko.' : 'Heterozygous FH with LDL 380 and positive family history: high-dose statin as baseline + PCSK9 inhibitor (evolocumab/alirocumab) for additional 50-60% LDL reduction. Early aggressive therapy reduces cardiovascular risk.',
      },
      {
        q: lang === 'de' ? 'ACMG-Kriterium PVS1 (Very Strong Pathogenic) gilt für welchen Variantentyp?' : 'ACMG criterion PVS1 (Very Strong Pathogenic) applies to which variant type?',
        options: [
          lang === 'de' ? 'Jede Missense-Variante' : 'Any missense variant',
          lang === 'de' ? 'Null-Varianten (Nonsense, Frameshift, kanonische Splice-Site) in Genen mit LoF-Mechanismus' : 'Null variants (nonsense, frameshift, canonical splice) in genes with LoF mechanism',
          lang === 'de' ? 'Synonyme Varianten in konservierten Regionen' : 'Synonymous variants in conserved regions',
          lang === 'de' ? 'Jede de-novo-Variante' : 'Any de novo variant',
        ],
        correct: 1,
        feedback: lang === 'de' ? 'PVS1 gilt nur für Null-Varianten (Frameshift, Nonsense, ±1,2 Splice) in Genen, bei denen Loss-of-Function der bekannte Pathomechanismus ist. Wichtig: bei Genen mit Gain-of-Function-Mechanismus gilt PVS1 NICHT.' : 'PVS1 applies only to null variants (frameshift, nonsense, ±1,2 splice) in genes where loss-of-function is the known pathomechanism. Important: PVS1 does NOT apply in genes with gain-of-function mechanism.',
      },
      {
        q: lang === 'de' ? 'Trio-Sequenzierung: Kind hat CBS c.833T>C. Variante weder bei Vater noch bei Mutter nachweisbar. Was bedeutet das?' : 'Trio sequencing: child has CBS c.833T>C. Variant not detected in father or mother. What does this mean?',
        options: [
          lang === 'de' ? 'Laborverwechslung' : 'Lab mix-up',
          lang === 'de' ? 'De-novo-Variante (starkes Pathogenitäts-Argument)' : 'De novo variant (strong pathogenicity argument)',
          lang === 'de' ? 'X-chromosomale Vererbung' : 'X-linked inheritance',
          lang === 'de' ? 'Benigne Variante' : 'Benign variant',
        ],
        correct: 1,
        feedback: lang === 'de' ? 'De-novo-Variante: entsteht neu in der Keimbahn des Kindes. In der ACMG-Klassifikation ist PS2 (de novo, bestätigte Elternschaft) ein starkes Kriterium für Pathogenität. Allerdings: CBS ist typisch AR, daher wäre eine einzelne de-novo-Variante allein nicht ausreichend.' : 'De novo variant: arises newly in the child\'s germline. In ACMG classification, PS2 (de novo, confirmed parentage) is a strong criterion for pathogenicity. However: CBS is typically AR, so a single de novo variant alone would not be sufficient.',
      },
    ],
  };

  return questions[level] || [];
}

function showQuestion() {
  const q = state.quiz;
  if (q.current >= q.questions.length) { endQuiz(); return; }

  const question = q.questions[q.current];
  document.getElementById('quiz-progress-text').textContent = `${q.current + 1} / ${q.questions.length}`;
  document.getElementById('quiz-progress-fill').style.width = `${((q.current + 1) / q.questions.length) * 100}%`;
  document.getElementById('quiz-score-text').textContent = `Score: ${q.score}`;
  document.getElementById('quiz-question').innerHTML = question.q;
  document.getElementById('quiz-feedback').classList.remove('visible');
  document.getElementById('quiz-next-btn').style.display = 'none';

  const optionsEl = document.getElementById('quiz-options');
  optionsEl.innerHTML = '';
  question.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt;
    btn.addEventListener('click', () => answerQuestion(i));
    optionsEl.appendChild(btn);
  });
}

function answerQuestion(idx) {
  const q = state.quiz;
  const question = q.questions[q.current];
  const options = document.querySelectorAll('#quiz-options .quiz-option');

  options.forEach((opt, i) => {
    opt.style.pointerEvents = 'none';
    if (i === question.correct) opt.classList.add('correct');
    if (i === idx && i !== question.correct) opt.classList.add('wrong');
  });

  if (idx === question.correct) q.score++;

  const feedback = document.getElementById('quiz-feedback');
  feedback.innerHTML = question.feedback;
  feedback.classList.add('visible');
  document.getElementById('quiz-next-btn').style.display = '';
  document.getElementById('quiz-score-text').textContent = `Score: ${q.score}`;
}

function nextQuestion() {
  state.quiz.current++;
  showQuestion();
}

function endQuiz() {
  const q = state.quiz;
  document.getElementById('quiz-game').style.display = 'none';
  document.getElementById('quiz-result').style.display = '';
  document.getElementById('quiz-final-score').textContent = `${q.score} / ${q.questions.length}`;

  const pct = q.questions.length ? (q.score / q.questions.length) * 100 : 0;
  const t = helixI18n.t;
  const lang = helixI18n.getLang();
  let msg;
  if (pct >= 80) msg = lang === 'de' ? 'Ausgezeichnet! Du beherrschst die Genomanalyse.' : 'Excellent! You have mastered genome analysis.';
  else if (pct >= 50) msg = lang === 'de' ? 'Gut gemacht! Einige Themen solltest du nochmal wiederholen.' : 'Well done! Review some topics for improvement.';
  else msg = lang === 'de' ? 'Weiter üben — geh die Learn-Lektionen nochmal durch.' : 'Keep practicing — review the Learn lessons again.';
  document.getElementById('quiz-final-feedback').textContent = msg;
}

// ── Data loading helpers ────────────────────────────────────────

async function fetchRegion(path) {
  if (state.regionCache[path]) return state.regionCache[path];
  try {
    const resp = await fetch(path);
    if (!resp.ok) return null;
    const data = await resp.json();
    state.regionCache[path] = data;
    return data;
  } catch (_) {
    console.warn(`Failed to load region: ${path}`);
    return null;
  }
}

async function fetchVcf(path) {
  if (state.vcfCache[path]) return state.vcfCache[path];
  try {
    const resp = await fetch(path);
    if (!resp.ok) return null;
    const data = await resp.json();
    state.vcfCache[path] = data;
    return data;
  } catch (_) {
    console.warn(`Failed to load VCF: ${path}`);
    return null;
  }
}

async function fetchJSON(path) {
  try {
    const resp = await fetch(path);
    if (!resp.ok) return null;
    return await resp.json();
  } catch (_) { return null; }
}

// ── Boot ────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
