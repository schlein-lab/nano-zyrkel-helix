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
let examIndex = 0;
let examAnswered = false;
let examStats = { correct: 0, total: 0, byCategory: {} };

// G-banding palette (matches CSS)
const STAIN_COLORS = {
  gneg:    '#1e293b',
  gpos25:  '#475569',
  gpos50:  '#6b7280',
  gpos75:  '#9ca3af',
  gpos100: '#e5e7eb',
  acen:    '#06b6d4',
  gvar:    '#818cf8',
  stalk:   '#f59e0b'
};

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

// ── Exam cases (50 clinical scenarios) ────────────────────────────
const EXAM_CASES = [
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

  // Draw bands
  for (const b of chr.bands) {
    const y = b.start * scale;
    const h = (b.end - b.start) * scale;
    const stainColor = STAIN_COLORS[b.stain] || '#475569';
    const isAcen = b.stain === 'acen';

    if (isAcen) {
      // Draw centromere as triangular indent
      const cy = y + h / 2;
      svg += `<rect x="2" y="${y}" width="${width - 4}" height="${h}" fill="${stainColor}"/>`;
    } else {
      svg += `<rect x="0" y="${y}" width="${width}" height="${h}" fill="${stainColor}" data-band="${b.band}" data-chr="${chrId}"/>`;
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

// ── Compare Mode (Zoom + multiple specimens per chromosome) ───────
const SPECIMENS = [
  {
    id: 'nhgri',
    name: 'NHGRI 46,XY',
    src: 'img/nhgri_karyotype.png',
    license: 'Public Domain (NIH)',
    note: 'Reference G-banding from National Human Genome Research Institute. High-condensation metaphase.'
  },
  {
    id: 'general',
    name: 'General 46,XY',
    src: 'img/general_male.jpg',
    license: 'CC BY-SA 4.0',
    note: 'Different specimen, different lab. Notice the variation in banding sharpness and chromosome condensation.'
  },
  {
    id: 'trisomy21',
    name: 'Trisomy 21',
    src: 'img/trisomy21.png',
    license: 'Public Domain (DOE)',
    note: 'Down syndrome example: count the chromosomes in row 21. This is what aneuploidy looks like in real cytogenetics.'
  }
];

let activeSpecimen = 'nhgri';

function renderCompareMode() {
  const container = document.getElementById('mode-compare');
  if (!container) return;

  const specimen = SPECIMENS.find(s => s.id === activeSpecimen);

  container.innerHTML = `
    <div class="compare-toolbar">
      <span class="toolbar-label">Real specimen:</span>
      <div class="specimen-tabs">
        ${SPECIMENS.map(s => `
          <button class="specimen-tab ${s.id === activeSpecimen ? 'active' : ''}" data-spec="${s.id}">${s.name}</button>
        `).join('')}
      </div>
    </div>
    <div class="compare-split">
      <div class="compare-side">
        <h3>Schematic (UCSC GRCh38)</h3>
        <div id="compare-svg"></div>
      </div>
      <div class="compare-side real">
        <h3>Real (${specimen.name})</h3>
        <div class="real-photo-wrap">
          <img class="real-photo" src="${specimen.src}" alt="${specimen.name}">
        </div>
        <div class="specimen-license">${specimen.license}</div>
      </div>
    </div>
    <div class="compare-info" id="compare-info">
      <strong>${specimen.note}</strong><br>
      <span style="font-size:0.65rem;">Click any chromosome pair on the left to zoom in and compare schema vs. real ideogram side-by-side.</span>
    </div>
  `;

  // Render SVG karyogram into the left side
  const svgHost = document.getElementById('compare-svg');
  if (svgHost) {
    svgHost.innerHTML = renderKaryogram();
    // Make chromosome pairs clickable to open zoom modal
    svgHost.querySelectorAll('.chr-pair').forEach(pair => {
      pair.style.cursor = 'pointer';
      pair.addEventListener('click', () => {
        const chrId = pair.dataset.chr;
        openChromosomeZoom(chrId);
      });
    });
    // Hover for band info
    svgHost.querySelectorAll('rect[data-band]').forEach(rect => {
      rect.addEventListener('mouseenter', (e) => {
        e.stopPropagation();
        showBandInfo(e.target.dataset.chr, e.target.dataset.band);
      });
    });
  }

  // Specimen tab switching
  container.querySelectorAll('.specimen-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSpecimen = btn.dataset.spec;
      renderCompareMode();
    });
  });
}

function showBandInfo(chr, band) {
  const info = document.getElementById('compare-info');
  if (!info) return;
  // Find dosage info if any
  const dosageMatch = CLINGEN.find(d => d.cytoband && d.cytoband.startsWith(chr));
  let dosageInfo = '';
  if (dosageMatch) {
    const targetBand = `${chr}${band}`;
    if (dosageMatch.cytoband === targetBand || dosageMatch.cytoband.startsWith(targetBand)) {
      dosageInfo = ` &mdash; <span class="info-genes">ClinGen: ${dosageMatch.name.substring(0, 80)}</span>`;
    }
  }
  info.innerHTML = `<span class="info-band">${chr}${band}</span>${dosageInfo}<br><span style="font-size:0.65rem;">Click pair for detailed zoom view.</span>`;
}

// ── Chromosome Zoom Modal ─────────────────────────────────────────
const REAL_CROPS_PER_CHR = 30;  // 30 real example images per chromosome class

function openChromosomeZoom(chrId) {
  const chr = CHROMOSOMES[chrId];
  if (!chr) return;

  // Remove existing modal if any
  const existing = document.getElementById('zoom-modal');
  if (existing) existing.remove();

  // Find ClinGen regions on this chromosome
  const dosageOnChr = CLINGEN.filter(d => {
    const cb = d.cytoband || '';
    const m = cb.match(/^([0-9XY]+)[pq]/);
    return m && m[1] === chrId;
  }).slice(0, 8);

  // Build large SVG schema (3x larger)
  const largeSvg = renderChromosome(chrId, { height: 320, width: 32 });

  // Resolve NIH ideogram filename
  let ideogramName;
  if (chrId === 'X' || chrId === 'Y') {
    ideogramName = `chr${chrId}_550.png`;
  } else {
    ideogramName = `chr${chrId.padStart(2, '0')}_550.png`;
  }

  // Build real crops gallery: 30 cropped specimens
  const cropsHtml = renderRealCropsGallery(chrId);

  // Modal HTML
  const modal = document.createElement('div');
  modal.id = 'zoom-modal';
  modal.className = 'zoom-modal';
  modal.innerHTML = `
    <div class="zoom-backdrop"></div>
    <div class="zoom-dialog">
      <div class="zoom-header">
        <h2>Chromosome ${chrId}</h2>
        <span class="zoom-stats">${chr.bands.length} bands &middot; ${(chr.length / 1e6).toFixed(1)} Mb</span>
        <button class="zoom-close">&times;</button>
      </div>
      <div class="zoom-body">
        <div class="zoom-reference">
          <div class="zoom-col">
            <div class="zoom-col-label">Schema (UCSC GRCh38)</div>
            <div class="zoom-svg-host">${largeSvg}</div>
            <div class="zoom-col-meta">Idealized cytoband consensus</div>
          </div>
          <div class="zoom-col">
            <div class="zoom-col-label">NIH Ideogram (550 bphs)</div>
            <div class="zoom-img-host">
              <img class="zoom-ideogram" src="img/chromosomes/${ideogramName}"
                   alt="Chromosome ${chrId} ideogram"
                   onerror="this.style.display='none'">
            </div>
            <div class="zoom-col-meta">Standard G-banding reference</div>
          </div>
        </div>

        <div class="zoom-section-label">${REAL_CROPS_PER_CHR} Real specimens (Lin et al. 2023, CC BY 4.0)</div>
        <div class="real-crops-gallery">${cropsHtml}</div>

        <div class="zoom-disclaimer">
          <strong>Why do real chromosomes look different?</strong>
          Each crop above shows the same chromosome from a different patient sample.
          They vary in: <em>condensation stage</em> (early vs. late metaphase &mdash;
          longer or shorter), <em>banding sharpness</em> (depends on trypsin digestion),
          <em>staining intensity</em>, <em>orientation</em>, and <em>squash artifacts</em>.
          The schema is an idealized consensus &mdash; in clinical cytogenetics you must
          learn to recognize the same chromosome across this technical variation.
        </div>

        ${dosageOnChr.length > 0 ? `
          <div class="zoom-clingen">
            <div class="zoom-section-label">ClinGen Dosage-Sensitive Regions on Chr ${chrId}</div>
            ${dosageOnChr.map(d => `
              <div class="clingen-row">
                <span class="cg-band">${d.cytoband}</span>
                <span class="cg-name">${d.name.substring(0, 90)}</span>
                <span class="cg-scores">HI:${d.hi_score} TS:${d.ts_score}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Close handlers
  modal.querySelector('.zoom-close').addEventListener('click', () => modal.remove());
  modal.querySelector('.zoom-backdrop').addEventListener('click', () => modal.remove());
  document.addEventListener('keydown', function escClose(e) {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', escClose);
    }
  });

  // Wire up crop click → enlarge
  modal.querySelectorAll('.real-crop-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumb.classList.toggle('enlarged');
    });
  });
}

function renderRealCropsGallery(chrId) {
  let html = '';
  for (let i = 1; i <= REAL_CROPS_PER_CHR; i++) {
    const num = String(i).padStart(3, '0');
    const src = `img/real_crops/chr${chrId}/${num}.jpg`;
    html += `<img class="real-crop-thumb" src="${src}" alt="chr${chrId} #${i}" loading="lazy">`;
  }
  return html;
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
  let aberration = null;
  if (syn) {
    if (syn.count && syn.count > 2) {
      aberration = { type: 'trisomy', chr: syn.chr };
    }
  }
  container.innerHTML = renderKaryogram(syn?.chr, aberration);
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
    info.innerHTML = '<div style="color:var(--text-dim);font-size:0.72rem;">Select a syndrome above to view details.</div>';
    return;
  }
  const syn = findSyndrome(activeSyndrome);
  if (!syn) return;
  let html = `<h3>${syn.name}`;
  if (syn.clingen) html += `<span class="clingen-badge">ClinGen ${syn.clingen}</span>`;
  html += `</h3>`;
  html += `<div class="iscn-line">${syn.iscn}</div>`;
  html += `<div><strong>Frequency:</strong> ${syn.freq}</div>`;
  html += `<div class="features"><strong>Features:</strong> ${syn.features}</div>`;
  html += `<div class="features"><strong>Mechanism:</strong> ${syn.mechanism}</div>`;
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
  let html = '';
  for (const g of ROB_SEGREGATION) {
    html += `<div class="gamete ${g.class}">
      <div class="g-label">${g.label}</div>
      <div class="g-result">${g.result}</div>
      <div class="g-pheno">${g.pheno}</div>
    </div>`;
  }
  container.innerHTML = html;
}

// ── Quiz Mode ─────────────────────────────────────────────────────
let quizIndex = 0;
let quizCorrect = 0;
let quizTotal = 0;

function renderQuizMode() {
  loadQuiz();
}

function loadQuiz() {
  const area = document.getElementById('quiz-area');
  if (!area) return;
  // Pick random syndrome from numerical or structural
  const allCases = [];
  for (const cat of ['numerical', 'structural']) {
    for (const [key, syn] of Object.entries(SYNDROMES[cat])) {
      allCases.push({ key, syn });
    }
  }
  if (allCases.length === 0) return;
  const pick = allCases[Math.floor(Math.random() * allCases.length)];

  // Build choices
  const otherKeys = allCases.filter(c => c.key !== pick.key).sort(() => Math.random() - 0.5).slice(0, 3);
  const choices = [pick.syn.name, ...otherKeys.map(c => c.syn.name)].sort(() => Math.random() - 0.5);
  const correctIdx = choices.indexOf(pick.syn.name);

  let html = `<div class="quiz-stats">Score: ${quizCorrect} / ${quizTotal}</div>`;
  html += `<div class="quiz-question">Identify the syndrome from this karyotype:</div>`;
  html += `<div class="quiz-karyo"><div style="font-family:monospace;color:var(--accent);font-size:0.85rem;">${pick.syn.iscn}</div></div>`;
  html += `<div class="quiz-choices">`;
  choices.forEach((c, i) => {
    html += `<button class="quiz-choice" data-i="${i}" data-correct="${correctIdx}">${c}</button>`;
  });
  html += `</div>`;
  html += `<div class="quiz-feedback"></div>`;
  area.innerHTML = html;

  area.querySelectorAll('.quiz-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.i);
      const correct = i === correctIdx;
      area.querySelectorAll('.quiz-choice').forEach((b, idx) => {
        b.disabled = true;
        if (idx === correctIdx) b.classList.add('correct');
        else if (idx === i) b.classList.add('wrong');
      });
      const fb = area.querySelector('.quiz-feedback');
      fb.classList.add('show', correct ? 'correct' : 'wrong');
      fb.innerHTML = correct
        ? `Correct! ${pick.syn.features.substring(0, 200)}`
        : `Not quite. Correct answer: <strong>${pick.syn.name}</strong>. ${pick.syn.features.substring(0, 200)}`;
      if (correct) quizCorrect++;
      quizTotal++;
      const next = document.createElement('button');
      next.className = 'build-btn';
      next.style.marginTop = '0.5rem';
      next.textContent = 'Next question';
      next.onclick = loadQuiz;
      area.appendChild(next);
    });
  });
}

// ── Exam Mode (50 cases) ──────────────────────────────────────────
function loadExamState() {
  try {
    const saved = localStorage.getItem('helix_exam_stats');
    if (saved) examStats = JSON.parse(saved);
  } catch (e) {}
}

function saveExamState() {
  try {
    localStorage.setItem('helix_exam_stats', JSON.stringify(examStats));
  } catch (e) {}
}

function renderExamMode() {
  loadExamState();
  renderExamCase();
}

function renderExamCase() {
  const container = document.getElementById('exam-area');
  if (!container) return;
  const c = EXAM_CASES[examIndex];
  if (!c) return;

  const progress = ((examIndex + 1) / EXAM_CASES.length) * 100;
  examAnswered = false;

  let html = `
    <div class="exam-header">
      <span>Case ${c.id}/50</span>
      <div class="exam-progress-bar"><div class="exam-progress-fill" style="width:${progress}%"></div></div>
      <span class="exam-counter">${examStats.correct || 0}/${examStats.total || 0}</span>
    </div>
    <div class="exam-case">
      <div class="exam-vignette">${c.vignette}</div>
      <div class="exam-karyo">
        <div style="font-family:monospace;color:var(--accent);font-size:0.85rem;text-align:center;padding:1rem;">${c.iscn}</div>
      </div>
      <div class="quiz-question" style="font-size:0.78rem;margin:0.4rem 0;">${c.q}</div>
      <div class="quiz-choices">
        ${c.choices.map((ch, i) => `<button class="quiz-choice" data-i="${i}">${ch}</button>`).join('')}
      </div>
      <div class="exam-explanation"></div>
    </div>
    <div class="exam-controls">
      <button id="exam-prev" ${examIndex === 0 ? 'disabled' : ''}>← Prev</button>
      <button id="exam-skip">Skip</button>
      <button id="exam-next" class="primary">Next →</button>
    </div>
  `;
  container.innerHTML = html;

  container.querySelectorAll('.quiz-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      if (examAnswered) return;
      examAnswered = true;
      const i = parseInt(btn.dataset.i);
      const correct = i === c.answer;
      container.querySelectorAll('.quiz-choice').forEach((b, idx) => {
        b.disabled = true;
        if (idx === c.answer) b.classList.add('correct');
        else if (idx === i) b.classList.add('wrong');
      });
      const exp = container.querySelector('.exam-explanation');
      exp.classList.add('show');
      exp.innerHTML = `<div class="iscn">${c.iscn}</div><div style="margin-top:0.3rem">${c.explain}</div>`;

      // Update stats
      examStats.total = (examStats.total || 0) + 1;
      if (correct) examStats.correct = (examStats.correct || 0) + 1;
      if (!examStats.byCategory) examStats.byCategory = {};
      if (!examStats.byCategory[c.cat]) examStats.byCategory[c.cat] = { correct: 0, total: 0 };
      examStats.byCategory[c.cat].total++;
      if (correct) examStats.byCategory[c.cat].correct++;
      saveExamState();

      // Update header counter
      const counter = container.querySelector('.exam-counter');
      if (counter) counter.textContent = `${examStats.correct}/${examStats.total}`;
    });
  });

  document.getElementById('exam-prev')?.addEventListener('click', () => {
    if (examIndex > 0) { examIndex--; renderExamCase(); }
  });
  document.getElementById('exam-next')?.addEventListener('click', () => {
    if (examIndex < EXAM_CASES.length - 1) { examIndex++; renderExamCase(); }
  });
  document.getElementById('exam-skip')?.addEventListener('click', () => {
    if (examIndex < EXAM_CASES.length - 1) { examIndex++; renderExamCase(); }
  });
}

// ── Build Mode (drag & drop sorting) ──────────────────────────────
function renderBuildMode() {
  // Simplified: show a hint for now since drag/drop is complex
  const area = document.getElementById('build-area');
  if (!area) return;
  area.innerHTML = `
    <div style="padding:1rem;text-align:center;color:var(--text-muted);font-size:0.8rem;">
      <div style="font-size:2rem;color:var(--accent);">🧬</div>
      <p style="margin-top:0.5rem;">Build Mode</p>
      <p style="font-size:0.7rem;color:var(--text-dim);margin-top:0.3rem;">Drag scattered chromosomes into their correct numbered slots.<br>Coming soon — full drag &amp; drop sorting.</p>
      <div style="margin-top:0.7rem;">${renderKaryogram()}</div>
    </div>
  `;
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
    case 'exam': renderExamMode(); break;
    case 'build': renderBuildMode(); break;
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

init();
