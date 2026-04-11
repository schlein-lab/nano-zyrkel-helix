// ═══════════════════════════════════════════════════════════════════
// Karyotype Workbench — Interactive Human Cytogenetics
// Powered by real GRCh38 data (UCSC cytoBand) + ClinGen dosage curation
// ═══════════════════════════════════════════════════════════════════

// ── State ─────────────────────────────────────────────────────────
let CYTOBANDS = [];        // loaded from data/cytobands.json
let CLINGEN = [];          // loaded from data/clingen_dosage.json
let CHROMOSOMES = {};      // computed from CYTOBANDS
let currentMode = 'compare';
let selectedChr = null;
let activeSyndrome = null;
let activeCategory = 'numerical';

// ── i18n (UI strings) ─────────────────────────────────────────────
let uiLang = 'de';
const I18N = {
  de: {
    compare: 'Vergleich', build: 'Sortieren', aberrations: 'Aberrationen', quiz: 'Quiz',
    schematic: 'Schema (UCSC GRCh38)', real: 'Real (Lin et al. 2023)',
    dragRotate: 'Ziehen zum Drehen', reset: 'Zurücksetzen',
    hint: 'Hilfe', submit: 'Auswerten', assign: '-- Zuordnen --',
    correct: 'Richtig!', wrong: 'Falsch', chrLabel: 'Chromosom',
    studium: 'Studium', facharzt: 'Facharzt',
    prevChr: 'Vorheriges Chromosom', nextChr: 'Nächstes Chromosom',
    prevSpec: 'Vorheriges Specimen', nextSpec: 'Nächstes Specimen',
    clickChr: 'Klicke ein Chromosom zum Laden.',
    arrowHint: 'Pfeiltasten: Links/Rechts = Specimens, Oben/Unten = Chromosom.',
    diagnose: 'Diagnose', klinik: 'Klinik', diagnostik: 'Diagnostik', genetik: 'Genetik', beratung: 'Beratung',
    all: 'Alle', single: 'Einzeln', easy: '24', hard: '46',
    score: 'Punkte', time: 'Zeit', hints: 'Hilfen',
    noExpert: 'Noch keine Facharzt-Fragen für diesen Fall',
    resetStats: 'Stats zurücksetzen', prev: 'Zurück', next: 'Weiter',
    fall: 'Fall',
    bands: 'Banden', quizNotLoaded: 'Quizdaten nicht geladen.',
    selectSyndrome: 'Wähle oben ein Syndrom, um Details anzuzeigen.',
    cat_numerical: 'Numerisch', cat_structural: 'Deletionen', cat_translocation: 'Translokationen',
    meioticSegTitle: 'Meiotische Segregation — 6 mögliche Gametentypen',
    robCarriersNote: 'Robertsonsche Träger sind phänotypisch normal, produzieren aber unbalancierte Gameten. Das empirische Risiko einer lebendgeborenen Trisomie ist deutlich niedriger als das theoretische (die meisten unbalancierten Konzeptionen enden in Frühaborten). Für rob(13;14): ~1 % Risiko für Patau-Syndrom bei Nachkommen.',
    disclaimer: 'Zytoband-Daten: UCSC GRCh38 (cytoBand.txt, öffentlich). Karyotyp-Bild: NHGRI (gemeinfrei). Dosierungs-Kuration: ClinGen Dosage Sensitivity Map. Klinische Merkmale und Häufigkeiten sind zu Lehrzwecken vereinfacht — für diagnostische Arbeit Standardreferenzen konsultieren (ISCN 2020, Thompson & Thompson, OMIM).',
    allModules: '← Alle Module',
    // Segregation table
    seg_alternate: 'Alternierend', seg_adjacent: 'Benachbart (adjacent)',
    seg_normal: 'Normal', seg_balanced: 'Balancierter Träger',
    seg_healthy: 'Gesund', seg_healthy_parent: 'Gesund (wie Elternteil)',
    seg_lethal: 'Letal (Abort)', seg_patau: 'Patau-Syndrom',
    // Syndrome features/mechanisms (DE)
    down_features: 'Intellektuelle Beeinträchtigung, charakteristische Fazies (Epicanthusfalten, flache Nasenwurzel), angeborene Herzfehler (~50 %, v. a. AVSD), Muskelhypotonie, erhöhtes Risiko für Leukämie und Alzheimer.',
    down_mechanism: 'Meiotische Non-Disjunction (95 %), maternaler Alterseffekt. ~4 % Translokations-Down (Robertsonsch), ~1 % Mosaik.',
    edwards_features: 'Schwere IUGR, geballte Fäuste mit überlappenden Fingern, Tintenlöscherfüße, Mikrozephalie, Herzfehler (VSD, ASD). 90 % Mortalität im ersten Lebensjahr.',
    edwards_mechanism: 'Maternale meiotische Non-Disjunction.',
    patau_features: 'Holoprosenzephalie, Lippen-Kiefer-Gaumenspalte, Polydaktylie, schwere Herzfehler, Kopfhautdefekte (Cutis aplasia). >80 % sterben im ersten Lebensjahr.',
    patau_mechanism: 'Maternale meiotische Non-Disjunction. ~20 % durch Robertsonsche Translokation.',
    turner_features: 'Kleinwuchs, Gonadendysgenesie (Streak-Gonaden), Pterygium colli, Lymphödem, Aortenisthmusstenose, normale Intelligenz. Meist sporadisch.',
    turner_mechanism: 'Verlust des paternalen Geschlechtschromosoms (~80 %). 99 % der Turner-Konzeptionen enden in Spontanabort.',
    klinefelter_features: 'Hochwuchs, Hypogonadismus, Gynäkomastie, Infertilität (Azoospermie), leichte Lernschwierigkeiten. Oft erst bei Fertilitätsabklärung diagnostiziert.',
    klinefelter_mechanism: 'Non-Disjunction des X-Chromosoms bei einem Elternteil (50/50 paternal/maternal).',
    triple_x_features: 'Hochwuchs, leichte Lern-/Sprachverzögerung, normale Fertilität. Häufig nicht diagnostiziert (milder Phänotyp).',
    triple_x_mechanism: 'Maternale meiotische Non-Disjunction (meistens).',
    digeorge_features: 'Konotrunkale Herzfehler (TOF, IAA-B, Truncus arteriosus), Thymushypoplasie (T-Zell-Mangel), Hypokalzämie (Nebenschilddrüse), Gaumenspalte, charakteristische Fazies, Lernbehinderungen.',
    digeorge_mechanism: '3-Mb-Deletion über NAHR zwischen Low-Copy-Repeats (LCR22). Enthält TBX1 (Herz/Nebenschilddrüse).',
    williams_features: 'Supravalvuläre Aortenstenose (ELN-Deletion), Elfenfazies, Hyperkalzämie, „Cocktailparty"-Persönlichkeit, milde intellektuelle Beeinträchtigung, Hypersozialität.',
    williams_mechanism: '~1,5-Mb-Deletion über NAHR. Reziproke Duplikation (7q11.23-dup) = schwere expressive Sprachentwicklungsverzögerung.',
    prader_willi_features: 'Neonatale Hypotonie und Trinkschwäche → Hyperphagie und Adipositas, Kleinwuchs, Hypogonadismus, milde intellektuelle Beeinträchtigung, Verhaltensauffälligkeiten.',
    prader_willi_mechanism: 'Imprinting-Störung. Verlust des paternalen 15q11-q13 (Deletion 70 %, maternale UPD 25 %, Imprinting-Defekt 5 %).',
    angelman_features: 'Schwere intellektuelle Beeinträchtigung, fehlende Sprache, ataktischer „marionettenartiger" Gang, unangemessenes Lachen, Krampfanfälle, Mikrozephalie, charakteristisches EEG.',
    angelman_mechanism: 'Imprinting-Störung. Verlust des maternalen UBE3A (Deletion 70 %, paternale UPD 5 %, UBE3A-Mutation 10 %, Imprinting-Defekt 5 %).',
    cri_du_chat_features: 'Hoher katzenartiger Schrei (Larynxhypoplasie), Mikrozephalie, schwere intellektuelle Beeinträchtigung, Hypertelorismus, Gedeihstörung.',
    cri_du_chat_mechanism: 'Terminale 5p-Deletion, variable Größe. Meist de novo paternal.',
    wolf_hirschhorn_features: 'Griechischer-Helm-Fazies, schwere IUGR, Mikrozephalie, schwere intellektuelle Beeinträchtigung, Krampfanfälle, Herzfehler. WHSC1 (NSD2) ist das kritische Gen.',
    wolf_hirschhorn_mechanism: 'Terminale 4p-Deletion, ~1–30 Mb. Meist de novo.',
    philadelphia_features: 'Chronisch-myeloische Leukämie. BCR-ABL1-Fusion → konstitutiv aktive Tyrosinkinase. Zielgerichtet durch Imatinib (Gleevec) — erste molekulare Krebstherapie.',
    philadelphia_mechanism: 'Reziproke Translokation. Erworben (somatisch) in hämatopoetischen Stammzellen.',
    rob_13_14_features: 'TRÄGER: phänotypisch normal, 45 Chromosomen (verlorene kurze Arme — nur rRNA, redundant). FERTILITÄT: ~1 % Lebendgeburtrisiko für Trisomie 13 (Patau) bei Nachkommen, rezidivierende Aborte häufig.',
    rob_13_14_mechanism: 'Ganzarm-Fusion akrozentrischer Chromosomen am Zentromer. Meiotische Segregation ergibt 6 Gametentypen (siehe unten).',
    rob_14_21_features: 'TRÄGER: normaler Phänotyp. NACHKOMMEN: ~10–15 % Translokations-Down-Syndrom-Risiko (deutlich höher als allein durch maternales Alter). Indikation zur genetischen Beratung.',
    rob_14_21_mechanism: 'Robertsonsche Fusion. Betroffenes Kind erbt rob(14;21) PLUS ein normales 21 → effektiv trisomisch für 21q.',
  },
  en: {
    compare: 'Compare', build: 'Sort', aberrations: 'Aberrations', quiz: 'Quiz',
    schematic: 'Schematic (UCSC GRCh38)', real: 'Real (Lin et al. 2023)',
    dragRotate: 'Drag to rotate', reset: 'Reset',
    hint: 'Hint', submit: 'Submit', assign: '-- Assign --',
    correct: 'Correct!', wrong: 'Wrong', chrLabel: 'Chromosome',
    studium: 'Student', facharzt: 'Board Exam',
    prevChr: 'Previous chromosome', nextChr: 'Next chromosome',
    prevSpec: 'Previous specimen', nextSpec: 'Next specimen',
    clickChr: 'Click a chromosome to load it.',
    arrowHint: 'Arrow keys: Left/Right = specimens, Up/Down = chromosome.',
    diagnose: 'Diagnosis', klinik: 'Clinical', diagnostik: 'Diagnostics', genetik: 'Genetics', beratung: 'Counseling',
    all: 'All', single: 'Single', easy: '24', hard: '46',
    score: 'Score', time: 'Time', hints: 'Hints',
    noExpert: 'No board exam questions for this case yet',
    resetStats: 'Reset stats', prev: 'Prev', next: 'Next',
    fall: 'Case',
    bands: 'bands', quizNotLoaded: 'Quiz data not loaded.',
    selectSyndrome: 'Select a syndrome above to view details.',
    cat_numerical: 'Numerical', cat_structural: 'Deletions', cat_translocation: 'Translocations',
    meioticSegTitle: 'Meiotic segregation — 6 possible gamete types',
    robCarriersNote: 'Robertsonian carriers are phenotypically normal but produce unbalanced gametes. Empirical risk of liveborn trisomy is much lower than theoretical (most unbalanced conceptions miscarry early). For rob(13;14): ~1% risk of Patau in offspring.',
    disclaimer: 'Cytoband data: UCSC GRCh38 (cytoBand.txt, public). Real karyotype image: NHGRI (public domain). Dosage curation: ClinGen Dosage Sensitivity Map. Clinical features and frequencies are simplified for teaching — consult standard references (ISCN 2020, Thompson & Thompson, OMIM) for diagnostic work.',
    allModules: '← All modules',
    seg_alternate: 'Alternate', seg_adjacent: 'Adjacent',
    seg_normal: 'Normal', seg_balanced: 'Balanced carrier',
    seg_healthy: 'Healthy', seg_healthy_parent: 'Healthy (like parent)',
    seg_lethal: 'Lethal (miscarriage)', seg_patau: 'Patau syndrome',
  }
};
function t(key) { return (I18N[uiLang] || I18N.de)[key] || key; }
// Syndrome text helper: returns DE or EN text for a given syndrome field
function synText(syndromeKey, field) {
  const deKey = syndromeKey + '_' + field;
  if (uiLang === 'de' && I18N.de[deKey]) return I18N.de[deKey];
  return null; // caller falls back to English default in SYNDROMES
}

// Acrocentric chromosomes (small p-arms with rRNA stalks/satellites)
const ACROCENTRIC = ['13', '14', '15', '21', '22'];

// Denver groups (size-based classification)
const DENVER_GROUPS = {
  A: ['1', '2', '3'],
  B: ['4', '5'],
  C: ['6', '7', '8', '9', '10', '11', '12', 'X'],
  D: ['13', '14', '15'],
  E: ['16', '17', '18'],
  F: ['19', '20'],
  G: ['21', '22', 'Y']
};

// ── Clinical syndromes (curated for teaching) ─────────────────────
const SYNDROMES = {
  'numerical': {
    'down': {
      name: 'Down Syndrome',
      iscn: '47,XY,+21',
      chr: '21', count: 3,
      freq: '1 : 700',
      features: 'Intellectual disability, characteristic facies (epicanthal folds, flat nasal bridge), congenital heart defects (~50%, esp. AVSD), hypotonia, increased risk of leukemia and Alzheimer disease.',
      mechanism: 'Meiotic non-disjunction (95%), maternal age effect. ~4% are translocation Down (Robertsonian), ~1% mosaic.'
    },
    'edwards': {
      name: 'Edwards Syndrome',
      iscn: '47,XY,+18',
      chr: '18', count: 3,
      freq: '1 : 5000',
      features: 'Severe IUGR, clenched fists with overlapping fingers, rocker-bottom feet, microcephaly, heart defects (VSD, ASD). 90% mortality in first year.',
      mechanism: 'Maternal meiotic non-disjunction.'
    },
    'patau': {
      name: 'Patau Syndrome',
      iscn: '47,XY,+13',
      chr: '13', count: 3,
      freq: '1 : 16000',
      features: 'Holoprosencephaly, cleft lip/palate, polydactyly, severe cardiac defects, scalp defects (cutis aplasia). >80% die in first year.',
      mechanism: 'Maternal meiotic non-disjunction. ~20% from Robertsonian translocation.'
    },
    'turner': {
      name: 'Turner Syndrome',
      iscn: '45,X',
      chr: 'X', count: 1,
      freq: '1 : 2500 girls',
      features: 'Short stature, gonadal dysgenesis (streak ovaries), webbed neck, lymphedema, coarctation of aorta, normal intelligence. Most are sporadic.',
      mechanism: 'Loss of paternal sex chromosome (~80%). 99% of Turner conceptions are spontaneously aborted.'
    },
    'klinefelter': {
      name: 'Klinefelter Syndrome',
      iscn: '47,XXY',
      chr: 'X', count: 2, extra: 'Y',
      freq: '1 : 660 boys',
      features: 'Tall stature, hypogonadism, gynecomastia, infertility (azoospermia), mild learning difficulties. Often diagnosed at infertility workup.',
      mechanism: 'Non-disjunction of X in either parent (50/50 paternal/maternal).'
    },
    'triple_x': {
      name: 'Triple X Syndrome',
      iscn: '47,XXX',
      chr: 'X', count: 3,
      freq: '1 : 1000 girls',
      features: 'Tall stature, mild learning/speech delays, normal fertility. Often undiagnosed (mild phenotype).',
      mechanism: 'Maternal meiotic non-disjunction (most cases).'
    }
  },
  'structural': {
    'digeorge': {
      name: 'DiGeorge / VCFS',
      iscn: '46,XY,del(22)(q11.2)',
      chr: '22', region: 'q11.2', type: 'deletion',
      freq: '1 : 4000',
      clingen: 'HI:3 (sufficient)',
      features: 'Conotruncal cardiac defects (TOF, IAA-B, truncus arteriosus), thymic hypoplasia (T-cell deficiency), hypocalcemia (parathyroid), cleft palate, characteristic facies, learning disabilities.',
      mechanism: '3-Mb deletion via NAHR between low-copy repeats (LCR22). Includes TBX1 (cardiac/parathyroid).'
    },
    'williams': {
      name: 'Williams-Beuren',
      iscn: '46,XX,del(7)(q11.23)',
      chr: '7', region: 'q11.23', type: 'deletion',
      freq: '1 : 7500',
      clingen: 'HI:3 / TS:3',
      features: 'Supravalvular aortic stenosis (ELN deletion), elfin facies, hypercalcemia, "cocktail party" personality, mild ID, hypersociability.',
      mechanism: '~1.5 Mb deletion via NAHR. Reciprocal duplication (7q11.23 dup) = severe expressive language delay.'
    },
    'prader_willi': {
      name: 'Prader-Willi',
      iscn: '46,XY,del(15)(q11.2q13)pat',
      chr: '15', region: 'q11.2-q13', type: 'deletion',
      freq: '1 : 15000',
      clingen: 'HI:3 / TS:3',
      features: 'Neonatal hypotonia and feeding difficulty → hyperphagia and obesity, short stature, hypogonadism, mild ID, behavioral issues.',
      mechanism: 'Imprinting disorder. Loss of paternal 15q11-q13 (deletion 70%, mat UPD 25%, imprinting defect 5%).'
    },
    'angelman': {
      name: 'Angelman Syndrome',
      iscn: '46,XX,del(15)(q11.2q13)mat',
      chr: '15', region: 'q11.2-q13', type: 'deletion',
      freq: '1 : 15000',
      clingen: 'HI:3 / TS:3',
      features: 'Severe ID, absent speech, ataxic "puppet-like" gait, inappropriate laughter, seizures, microcephaly, characteristic EEG.',
      mechanism: 'Imprinting disorder. Loss of maternal UBE3A (deletion 70%, pat UPD 5%, UBE3A mutation 10%, imprinting defect 5%).'
    },
    'cri_du_chat': {
      name: 'Cri-du-chat',
      iscn: '46,XX,del(5)(p15.2)',
      chr: '5', region: 'p15.2', type: 'deletion',
      freq: '1 : 50000',
      clingen: 'HI:3',
      features: 'High-pitched cat-like cry (laryngeal hypoplasia), microcephaly, severe ID, hypertelorism, growth failure.',
      mechanism: 'Terminal 5p deletion, variable size. Most de novo paternal.'
    },
    'wolf_hirschhorn': {
      name: 'Wolf-Hirschhorn',
      iscn: '46,XY,del(4)(p16.3)',
      chr: '4', region: 'p16.3', type: 'deletion',
      freq: '1 : 50000',
      clingen: 'HI:3',
      features: 'Greek-helmet facies, severe IUGR, microcephaly, severe ID, seizures, cardiac defects. WHSC1 (NSD2) is critical gene.',
      mechanism: 'Terminal 4p deletion, ~1-30 Mb. Mostly de novo.'
    }
  },
  'translocation': {
    'philadelphia': {
      name: 'Philadelphia (CML)',
      iscn: '46,XX,t(9;22)(q34;q11.2)',
      chrA: '9', chrB: '22',
      freq: '~95% of CML',
      features: 'Chronic myeloid leukemia. BCR-ABL1 fusion → constitutively active tyrosine kinase. Targeted by imatinib (Gleevec) — first molecular cancer therapy.',
      mechanism: 'Reciprocal translocation. Acquired (somatic) in hematopoietic stem cell.'
    },
    'rob_13_14': {
      name: 'Robertsonian rob(13;14)',
      iscn: '45,XX,rob(13;14)(q10;q10)',
      chrA: '13', chrB: '14',
      freq: '1 : 1300 (most common balanced)',
      features: 'CARRIER: phenotypically normal, 45 chromosomes (lost short arms — only rRNA, redundant). FERTILITY: ~1% live-birth risk for trisomy 13 in offspring (Patau), recurrent miscarriage common.',
      mechanism: 'Whole-arm fusion of acrocentric chromosomes at centromere. Meiotic segregation produces 6 gamete types (see below).'
    },
    'rob_14_21': {
      name: 'Robertsonian rob(14;21)',
      iscn: '45,XY,rob(14;21)(q10;q10)',
      chrA: '14', chrB: '21',
      freq: '~1:1000',
      features: 'CARRIER: normal phenotype. OFFSPRING: ~10-15% translocation Down syndrome risk (much higher than maternal age alone). Genetic counseling indication.',
      mechanism: 'Robertsonian fusion. Affected child inherits the rob(14;21) PLUS a normal 21 → effectively trisomic for 21q.'
    }
  }
};

// ── Robertsonian segregation (the 6 gamete types) ─────────────────
const ROB_SEGREGATION = [
  { label: 'Alternate', chroms: '13 + 14', result: 'Normal', pheno: 'Healthy', class: 'normal' },
  { label: 'Alternate', chroms: 'rob(13;14)', result: 'Balanced carrier', pheno: 'Healthy (like parent)', class: 'balanced' },
  { label: 'Adjacent', chroms: 'rob(13;14) + 14', result: 'Trisomy 14', pheno: 'Lethal (miscarriage)', class: 'trisomy' },
  { label: 'Adjacent', chroms: 'rob(13;14) + 13', result: 'Trisomy 13', pheno: 'Patau syndrome', class: 'trisomy' },
  { label: 'Adjacent', chroms: '13 only', result: 'Monosomy 14', pheno: 'Lethal (miscarriage)', class: 'monosomy' },
  { label: 'Adjacent', chroms: '14 only', result: 'Monosomy 13', pheno: 'Lethal (miscarriage)', class: 'monosomy' }
];

// (EXAM_CASES removed — use QUIZ_CASES from quiz_cases.js + quiz_expert.js)
const _REMOVED = [
  // ── Numerical autosomal (10) ────────────
  { id: 1, cat: 'num_auto', iscn: '47,XX,+21', vignette: 'Newborn girl with hypotonia, single palmar crease, upslanted palpebral fissures, and a heart murmur (AVSD on echo).', q: 'Most likely diagnosis?', choices: ['Trisomy 21 (Down syndrome)', 'Trisomy 18 (Edwards)', 'Triple X', 'Turner syndrome'], answer: 0, explain: 'Classic newborn presentation of Down syndrome. AVSD (atrioventricular septal defect) is the most characteristic cardiac lesion. 95% of cases are full trisomy 21 from meiotic non-disjunction.' },
  { id: 2, cat: 'num_auto', iscn: '47,XY,+21', vignette: 'Boy at routine pediatric exam: mild ID, characteristic facies, no major organ malformations.', q: 'Karyotype interpretation?', choices: ['46,XY,t(21;21)', '47,XY,+21', '47,XY,+18', '46,XY,del(21)'], answer: 1, explain: 'Standard ISCN notation for Down syndrome in a male. Always check for translocation Down (rob(14;21) or rob(21;21)) — recurrence risk differs dramatically.' },
  { id: 3, cat: 'num_auto', iscn: '46,XX/47,XX,+21', vignette: 'Girl with mild Down features, near-normal intelligence. FISH shows trisomy 21 in 30% of cells.', q: 'Best descriptor?', choices: ['Mosaic Down syndrome', 'Translocation Down', 'Uniparental disomy 21', 'Partial trisomy 21'], answer: 0, explain: 'Mosaicism arises from post-zygotic non-disjunction. Phenotype correlates with proportion of trisomic cells. Counsel that recurrence risk is low (sporadic).' },
  { id: 4, cat: 'num_auto', iscn: '47,XX,+18', vignette: 'Newborn with severe IUGR, clenched fists with overlapping index fingers, rocker-bottom feet, VSD.', q: 'Diagnosis?', choices: ['Patau syndrome', 'Edwards syndrome', 'Smith-Lemli-Opitz', 'Cornelia de Lange'], answer: 1, explain: 'Edwards syndrome (trisomy 18). Clenched fists with overlapping fingers and rocker-bottom feet are pathognomonic. >90% mortality in first year.' },
  { id: 5, cat: 'num_auto', iscn: '47,XY,+13', vignette: 'Newborn with cleft lip and palate, polydactyly, holoprosencephaly on imaging, scalp defects (aplasia cutis), severe cardiac malformation.', q: 'Diagnosis?', choices: ['Edwards syndrome', 'Patau syndrome', 'CHARGE syndrome', 'Pallister-Hall'], answer: 1, explain: 'Patau syndrome (trisomy 13). Holoprosencephaly + polydactyly + scalp defects = classic triad. Most die within days to months.' },
  { id: 6, cat: 'num_auto', iscn: '69,XXY', vignette: 'Severely growth-restricted fetus, large placenta with cystic changes, syndactyly 3-4. Chromosome analysis from amniocentesis.', q: 'Karyotype?', choices: ['Trisomy 13', 'Triploidy', 'Trisomy 18', '45,X'], answer: 1, explain: 'Triploidy (3n=69). Diandric (paternal) origin → partial mole, large placenta. Digynic (maternal) → small placenta, severe IUGR. Always lethal.' },
  { id: 7, cat: 'num_auto', iscn: '47,XX,+8', vignette: 'Child with mild ID, thick everted lower lip, deep palmar/plantar furrows, joint contractures.', q: 'Suspected aneuploidy?', choices: ['Trisomy 8 mosaic (Warkany)', 'Trisomy 9 mosaic', 'Trisomy 22 mosaic', 'Trisomy 16'], answer: 0, explain: 'Warkany syndrome 2 (mosaic trisomy 8). Full trisomy 8 is lethal — only mosaics survive. Deep palmar/plantar furrows are characteristic.' },
  { id: 8, cat: 'num_auto', iscn: '47,XY,+22', vignette: 'Recurrent first-trimester miscarriage. POC karyotype: trisomy 22.', q: 'Counseling point?', choices: ['Sporadic, low recurrence', 'High recurrence, test parents', 'Likely translocation', 'Uniparental disomy'], answer: 0, explain: 'Full trisomy 22 is one of the most common autosomal trisomies in spontaneous abortion. Almost always sporadic non-disjunction; recurrence risk is low.' },
  { id: 9, cat: 'num_auto', iscn: '47,XX,+16', vignette: 'First-trimester loss at 8 weeks. Karyotype of products of conception.', q: 'Most common autosomal trisomy in spontaneous abortion?', choices: ['Trisomy 13', 'Trisomy 16', 'Trisomy 21', 'Trisomy 22'], answer: 1, explain: 'Trisomy 16 is the most common autosomal trisomy at conception (~1% of pregnancies) but is uniformly lethal in utero — never seen as live birth.' },
  { id: 10, cat: 'num_auto', iscn: '92,XXYY', vignette: 'Hydatidiform mole-like findings, severe IUGR, multiple anomalies on prenatal ultrasound. Karyotype: 92,XXYY.', q: 'What is this?', choices: ['Triploidy', 'Tetraploidy', 'Mosaic trisomy', 'Polyploid mole'], answer: 1, explain: 'Tetraploidy (4n=92). Most often arises from cytokinesis failure after fertilization. Always lethal in utero.' },

  // ── Numerical sex chromosomes (8) ──────
  { id: 11, cat: 'num_sex', iscn: '45,X', vignette: 'Adolescent girl: short stature (<3rd percentile), webbed neck, broad shield chest with widely-spaced nipples, primary amenorrhea, normal IQ.', q: 'Diagnosis?', choices: ['Noonan syndrome', 'Turner syndrome', 'Klinefelter syndrome', 'Triple X'], answer: 1, explain: 'Turner syndrome (45,X). Always suspect in short girls with primary amenorrhea. Cardiac evaluation crucial: bicuspid aortic valve, coarctation, aortic dissection risk.' },
  { id: 12, cat: 'num_sex', iscn: '45,X/46,XX', vignette: 'Young woman with mild Turner stigmata, regular menses, normal stature. Karyotype shows mosaicism.', q: 'Best counseling?', choices: ['Same severity as 45,X', 'Phenotype usually milder, fertility possible', 'Cancer risk increased', 'Lethal in utero'], answer: 1, explain: 'Turner mosaics often have milder phenotype. Some retain fertility. Always check for Y-bearing line (gonadoblastoma risk → prophylactic gonadectomy if Y present).' },
  { id: 13, cat: 'num_sex', iscn: '47,XXY', vignette: 'Adult male, infertility workup: tall stature, small firm testes, gynecomastia, azoospermia, low testosterone, elevated FSH/LH.', q: 'Diagnosis?', choices: ['XYY syndrome', 'Klinefelter syndrome', 'Kallmann syndrome', 'Androgen insensitivity'], answer: 1, explain: 'Klinefelter syndrome (47,XXY) — most common cause of primary hypogonadism in men. Often diagnosed only at infertility evaluation. Testosterone replacement; TESE for fertility.' },
  { id: 14, cat: 'num_sex', iscn: '48,XXXY', vignette: 'Boy with more pronounced features than typical Klinefelter: severe ID, dysmorphism, hypogonadism, radioulnar synostosis.', q: 'Karyotype?', choices: ['47,XXY', '48,XXXY', '49,XXXXY', '47,XYY'], answer: 1, explain: 'Each additional X chromosome adds ~15-16 IQ points reduction. 48,XXXY is intermediate; 49,XXXXY is severe.' },
  { id: 15, cat: 'num_sex', iscn: '47,XXX', vignette: 'Tall girl with mild speech delay and learning difficulties, normal puberty, normal fertility.', q: 'Most likely karyotype?', choices: ['47,XXX', '47,XXY', '45,X', '46,XX,inv(X)'], answer: 0, explain: 'Triple X (47,XXX). Often missed clinically — mild phenotype. Most are fertile with normal offspring. Increased risk of subtle learning difficulties.' },
  { id: 16, cat: 'num_sex', iscn: '47,XYY', vignette: 'Tall man, mild learning difficulties as a child, otherwise unremarkable. Karyotype incidentally found.', q: 'Karyotype?', choices: ['47,XYY', '47,XXY', '46,XY/47,XXY mosaic', '48,XXYY'], answer: 0, explain: '47,XYY (Jacobs syndrome). Usually mild — tall stature, sometimes mild learning issues. Old (debunked) association with criminality is not supported by modern data.' },
  { id: 17, cat: 'num_sex', iscn: '48,XXYY', vignette: 'Tall man with ID, dysmorphic features, hypogonadism, mild Klinefelter-like phenotype but more severe.', q: 'Karyotype?', choices: ['48,XXYY', '47,XXY', '49,XXXYY', '47,XYY'], answer: 0, explain: '48,XXYY. Combines features of Klinefelter (extra X) and 47,XYY (extra Y). Tall stature, hypogonadism, learning disability.' },
  { id: 18, cat: 'num_sex', iscn: '49,XXXXY', vignette: 'Boy with severe ID, distinctive facies (hypertelorism, broad nasal bridge), hypogonadism, radioulnar synostosis, microcephaly.', q: 'Karyotype?', choices: ['47,XXY', '48,XXXY', '49,XXXXY', 'Triple X'], answer: 2, explain: '49,XXXXY (Fraccaro syndrome). Most severe X-aneuploidy in males. Severe ID, distinctive facies, multiple anomalies.' },

  // ── Robertsonian translocations (6) ────
  { id: 19, cat: 'rob', iscn: '45,XX,rob(13;14)(q10;q10)', vignette: 'Healthy 32-year-old woman, normal karyotype request after recurrent miscarriages (3 first-trimester losses).', q: 'Why is she healthy with 45 chromosomes?', choices: ['Mosaicism', 'Acrocentric short arms only contain rRNA genes (redundant)', 'X-inactivation', 'Imprinting'], answer: 1, explain: 'rob(13;14) is the most common balanced rearrangement (~1:1000). Acrocentric p-arms contain only rRNA repeats (multiple copies elsewhere) — losing them is phenotypically silent. But meiotic segregation gives unbalanced gametes → recurrent loss.' },
  { id: 20, cat: 'rob', iscn: '46,XX,rob(13;14)(q10;q10),+13', vignette: 'Newborn with Patau features. Mother is rob(13;14) carrier.', q: 'How does this differ from sporadic trisomy 13?', choices: ['Identical phenotype, same recurrence', 'Same phenotype but high recurrence (counsel parents)', 'Milder phenotype', 'Lethal earlier'], answer: 1, explain: 'Translocation trisomy 13. Phenotypically identical to sporadic trisomy 13 but recurrence risk is much higher (~1% empirically) — genetic counseling and PND essential.' },
  { id: 21, cat: 'rob', iscn: '45,XY,rob(14;21)(q10;q10)', vignette: 'Healthy 28-year-old man, evaluated after his sister had a child with translocation Down syndrome.', q: 'His risk of fathering a child with Down syndrome?', choices: ['No increased risk', '~1-2%', '~10-15%', '100%'], answer: 1, explain: 'Male carriers of rob(14;21) have ~1-2% risk of trisomy 21 offspring. Female carriers have ~10-15% risk (due to differential gamete viability). Always offer PND.' },
  { id: 22, cat: 'rob', iscn: '46,XY,rob(14;21)(q10;q10),+21', vignette: 'Boy with Down syndrome features. Karyotype: 46 chromosomes including a der(14;21) and an extra free 21.', q: 'What testing is mandatory next?', choices: ['Whole exome sequencing', 'Parental karyotypes', 'No further testing', 'Methylation studies'], answer: 1, explain: 'Translocation Down syndrome (~4% of all Down). Always test parents — if one is a balanced carrier, recurrence risk is high and other family members should be offered testing.' },
  { id: 23, cat: 'rob', iscn: '45,XX,rob(13;13)(q10;q10)', vignette: 'Healthy woman, balanced rob(13;13) carrier — homologous Robertsonian.', q: 'Risk of healthy live birth?', choices: ['~50%', '~25%', '~1%', 'Essentially 0%'], answer: 3, explain: 'Homologous rob(13;13) — every gamete is unbalanced (either nullisomy 13 or disomy 13). All conceptions are either lethal monosomy 13 or trisomy 13. Effectively 100% reproductive failure. Donor gametes usually recommended.' },
  { id: 24, cat: 'rob', iscn: '45,XY,rob(21;21)(q10;q10)', vignette: 'Father of three children with Down syndrome, all from same partner.', q: 'Recurrence risk in next pregnancy?', choices: ['~1%', '~25%', '~50%', '100% Down syndrome'], answer: 3, explain: 'Homologous rob(21;21) — every viable conception will be translocation Down syndrome (or lethal monosomy 21). 100% recurrence risk. Donor sperm or PGD considered.' },

  // ── Reciprocal translocations (5) ──────
  { id: 25, cat: 'recip', iscn: '46,XX,t(9;22)(q34;q11.2)', vignette: 'Adult with chronic phase CML: leukocytosis, splenomegaly, basophilia, low LAP score. Bone marrow karyotype.', q: 'Significance of this translocation?', choices: ['BCR-ABL1 fusion → imatinib responsive', 'Loss of tumor suppressor', 'Activates MYC', 'PML-RARA fusion'], answer: 0, explain: 'Philadelphia chromosome — first cancer translocation described (1960). BCR-ABL1 fusion creates constitutively active tyrosine kinase. Imatinib (Gleevec) was the first targeted cancer therapy.' },
  { id: 26, cat: 'recip', iscn: '46,XY,t(11;22)(q23;q11.2)', vignette: 'Healthy adult, balanced t(11;22). Recurrent miscarriages.', q: 'Why is this important to recognize?', choices: ['Becomes Burkitt lymphoma', 'Most common constitutional reciprocal translocation; offspring → Emanuel syndrome', 'Always cancer-related', 'Causes Bloom syndrome'], answer: 1, explain: 'The t(11;22)(q23;q11) is the most common recurrent constitutional reciprocal translocation. Unbalanced offspring → Emanuel syndrome (supernumerary der(22), severe ID). PND essential.' },
  { id: 27, cat: 'recip', iscn: '46,XX,t(8;14)(q24;q32)', vignette: 'Adolescent with rapidly growing jaw mass. Biopsy: high-grade lymphoma with starry-sky appearance.', q: 'Translocation product?', choices: ['BCR-ABL1', 'MYC-IgH', 'PML-RARA', 'BCL2-IgH'], answer: 1, explain: 'Burkitt lymphoma. t(8;14) places MYC under control of IgH enhancer → constitutive overexpression. Other variants: t(2;8) (Igκ-MYC), t(8;22) (MYC-Igλ).' },
  { id: 28, cat: 'recip', iscn: '46,XY,t(15;17)(q24;q21)', vignette: 'Young adult with pancytopenia, DIC at presentation. Bone marrow: hypergranular promyelocytes with Auer rods.', q: 'Diagnosis and treatment?', choices: ['CML — imatinib', 'APL — ATRA + arsenic', 'Burkitt — chemotherapy', 'AML — standard induction'], answer: 1, explain: 'Acute Promyelocytic Leukemia (APL, AML M3). PML-RARA fusion blocks differentiation. ATRA (all-trans retinoic acid) + arsenic trioxide → highly curable. DIC is the critical early complication.' },
  { id: 29, cat: 'recip', iscn: '46,XX,t(4;11)(q21;q23)', vignette: 'Infant with leukemia: hyperleukocytosis, CNS involvement, very poor prognosis.', q: 'Gene involved?', choices: ['ETV6-RUNX1', 'BCR-ABL1', 'KMT2A (MLL) rearrangement', 'TCF3-PBX1'], answer: 2, explain: 'Infant ALL with t(4;11) → KMT2A-AFF1 (MLL-AF4) fusion. KMT2A rearrangements at 11q23 are aggressive, especially in infants <1 year. Poor prognosis.' },

  // ── Deletions (8) ──────────────────────
  { id: 30, cat: 'del', iscn: '46,XX,del(5)(p15.2)', vignette: 'Newborn with high-pitched cat-like cry, microcephaly, round face, hypertelorism, hypotonia.', q: 'Diagnosis?', choices: ['Cri-du-chat (5p-)', 'Wolf-Hirschhorn (4p-)', 'Smith-Magenis', 'Williams syndrome'], answer: 0, explain: 'Cri-du-chat syndrome — terminal 5p deletion. The characteristic cry (laryngeal hypoplasia) is pathognomonic and gives the syndrome its name. Severe ID.' },
  { id: 31, cat: 'del', iscn: '46,XY,del(4)(p16.3)', vignette: 'Newborn with "Greek warrior helmet" facies (broad forehead, hypertelorism, prominent glabella), severe IUGR, seizures, midline defects.', q: 'Diagnosis?', choices: ['Cri-du-chat', 'Wolf-Hirschhorn', 'CHARGE syndrome', 'Cornelia de Lange'], answer: 1, explain: 'Wolf-Hirschhorn syndrome — terminal 4p deletion including WHSC1/NSD2. The Greek-helmet facies is classic. Severe ID, seizures, growth failure.' },
  { id: 32, cat: 'del', iscn: '46,XX,del(7)(q11.23)', vignette: 'Toddler with elfin facies, supravalvular aortic stenosis, hypercalcemia, "cocktail party" personality, mild ID.', q: 'Gene critical for cardiac phenotype?', choices: ['ELN (elastin)', 'TBX1', 'NSD2', 'RAI1'], answer: 0, explain: 'Williams-Beuren syndrome. ~26 genes deleted including ELN (elastin) → SVAS. Hemizygosity for GTF2I → hypersociability. Caused by NAHR between LCRs.' },
  { id: 33, cat: 'del', iscn: '46,XY,del(22)(q11.2)', vignette: 'Newborn with interrupted aortic arch type B, hypocalcemic seizures, T-cell deficiency on flow cytometry.', q: 'Likely deletion?', choices: ['del(22)(q11.2) — DiGeorge', 'del(7)(q11.23)', 'del(15)(q11.2)', 'del(17)(p11.2)'], answer: 0, explain: '22q11.2 deletion syndrome (DiGeorge / VCFS). CATCH-22: Cardiac (TOF, IAA-B, truncus), Abnormal facies, Thymic hypoplasia, Cleft palate, Hypocalcemia. TBX1 is critical gene.' },
  { id: 34, cat: 'del', iscn: '46,XX,del(15)(q11.2q13)pat', vignette: 'Infant with severe neonatal hypotonia and feeding difficulty. Later developed hyperphagia and obesity.', q: 'Diagnosis and parent of origin?', choices: ['Angelman, maternal', 'Prader-Willi, paternal', 'Prader-Willi, maternal', 'Angelman, paternal'], answer: 1, explain: 'Prader-Willi syndrome — loss of PATERNAL 15q11-q13 (deletion 70%, mat UPD 25%). Same region; opposite parent → Angelman. Classic imprinting disorder.' },
  { id: 35, cat: 'del', iscn: '46,XY,del(15)(q11.2q13)mat', vignette: 'Child with severe ID, no speech, ataxic gait, inappropriate paroxysms of laughter, seizures, microcephaly.', q: 'Diagnosis and parent of origin?', choices: ['Prader-Willi, paternal', 'Angelman, maternal', 'Rett syndrome', 'Prader-Willi, maternal'], answer: 1, explain: 'Angelman syndrome — loss of MATERNAL UBE3A. Same 15q11-q13 region as Prader-Willi but opposite parent → completely different phenotype. The "happy puppet" appearance is characteristic.' },
  { id: 36, cat: 'del', iscn: '46,XX,del(17)(p13.3)', vignette: 'Newborn with smooth lissencephaly on brain MRI (no gyri), microcephaly, severe ID, seizures, characteristic facies.', q: 'Diagnosis?', choices: ['Wolf-Hirschhorn', 'Miller-Dieker', 'Walker-Warburg', 'Smith-Lemli-Opitz'], answer: 1, explain: 'Miller-Dieker syndrome — 17p13.3 deletion including PAFAH1B1 (LIS1). Causes classic lissencephaly type 1. YWHAE deletion adds dysmorphic features.' },
  { id: 37, cat: 'del', iscn: '46,XY,del(11)(p13)', vignette: 'Newborn boy with bilateral cryptorchidism, aniridia (absent iris), genitourinary anomalies. At age 3, develops a kidney mass.', q: 'Syndrome?', choices: ['Beckwith-Wiedemann', 'WAGR syndrome', 'Denys-Drash', 'Frasier syndrome'], answer: 1, explain: 'WAGR syndrome — 11p13 contiguous gene deletion. Wilms tumor, Aniridia, Genitourinary anomalies, mental Retardation. PAX6 (aniridia) and WT1 (Wilms) both deleted.' },

  // ── Duplications + Inversions (5) ──────
  { id: 38, cat: 'dup_inv', iscn: '46,XX,dup(12)(p13.3p13.1)', vignette: 'Tissue-specific mosaicism: skin fibroblast karyotype shows extra isochromosome 12p, while blood is normal.', q: 'Diagnosis?', choices: ['Pallister-Killian (i(12p))', 'Tetrasomy 9p', 'Cat-eye syndrome', 'Trisomy 12 mosaic'], answer: 0, explain: 'Pallister-Killian syndrome — mosaic tetrasomy 12p from a supernumerary i(12p). Tissue-limited (often absent in blood, present in skin/tissue). Coarse facies, severe ID.' },
  { id: 39, cat: 'dup_inv', iscn: '46,XY,inv(9)(p12q13)', vignette: 'Routine prenatal karyotype shows pericentric inversion 9. Parents anxious.', q: 'Counseling?', choices: ['High recurrence loss risk', 'Normal variant — no clinical significance', 'Recommend amniocentesis', 'Likely cancer predisposition'], answer: 1, explain: 'inv(9)(p11q13) is the most common heterochromatic variant — found in ~1-3% of population. Considered a normal variant with NO clinical significance. Important to recognize so parents are not alarmed.' },
  { id: 40, cat: 'dup_inv', iscn: '46,XX,inv(16)(p13.1q22)', vignette: 'Adult with AML showing eosinophils with abnormal granules. Cytogenetics: pericentric inv(16).', q: 'AML subtype and prognosis?', choices: ['AML M3 — favorable', 'AML M4eo (CBFB-MYH11) — favorable', 'AML M0 — poor', 'Therapy-related AML — poor'], answer: 1, explain: 'inv(16) creates CBFB-MYH11 fusion → AML M4eo (acute myelomonocytic with eosinophilia). Core binding factor leukemia — favorable prognosis with high-dose cytarabine consolidation.' },
  { id: 41, cat: 'dup_inv', iscn: '46,XY,dup(7)(q11.23)', vignette: 'Child with severe expressive language delay, anxiety, normal IQ otherwise. Microarray: 7q11.23 duplication.', q: 'How does this relate to Williams syndrome?', choices: ['Same gene region, reciprocal mechanism', 'Unrelated coincidence', 'Same gene, opposite imprinting', 'Different chromosome'], answer: 0, explain: 'Williams syndrome (deletion) and 7q11.23 duplication syndrome arise from the same NAHR mechanism between flanking LCRs — but phenotypes are nearly opposite. Williams: hypersociable. Duplication: severe expressive language delay, anxiety.' },
  { id: 42, cat: 'dup_inv', iscn: '46,XX,dup(17)(p11.2)', vignette: 'Child with mild ID, autism features, hypotonia, sleep disturbance. Microarray: 17p11.2 duplication.', q: 'Syndrome and reciprocal disorder?', choices: ['Potocki-Lupski; reciprocal of Smith-Magenis', 'Charcot-Marie-Tooth 1A', 'Cri-du-chat', 'Williams syndrome'], answer: 0, explain: 'Potocki-Lupski syndrome — 17p11.2 duplication (reciprocal of Smith-Magenis deletion). RAI1 is the key gene. Same NAHR mechanism, opposite copy number.' },

  // ── Isochromosomes + Rings (4) ─────────
  { id: 43, cat: 'iso_ring', iscn: '46,X,i(Xq)', vignette: 'Girl with Turner-like features but taller than typical Turner. Karyotype shows isochromosome Xq.', q: 'How does this differ from 45,X?', choices: ['Identical phenotype', 'Milder — only Xp loss, Xq present in 2 copies', 'More severe', 'No phenotype'], answer: 1, explain: 'i(Xq) — loss of Xp, duplication of Xq. Phenotype reflects haploinsufficiency for Xp genes (especially SHOX → short stature). i(Xq) Turner is often milder than 45,X.' },
  { id: 44, cat: 'iso_ring', iscn: '46,XY,r(13)', vignette: 'Newborn with growth retardation, microcephaly, hypertelorism, anal atresia, holoprosencephaly. Karyotype: ring chromosome 13.', q: 'Origin of phenotype?', choices: ['Imprinting', 'Loss of distal 13q from ring formation', 'Trisomy', 'X-inactivation'], answer: 1, explain: 'Ring chromosomes form when both arm tips break and fuse. Phenotype reflects loss of telomeric material. Ring instability also causes mosaicism. r(13) → variable holoprosencephaly spectrum.' },
  { id: 45, cat: 'iso_ring', iscn: '46,XX,i(12p)+i(12p)', vignette: 'Skin biopsy: extra small marker chromosome present, identified as i(12p). Blood karyotype normal.', q: 'Tetrasomy of which arm?', choices: ['Tetrasomy 12q', 'Tetrasomy 12p', 'Trisomy 12', 'Pentasomy 12'], answer: 1, explain: 'Pallister-Killian: mosaic tetrasomy 12p from supernumerary i(12p). Tissue-limited mosaicism is the rule — diagnose on skin fibroblasts, not blood.' },
  { id: 46, cat: 'iso_ring', iscn: '46,XY,r(18)', vignette: 'Child with microcephaly, growth retardation, midface hypoplasia, IgA deficiency, holoprosencephaly spectrum.', q: 'Diagnosis?', choices: ['Ring 18', 'Edwards syndrome', '18q deletion', 'Cat-eye syndrome'], answer: 0, explain: 'Ring 18. Combines features of 18p- and 18q- since both telomeres are lost in ring formation. IgA deficiency is characteristic.' },

  // ── Markers + Complex (4) ──────────────
  { id: 47, cat: 'marker', iscn: '47,XY,+mar', vignette: 'Karyotype shows 47 chromosomes with an extra small unidentified marker. FISH needed.', q: 'Most useful next test?', choices: ['Whole exome sequencing', 'Methylation analysis', 'Microarray (CGH/SNP)', 'Karyotype rerun'], answer: 2, explain: 'Supernumerary marker chromosome (sSMC). Microarray identifies the chromosomal origin and content. Most commonly derived from chromosome 15, often containing PWS/AS region.' },
  { id: 48, cat: 'marker', iscn: '46,XX,der(22)t(11;22)(q23;q11.2)mat', vignette: 'Newborn with severe ID, microcephaly, ear anomalies, congenital heart defect. Mother is balanced t(11;22) carrier.', q: 'Diagnosis?', choices: ['DiGeorge syndrome', 'Emanuel syndrome', 'Cat-eye syndrome', 'WAGR syndrome'], answer: 1, explain: 'Emanuel syndrome — unbalanced offspring of a parent with the t(11;22). The supernumerary der(22) results in partial trisomy 11q + 22q. Always test parents when this is diagnosed.' },
  { id: 49, cat: 'marker', iscn: '47,XX,+i(12p)', vignette: 'Tissue biopsy karyotype with extra i(12p) marker. Coarse facies, sparse hair, severe ID, seizures.', q: 'Syndrome?', choices: ['Pallister-Killian', 'Cat-eye', 'Tetrasomy 9p', 'Marker chromosome 18'], answer: 0, explain: 'Pallister-Killian (Tetrasomy 12p mosaic). Streaky pigmentation, alopecia of temples, coarse facies, severe ID. Diagnose on fibroblasts — often missed on blood.' },
  { id: 50, cat: 'marker', iscn: '45,X/46,X,r(X)', vignette: 'Girl with Turner stigmata + severe ID and unusual features (compared to typical Turner). Karyotype: 45,X/46,X,r(X).', q: 'Why might phenotype be more severe than typical Turner?', choices: ['More monosomic cells', 'Failure of XIST in ring → biallelic expression of X genes', 'Random imprinting', 'Triploidy'], answer: 1, explain: 'Some r(X) chromosomes lack XIST (X-inactivation center) → cannot be inactivated → functional disomy of X-linked genes from the ring. This explains the severe phenotype in some r(X) Turner mosaics.' }
];

// ── Initialization ────────────────────────────────────────────────
async function loadData() {
  try {
    const [bands, dosage] = await Promise.all([
      fetch('data/cytobands.json').then(r => r.json()),
      fetch('data/clingen_dosage.json').then(r => r.json())
    ]);
    CYTOBANDS = bands;
    CLINGEN = dosage;

    // Compute chromosome metadata from bands
    for (const b of CYTOBANDS) {
      if (!CHROMOSOMES[b.chr]) {
        CHROMOSOMES[b.chr] = { length: 0, centromere_start: null, centromere_end: null, bands: [] };
      }
      const chr = CHROMOSOMES[b.chr];
      if (b.end > chr.length) chr.length = b.end;
      if (b.stain === 'acen') {
        if (chr.centromere_start === null || b.start < chr.centromere_start) chr.centromere_start = b.start;
        if (chr.centromere_end === null || b.end > chr.centromere_end) chr.centromere_end = b.end;
      }
      chr.bands.push(b);
    }

    return true;
  } catch (e) {
    console.error('Failed to load karyotype data:', e);
    return false;
  }
}

// ── Chromosome SVG rendering ──────────────────────────────────────
function renderChromosome(chrId, options = {}) {
  const chr = CHROMOSOMES[chrId];
  if (!chr) return '';

  const maxLength = CHROMOSOMES['1'].length;
  const pixelHeight = options.height || 90;
  const width = options.width || 12;
  const scale = pixelHeight / maxLength;
  const totalH = chr.length * scale;

  let svg = `<svg class="chr-svg" width="${width + 4}" height="${totalH + 4}" viewBox="0 0 ${width + 4} ${totalH + 4}">`;
  svg += `<g transform="translate(2,2)">`;

  // Draw bands - use CSS classes (band-gneg etc.) so theme can swap colors
  for (const b of chr.bands) {
    const y = b.start * scale;
    const h = (b.end - b.start) * scale;
    const stainClass = `band-${b.stain || 'gneg'}`;
    const isAcen = b.stain === 'acen';

    if (isAcen) {
      svg += `<rect class="${stainClass}" x="2" y="${y}" width="${width - 4}" height="${h}"/>`;
    } else {
      svg += `<rect class="${stainClass}" x="0" y="${y}" width="${width}" height="${h}" data-band="${b.band}" data-chr="${chrId}"/>`;
    }
  }

  // Outline
  svg += `<rect class="chr-outline" x="0" y="0" width="${width}" height="${totalH}" rx="2" ry="2"/>`;
  svg += `</g></svg>`;
  return svg;
}

function renderKaryogram(highlightChr = null, aberration = null) {
  let html = '';
  for (const [groupName, chrs] of Object.entries(DENVER_GROUPS)) {
    html += `<div class="kgroup"><div class="kgroup-label">Group ${groupName}</div><div class="kgroup-row">`;
    for (const chrId of chrs) {
      const isHighlighted = highlightChr === chrId;
      // Show pair (most chromosomes) or single (Y)
      const isY = chrId === 'Y';
      const sel = isHighlighted ? 'selected' : '';
      html += `<div class="chr-pair ${sel}" data-chr="${chrId}">`;
      html += `<div class="chr-pair-svgs">`;
      html += renderChromosome(chrId);
      if (!isY) html += renderChromosome(chrId);
      // Aberration: extra copy
      if (aberration && aberration.type === 'trisomy' && aberration.chr === chrId) {
        html += renderChromosome(chrId);
      }
      html += `</div>`;
      html += `<div class="chr-num">${chrId}</div>`;
      html += `</div>`;
    }
    html += `</div></div>`;
  }
  return html;
}

// ── Compare Mode (chromosome pager) ───────────────────────────────
const CHROMOSOME_ORDER = [
  '1','2','3','4','5','6','7','8','9','10','11','12',
  '13','14','15','16','17','18','19','20','21','22','X','Y'
];
const REAL_CROPS_PER_CHR = 30;

let activeChr = '1';
let activeCropIdx = 1; // 1..30
let pagerRotation = 0; // degrees

function renderCompareMode() {
  const container = document.getElementById('mode-compare');
  if (!container) return;

  container.innerHTML = `
    <div class="compare-split">
      <div class="compare-side schema-side">
        <h3>Schematic (UCSC GRCh38)</h3>
        <div class="schema-pager-host">
          <div id="schema-large"></div>
          <div id="schema-large-label" class="schema-large-label"></div>
        </div>
        <div id="compare-svg" class="schema-mini-grid"></div>
      </div>
      <div class="compare-side real-side">
        <h3>Real (Lin et al. 2023)</h3>
        <div class="pager">
          <button class="pager-arrow pager-up" data-dir="prev-chr" title="Previous chromosome (\u2191)">\u25B2</button>
          <div class="pager-main">
            <button class="pager-arrow pager-left" data-dir="prev-crop" title="Previous specimen (\u2190)">\u25C0</button>
            <div class="pager-img-wrap" id="pager-img-wrap" title="Drag to rotate">
              <img id="pager-img" class="pager-img" src="" alt="" draggable="false">
            </div>
            <button class="pager-arrow pager-right" data-dir="next-crop" title="Next specimen (\u2192)">\u25B6</button>
          </div>
          <button class="pager-arrow pager-down" data-dir="next-chr" title="Next chromosome (\u2193)">\u25BC</button>
        </div>
        <div class="pager-meta">
          <span id="pager-chr-label">Chromosome 1</span>
          <span id="pager-rotation">0&deg;</span>
          <span id="pager-crop-counter">1 / 30</span>
        </div>
        <div class="pager-controls">
          <button id="pager-reset-rotation" class="pager-mini-btn" title="Reset rotation">Reset \u21BB</button>
        </div>
        <div class="pager-license">CC BY 4.0 &middot; Lin et al. 2023, Sci Data</div>
      </div>
    </div>
    <div class="compare-info" id="compare-info">
      Click a chromosome below to load it. Hover over bands in the large schema for names. Use \u2190\u2192 for specimens, \u2191\u2193 for chromosomes.
    </div>
  `;

  // Render the schema mini-grid
  const svgHost = document.getElementById('compare-svg');
  if (svgHost) {
    svgHost.innerHTML = renderKaryogram(activeChr);
    bindSchemaInteractions(svgHost);
  }

  // Pager arrow buttons
  container.querySelectorAll('.pager-arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.dataset.dir;
      handlePagerNav(dir);
    });
  });

  // Pager image rotation (drag to rotate)
  setupPagerRotation();

  // Reset rotation button
  const resetBtn = document.getElementById('pager-reset-rotation');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      pagerRotation = 0;
      applyPagerRotation();
    });
  }

  // Keyboard navigation
  if (!window._karyoKeyHandler) {
    window._karyoKeyHandler = (e) => {
      // Only respond when compare mode is active
      const compareActive = document.getElementById('mode-compare')?.classList.contains('active');
      if (!compareActive) return;
      switch (e.key) {
        case 'ArrowLeft':  handlePagerNav('prev-crop'); e.preventDefault(); break;
        case 'ArrowRight': handlePagerNav('next-crop'); e.preventDefault(); break;
        case 'ArrowUp':    handlePagerNav('prev-chr');  e.preventDefault(); break;
        case 'ArrowDown':  handlePagerNav('next-chr');  e.preventDefault(); break;
      }
    };
    document.addEventListener('keydown', window._karyoKeyHandler);
  }

  updatePager();
}

function bindSchemaInteractions(svgHost) {
  svgHost.querySelectorAll('.chr-pair').forEach(pair => {
    pair.style.cursor = 'pointer';
    pair.addEventListener('click', () => {
      activeChr = pair.dataset.chr;
      activeCropIdx = 1;
      updatePager();
      svgHost.innerHTML = renderKaryogram(activeChr);
      bindSchemaInteractions(svgHost);
    });
  });
  svgHost.querySelectorAll('rect[data-band]').forEach(rect => {
    rect.addEventListener('mouseenter', (e) => {
      e.stopPropagation();
      showBandInfo(e.target.dataset.chr, e.target.dataset.band);
    });
  });
}

function handlePagerNav(dir) {
  switch (dir) {
    case 'prev-crop':
      activeCropIdx = activeCropIdx > 1 ? activeCropIdx - 1 : REAL_CROPS_PER_CHR;
      break;
    case 'next-crop':
      activeCropIdx = activeCropIdx < REAL_CROPS_PER_CHR ? activeCropIdx + 1 : 1;
      break;
    case 'prev-chr': {
      const i = CHROMOSOME_ORDER.indexOf(activeChr);
      activeChr = CHROMOSOME_ORDER[i > 0 ? i - 1 : CHROMOSOME_ORDER.length - 1];
      activeCropIdx = 1;
      const svgHost = document.getElementById('compare-svg');
      if (svgHost) {
        svgHost.innerHTML = renderKaryogram(activeChr);
        bindSchemaInteractions(svgHost);
      }
      break;
    }
    case 'next-chr': {
      const i = CHROMOSOME_ORDER.indexOf(activeChr);
      activeChr = CHROMOSOME_ORDER[i < CHROMOSOME_ORDER.length - 1 ? i + 1 : 0];
      activeCropIdx = 1;
      const svgHost = document.getElementById('compare-svg');
      if (svgHost) {
        svgHost.innerHTML = renderKaryogram(activeChr);
        bindSchemaInteractions(svgHost);
      }
      break;
    }
  }
  updatePager();
}

function updatePager() {
  const img = document.getElementById('pager-img');
  const label = document.getElementById('pager-chr-label');
  const counter = document.getElementById('pager-crop-counter');
  if (!img || !label || !counter) return;

  const num = String(activeCropIdx).padStart(3, '0');
  img.src = `img/real_crops/chr${activeChr}/${num}.jpg`;
  img.alt = `Chromosome ${activeChr} specimen ${activeCropIdx}`;
  label.textContent = `Chromosome ${activeChr}`;
  counter.textContent = `${activeCropIdx} / ${REAL_CROPS_PER_CHR}`;

  // Reset rotation on image change
  pagerRotation = 0;
  applyPagerRotation();

  // Also update the large schema with hoverable bands
  updateSchemaLarge();
}

function applyPagerRotation() {
  const img = document.getElementById('pager-img');
  const rotLabel = document.getElementById('pager-rotation');
  if (img) img.style.transform = `rotate(${pagerRotation}deg)`;
  if (rotLabel) rotLabel.textContent = `${Math.round(pagerRotation)}\u00B0`;
}

function setupPagerRotation() {
  const wrap = document.getElementById('pager-img-wrap');
  if (!wrap) return;

  let isDragging = false;
  let centerX = 0, centerY = 0;
  let startAngle = 0;
  let startRotation = 0;

  function getAngle(clientX, clientY) {
    return Math.atan2(clientY - centerY, clientX - centerX) * 180 / Math.PI;
  }

  function startDrag(clientX, clientY) {
    const rect = wrap.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;
    startAngle = getAngle(clientX, clientY);
    startRotation = pagerRotation;
    isDragging = true;
    wrap.classList.add('rotating');
  }

  function moveDrag(clientX, clientY) {
    if (!isDragging) return;
    const angle = getAngle(clientX, clientY);
    pagerRotation = startRotation + (angle - startAngle);
    // Normalize to -180..180
    while (pagerRotation > 180) pagerRotation -= 360;
    while (pagerRotation < -180) pagerRotation += 360;
    applyPagerRotation();
  }

  function endDrag() {
    isDragging = false;
    wrap.classList.remove('rotating');
  }

  // Mouse
  wrap.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  });
  document.addEventListener('mousemove', (e) => {
    if (isDragging) moveDrag(e.clientX, e.clientY);
  });
  document.addEventListener('mouseup', endDrag);

  // Touch
  wrap.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });
  document.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      e.preventDefault();
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });
  document.addEventListener('touchend', endDrag);

  // Mouse wheel = fine rotation in 5° steps
  wrap.addEventListener('wheel', (e) => {
    e.preventDefault();
    pagerRotation += e.deltaY > 0 ? 5 : -5;
    while (pagerRotation > 180) pagerRotation -= 360;
    while (pagerRotation < -180) pagerRotation += 360;
    applyPagerRotation();
  }, { passive: false });
}

function updateSchemaLarge() {
  const host = document.getElementById('schema-large');
  const label = document.getElementById('schema-large-label');
  if (!host) return;
  const chr = CHROMOSOMES[activeChr];
  if (!chr) return;
  host.innerHTML = renderChromosome(activeChr, { height: 320, width: 36 });
  if (label) {
    label.textContent = `Chr ${activeChr} \u2014 ${chr.bands.length} bands \u2014 ${(chr.length / 1e6).toFixed(1)} Mb`;
  }
  // Bind hover for band info
  host.querySelectorAll('rect[data-band]').forEach(rect => {
    rect.addEventListener('mouseenter', (e) => {
      e.stopPropagation();
      showBandInfo(e.target.dataset.chr, e.target.dataset.band);
    });
  });
}

function showBandInfo(chr, band) {
  const info = document.getElementById('compare-info');
  if (!info) return;
  const dosageMatch = CLINGEN.find(d => d.cytoband && d.cytoband.startsWith(chr));
  let dosageInfo = '';
  if (dosageMatch) {
    const targetBand = `${chr}${band}`;
    if (dosageMatch.cytoband === targetBand || dosageMatch.cytoband.startsWith(targetBand)) {
      dosageInfo = ` &mdash; <span class="info-genes">ClinGen: ${dosageMatch.name.substring(0, 80)}</span>`;
    }
  }
  info.innerHTML = `<span class="info-band">${chr}${band}</span>${dosageInfo}`;
}


// ── Aberrations Mode ──────────────────────────────────────────────
function renderAberrationsMode() {
  renderAberrationCategory(activeCategory);
  renderAberrationKaryogram();
}

function renderAberrationCategory(cat) {
  const container = document.getElementById('preset-grid');
  if (!container) return;
  const presets = SYNDROMES[cat] || {};
  let html = '';
  for (const [key, syn] of Object.entries(presets)) {
    const active = activeSyndrome === key ? 'active' : '';
    html += `<button class="preset-syndrome ${active}" data-syn="${key}" data-cat="${cat}">
      <div class="ps-name">${syn.name}</div>
      <div class="ps-iscn">${syn.iscn}</div>
      <div class="ps-freq">${syn.freq}</div>
    </button>`;
  }
  container.innerHTML = html;
  container.querySelectorAll('.preset-syndrome').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSyndrome = btn.dataset.syn;
      renderAberrationCategory(cat);
      renderAberrationKaryogram();
      renderSyndromeInfo();
    });
  });
}

function renderAberrationKaryogram() {
  const container = document.getElementById('aberration-karyo');
  if (!container) return;
  const syn = activeSyndrome ? findSyndrome(activeSyndrome) : null;

  if (!syn) {
    container.innerHTML = renderKaryogram();
    return;
  }

  // Numerical: render full karyogram with extra/missing copy
  if (activeCategory === 'numerical') {
    let aberration = null;
    if (syn.count && syn.count > 2) {
      aberration = { type: 'trisomy', chr: syn.chr };
    }
    container.innerHTML = renderKaryogram(syn.chr, aberration);
    return;
  }

  // Structural deletion: zoom in on the affected chromosome with band highlight
  if (activeCategory === 'structural' && syn.type === 'deletion') {
    container.innerHTML = renderDeletionView(syn);
    bindBandHover(container);
    return;
  }

  // Translocation: show before/after of involved chromosomes
  if (activeCategory === 'translocation') {
    container.innerHTML = renderTranslocationView(syn);
    bindBandHover(container);
    return;
  }

  // Fallback
  container.innerHTML = renderKaryogram(syn.chr);
}

function bindBandHover(container) {
  container.querySelectorAll('rect[data-band]').forEach(rect => {
    rect.addEventListener('mouseenter', (e) => {
      e.stopPropagation();
      const tooltip = document.getElementById('aberration-band-tooltip');
      if (tooltip) {
        tooltip.textContent = `${e.target.dataset.chr}${e.target.dataset.band}`;
      }
    });
  });
}

function renderDeletionView(syn) {
  // Large single chromosome with the affected band highlighted
  const chr = CHROMOSOMES[syn.chr];
  if (!chr) return renderKaryogram(syn.chr);

  // Find which band(s) match the deletion region (e.g. "q11.2")
  const targetRegion = syn.region || '';
  // Render large chromosome
  const svg = renderLargeChromosomeWithHighlight(syn.chr, targetRegion);

  return `
    <div class="aberration-zoom-view">
      <div class="aberration-zoom-svg">${svg}</div>
      <div class="aberration-zoom-info">
        <div class="azi-label">Affected chromosome</div>
        <div class="azi-region">${syn.chr}${targetRegion}</div>
        <div class="azi-note">Submicroscopic deletion &mdash; usually invisible on routine karyotype.
        Detected by FISH probe or chromosomal microarray (CMA) / aCGH.
        The highlighted band(s) mark the deleted region.</div>
        <div id="aberration-band-tooltip" class="azi-tooltip"></div>
      </div>
    </div>
  `;
}

function renderLargeChromosomeWithHighlight(chrId, regionPattern) {
  const chr = CHROMOSOMES[chrId];
  if (!chr) return '';

  const maxLength = CHROMOSOMES['1'].length;
  const pixelHeight = 360;
  const width = 40;
  const scale = pixelHeight / maxLength;
  const totalH = chr.length * scale;

  let svg = `<svg class="chr-svg-large" width="${width + 60}" height="${totalH + 8}" viewBox="0 0 ${width + 60} ${totalH + 8}">`;
  svg += `<g transform="translate(4,4)">`;

  for (const b of chr.bands) {
    const y = b.start * scale;
    const h = (b.end - b.start) * scale;
    const stainClass = `band-${b.stain || 'gneg'}`;
    const isAcen = b.stain === 'acen';
    // Mark this band if it matches the deletion region
    const isHighlighted = regionPattern && b.band.startsWith(regionPattern);
    const extra = isHighlighted ? ' aberration-highlighted' : '';

    if (isAcen) {
      svg += `<rect class="${stainClass}${extra}" x="2" y="${y}" width="${width - 4}" height="${h}"/>`;
    } else {
      svg += `<rect class="${stainClass}${extra}" x="0" y="${y}" width="${width}" height="${h}" data-band="${b.band}" data-chr="${chrId}"/>`;
    }
    // Label every band on the right
    if (h > 4) {
      svg += `<text x="${width + 4}" y="${y + h / 2 + 2}" class="band-label">${b.band}</text>`;
    }
  }

  svg += `<rect class="chr-outline" x="0" y="0" width="${width}" height="${totalH}" rx="3" ry="3"/>`;
  svg += `</g></svg>`;
  return svg;
}

function renderTranslocationView(syn) {
  // For translocations: show the two involved chromosomes side by side
  // with markers for the breakpoints
  const chrA = syn.chrA;
  const chrB = syn.chrB;
  if (!chrA || !chrB) return renderKaryogram();

  const isRobertsonian = syn.iscn && syn.iscn.includes('rob(');

  let html = `<div class="translocation-view">`;
  html += `<div class="trans-pair">`;
  html += `<div class="trans-label">Chromosome ${chrA}</div>`;
  html += `<div class="trans-svg">${renderChromosome(chrA, { height: 280, width: 30 })}</div>`;
  html += `</div>`;
  html += `<div class="trans-arrow">${isRobertsonian ? '\u2295' : '\u2194'}</div>`;
  html += `<div class="trans-pair">`;
  html += `<div class="trans-label">Chromosome ${chrB}</div>`;
  html += `<div class="trans-svg">${renderChromosome(chrB, { height: 280, width: 30 })}</div>`;
  html += `</div>`;
  html += `</div>`;

  if (isRobertsonian) {
    html += `<div class="trans-explainer">
      <strong>Robertsonian fusion:</strong> The two acrocentric chromosomes
      fuse at their centromeres. The short arms (containing only redundant
      rRNA gene clusters) are lost. The carrier has 45 chromosomes total
      but is phenotypically normal.
    </div>`;
  } else {
    html += `<div class="trans-explainer">
      <strong>Reciprocal translocation:</strong> Segments are exchanged
      between the two non-homologous chromosomes. Balanced carriers have
      no phenotype but produce unbalanced gametes during meiosis.
    </div>`;
  }
  return html;
}

function findSyndrome(key) {
  for (const cat of Object.values(SYNDROMES)) {
    if (cat[key]) return cat[key];
  }
  return null;
}

function renderSyndromeInfo() {
  const info = document.getElementById('aberration-info');
  if (!info) return;
  if (!activeSyndrome) {
    info.innerHTML = `<div style="color:var(--text-dim);font-size:0.72rem;">${t('selectSyndrome')}</div>`;
    return;
  }
  const syn = findSyndrome(activeSyndrome);
  if (!syn) return;
  const features = synText(activeSyndrome, 'features') || syn.features;
  const mechanism = synText(activeSyndrome, 'mechanism') || syn.mechanism;
  let html = `<h3>${syn.name}`;
  if (syn.clingen) html += `<span class="clingen-badge">ClinGen ${syn.clingen}</span>`;
  html += `</h3>`;
  html += `<div class="iscn-line">${syn.iscn}</div>`;
  html += `<div><strong>${uiLang === 'de' ? 'Häufigkeit' : 'Frequency'}:</strong> ${syn.freq}</div>`;
  html += `<div class="features"><strong>${uiLang === 'de' ? 'Merkmale' : 'Features'}:</strong> ${features}</div>`;
  html += `<div class="features"><strong>${uiLang === 'de' ? 'Mechanismus' : 'Mechanism'}:</strong> ${mechanism}</div>`;
  info.innerHTML = html;

  // Show segregation animation for Robertsonian
  const segArea = document.getElementById('segregation-area');
  if (segArea) {
    if (activeSyndrome.startsWith('rob_')) {
      segArea.style.display = 'block';
      renderSegregation();
    } else {
      segArea.style.display = 'none';
    }
  }
}

function renderSegregation() {
  const container = document.getElementById('gametes-row');
  if (!container) return;
  // Map from EN labels to i18n keys
  const labelKey = { 'Alternate': 'seg_alternate', 'Adjacent': 'seg_adjacent' };
  const resultKey = { 'Normal': 'seg_normal', 'Balanced carrier': 'seg_balanced',
    'Trisomy 14': 'Trisomy 14', 'Trisomy 13': 'Trisomy 13',
    'Monosomy 14': 'Monosomy 14', 'Monosomy 13': 'Monosomy 13' };
  const phenoKey = { 'Healthy': 'seg_healthy', 'Healthy (like parent)': 'seg_healthy_parent',
    'Lethal (miscarriage)': 'seg_lethal', 'Patau syndrome': 'seg_patau' };
  let html = '';
  for (const g of ROB_SEGREGATION) {
    html += `<div class="gamete ${g.class}">
      <div class="g-label">${t(labelKey[g.label] || g.label)}</div>
      <div class="g-result">${t(resultKey[g.result] || g.result) || g.result}</div>
      <div class="g-pheno">${t(phenoKey[g.pheno] || g.pheno) || g.pheno}</div>
    </div>`;
  }
  container.innerHTML = html;
}

// ── Quiz / Exam Mode (QUIZ_CASES from quiz_cases.js) ──────────────
let qzCaseIdx = 0;
let qzSubIdx = 0;
let qzAnswered = false;
let qzDifficulty = 'student'; // 'student' or 'facharzt'
let qzStats = { correct: 0, total: 0, byCase: {} };

function renderQuizMode() {
  loadQzState();
  renderQzCase();
}

function loadQzState() {
  try {
    const s = localStorage.getItem('helix_quiz_stats');
    if (s) qzStats = JSON.parse(s);
  } catch (e) {}
}

function saveQzState() {
  try { localStorage.setItem('helix_quiz_stats', JSON.stringify(qzStats)); } catch (e) {}
}

function renderQzCase() {
  const area = document.getElementById('quiz-area');
  if (!area) return;
  // Select language-appropriate question bank
  const casesDE = window.QUIZ_CASES || [];
  const casesEN = window.QUIZ_CASES_EN || [];
  const cases = (uiLang === 'en' && casesEN.length > 0) ? casesEN : casesDE;
  if (cases.length === 0) {
    area.innerHTML = '<div style="padding:1rem;color:var(--danger);">Quiz data not loaded.</div>';
    return;
  }
  const c = cases[qzCaseIdx];
  if (!c) return;

  // Get questions from expert pool if available and facharzt mode, else student
  const expertPoolDE = window.QUIZ_EXPERT || {};
  const expertPoolEN = window.QUIZ_EXPERT_EN || {};
  const expertPool = (uiLang === 'en' && Object.keys(expertPoolEN).length > 0) ? expertPoolEN : expertPoolDE;
  const expertQs = expertPool[c.id];
  const questions = (qzDifficulty === 'facharzt' && expertQs) ? expertQs : c.sub;
  const sub = questions[qzSubIdx];
  if (!sub) return;
  const hasExpert = !!expertQs;

  qzAnswered = false;
  const progress = ((qzCaseIdx * 5 + qzSubIdx + 1) / (cases.length * 5)) * 100;

  // Subfrage-Tabs (1-5)
  const subLabels = ['Diagnose', 'Klinik', 'Diagnostik', 'Genetik', 'Beratung'];
  let subTabs = '';
  for (let i = 0; i < c.sub.length; i++) {
    const answered = qzStats.byCase?.[c.id]?.[i] !== undefined;
    const cls = i === qzSubIdx ? 'active' : (answered ? 'done' : '');
    subTabs += `<button class="qz-sub-tab ${cls}" data-sub="${i}">${subLabels[i] || (i + 1)}</button>`;
  }

  // Image: use real photo if available, else render SVG karyogram
  let karyoHtml = '';
  if (c.img) {
    karyoHtml = `<img class="qz-karyo-img" src="${c.img}" alt="Karyotype">`;
  } else {
    karyoHtml = `<div class="qz-iscn-display">${c.iscn}</div>`;
  }

  area.innerHTML = `
    <div class="qz-header">
      <span>Fall ${qzCaseIdx + 1}/${cases.length}</span>
      <div class="exam-progress-bar"><div class="exam-progress-fill" style="width:${progress}%"></div></div>
      <span class="exam-counter">${qzStats.correct || 0}/${qzStats.total || 0}</span>
      <div class="qz-diff-toggle">
        <button class="qz-diff-btn ${qzDifficulty === 'student' ? 'active' : ''}" data-diff="student">Studium</button>
        <button class="qz-diff-btn ${qzDifficulty === 'facharzt' ? 'active' : ''}" data-diff="facharzt" ${hasExpert ? '' : 'disabled title="Noch keine Facharzt-Fragen fuer diesen Fall"'}>Facharzt</button>
      </div>
    </div>
    <div class="qz-sub-tabs">${subTabs}</div>
    <div class="exam-case">
      <div class="exam-vignette">${c.vignette}</div>
      <div class="qz-karyo">${karyoHtml}</div>
      <div class="qz-iscn-line">${c.iscn}</div>
      <div class="quiz-question">${sub.q}</div>
      <div class="quiz-choices">
        ${sub.choices.map((ch, i) => `<button class="quiz-choice" data-i="${i}">${ch}</button>`).join('')}
      </div>
      <div class="qz-explain" id="qz-explain"></div>
    </div>
    <div class="exam-controls">
      <button id="qz-prev">Prev</button>
      <button id="qz-next" class="primary">Next</button>
      <button id="qz-reset" class="secondary">Reset Stats</button>
    </div>
  `;

  // Answer buttons
  area.querySelectorAll('.quiz-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      if (qzAnswered) return;
      qzAnswered = true;
      const i = parseInt(btn.dataset.i);
      const correct = i === sub.answer;
      area.querySelectorAll('.quiz-choice').forEach((b, idx) => {
        b.disabled = true;
        if (idx === sub.answer) b.classList.add('correct');
        else if (idx === i) b.classList.add('wrong');
      });
      const exp = document.getElementById('qz-explain');
      if (exp) {
        exp.classList.add('show');
        exp.innerHTML = `<strong>${correct ? 'Richtig!' : 'Falsch.'}</strong> ${sub.explain}`;
      }
      qzStats.total = (qzStats.total || 0) + 1;
      if (correct) qzStats.correct = (qzStats.correct || 0) + 1;
      if (!qzStats.byCase) qzStats.byCase = {};
      if (!qzStats.byCase[c.id]) qzStats.byCase[c.id] = {};
      qzStats.byCase[c.id][qzSubIdx] = correct;
      saveQzState();
    });
  });

  // Sub-tabs
  area.querySelectorAll('.qz-sub-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      qzSubIdx = parseInt(tab.dataset.sub);
      renderQzCase();
    });
  });

  // Navigation
  document.getElementById('qz-prev')?.addEventListener('click', () => {
    if (qzSubIdx > 0) { qzSubIdx--; }
    else if (qzCaseIdx > 0) { qzCaseIdx--; qzSubIdx = 4; }
    renderQzCase();
  });
  document.getElementById('qz-next')?.addEventListener('click', () => {
    if (qzSubIdx < 4) { qzSubIdx++; }
    else if (qzCaseIdx < cases.length - 1) { qzCaseIdx++; qzSubIdx = 0; }
    renderQzCase();
  });
  document.getElementById('qz-reset')?.addEventListener('click', () => {
    qzStats = { correct: 0, total: 0, byCase: {} };
    saveQzState();
    qzCaseIdx = 0;
    qzSubIdx = 0;
    renderQzCase();
  });

  // Difficulty toggle
  area.querySelectorAll('.qz-diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      qzDifficulty = btn.dataset.diff;
      qzSubIdx = 0;
      renderQzCase();
    });
  });
}

// ── Build Mode (sorting game) ─────────────────────────────────────
let buildState = null;

function renderBuildMode() {
  const area = document.getElementById('build-area');
  if (!area) return;
  if (!buildState) {
    initBuildGame('easy');
  }
  drawBuildGame();
}

function initBuildGame(difficulty) {
  let pieces = [];
  if (difficulty === 'hard') {
    for (const chr of CHROMOSOME_ORDER) {
      const count = (chr === 'X' || chr === 'Y') ? 1 : 2;
      const indices = pickRandomDistinct(REAL_CROPS_PER_CHR, count);
      indices.forEach(idx => pieces.push({ chr, cropIdx: idx, id: `${chr}_${idx}` }));
    }
  } else {
    for (const chr of CHROMOSOME_ORDER) {
      const idx = 1 + Math.floor(Math.random() * REAL_CROPS_PER_CHR);
      pieces.push({ chr, cropIdx: idx, id: `${chr}_${idx}` });
    }
  }
  pieces.forEach(p => {
    p.rotation = Math.floor(Math.random() * 12) * 30 - 180;
    p.userRotation = p.rotation; // user can adjust
  });
  pieces = shuffle(pieces);

  buildState = {
    difficulty,
    pieces,
    placements: {},  // slotKey -> piece.id
    answers: {},     // piece.id -> chrId (for single mode)
    selectedPieceId: null,
    submitted: false,
    score: null,
    startTime: Date.now(),
    viewMode: 'single',  // 'single' or 'spread'
    singleIdx: 0,        // current piece in single mode
    hintsUsed: 0,
    showingHint: false,
  };
}

function pickRandomDistinct(max, count) {
  const result = [];
  while (result.length < count) {
    const v = 1 + Math.floor(Math.random() * max);
    if (!result.includes(v)) result.push(v);
  }
  return result;
}

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function drawBuildGame() {
  const area = document.getElementById('build-area');
  if (!area || !buildState) return;

  const total = buildState.pieces.length;
  const answered = Object.keys(buildState.answers).length;
  let scoreLine = `${answered} / ${total}`;
  if (buildState.submitted && buildState.score !== null) {
    const elapsed = Math.round((buildState.score.endTime - buildState.startTime) / 1000);
    scoreLine = `${buildState.score.correct}/${total} richtig (${elapsed}s, ${buildState.hintsUsed} Hilfen)`;
  }

  if (buildState.viewMode === 'single') {
    drawBuildSingleMode(area, scoreLine);
  } else {
    drawBuildSpreadMode(area, scoreLine);
  }
}

function drawBuildSingleMode(area, scoreLine) {
  const piece = buildState.pieces[buildState.singleIdx];
  if (!piece) return;

  const num = String(piece.cropIdx).padStart(3, '0');
  const src = `img/real_crops/chr${piece.chr}/${num}.jpg`;
  const answered = buildState.answers[piece.id];
  const isAnswered = answered !== undefined;

  // Chromosome dropdown options
  let options = '<option value="">-- Zuordnen --</option>';
  for (const chr of CHROMOSOME_ORDER) {
    const sel = answered === chr ? 'selected' : '';
    options += `<option value="${chr}" ${sel}>Chromosom ${chr}</option>`;
  }

  // Show result coloring if submitted
  let resultClass = '';
  if (buildState.submitted && isAnswered) {
    resultClass = answered === piece.chr ? 'correct' : 'incorrect';
  }

  // Hint: UCSC schema side-by-side with the real image
  let hintSideHtml = '';
  if (buildState.showingHint) {
    // Show ALL 24 schemata next to the real image for comparison
    hintSideHtml = `
      <div class="build-hint-side">
        <div class="build-hint-label">UCSC Schema (-1 Punkt)</div>
        <div class="build-hint-all">${CHROMOSOME_ORDER.map(c =>
          `<div class="build-hint-chr" data-hint-chr="${c}">
            <div class="build-hint-svg">${renderChromosome(c, { height: 120, width: 14 })}</div>
            <div class="build-hint-num">${c}</div>
          </div>`
        ).join('')}</div>
      </div>`;
  }

  area.innerHTML = `
    <div class="build-toolbar">
      <span class="build-status">${scoreLine}</span>
      <div class="build-buttons">
        <button class="build-view-btn ${buildState.viewMode === 'single' ? 'active' : ''}" data-view="single">Einzeln</button>
        <button class="build-view-btn ${buildState.viewMode === 'spread' ? 'active' : ''}" data-view="spread">Alle</button>
        <button class="build-diff-btn ${buildState.difficulty === 'easy' ? 'active' : ''}" data-diff="easy">24</button>
        <button class="build-diff-btn ${buildState.difficulty === 'hard' ? 'active' : ''}" data-diff="hard">46</button>
      </div>
    </div>
    <div class="build-single-layout">
      <div class="build-single ${resultClass}">
        <div class="build-single-counter">${buildState.singleIdx + 1} / ${buildState.pieces.length}</div>
        <div class="build-single-img-wrap" id="build-single-img-wrap">
          <img src="${src}" alt="" draggable="false" style="transform:rotate(${piece.userRotation}deg)" id="build-single-img">
        </div>
        <div class="build-single-controls">
          <button id="build-rotate-left" class="pager-mini-btn">-90</button>
          <button id="build-rotate-reset" class="pager-mini-btn">0</button>
          <button id="build-rotate-right" class="pager-mini-btn">+90</button>
          <span class="build-rotation-display">${Math.round(piece.userRotation)}\u00B0</span>
        </div>
        <select id="build-assign" class="build-assign-select">${options}</select>
        ${buildState.submitted && isAnswered && answered !== piece.chr ?
          `<div class="build-correct-answer">Richtig: Chromosom ${piece.chr}</div>` : ''}
        <div class="build-single-nav">
          <button id="build-prev" class="pager-arrow pager-left" ${buildState.singleIdx === 0 ? 'disabled' : ''}>\u25C0</button>
          <button id="build-hint-btn" class="build-action-btn secondary">\u{1F50D} Hilfe</button>
          <button id="build-next" class="pager-arrow pager-right">\u25B6</button>
        </div>
      </div>
      ${hintSideHtml}
    </div>
    <div class="build-single-nav-bottom">
      <button id="build-submit" class="build-action-btn" ${Object.keys(buildState.answers).length < buildState.pieces.length ? 'disabled' : ''}>Auswerten</button>
    </div>
  `;

  bindBuildSingleInteractions(piece);
}

function drawBuildSpreadMode(area, scoreLine) {
  // Existing spread mode (show all pieces at once + slot grid)
  let spreadHtml = '';
  const placedIds = new Set(Object.values(buildState.placements));
  const unplaced = buildState.pieces.filter(p => !placedIds.has(p.id));
  for (const piece of unplaced) {
    spreadHtml += renderBuildPiece(piece, false);
  }

  let slotsHtml = '';
  for (const [groupName, chrs] of Object.entries(DENVER_GROUPS)) {
    slotsHtml += `<div class="build-group"><div class="build-group-label">${groupName}</div><div class="build-group-row">`;
    for (const chr of chrs) {
      const slotCount = (buildState.difficulty === 'hard' && chr !== 'X' && chr !== 'Y') ? 2 : 1;
      slotsHtml += `<div class="build-slot-pair">`;
      for (let s = 0; s < slotCount; s++) {
        const slotKey = `${chr}_${s}`;
        const placedId = buildState.placements[slotKey];
        const placedPiece = placedId ? buildState.pieces.find(p => p.id === placedId) : null;
        let slotClass = 'build-slot';
        let slotContent = '';
        if (placedPiece) {
          if (buildState.submitted) {
            slotClass += placedPiece.chr === chr ? ' correct' : ' incorrect';
          }
          slotContent = renderBuildPiece(placedPiece, true);
        }
        slotsHtml += `<div class="${slotClass}" data-slot="${slotKey}">${slotContent}</div>`;
      }
      slotsHtml += `<div class="build-slot-label">${chr}</div></div>`;
    }
    slotsHtml += `</div></div>`;
  }

  const placed = Object.keys(buildState.placements).length;
  area.innerHTML = `
    <div class="build-toolbar">
      <span class="build-status">${scoreLine}</span>
      <div class="build-buttons">
        <button class="build-view-btn ${buildState.viewMode === 'single' ? 'active' : ''}" data-view="single">Einzeln</button>
        <button class="build-view-btn ${buildState.viewMode === 'spread' ? 'active' : ''}" data-view="spread">Alle</button>
        <button class="build-diff-btn ${buildState.difficulty === 'easy' ? 'active' : ''}" data-diff="easy">24</button>
        <button class="build-diff-btn ${buildState.difficulty === 'hard' ? 'active' : ''}" data-diff="hard">46</button>
        <button id="build-submit" class="build-action-btn" ${placed < buildState.pieces.length ? 'disabled' : ''}>Auswerten</button>
      </div>
    </div>
    <div class="build-spread" id="build-spread">${spreadHtml}</div>
    <div class="build-grid">${slotsHtml}</div>
    <div class="build-hint" style="font-size:0.6rem;color:var(--text-dim);padding:0.3rem 0.8rem;">
      Klicke ein Chromosom, dann einen Slot. Rotiert — identifiziere am Banding-Muster.
    </div>
  `;

  bindBuildSpreadInteractions();
}

function renderBuildPiece(piece, isPlaced) {
  const num = String(piece.cropIdx).padStart(3, '0');
  const src = `img/real_crops/chr${piece.chr}/${num}.jpg`;
  const selected = buildState.selectedPieceId === piece.id ? 'selected' : '';
  return `<div class="build-piece ${selected}" data-piece-id="${piece.id}" data-placed="${isPlaced ? '1' : '0'}">
    <img src="${src}" alt="" draggable="false" style="transform:rotate(${piece.rotation}deg)">
  </div>`;
}

function bindBuildSingleInteractions(piece) {
  // Rotation buttons
  document.getElementById('build-rotate-left')?.addEventListener('click', () => {
    piece.userRotation -= 90;
    drawBuildGame();
  });
  document.getElementById('build-rotate-right')?.addEventListener('click', () => {
    piece.userRotation += 90;
    drawBuildGame();
  });
  document.getElementById('build-rotate-reset')?.addEventListener('click', () => {
    piece.userRotation = 0;
    drawBuildGame();
  });

  // Mouse wheel rotation on image
  document.getElementById('build-single-img-wrap')?.addEventListener('wheel', (e) => {
    e.preventDefault();
    piece.userRotation += e.deltaY > 0 ? 15 : -15;
    drawBuildGame();
  }, { passive: false });

  // Assignment dropdown — immediate feedback + auto-advance
  document.getElementById('build-assign')?.addEventListener('change', (e) => {
    if (buildState.submitted) return;
    const val = e.target.value;
    if (!val) { delete buildState.answers[piece.id]; drawBuildGame(); return; }
    buildState.answers[piece.id] = val;
    const correct = val === piece.chr;

    // Flash feedback on the image wrap
    const wrap = document.getElementById('build-single-img-wrap');
    const feedback = document.createElement('div');
    feedback.className = 'build-flash ' + (correct ? 'flash-correct' : 'flash-wrong');
    feedback.textContent = correct ? 'Richtig!' : `Falsch — Chr ${piece.chr}`;
    if (wrap) wrap.parentElement.insertBefore(feedback, wrap.nextSibling);

    // Auto-advance after brief delay
    setTimeout(() => {
      buildState.showingHint = false;
      if (buildState.singleIdx < buildState.pieces.length - 1) {
        buildState.singleIdx++;
      }
      drawBuildGame();
    }, correct ? 600 : 1500);
  });

  // Navigation
  document.getElementById('build-prev')?.addEventListener('click', () => {
    if (buildState.singleIdx > 0) { buildState.singleIdx--; buildState.showingHint = false; drawBuildGame(); }
  });
  document.getElementById('build-next')?.addEventListener('click', () => {
    if (buildState.singleIdx < buildState.pieces.length - 1) {
      buildState.singleIdx++;
      buildState.showingHint = false;
      drawBuildGame();
    }
  });

  // Hint
  document.getElementById('build-hint-btn')?.addEventListener('click', () => {
    if (!buildState.showingHint) {
      buildState.hintsUsed++;
    }
    buildState.showingHint = !buildState.showingHint;
    drawBuildGame();
  });

  // Submit (evaluate all)
  document.getElementById('build-submit')?.addEventListener('click', () => {
    let correct = 0;
    for (const p of buildState.pieces) {
      if (buildState.answers[p.id] === p.chr) correct++;
    }
    buildState.submitted = true;
    buildState.score = { correct: correct - buildState.hintsUsed, endTime: Date.now() };
    if (buildState.score.correct < 0) buildState.score.correct = 0;
    drawBuildGame();
  });

  // Common buttons
  bindBuildCommonButtons();
}

function bindBuildSpreadInteractions() {
  document.querySelectorAll('.build-spread .build-piece').forEach(el => {
    el.addEventListener('click', () => {
      const pieceId = el.dataset.pieceId;
      buildState.selectedPieceId = buildState.selectedPieceId === pieceId ? null : pieceId;
      drawBuildGame();
    });
  });
  document.querySelectorAll('.build-slot .build-piece').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (buildState.submitted) return;
      const pieceId = el.dataset.pieceId;
      for (const [slot, pid] of Object.entries(buildState.placements)) {
        if (pid === pieceId) { delete buildState.placements[slot]; break; }
      }
      buildState.selectedPieceId = pieceId;
      drawBuildGame();
    });
  });
  document.querySelectorAll('.build-slot').forEach(slotEl => {
    slotEl.addEventListener('click', () => {
      if (buildState.submitted || !buildState.selectedPieceId) return;
      const slotKey = slotEl.dataset.slot;
      if (buildState.placements[slotKey]) return;
      buildState.placements[slotKey] = buildState.selectedPieceId;
      buildState.selectedPieceId = null;
      drawBuildGame();
    });
  });
  document.getElementById('build-submit')?.addEventListener('click', () => {
    let correct = 0;
    for (const [slotKey, pieceId] of Object.entries(buildState.placements)) {
      const piece = buildState.pieces.find(p => p.id === pieceId);
      if (piece && piece.chr === slotKey.split('_')[0]) correct++;
    }
    buildState.submitted = true;
    buildState.score = { correct, endTime: Date.now() };
    drawBuildGame();
  });
  bindBuildCommonButtons();
}

function bindBuildCommonButtons() {
  // Difficulty
  document.querySelectorAll('.build-diff-btn').forEach(btn => {
    btn.addEventListener('click', () => { initBuildGame(btn.dataset.diff); drawBuildGame(); });
  });
  // View toggle
  document.querySelectorAll('.build-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      buildState.viewMode = btn.dataset.view;
      buildState.showingHint = false;
      drawBuildGame();
    });
  });
  // Reset
  document.getElementById('build-reset')?.addEventListener('click', () => {
    initBuildGame(buildState.difficulty);
    drawBuildGame();
  });
}

// ── Mode switching ────────────────────────────────────────────────
function switchMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.mode === mode);
  });
  document.querySelectorAll('.mode-panel').forEach(p => {
    p.classList.toggle('active', p.id === `mode-${mode}`);
  });

  switch (mode) {
    case 'compare': renderCompareMode(); break;
    case 'aberrations': renderAberrationsMode(); break;
    case 'quiz': renderQuizMode(); break;
    case 'build': renderBuildMode(); break;
  }
}

// ── Theme Toggle ──────────────────────────────────────────────────
function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('karyo-light');
  } else {
    document.body.classList.remove('karyo-light');
  }
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.innerHTML = theme === 'light' ? '\u263E' : '\u2600';
  try { localStorage.setItem('helix_karyo_theme', theme); } catch (e) {}
}

function initTheme() {
  let theme = 'dark';
  try {
    theme = localStorage.getItem('helix_karyo_theme') || 'dark';
  } catch (e) {}
  applyTheme(theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const cur = document.body.classList.contains('karyo-light') ? 'light' : 'dark';
      applyTheme(cur === 'light' ? 'dark' : 'light');
    });
  }
}

// ── Init ──────────────────────────────────────────────────────────
async function init() {
  if (new URLSearchParams(location.search).has('embed')) {
    document.body.classList.add('embed');
  }

  const ok = await loadData();
  if (!ok) {
    document.querySelector('.widget').innerHTML += '<div style="padding:1rem;color:var(--danger);">Failed to load karyotype data.</div>';
    return;
  }

  initTheme();

  // Language toggle — use shared i18n.js if available, but keep local uiLang in sync
  try { uiLang = localStorage.getItem('helix_lang') || 'de'; } catch (e) {}
  if (window.helixI18n) {
    // Let i18n.js handle the toggle button
    uiLang = window.helixI18n.getLang();
    window.addEventListener('helix:lang-changed', (e) => {
      uiLang = e.detail.lang;
      applyKaryoI18n();
      switchMode(currentMode);
    });
  } else {
    // Standalone fallback
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
      langBtn.textContent = uiLang.toUpperCase();
      langBtn.addEventListener('click', () => {
        uiLang = uiLang === 'de' ? 'en' : 'de';
        langBtn.textContent = uiLang.toUpperCase();
        try { localStorage.setItem('helix_lang', uiLang); } catch (e) {}
        applyKaryoI18n();
        switchMode(currentMode);
      });
    }
  }
  applyKaryoI18n();

  // Tab listeners
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => switchMode(tab.dataset.mode));
  });

  // Category tabs (aberrations)
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      activeSyndrome = null;
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b === btn));
      renderAberrationCategory(activeCategory);
      renderSyndromeInfo();
    });
  });

  // Default mode
  switchMode('compare');
}

function applyKaryoI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t(el.dataset.i18n);
    if (v !== el.dataset.i18n) el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    const v = (I18N[uiLang] || {})[key];
    if (v) el.innerHTML = v;
  });
}

init();
