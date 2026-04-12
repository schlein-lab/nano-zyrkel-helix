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

    seq_s1_intro: 'Genomische Daten beginnen als <strong>Reads</strong> — kurze Fragmente der DNA, die von einem Sequenziergerät gelesen werden. Jeder Read ist typischerweise <strong>150 bp</strong> lang (Illumina Short-Read) oder <strong>10.000+ bp</strong> (PacBio HiFi / ONT Long-Read). Viele Reads übereinander ergeben die <strong>Coverage</strong> — die Abdeckungstiefe. Stell dir vor: Wir suchen die Ursache einer PKU bei einem Neugeborenen.',
    seq_s2_intro: 'Hier siehst du echte Reads in einem <strong>BAM-Viewer</strong>. Jeder horizontale Balken ist ein Read. Wenn an einer Position etwa die Hälfte der Reads ein <strong>alternatives Allel</strong> zeigt, ist der Patient dort <strong>heterozygot</strong>. Wähle verschiedene Fälle und lerne, echte Varianten von Artefakten zu unterscheiden.',
    seq_s3_intro: 'Bei einer <strong>Copy Number Variation</strong> (CNV) fehlen oder verdoppeln sich ganze Genomabschnitte. Im BAM sieht man das als plötzlichen <strong>Coverage-Abfall</strong> (Deletion) oder <strong>Coverage-Anstieg</strong> (Duplikation). Long-Reads können den Breakpoint direkt überspannen.',
    seq_s4_intro: 'Drei Strategien, ein Patient: <strong>Panel</strong> (50 Gene, 500x, ), <strong>Exom</strong> (20.000 Gene, 100x, ), <strong>Genom</strong> (alles, 30x, ). Jede findet andere Varianten. Eine tief-intronische Splice-Variante? Nur das Genom sieht sie.',
    seq_s5_intro: 'Ein Genom liefert <strong>4,5 Millionen Varianten</strong>. Die meisten sind harmlos. Durch systematische Filter engt man die Kandidaten ein: Qualität, Allel-Frequenz, Protein-Effekt, Gen-Liste, Segregation. <strong>Achtung:</strong> Bei MCADD hat die häufigste pathogene Variante eine MAF von 1,4% — ein zu strenger MAF-Filter wirft sie raus!',
    seq_s6_intro: 'Das <strong>ACMG-Klassifikationssystem</strong> bewertet Varianten anhand von Evidenz-Kriterien. Jedes Kriterium gibt Punkte — die Summe bestimmt die Klasse: <strong>Pathogenic, Likely Pathogenic, VUS, Likely Benign, Benign</strong>. Probiere es aus: Wähle Kriterien an und beobachte, wie sich die Klassifikation ändert.',
    seq_s7_intro: '<strong>Links:</strong> Illumina Short-Read (150 bp, niedrige Fehlerrate). <strong>Rechts:</strong> Long-Read (PacBio HiFi / ONT) (~10 kb, PacBio HiFi mit Q30+ Genauigkeit, ONT mit höherer Fehlerrate). Gleiche Region, gleicher Patient — aber beachte: In der repetitiven Alu-Region kann Short-Read den Breakpoint nicht auflösen. Ein einzelner Long-Read überspannt den gesamten Bereich. PacBio HiFi liefert dabei die höchste Genauigkeit unter den Long-Read-Plattformen.',
    seq_s8_intro: 'Von der Variante zurück zur Klinik: <strong>Warum</strong> suchen wir diese Variante? Weil ein blockiertes Enzym den Stoffwechselweg stört — Substrat akkumuliert, Produkt fehlt. Wähle eine Erkrankung und blockiere das Enzym. Unten findest du ausführliche Informationen zu Biochemie, Klinik, Diagnostik, Therapie und genetischer Beratung.',

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
    filt_remaining: 'verbleibend',
    filt_removed: 'entfernt',
    filt_causal_survived: 'Kausale Variante: erhalten',
    filt_causal_lost: 'Kausale Variante: herausgefiltert!',

    acmg_pvs1: 'Null-Variante', acmg_ps1: 'Bekannter AS-Austausch', acmg_ps3: 'Funktionelle Studie',
    acmg_pm1: 'Hotspot', acmg_pm2: 'Absent in gnomAD', acmg_pp3: 'In silico', acmg_pp5: 'ClinVar P',
    acmg_ba1: 'MAF >5%', acmg_bs1: 'MAF zu hoch', acmg_bs3: 'Funkt. normal',
    acmg_bp1: 'Missense (LoF-Gen)', acmg_bp4: 'In silico benigne',
    acmg_reveal_answer: 'Korrekte Antwort zeigen',
    acmg_correct_answer: 'Korrekte Antwort',

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

    pw_section_biochem: 'Biochemie',
    pw_section_clinic: 'Klinik',
    pw_section_diagnostics: 'Diagnostik',
    pw_section_therapy: 'Therapie',
    pw_section_counseling: 'Genetische Beratung',
    pw_section_vus: 'VUS-Problematik',

    pw_pku_biochem: '<strong>Akkumulation:</strong> Phenylalanin (Phe) im Blut und Gewebe. Normal: 30–120 µmol/L, bei klassischer PKU: >1200 µmol/L.<br><strong>Mangel:</strong> Tyrosin (Tyr), da PAH die Hydroxylierung von Phe zu Tyr katalysiert.<br><strong>Toxizität:</strong> Überschüssiges Phe konkurriert mit anderen großen neutralen Aminosäuren (LNAA) um den Transport über die Blut-Hirn-Schranke → Störung der Neurotransmitter-Synthese (Dopamin, Serotonin, Noradrenalin), Myelinisierungsstörung.',
    pw_pku_clinic: '<strong>Symptome unbehandelt:</strong> Intellektuelle Behinderung (schwer, IQ <50), Mikrozephalie, epileptische Anfälle, Ekzem, mausartiger Geruch (Phenylacetat), helle Haut/Haare (Melanin↓).<br><strong>Onset:</strong> Erste Wochen bis Monate postnatal.<br><strong>Spektrum:</strong> Klassische PKU (Phe >1200 µmol/L), milde PKU (600–1200), milde Hyperphenylalaninämie (120–600).',
    pw_pku_diagnostics: '<strong>Neugeborenenscreening:</strong> Phe im Trockenblut (Guthrie-Karte), Tag 2–3. Cut-off: >120 µmol/L.<br><strong>Bestätigungsdiagnostik:</strong> Plasma-Aminosäuren (Phe/Tyr-Ratio), BH4-Belastungstest (Ausschluss BH4-Mangel), molekulargenetisch PAH-Sequenzierung.',
    pw_pku_therapy: '<strong>Diät:</strong> Phe-arme Ernährung lebenslang, Aminosäure-Supplemente, Ziel-Phe 120–360 µmol/L (Kinder) bzw. <600 (Erwachsene).<br><strong>Medikation:</strong> Sapropterin (Kuvan) bei BH4-responsiver PKU (~30% der Patienten). Pegvaliase (Palynziq) für Erwachsene mit unzureichender Kontrolle.<br><strong>Monitoring:</strong> Regelmäßige Phe-Kontrollen (Trockenblut, 1–2x/Woche bei Kindern), neuropsychologische Testung, Ernährungsberatung.',
    pw_pku_counseling: '<strong>Erbgang:</strong> Autosomal-rezessiv. <strong>Wiederholungsrisiko:</strong> 25% für Geschwister. <strong>Heterozygoten-Test:</strong> Molekulargenetisch möglich nach Identifikation der familiären Varianten. <strong>Pränataldiagnostik:</strong> Möglich bei bekannten Varianten, aber selten gewünscht (behandelbare Erkrankung). <strong>Maternale PKU:</strong> Phe-Kontrolle VOR und WÄHREND der Schwangerschaft essentiell (Embryo/Fetopathie bei mütterlicher Phe >360 µmol/L).',
    pw_pku_vus: 'Bei einem VUS in PAH: Klinisches Management richtet sich nach dem biochemischen Phänotyp (Phe-Spiegel), nicht allein nach der Genetik. Phe-Monitoring fortsetzen. Funktionelle Studien (in vitro PAH-Aktivität) und Familiensegregation anfordern. Re-Evaluation nach 1–2 Jahren empfohlen.',

    pw_mcadd_biochem: '<strong>Akkumulation:</strong> Mittelkettige Acylcarnitine (v.a. Octanoylcarnitin C8). Normal C8: <0,3 µmol/L, bei MCADD: >1,0 µmol/L.<br><strong>Mangel:</strong> Acetyl-CoA-Produktion aus mittelkettigen Fettsäuren blockiert → keine Ketonkörper-Synthese bei Fasten.<br><strong>Toxizität:</strong> Mittelkettige Fettsäuren und deren Metabolite (Octanoat, Decanolat) sind hepato- und neurotoxisch. Sekundärer Carnitinmangel durch vermehrte Ausscheidung.',
    pw_mcadd_clinic: '<strong>Symptome:</strong> Hypoketotische Hypoglykämie bei Fasten/Infekt, Lethargie, Erbrechen, Hepatomegalie, Reye-ähnliche Episoden. Plötzlicher Kindstod (SIDS) als Erstmanifestation möglich.<br><strong>Onset:</strong> Meist 3–24 Monate, aber auch neonatal oder im Erwachsenenalter möglich.<br><strong>Spektrum:</strong> Von asymptomatisch (nur biochemisch) bis lebensbedrohliche metabolische Krisen.',
    pw_mcadd_diagnostics: '<strong>Neugeborenenscreening:</strong> Tandem-MS: C8↑, C8/C10-Ratio↑ im Trockenblut.<br><strong>Bestätigung:</strong> Acylcarnitin-Profil im Plasma, organische Säuren im Urin (Hexanoylglycin, Suberylglycin), molekulargenetisch ACADM-Sequenzierung. Enzymtest in Fibroblasten möglich.',
    pw_mcadd_therapy: '<strong>Vermeidung von Fasten:</strong> Regelmäßige Mahlzeiten, Notfallprotokoll bei Krankheit (Glucose-Infusion). Nüchterntoleranz altersabhängig: Säuglinge max. 6h, Kleinkinder 8–10h, Erwachsene 12h.<br><strong>Notfall:</strong> 10% Glucose i.v. bei Erbrechen/Nahrungsverweigerung. L-Carnitin-Supplementierung kontrovers (einige Zentren: 50–100 mg/kg/d).<br><strong>Monitoring:</strong> Acylcarnitin-Profil, freies Carnitin, Wachstum, Entwicklung.',
    pw_mcadd_counseling: '<strong>Erbgang:</strong> Autosomal-rezessiv. <strong>Wiederholungsrisiko:</strong> 25%. <strong>Trägerfrequenz:</strong> ~1:40 bei Nordeuropäern (Founder-Effekt c.985A>G). <strong>Heterozygoten-Test:</strong> Molekulargenetisch. <strong>Pränataldiagnostik:</strong> Möglich, aber selten indiziert (gute Prognose bei frühzeitiger Diagnose durch NBS).',
    pw_mcadd_vus: 'Bei einem VUS in ACADM: Acylcarnitin-Profil im Nüchternzustand bestimmen. Ggf. kontrollierter Fastentest unter stationären Bedingungen. Funktionelle Enzymanalyse in Fibroblasten kann Klärung bringen. Bis zur Klärung: Fasten-Vermeidungsprotokoll beibehalten.',

    pw_gal_biochem: '<strong>Akkumulation:</strong> Galaktose-1-Phosphat (Gal-1-P) in Erythrozyten und Gewebe. Normal: <1 mg/dL, bei Galaktosämie: >10 mg/dL.<br><strong>Mangel:</strong> UDP-Glucose und UDP-Galaktose (Galactose-1-P-Uridylyltransferase = GALT katalysiert die Umsetzung).<br><strong>Toxizität:</strong> Gal-1-P hemmt Phosphoglucomutase und andere Enzyme, Galaktitol akkumuliert in der Linse (Katarakt durch osmotischen Stress).',
    pw_gal_clinic: '<strong>Symptome neonatal:</strong> Trinkschwäche, Erbrechen, Ikterus, Hepatomegalie, E. coli-Sepsis (erhöhte Anfälligkeit), Gerinnungsstörung.<br><strong>Langzeit (trotz Therapie):</strong> Sprachentwicklungsverzögerung, Lernschwierigkeiten, prämature Ovarialinsuffizienz (>80% der Frauen), Tremor/Ataxie.<br><strong>Onset:</strong> Neonatal (Tage nach Milchbeginn).<br><strong>Spektrum:</strong> Klassische Galaktosämie (GALT <1%), Duarte-Galaktosämie (GALT 14–25%, meist mild).',
    pw_gal_diagnostics: '<strong>Neugeborenenscreening:</strong> GALT-Enzymaktivität + Totalgehalt Galaktose im Trockenblut. Cave: Transfusionen verfälschen das Ergebnis!<br><strong>Bestätigung:</strong> GALT-Aktivität in Erythrozyten, Gal-1-P-Spiegel, molekulargenetisch GALT-Sequenzierung. Häufigste Variante: c.563A>G (p.Q188R) — keine Restaktivität.',
    pw_gal_therapy: '<strong>Diät:</strong> Galaktose-freie Ernährung lebenslang (Laktose-frei, Casein-basierte Formula). Endogene Galaktose-Produktion (~1g/Tag) kann nicht eliminiert werden.<br><strong>Calcium/Vitamin-D-Supplementierung</strong> wegen Milchverzicht.<br><strong>Monitoring:</strong> Gal-1-P in Erythrozyten (Ziel <3 mg/dL), Leberfunktion, Hormonstatus (FSH, AMH bei Mädchen), Sprachtherapie, neuropsychologische Testung.',
    pw_gal_counseling: '<strong>Erbgang:</strong> Autosomal-rezessiv. <strong>Wiederholungsrisiko:</strong> 25%. <strong>Heterozygoten-Test:</strong> GALT-Enzymaktivität (Träger haben ~50%) oder molekulargenetisch. <strong>Pränataldiagnostik:</strong> GALT-Aktivität in Chorionzotten oder molekulargenetisch. Duarte/Klassisch-Compound-Heterozygote: in der Regel klinisch mild, kontroverse Therapieindikation.',
    pw_gal_vus: 'Bei einem VUS in GALT: GALT-Enzymaktivität in Erythrozyten bestimmen (funktioneller Biomarker). Gal-1-P-Monitoring. Segregationsanalyse in der Familie. Re-Klassifikation bei neuen Daten. Bis zur Klärung: Galaktose-arme Diät beibehalten wenn klinisch auffällig.',

    pw_fh_biochem: '<strong>Akkumulation:</strong> LDL-Cholesterin im Blut. Normal: <130 mg/dL, bei heterozygoter FH: 190–400 mg/dL, bei homozygoter FH: >500 mg/dL.<br><strong>Mangel:</strong> Funktionelle LDL-Rezeptoren auf Hepatozyten → LDL kann nicht internalisiert und abgebaut werden.<br><strong>Toxizität:</strong> LDL-Ablagerung in Gefäßwänden → Atherosklerose, Xanthome, Arcus corneae.',
    pw_fh_clinic: '<strong>Heterozygot (1:250):</strong> LDL 190–400, Sehnenxanthome (Achillessehne), koronare Herzkrankheit ab 40–55 J. (Männer) / 50–65 J. (Frauen).<br><strong>Homozygot (1:160.000–300.000):</strong> LDL >500, kutane Xanthome bereits im Kindesalter, Aortenstenose, MI vor 20. Lebensjahr ohne Behandlung.<br><strong>Onset:</strong> LDL ab Geburt erhöht, klinische Manifestation altersabhängig.',
    pw_fh_diagnostics: '<strong>Klinische Kriterien:</strong> Dutch Lipid Clinic Network Score (LDL, Familienanamnese, Xanthome, Arcus).<br><strong>Laborchemisch:</strong> Nüchtern-Lipidprofil, Lp(a).<br><strong>Molekulargenetisch:</strong> LDLR (>1700 bekannte Varianten), APOB, PCSK9. Kaskaden-Screening bei Verwandten 1. Grades empfohlen.',
    pw_fh_therapy: '<strong>Statine:</strong> Hochdosis (Atorvastatin 40–80mg, Rosuvastatin 20–40mg), ab 8–10 Jahren bei Kindern.<br><strong>Ezetimib:</strong> Zusätzlich 10mg/d für 15–20% weitere LDL-Senkung.<br><strong>PCSK9-Inhibitoren:</strong> Evolocumab/Alirocumab für 50–60% zusätzliche Reduktion.<br><strong>Homozygote FH:</strong> Lomitapid, Evinacumab, LDL-Apherese.<br><strong>Ziel-LDL:</strong> <70 mg/dL (Hochrisiko), <55 mg/dL (sehr hohes Risiko).',
    pw_fh_counseling: '<strong>Erbgang:</strong> Autosomal-dominant (semi-dominant: homozygot schwerer als heterozygot). <strong>Wiederholungsrisiko:</strong> 50% bei heterozygoten Eltern. <strong>Kaskaden-Screening:</strong> ALLE Verwandten 1. Grades sollten getestet werden (LDL + ggf. Genetik). <strong>Pränataldiagnostik:</strong> Technisch möglich, aber ethisch umstritten (behandelbare Erkrankung). Frühzeitige Diagnose und Statin-Therapie ab Kindesalter verbessern Prognose erheblich.',
    pw_fh_vus: 'Bei einem VUS in LDLR: LDL-Cholesterin-Verlauf dokumentieren. Familiensegregation (Co-Segregation mit Hypercholesterinämie?). In vitro LDL-Uptake-Assay kann Funktionalität klären. ClinVar und LOVD regelmäßig prüfen. Therapie richtet sich nach dem LDL-Wert, nicht allein nach der Genetik.',
  },
  en: {
    seq_header: 'Sequencing Lab',
    seq_subtitle: 'BAM reads · variant filtering · ACMG · CNV · short vs long read',
    mode_learn: 'Learn', mode_explore: 'Explore', mode_quiz: 'Quiz',
    seq_s1_label: 'Reads', seq_s2_label: 'SNV', seq_s3_label: 'CNV',
    seq_s4_label: 'Panel/Exome/Genome', seq_s5_label: 'Filter', seq_s6_label: 'ACMG',
    seq_s7_label: 'Short/Long', seq_s8_label: 'Pathway',

    seq_s1_intro: 'Genomic data starts as <strong>reads</strong> — short fragments of DNA read by a sequencing machine. Each read is typically <strong>150 bp</strong> (Illumina short-read) or <strong>10,000+ bp</strong> (PacBio HiFi / ONT long-read). Many overlapping reads create <strong>coverage</strong> — the depth of sequencing. Imagine: we are looking for the cause of PKU in a newborn.',
    seq_s2_intro: 'Here you see actual reads in a <strong>BAM viewer</strong>. Each horizontal bar is a read. When about half the reads show an <strong>alternate allele</strong> at a position, the patient is <strong>heterozygous</strong> there. Select different cases and learn to distinguish real variants from artifacts.',
    seq_s3_intro: 'In a <strong>Copy Number Variation</strong> (CNV), entire genomic segments are deleted or duplicated. In the BAM you see a sudden <strong>coverage drop</strong> (deletion) or <strong>coverage increase</strong> (duplication). Long reads can span the breakpoint directly.',
    seq_s4_intro: 'Three strategies, one patient: <strong>Panel</strong> (50 genes, 500x, ), <strong>Exome</strong> (20,000 genes, 100x, ), <strong>Genome</strong> (everything, 30x, ). Each finds different variants. A deep-intronic splice variant? Only the genome sees it.',
    seq_s5_intro: 'A genome yields <strong>4.5 million variants</strong>. Most are harmless. Systematic filters narrow down candidates: quality, allele frequency, protein effect, gene list, segregation. <strong>Watch out:</strong> In MCADD, the most common pathogenic variant has a MAF of 1.4% — a strict MAF filter will discard it!',
    seq_s6_intro: 'The <strong>ACMG classification system</strong> evaluates variants based on evidence criteria. Each criterion gives points — the sum determines the class: <strong>Pathogenic, Likely Pathogenic, VUS, Likely Benign, Benign</strong>. Try it: select criteria and watch the classification change.',
    seq_s7_intro: '<strong>Left:</strong> Illumina short-read (150 bp, low error rate). <strong>Right:</strong> Long-read (PacBio HiFi / ONT) (~10 kb, PacBio HiFi with Q30+ accuracy, ONT with higher error rate). Same region, same patient — but note: in the repetitive Alu region, short-read cannot resolve the breakpoint. A single long read spans the entire region. PacBio HiFi provides the highest accuracy among long-read platforms.',
    seq_s8_intro: 'From variant back to clinic: <strong>Why</strong> are we looking for this variant? Because a blocked enzyme disrupts the metabolic pathway — substrate accumulates, product is missing. Select a disease and block the enzyme. Below you will find detailed information on biochemistry, clinical presentation, diagnostics, therapy, and genetic counseling.',

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
    filt_remaining: 'remaining',
    filt_removed: 'removed',
    filt_causal_survived: 'Causal variant: retained',
    filt_causal_lost: 'Causal variant: filtered out!',

    acmg_pvs1: 'Null variant', acmg_ps1: 'Known AA change', acmg_ps3: 'Functional study',
    acmg_pm1: 'Hotspot', acmg_pm2: 'Absent in gnomAD', acmg_pp3: 'In silico', acmg_pp5: 'ClinVar P',
    acmg_ba1: 'MAF >5%', acmg_bs1: 'MAF too high', acmg_bs3: 'Func. normal',
    acmg_bp1: 'Missense (LoF gene)', acmg_bp4: 'In silico benign',
    acmg_reveal_answer: 'Show correct answer',
    acmg_correct_answer: 'Correct answer',

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

    pw_section_biochem: 'Biochemistry',
    pw_section_clinic: 'Clinical Presentation',
    pw_section_diagnostics: 'Diagnostics',
    pw_section_therapy: 'Therapy',
    pw_section_counseling: 'Genetic Counseling',
    pw_section_vus: 'VUS Implications',

    pw_pku_biochem: '<strong>Accumulation:</strong> Phenylalanine (Phe) in blood and tissue. Normal: 30–120 µmol/L, in classical PKU: >1200 µmol/L.<br><strong>Deficiency:</strong> Tyrosine (Tyr), since PAH catalyzes the hydroxylation of Phe to Tyr.<br><strong>Toxicity:</strong> Excess Phe competes with other large neutral amino acids (LNAA) for transport across the blood-brain barrier → disruption of neurotransmitter synthesis (dopamine, serotonin, norepinephrine), impaired myelination.',
    pw_pku_clinic: '<strong>Symptoms untreated:</strong> Intellectual disability (severe, IQ <50), microcephaly, seizures, eczema, musty odor (phenylacetate), fair skin/hair (melanin↓).<br><strong>Onset:</strong> First weeks to months postnatal.<br><strong>Spectrum:</strong> Classical PKU (Phe >1200 µmol/L), mild PKU (600–1200), mild hyperphenylalaninemia (120–600).',
    pw_pku_diagnostics: '<strong>Newborn screening:</strong> Phe in dried blood spot (Guthrie card), day 2–3. Cutoff: >120 µmol/L.<br><strong>Confirmatory testing:</strong> Plasma amino acids (Phe/Tyr ratio), BH4 loading test (exclude BH4 deficiency), molecular genetic PAH sequencing.',
    pw_pku_therapy: '<strong>Diet:</strong> Phe-restricted diet lifelong, amino acid supplements, target Phe 120–360 µmol/L (children) or <600 (adults).<br><strong>Medication:</strong> Sapropterin (Kuvan) in BH4-responsive PKU (~30% of patients). Pegvaliase (Palynziq) for adults with inadequate control.<br><strong>Monitoring:</strong> Regular Phe checks (dried blood spot, 1–2x/week in children), neuropsychological testing, nutritional counseling.',
    pw_pku_counseling: '<strong>Inheritance:</strong> Autosomal recessive. <strong>Recurrence risk:</strong> 25% for siblings. <strong>Carrier testing:</strong> Molecular genetic testing possible after identification of familial variants. <strong>Prenatal diagnosis:</strong> Possible with known variants, but rarely requested (treatable condition). <strong>Maternal PKU:</strong> Phe control BEFORE and DURING pregnancy essential (embryo/fetopathy if maternal Phe >360 µmol/L).',
    pw_pku_vus: 'With a VUS in PAH: Clinical management follows the biochemical phenotype (Phe levels), not genetics alone. Continue Phe monitoring. Request functional studies (in vitro PAH activity) and family segregation. Re-evaluation after 1–2 years recommended.',

    pw_mcadd_biochem: '<strong>Accumulation:</strong> Medium-chain acylcarnitines (especially octanoylcarnitine C8). Normal C8: <0.3 µmol/L, in MCADD: >1.0 µmol/L.<br><strong>Deficiency:</strong> Acetyl-CoA production from medium-chain fatty acids blocked → no ketone body synthesis during fasting.<br><strong>Toxicity:</strong> Medium-chain fatty acids and their metabolites (octanoate, decanoate) are hepato- and neurotoxic. Secondary carnitine deficiency from increased excretion.',
    pw_mcadd_clinic: '<strong>Symptoms:</strong> Hypoketotic hypoglycemia during fasting/infection, lethargy, vomiting, hepatomegaly, Reye-like episodes. Sudden infant death (SIDS) as initial presentation possible.<br><strong>Onset:</strong> Usually 3–24 months, but neonatal or adult onset possible.<br><strong>Spectrum:</strong> From asymptomatic (biochemical only) to life-threatening metabolic crises.',
    pw_mcadd_diagnostics: '<strong>Newborn screening:</strong> Tandem-MS: C8↑, C8/C10 ratio↑ in dried blood spot.<br><strong>Confirmation:</strong> Acylcarnitine profile in plasma, organic acids in urine (hexanoylglycine, suberylglycine), molecular genetic ACADM sequencing. Enzyme assay in fibroblasts possible.',
    pw_mcadd_therapy: '<strong>Fasting avoidance:</strong> Regular meals, emergency protocol during illness (glucose infusion). Fasting tolerance age-dependent: infants max 6h, toddlers 8–10h, adults 12h.<br><strong>Emergency:</strong> 10% glucose IV for vomiting/food refusal. L-carnitine supplementation controversial (some centers: 50–100 mg/kg/d).<br><strong>Monitoring:</strong> Acylcarnitine profile, free carnitine, growth, development.',
    pw_mcadd_counseling: '<strong>Inheritance:</strong> Autosomal recessive. <strong>Recurrence risk:</strong> 25%. <strong>Carrier frequency:</strong> ~1:40 in Northern Europeans (founder effect c.985A>G). <strong>Carrier testing:</strong> Molecular genetic. <strong>Prenatal diagnosis:</strong> Possible but rarely indicated (good prognosis with early diagnosis through NBS).',
    pw_mcadd_vus: 'With a VUS in ACADM: Determine acylcarnitine profile in fasting state. Consider controlled fasting test under inpatient conditions. Functional enzyme analysis in fibroblasts may clarify. Until clarification: maintain fasting avoidance protocol.',

    pw_gal_biochem: '<strong>Accumulation:</strong> Galactose-1-phosphate (Gal-1-P) in erythrocytes and tissue. Normal: <1 mg/dL, in galactosemia: >10 mg/dL.<br><strong>Deficiency:</strong> UDP-glucose and UDP-galactose (Galactose-1-P uridylyltransferase = GALT catalyzes the conversion).<br><strong>Toxicity:</strong> Gal-1-P inhibits phosphoglucomutase and other enzymes, galactitol accumulates in the lens (cataracts from osmotic stress).',
    pw_gal_clinic: '<strong>Neonatal symptoms:</strong> Poor feeding, vomiting, jaundice, hepatomegaly, E. coli sepsis (increased susceptibility), coagulopathy.<br><strong>Long-term (despite therapy):</strong> Speech delay, learning difficulties, premature ovarian insufficiency (>80% of females), tremor/ataxia.<br><strong>Onset:</strong> Neonatal (days after milk introduction).<br><strong>Spectrum:</strong> Classical galactosemia (GALT <1%), Duarte galactosemia (GALT 14–25%, usually mild).',
    pw_gal_diagnostics: '<strong>Newborn screening:</strong> GALT enzyme activity + total galactose in dried blood spot. Caveat: transfusions can falsify the result!<br><strong>Confirmation:</strong> GALT activity in erythrocytes, Gal-1-P levels, molecular genetic GALT sequencing. Most common variant: c.563A>G (p.Q188R) — no residual activity.',
    pw_gal_therapy: '<strong>Diet:</strong> Galactose-free diet lifelong (lactose-free, casein-based formula). Endogenous galactose production (~1g/day) cannot be eliminated.<br><strong>Calcium/Vitamin D supplementation</strong> due to dairy avoidance.<br><strong>Monitoring:</strong> Gal-1-P in erythrocytes (target <3 mg/dL), liver function, hormone status (FSH, AMH in girls), speech therapy, neuropsychological testing.',
    pw_gal_counseling: '<strong>Inheritance:</strong> Autosomal recessive. <strong>Recurrence risk:</strong> 25%. <strong>Carrier testing:</strong> GALT enzyme activity (carriers have ~50%) or molecular genetic. <strong>Prenatal diagnosis:</strong> GALT activity in chorionic villi or molecular genetic. Duarte/Classical compound heterozygotes: usually clinically mild, controversial therapy indication.',
    pw_gal_vus: 'With a VUS in GALT: Determine GALT enzyme activity in erythrocytes (functional biomarker). Gal-1-P monitoring. Segregation analysis in family. Reclassification with new data. Until clarification: maintain galactose-restricted diet if clinically symptomatic.',

    pw_fh_biochem: '<strong>Accumulation:</strong> LDL cholesterol in blood. Normal: <130 mg/dL, in heterozygous FH: 190–400 mg/dL, in homozygous FH: >500 mg/dL.<br><strong>Deficiency:</strong> Functional LDL receptors on hepatocytes → LDL cannot be internalized and degraded.<br><strong>Toxicity:</strong> LDL deposition in vessel walls → atherosclerosis, xanthomas, arcus corneae.',
    pw_fh_clinic: '<strong>Heterozygous (1:250):</strong> LDL 190–400, tendon xanthomas (Achilles tendon), coronary heart disease from 40–55y (men) / 50–65y (women).<br><strong>Homozygous (1:160,000–300,000):</strong> LDL >500, cutaneous xanthomas already in childhood, aortic stenosis, MI before age 20 without treatment.<br><strong>Onset:</strong> LDL elevated from birth, clinical manifestation age-dependent.',
    pw_fh_diagnostics: '<strong>Clinical criteria:</strong> Dutch Lipid Clinic Network Score (LDL, family history, xanthomas, arcus).<br><strong>Laboratory:</strong> Fasting lipid profile, Lp(a).<br><strong>Molecular genetic:</strong> LDLR (>1700 known variants), APOB, PCSK9. Cascade screening of first-degree relatives recommended.',
    pw_fh_therapy: '<strong>Statins:</strong> High-dose (atorvastatin 40–80mg, rosuvastatin 20–40mg), from age 8–10 in children.<br><strong>Ezetimibe:</strong> Additional 10mg/d for 15–20% further LDL reduction.<br><strong>PCSK9 inhibitors:</strong> Evolocumab/alirocumab for 50–60% additional reduction.<br><strong>Homozygous FH:</strong> Lomitapide, evinacumab, LDL apheresis.<br><strong>LDL target:</strong> <70 mg/dL (high risk), <55 mg/dL (very high risk).',
    pw_fh_counseling: '<strong>Inheritance:</strong> Autosomal dominant (semi-dominant: homozygous more severe than heterozygous). <strong>Recurrence risk:</strong> 50% with heterozygous parents. <strong>Cascade screening:</strong> ALL first-degree relatives should be tested (LDL + optionally genetics). <strong>Prenatal diagnosis:</strong> Technically possible, but ethically controversial (treatable condition). Early diagnosis and statin therapy from childhood significantly improves prognosis.',
    pw_fh_vus: 'With a VUS in LDLR: Document LDL cholesterol trends. Family segregation (co-segregation with hypercholesterolemia?). In vitro LDL uptake assay can clarify functionality. Check ClinVar and LOVD regularly. Therapy follows the LDL level, not genetics alone.',
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

  const statsEl = document.getElementById('seq-computed-stats');

  function update() {
    const readLen = parseInt(lenSlider.value);
    const numReads = parseInt(covSlider.value);
    lenVal.textContent = readLen >= 1000 ? `${(readLen / 1000).toFixed(1)} kb` : `${readLen} bp`;
    covVal.textContent = `${numReads}`;
    renderReadDemo(canvas, readLen, numReads);

    // Compute resulting coverage
    const regionLen = 500;
    // Coverage = number of reads overlapping this region (depth of read-stack)
    const avgCov = numReads;
    if (statsEl) {
      statsEl.innerHTML = `<span style="font-size:0.7rem;color:var(--text-dim)">→ Resultierende Coverage: <strong style="color:var(--accent)">${avgCov}x</strong> (${numReads} Reads über ${regionLen}bp Region = ${numReads}x Tiefe)</span>`;
    }

    const isLong = readLen > 500;
    const tech = isLong ? 'Long-Read (PacBio HiFi / ONT)' : 'Short-Read (Illumina)';
    explainEl.innerHTML = isLong
      ? `<strong>${tech}</strong>: ${readLen >= 1000 ? (readLen/1000).toFixed(1) + ' kb' : readLen + ' bp'} Reads. Weniger Reads nötig für gleiche Coverage, aber höhere Fehlerrate (~5-15% ONT, <1% PacBio HiFi). Ideal für Strukturvarianten und repetitive Regionen.`
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

  // Update data attributes on strategy cards with correct costs
  cards.forEach(c => {
    const s = c.dataset.strategy;
    if (s === 'panel') {
      c.dataset.cost = '500-800';
      const costEl = c.querySelector('.strategy-cost');
      if (costEl) costEl.textContent = '';
    } else if (s === 'exome') {
      c.dataset.cost = '1200-2000';
      const costEl = c.querySelector('.strategy-cost');
      if (costEl) costEl.textContent = '';
    } else if (s === 'genome') {
      c.dataset.cost = '3000-5000';
      const costEl = c.querySelector('.strategy-cost');
      if (costEl) costEl.textContent = '';
    }
  });

  const findings = {
    panel: {
      de: '<strong>Panel (50 Gene, 500x, ):</strong> Hohe Coverage in Ziel-Genen → sehr sensitive SNV-Detektion. Aber: nur bekannte Gene. Neue Gen-Entdeckung unmöglich. Deep-intronische Varianten unsichtbar. Schnell, günstig, ideal als Erstlinien-Diagnostik.',
      en: '<strong>Panel (50 genes, 500x, ):</strong> High coverage in target genes → very sensitive SNV detection. But: only known genes. New gene discovery impossible. Deep-intronic variants invisible. Fast, affordable, ideal as first-line diagnostics.',
    },
    exome: {
      de: '<strong>Exom (20.000 Gene, 100x, ):</strong> Breite Abdeckung aller kodierenden Regionen. Kann neue Kandidatengene finden. Aber: GC-reiche Exons können schlecht abgedeckt sein. Intronische Varianten fehlen. Repetitive Regionen problematisch.',
      en: '<strong>Exome (20,000 genes, 100x, ):</strong> Broad coverage of all coding regions. Can discover new candidate genes. But: GC-rich exons may have poor coverage. Intronic variants missed. Repetitive regions problematic.',
    },
    genome: {
      de: '<strong>Genom (alles, 30x, ):</strong> Findet ALLES — SNVs, CNVs, SVs, deep-intronische Varianten, regulatorische Elemente. Aber: 4,5 Mio Varianten zu filtern. Niedrigere Coverage pro Position. Teurer. Der MSUD-Fall hier: Die deep-intronische BCKDHA-Variante wäre NUR im Genom sichtbar.',
      en: '<strong>Genome (everything, 30x, ):</strong> Finds EVERYTHING — SNVs, CNVs, SVs, deep-intronic variants, regulatory elements. But: 4.5M variants to filter. Lower coverage per position. More expensive. The MSUD case here: the deep-intronic BCKDHA variant would ONLY be visible in the genome.',
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

  // Normalized coverage data — each strategy scaled to its own max for visibility,
  // but the visual height reflects absolute coverage differences
  const coverages = { panel: [], exome: [], genome: [] };
  for (let i = 0; i < bins; i++) {
    const inExon = exonRegions.some(([s, e]) => i >= s && i <= e);
    coverages.panel.push(inExon ? 500 + (Math.sin(i) * 50) : 0);
    coverages.exome.push(inExon ? 100 + (Math.sin(i * 2) * 30) : Math.random() * 3);
    coverages.genome.push(30 + (Math.sin(i * 3) * 5));
  }

  const data = coverages[strategy];
  // Use a fixed max so comparisons across strategies are meaningful
  const globalMax = 550;
  const binW = W / bins;
  const plotH = H - 40; // leave room for labels at top and bottom

  // Draw intron/exon region backgrounds with labels
  for (let i = 0; i < bins; i++) {
    const inExon = exonRegions.some(([s, e]) => i >= s && i <= e);
    ctx.fillStyle = inExon ? 'rgba(6, 182, 212, 0.12)' : 'rgba(100, 116, 139, 0.06)';
    ctx.fillRect(i * binW, 15, binW, plotH);
  }

  // Intron labels between exon regions
  ctx.fillStyle = '#64748b';
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'center';

  // Label intron regions
  const intronSpans = [];
  let prevEnd = 0;
  for (const [s, e] of exonRegions) {
    if (s > prevEnd) intronSpans.push([prevEnd, s]);
    prevEnd = e + 1;
  }
  if (prevEnd < bins) intronSpans.push([prevEnd, bins]);

  intronSpans.forEach(([s, e]) => {
    const mid = ((s + e) / 2) * binW;
    if (e - s > 5) { // only label if wide enough
      ctx.fillStyle = '#64748b';
      ctx.fillText('Intron', mid, H - 2);
    }
  });

  // Exon labels at bottom
  ctx.fillStyle = '#06b6d4';
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'center';
  exonRegions.forEach(([s, e], idx) => {
    ctx.fillText(`Exon ${idx + 1}`, ((s + e) / 2) * binW, H - 2);
  });

  // Coverage bars
  for (let i = 0; i < bins; i++) {
    const h = (data[i] / globalMax) * plotH;
    if (data[i] === 0) {
      // No coverage — draw a thin red line at the bottom
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(i * binW, 15 + plotH - 2, binW - 0.5, 2);
    } else {
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(i * binW, 15 + plotH - h, binW - 0.5, h);
    }
  }

  // Strategy label + max coverage at top
  const maxCov = Math.max(...data, 1);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';

  const strategyLabels = {
    panel: 'PANEL | 50 Gene, 500x | ',
    exome: 'EXOM | 20.000 Gene, 100x | ',
    genome: 'GENOM | alles, 30x | ',
  };
  ctx.fillText(`${strategyLabels[strategy]} | max: ${maxCov.toFixed(0)}x`, 4, 11);
}

// ── Step 5: Filter Funnel ───────────────────────────────────────

// Detailed per-step filter data for each case.
// Each step has: total pool entering, how many are removed by this filter,
// and whether the causal variant survives this step.
// Steps: 0=Raw, 1=Quality, 2=MAF, 3=Coding, 4=Effect, 5=GeneList, 6=Segregation, 7=ACMG
const FILTER_DEFINITIONS = {
  mcadd: {
    raw: 4500000,
    // Each step: [removed_by_this_step, causal_survives]
    steps: {
      quality:     { removed: 700000, causalSurvives: true },
      maf:         { removed: 3755000, causalSurvives: true, causalMaf: 0.014 },  // MAF trap: causal variant has 1.4% MAF
      coding:      { removed: 44200, causalSurvives: true },
      effect:      { removed: 450, causalSurvives: true },
      genelist:    { removed: 338, causalSurvives: true },
      segregation: { removed: 10, causalSurvives: true },
      acmg:        { removed: 1, causalSurvives: true },
    },
  },
  pku: {
    raw: 4500000,
    steps: {
      quality:     { removed: 700000, causalSurvives: true },
      maf:         { removed: 3758000, causalSurvives: true },
      coding:      { removed: 41220, causalSurvives: true },
      effect:      { removed: 440, causalSurvives: true },
      genelist:    { removed: 330, causalSurvives: true },
      segregation: { removed: 8, causalSurvives: true },
      acmg:        { removed: 1, causalSurvives: true },
    },
  },
  fh: {
    raw: 4500000,
    steps: {
      quality:     { removed: 700000, causalSurvives: true },
      maf:         { removed: 3756000, causalSurvives: true },
      coding:      { removed: 43190, causalSurvives: true },
      effect:      { removed: 460, causalSurvives: true },
      genelist:    { removed: 352, causalSurvives: true },
      segregation: { removed: 5, causalSurvives: true },  // AD, so segregation less relevant
      acmg:        { removed: 2, causalSurvives: true },
    },
  },
};

const FILTER_STEP_ORDER = ['quality', 'maf', 'coding', 'effect', 'genelist', 'segregation', 'acmg'];
const FILTER_STEP_IDS   = ['filt-count-0','filt-count-1','filt-count-2','filt-count-3','filt-count-4','filt-count-5','filt-count-6','filt-count-7'];

function setupFilterFunnel() {
  const mafSlider = document.getElementById('maf-slider');
  const mafDisplay = document.getElementById('maf-threshold-display');
  const warningEl = document.getElementById('filter-warning');
  const caseSelect = document.getElementById('filter-case');

  function updateFunnel() {
    const caseName = caseSelect.value;
    const fd = FILTER_DEFINITIONS[caseName];
    if (!fd) return;

    const mafPct = parseFloat(mafSlider.value);
    mafDisplay.textContent = `${mafPct}%`;
    const mafThresh = mafPct / 100;

    const t = helixI18n.t;
    const lang = helixI18n.getLang();
    const remainingLabel = t('filt_remaining');
    const removedLabel = t('filt_removed');

    // Determine which checkboxes are checked
    const checks = {};
    document.querySelectorAll('.filt-check').forEach(cb => {
      checks[cb.dataset.filter] = cb.checked;
    });

    // Walk through the funnel
    let pool = fd.raw;
    let causalAlive = true;
    const counts = [pool]; // index 0 = raw
    const removedCounts = [0];

    for (const stepName of FILTER_STEP_ORDER) {
      const stepDef = fd.steps[stepName];
      const isActive = checks[stepName] !== false; // default true if no checkbox

      let removed = 0;
      let causalSurvivesThisStep = true;

      if (isActive) {
        removed = stepDef.removed;

        // MAF step: adjust removed count based on slider position
        if (stepName === 'maf') {
          // Base MAF filter assumes 1% threshold
          // Scale: lower threshold = more removed, higher = fewer removed
          const scaleFactor = Math.max(0.3, Math.min(2.5, 1.0 / Math.max(mafPct, 0.1)));
          removed = Math.round(stepDef.removed * scaleFactor);

          // Check the MAF trap
          if (stepDef.causalMaf && mafThresh < stepDef.causalMaf) {
            causalSurvivesThisStep = false;
          }
        }

        // Coding filter: when unchecked, MORE variants remain (coding restricts to coding/splice only)
        // So when checked/active, we remove non-coding variants
        // When unchecked/inactive, we skip this filter = more variants remain

        removed = Math.min(removed, pool); // cannot remove more than pool
        pool -= removed;
      }

      if (!causalSurvivesThisStep) causalAlive = false;

      counts.push(pool);
      removedCounts.push(removed);
    }

    // MAF trap warning
    const mafStep = fd.steps.maf;
    if (mafStep.causalMaf && mafThresh < mafStep.causalMaf && checks['maf'] !== false) {
      warningEl.innerHTML = t('mcadd_warning');
      warningEl.classList.add('visible');
      causalAlive = false;
    } else {
      warningEl.classList.remove('visible');
    }

    // Update display for each funnel step
    for (let i = 0; i < FILTER_STEP_IDS.length; i++) {
      const countEl = document.getElementById(FILTER_STEP_IDS[i]);
      if (!countEl) continue;

      const count = counts[i] !== undefined ? counts[i] : 0;
      const removed = removedCounts[i] !== undefined ? removedCounts[i] : 0;

      // Main count with "remaining" label
      let html = `<span class="filt-count-num">${count.toLocaleString('de-DE')}</span> <span class="filt-count-label">${remainingLabel}</span>`;

      // Show removed count for non-raw steps
      if (i > 0 && removed > 0) {
        html += ` <span class="filt-removed">(−${removed.toLocaleString('de-DE')} ${removedLabel})</span>`;
      }

      // Causal variant indicator
      if (i > 0) {
        if (causalAlive) {
          html += ` <span class="filt-causal-ok" title="${t('filt_causal_survived')}">&#10003;</span>`;
        } else {
          // Check if causal was lost at or before this step
          html += ` <span class="filt-causal-lost" title="${t('filt_causal_lost')}">&#10007;</span>`;
        }
      }

      countEl.innerHTML = html;
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

// ACMG criteria detailed explanations for tooltip/info boxes
const ACMG_CRITERIA_INFO = {
  PVS1: {
    de: { name: 'Null-Variante (Very Strong)', desc: 'Nonsense, Frameshift, kanonische Splice-Variante (±1,2) in einem Gen, bei dem Loss-of-Function der bekannte Krankheitsmechanismus ist.', points: '+8', example: 'PAH c.1315+1G>A — kanonische Splice-Site-Variante. PAH ist ein bekanntes LoF-Gen (PKU).' },
    en: { name: 'Null variant (Very Strong)', desc: 'Nonsense, frameshift, canonical splice variant (±1,2) in a gene where loss-of-function is the known disease mechanism.', points: '+8', example: 'PAH c.1315+1G>A — canonical splice site variant. PAH is a known LoF gene (PKU).' },
  },
  PS1: {
    de: { name: 'Bekannter AS-Austausch (Strong)', desc: 'Gleiche Aminosäure-Änderung wie eine bereits als pathogen bekannte Variante, aber durch eine andere Nukleotid-Änderung verursacht.', points: '+4', example: 'PAH p.Arg408Trp ist pathogen. Eine neue Variante, die ebenfalls p.Arg408Trp verursacht (anderer Codon-Wechsel), erhält PS1.' },
    en: { name: 'Known AA change (Strong)', desc: 'Same amino acid change as a previously established pathogenic variant, but caused by a different nucleotide change.', points: '+4', example: 'PAH p.Arg408Trp is pathogenic. A novel variant also causing p.Arg408Trp (different codon change) gets PS1.' },
  },
  PS3: {
    de: { name: 'Funktionelle Studie (Strong)', desc: 'Gut etablierte In-vitro- oder In-vivo-Studien zeigen einen schädlichen Effekt auf die Genfunktion.', points: '+4', example: 'In-vitro-Enzymassay zeigt <5% PAH-Restaktivität für die Variante.' },
    en: { name: 'Functional study (Strong)', desc: 'Well-established in vitro or in vivo studies show a damaging effect on gene function.', points: '+4', example: 'In vitro enzyme assay shows <5% PAH residual activity for the variant.' },
  },
  PM1: {
    de: { name: 'Hotspot / funktionelle Domäne (Moderate)', desc: 'In einem Mutationshotspot und/oder einer kritischen funktionellen Domäne ohne bekannte benigne Varianten gelegen.', points: '+2', example: 'Variante in der katalytischen Domäne von PAH (AS 206-453), wo keine benignen Varianten bekannt sind.' },
    en: { name: 'Hotspot / functional domain (Moderate)', desc: 'Located in a mutation hotspot and/or critical functional domain without known benign variants.', points: '+2', example: 'Variant in the catalytic domain of PAH (residues 206-453), where no benign variants are known.' },
  },
  PM2: {
    de: { name: 'Absent in gnomAD (Moderate)', desc: 'Fehlt in Populationsdatenbanken (gnomAD) oder ist extrem selten (MAF deutlich unter dem erwarteten Wert für die Erkrankung).', points: '+2', example: 'Variante nicht in gnomAD v4 (>800.000 Allele) nachweisbar.' },
    en: { name: 'Absent in gnomAD (Moderate)', desc: 'Absent from population databases (gnomAD) or extremely rare (MAF well below expected for the disease).', points: '+2', example: 'Variant not found in gnomAD v4 (>800,000 alleles).' },
  },
  PP3: {
    de: { name: 'In silico (Supporting)', desc: 'Mehrere Vorhersage-Algorithmen (CADD, REVEL, AlphaMissense) sagen einen schädlichen Effekt vorher.', points: '+1', example: 'CADD >25, REVEL >0.7, AlphaMissense "likely pathogenic" — alle sprechen für Schädlichkeit.' },
    en: { name: 'In silico (Supporting)', desc: 'Multiple prediction algorithms (CADD, REVEL, AlphaMissense) predict a deleterious effect.', points: '+1', example: 'CADD >25, REVEL >0.7, AlphaMissense "likely pathogenic" — all support deleteriousness.' },
  },
  PP5: {
    de: { name: 'ClinVar P (Supporting)', desc: 'Vertrauenswürdige Quelle hat die Variante als pathogen gemeldet (z.B. ClinVar mit Review-Status ≥2 Sterne). Hinweis: PP5 wird nach ClinGen-Update 2020 als schwächer betrachtet.', points: '+1', example: 'ClinVar: "Pathogenic" mit 3-Sterne-Review für diese Variante.' },
    en: { name: 'ClinVar P (Supporting)', desc: 'Reputable source has reported the variant as pathogenic (e.g., ClinVar with review status ≥2 stars). Note: PP5 is considered weaker after ClinGen 2020 update.', points: '+1', example: 'ClinVar: "Pathogenic" with 3-star review for this variant.' },
  },
  BA1: {
    de: { name: 'MAF >5% (Stand-alone Benign)', desc: 'Allel-Frequenz >5% in einer großen Populationsdatenbank. Allein ausreichend für "Benign"-Klassifikation.', points: '-8', example: 'Variante hat MAF 12% in gnomAD (alle Populationen) — viel zu häufig für eine penetrante Erkrankung.' },
    en: { name: 'MAF >5% (Stand-alone Benign)', desc: 'Allele frequency >5% in a large population database. Alone sufficient for "Benign" classification.', points: '-8', example: 'Variant has MAF 12% in gnomAD (all populations) — far too common for a penetrant disease.' },
  },
  BS1: {
    de: { name: 'MAF zu hoch (Strong Benign)', desc: 'Allel-Frequenz höher als für die Erkrankung erwartet, aber unter 5%.', points: '-4', example: 'AR-Erkrankung mit Inzidenz 1:10.000 → erwartete Carrier-Frequenz ~1:50 (MAF 1%). Variante hat MAF 2.5% — zu häufig.' },
    en: { name: 'MAF too high (Strong Benign)', desc: 'Allele frequency higher than expected for the disease, but below 5%.', points: '-4', example: 'AR disease with incidence 1:10,000 → expected carrier frequency ~1:50 (MAF 1%). Variant has MAF 2.5% — too common.' },
  },
  BS3: {
    de: { name: 'Funktionell normal (Strong Benign)', desc: 'Gut etablierte funktionelle Studien zeigen keinen schädlichen Effekt.', points: '-4', example: 'In-vitro-Enzymassay zeigt >80% PAH-Aktivität — funktionell normal.' },
    en: { name: 'Func. normal (Strong Benign)', desc: 'Well-established functional studies show no damaging effect.', points: '-4', example: 'In vitro enzyme assay shows >80% PAH activity — functionally normal.' },
  },
  BP1: {
    de: { name: 'Missense in LoF-Gen (Supporting Benign)', desc: 'Missense-Variante in einem Gen, bei dem nur Truncating-Varianten (LoF) Krankheit verursachen.', points: '-1', example: 'Missense-Variante in einem Gen, das nur durch Frameshift/Nonsense pathogen wird.' },
    en: { name: 'Missense in LoF gene (Supporting Benign)', desc: 'Missense variant in a gene where only truncating variants (LoF) cause disease.', points: '-1', example: 'Missense variant in a gene that is only pathogenic through frameshift/nonsense.' },
  },
  BP4: {
    de: { name: 'In silico benigne (Supporting Benign)', desc: 'Mehrere Vorhersage-Algorithmen sagen keinen schädlichen Effekt vorher.', points: '-1', example: 'CADD <15, REVEL <0.3, AlphaMissense "benign" — alle sprechen gegen Schädlichkeit.' },
    en: { name: 'In silico benign (Supporting Benign)', desc: 'Multiple prediction algorithms predict no deleterious effect.', points: '-1', example: 'CADD <15, REVEL <0.3, AlphaMissense "benign" — all argue against deleteriousness.' },
  },
};

// Correct ACMG criteria for the CBS teaching case
const CBS_CORRECT_CRITERIA = ['PS3', 'PM2', 'PP3'];
const CBS_CORRECT_CLASSIFICATION = 'Likely Pathogenic';

function setupACMG() {
  const grid = document.getElementById('acmg-criteria-grid');
  if (!grid) return;

  grid.querySelectorAll('.acmg-crit').forEach(btn => {
    const criterion = btn.dataset.criterion;

    // Make buttons larger with code + short description
    if (criterion && ACMG_CRITERIA_INFO[criterion]) {
      const lang = helixI18n.getLang();
      const info = ACMG_CRITERIA_INFO[criterion][lang] || ACMG_CRITERIA_INFO[criterion].en;
      btn.innerHTML = `<span class="acmg-code">${criterion}</span><span class="acmg-short">${info.name}</span>`;
      btn.style.minWidth = '120px';
      btn.style.padding = '8px 12px';
      btn.style.textAlign = 'left';
    }

    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      updateACMGResult();
      showACMGExplanation(criterion, btn.classList.contains('selected'));
    });
  });

  // Add explanation container below the grid if it does not exist
  let explainContainer = document.getElementById('acmg-explanation');
  if (!explainContainer) {
    explainContainer = document.createElement('div');
    explainContainer.id = 'acmg-explanation';
    explainContainer.className = 'acmg-explanation-box';
    explainContainer.style.cssText = 'margin-top:12px;padding:12px 16px;background:rgba(6,182,212,0.06);border:1px solid rgba(6,182,212,0.15);border-radius:8px;display:none;font-size:13px;line-height:1.6;';
    grid.parentNode.insertBefore(explainContainer, grid.nextSibling);
  }

  // Add "Reveal correct answer" button if it does not exist
  let revealBtn = document.getElementById('acmg-reveal-btn');
  if (!revealBtn) {
    revealBtn = document.createElement('button');
    revealBtn.id = 'acmg-reveal-btn';
    revealBtn.className = 'btn btn-secondary';
    revealBtn.style.cssText = 'margin-top:12px;';
    revealBtn.textContent = helixI18n.t('acmg_reveal_answer');
    revealBtn.addEventListener('click', () => revealCorrectACMG());
    const container = explainContainer.parentNode;
    container.insertBefore(revealBtn, explainContainer.nextSibling);
  }

  // Add correct answer container
  let correctContainer = document.getElementById('acmg-correct-answer');
  if (!correctContainer) {
    correctContainer = document.createElement('div');
    correctContainer.id = 'acmg-correct-answer';
    correctContainer.style.cssText = 'margin-top:12px;padding:12px 16px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:8px;display:none;font-size:13px;line-height:1.6;';
    revealBtn.parentNode.insertBefore(correctContainer, revealBtn.nextSibling);
  }

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

function showACMGExplanation(criterion, isSelected) {
  const container = document.getElementById('acmg-explanation');
  if (!container) return;

  if (!isSelected || !criterion || !ACMG_CRITERIA_INFO[criterion]) {
    container.style.display = 'none';
    return;
  }

  const lang = helixI18n.getLang();
  const info = ACMG_CRITERIA_INFO[criterion][lang] || ACMG_CRITERIA_INFO[criterion].en;

  container.innerHTML = `
    <div style="font-weight:700;font-size:14px;margin-bottom:6px;color:#06b6d4;">${criterion} — ${info.name}</div>
    <div style="margin-bottom:4px;"><strong>${lang === 'de' ? 'Bedeutung' : 'Meaning'}:</strong> ${info.desc}</div>
    <div style="margin-bottom:4px;"><strong>${lang === 'de' ? 'Punkte' : 'Points'}:</strong> ${info.points}</div>
    <div style="color:#94a3b8;font-style:italic;"><strong>${lang === 'de' ? 'Beispiel' : 'Example'}:</strong> ${info.example}</div>
  `;
  container.style.display = 'block';
}

function revealCorrectACMG() {
  const container = document.getElementById('acmg-correct-answer');
  if (!container) return;

  const lang = helixI18n.getLang();
  const t = helixI18n.t;

  const criteriaList = CBS_CORRECT_CRITERIA.map(c => {
    const info = ACMG_CRITERIA_INFO[c][lang] || ACMG_CRITERIA_INFO[c].en;
    return `<li><strong>${c}</strong> — ${info.name}: ${info.desc}</li>`;
  }).join('');

  container.innerHTML = `
    <div style="font-weight:700;font-size:14px;margin-bottom:8px;color:#10b981;">${t('acmg_correct_answer')}: ${CBS_CORRECT_CLASSIFICATION}</div>
    <div style="margin-bottom:6px;">${lang === 'de' ? 'Korrekte Kriterien fuer CBS c.833T>C (p.Ile278Thr):' : 'Correct criteria for CBS c.833T>C (p.Ile278Thr):'}</div>
    <ul style="margin:0;padding-left:20px;">${criteriaList}</ul>
    <div style="margin-top:8px;color:#94a3b8;font-size:12px;">${lang === 'de'
      ? 'PS3 (funktionelle Studie: 15% Restaktivität = deutlich reduziert) + PM2 (gnomAD MAF 0.00003 = quasi absent) + PP3 (CADD 27, REVEL 0.72 = pathogen vorhergesagt) = Likely Pathogenic. Für Pathogenic würde ein weiteres Strong-Kriterium (z.B. PS1 oder PS2) benötigt.'
      : 'PS3 (functional study: 15% residual activity = clearly reduced) + PM2 (gnomAD MAF 0.00003 = quasi absent) + PP3 (CADD 27, REVEL 0.72 = predicted pathogenic) = Likely Pathogenic. For Pathogenic, an additional Strong criterion (e.g. PS1 or PS2) would be needed.'
    }</div>
  `;
  container.style.display = 'block';

  // Highlight correct criteria in the grid
  const grid = document.getElementById('acmg-criteria-grid');
  if (grid) {
    grid.querySelectorAll('.acmg-crit').forEach(btn => {
      const crit = btn.dataset.criterion;
      if (CBS_CORRECT_CRITERIA.includes(crit)) {
        btn.classList.add('correct-answer');
        btn.style.outline = '2px solid #10b981';
      }
    });
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
    btn.classList.remove('correct-answer');
    btn.style.outline = '';
  });
  const explainEl = document.getElementById('acmg-explanation');
  if (explainEl) explainEl.style.display = 'none';
  const correctEl = document.getElementById('acmg-correct-answer');
  if (correctEl) correctEl.style.display = 'none';
  updateACMGResult();
}

// ── Step 7: Short vs Long Read ──────────────────────────────────

// Generate synthetic reads directly in JS instead of loading JSON files
function generateSyntheticReads() {
  const regionLen = 1000;
  const breakpointStart = 450;
  const breakpointEnd = 550;

  // Generate a reference sequence
  const bases = 'ACGT';
  let reference = '';
  for (let i = 0; i < regionLen; i++) {
    reference += bases[Math.floor(Math.random() * 4)];
  }

  // Short reads: 40 reads of 150bp
  const shortReads = [];
  for (let i = 0; i < 40; i++) {
    const start = Math.floor(Math.random() * (regionLen - 150));
    const end = start + 150;
    const overlapsBreakpoint = start < breakpointEnd && end > breakpointStart;

    let flags = 0; // normal mapping
    let color = '#06b6d4'; // normal cyan
    let softClipLeft = 0;
    let softClipRight = 0;
    let mateDiscordant = false;

    if (overlapsBreakpoint) {
      // Reads near the breakpoint have mapping issues
      const rng = Math.random();
      if (rng < 0.4) {
        // Soft-clipped read
        softClipLeft = end > breakpointStart && start < breakpointStart ? end - breakpointStart : 0;
        softClipRight = start < breakpointEnd && end > breakpointEnd ? breakpointEnd - start : 0;
        if (softClipLeft > 0 || softClipRight > 0) {
          color = '#f59e0b'; // amber for soft-clipped
          flags = 1;
        }
      } else if (rng < 0.7) {
        // Discordant pair — unexpected insert size
        mateDiscordant = true;
        color = '#ef4444'; // red for discordant
        flags = 2;
      } else {
        // Low mapping quality
        color = '#94a3b8'; // gray for low MAPQ
        flags = 3;
      }
    }

    shortReads.push({
      start, end, color, flags, softClipLeft, softClipRight, mateDiscordant,
      seq: reference.substring(start, end),
    });
  }

  // Long reads: 8 reads of 5000-8000bp equivalent, scaled to fit the 1000bp display region
  // We represent them as reads spanning large portions of the region
  const longReads = [];
  for (let i = 0; i < 8; i++) {
    const readLen = 600 + Math.floor(Math.random() * 400); // 600-1000bp in display space
    const maxStart = Math.max(0, regionLen - readLen);
    const start = Math.floor(Math.random() * maxStart);
    const end = Math.min(start + readLen, regionLen);
    const spansBreakpoint = start < breakpointStart && end > breakpointEnd;
    const realLen = 5000 + Math.floor(Math.random() * 3000); // actual length 5-8kb

    longReads.push({
      start, end, realLen,
      color: spansBreakpoint ? '#10b981' : '#06b6d4', // green if spanning breakpoint
      spansBreakpoint,
      seq: reference.substring(start, end),
    });
  }

  return { reference, regionLen, breakpointStart, breakpointEnd, shortReads, longReads };
}

function renderSyntheticReadsCanvas(canvas, reads, regionLen, breakpointStart, breakpointEnd, isLongRead) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0a0e17';
  ctx.fillRect(0, 0, W, H);

  const scale = W / regionLen;
  const readHeight = isLongRead ? 18 : 8;
  const readGap = isLongRead ? 4 : 2;
  const topMargin = 25;

  // Draw breakpoint region background
  ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
  ctx.fillRect(breakpointStart * scale, 0, (breakpointEnd - breakpointStart) * scale, H);

  // Breakpoint markers
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(breakpointStart * scale, 0);
  ctx.lineTo(breakpointStart * scale, H);
  ctx.moveTo(breakpointEnd * scale, 0);
  ctx.lineTo(breakpointEnd * scale, H);
  ctx.stroke();
  ctx.setLineDash([]);

  // Breakpoint label
  ctx.fillStyle = '#ef4444';
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Breakpoint', ((breakpointStart + breakpointEnd) / 2) * scale, 12);

  // Draw reference track at top
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, topMargin - 5, W, 3);

  // Position reads using simple stacking
  const rows = [];
  const sortedReads = [...reads].sort((a, b) => a.start - b.start);

  for (const read of sortedReads) {
    let placed = false;
    for (let row = 0; row < rows.length; row++) {
      if (rows[row] <= read.start * scale - 2) {
        rows[row] = read.end * scale;
        read._row = row;
        placed = true;
        break;
      }
    }
    if (!placed) {
      read._row = rows.length;
      rows.push(read.end * scale);
    }
  }

  // Draw reads
  for (const read of sortedReads) {
    const x = read.start * scale;
    const w = (read.end - read.start) * scale;
    const y = topMargin + read._row * (readHeight + readGap);

    if (y + readHeight > H) continue; // skip if out of view

    // Read body
    ctx.fillStyle = read.color;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(x, y, w, readHeight);
    ctx.globalAlpha = 1.0;

    // Soft clip indicators (short reads only)
    if (!isLongRead && read.softClipLeft > 0) {
      ctx.fillStyle = '#f59e0b';
      ctx.globalAlpha = 0.9;
      const clipW = Math.min(read.softClipLeft * scale, w * 0.4);
      ctx.fillRect(x + w - clipW, y, clipW, readHeight);
      ctx.globalAlpha = 1.0;
    }
    if (!isLongRead && read.softClipRight > 0) {
      ctx.fillStyle = '#f59e0b';
      ctx.globalAlpha = 0.9;
      const clipW = Math.min(read.softClipRight * scale, w * 0.4);
      ctx.fillRect(x, y, clipW, readHeight);
      ctx.globalAlpha = 1.0;
    }

    // Discordant pair indicator
    if (!isLongRead && read.mateDiscordant) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w, readHeight);
    }

    // Long read: show if it spans breakpoint with a green highlight
    if (isLongRead && read.spansBreakpoint) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, readHeight);
      // Small label
      ctx.fillStyle = '#10b981';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${(read.realLen / 1000).toFixed(1)}kb`, x + 3, y + readHeight - 3);
    }
  }

  // Legend
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'left';
  if (isLongRead) {
    ctx.fillStyle = '#10b981';
    ctx.fillRect(W - 180, H - 28, 10, 10);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Spans breakpoint', W - 166, H - 19);
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(W - 180, H - 14, 10, 10);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Normal read', W - 166, H - 5);
  } else {
    const legendY = H - 42;
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(W - 180, legendY, 10, 8);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Normal', W - 166, legendY + 7);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(W - 180, legendY + 12, 10, 8);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Soft-clipped', W - 166, legendY + 19);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(W - 180, legendY + 24, 10, 8);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Discordant pair', W - 166, legendY + 31);
  }
}

function initStep7() {
  const shortCanvas = document.getElementById('split-short-canvas');
  const longCanvas = document.getElementById('split-long-canvas');
  const infoEl = document.getElementById('split-info');

  // Generate synthetic data instead of loading JSON files
  const synth = generateSyntheticReads();

  if (shortCanvas) {
    renderSyntheticReadsCanvas(
      shortCanvas, synth.shortReads, synth.regionLen,
      synth.breakpointStart, synth.breakpointEnd, false
    );
  }
  if (longCanvas) {
    renderSyntheticReadsCanvas(
      longCanvas, synth.longReads, synth.regionLen,
      synth.breakpointStart, synth.breakpointEnd, true
    );
  }

  const lang = helixI18n.getLang();
  if (infoEl) {
    infoEl.innerHTML = lang === 'de'
      ? '<strong>Links (Illumina Short-Read, 150 bp):</strong> Viele kurze Reads — Coverage gleichmaessig, SNVs praezise. Aber in der Breakpoint-Region: Reads werden soft-geclippt (gelb), diskordante Paare (rot) oder haben niedriges Mapping (grau). Der Breakpoint kann nicht eindeutig aufgeloest werden.<br><br><strong>Rechts (Long-Read: PacBio HiFi / ONT, 5–8 kb):</strong> Wenige lange Reads — einzelne Reads ueberspannen den gesamten Breakpoint (gruen markiert). Strukturvariante sofort sichtbar. PacBio HiFi liefert dabei Q30+ Genauigkeit (>99.9%), ONT hat hoehere Fehlerrate (~5%), bietet dafuer ultra-lange Reads (>100 kb moeglich).'
      : '<strong>Left (Illumina Short-Read, 150 bp):</strong> Many short reads — coverage uniform, SNVs precise. But in the breakpoint region: reads are soft-clipped (amber), discordant pairs (red), or have low mapping quality (gray). The breakpoint cannot be clearly resolved.<br><br><strong>Right (Long-Read: PacBio HiFi / ONT, 5–8 kb):</strong> Few long reads — single reads span the entire breakpoint (highlighted in green). Structural variant immediately visible. PacBio HiFi delivers Q30+ accuracy (>99.9%), ONT has higher error rate (~5%) but offers ultra-long reads (>100 kb possible).';
  }
}

// ── Step 8: Metabolic Pathway ───────────────────────────────────

// Detailed pathway data for each disease including reference concentrations
const PATHWAY_DATA = {
  pku: {
    nodes: ['Phe', 'PAH', 'Tyr', 'Melanin'],
    enzyme: 1,
    refConcentrations: {
      normal: { 'Phe': '30–120 µmol/L', 'Tyr': '30–120 µmol/L', 'Melanin': 'normal' },
      blocked: { 'Phe': '>1200 µmol/L ↑↑', 'Tyr': '<20 µmol/L ↓', 'Melanin': '↓ (hypopigm.)' },
    },
    i18nKey: 'pku',
  },
  mcadd: {
    nodes: ['C8-FA', 'ACADM', 'Acetyl-CoA', 'Energy'],
    enzyme: 1,
    refConcentrations: {
      normal: { 'C8-FA': 'C8 <0.3 µmol/L', 'Acetyl-CoA': 'normal', 'Energy': 'normal' },
      blocked: { 'C8-FA': 'C8 >1.0 µmol/L ↑↑', 'Acetyl-CoA': '↓↓', 'Energy': 'Krise / Crisis' },
    },
    i18nKey: 'mcadd',
  },
  galactosemia: {
    nodes: ['Gal-1-P', 'GALT', 'UDP-Glc', 'Glycogen'],
    enzyme: 1,
    refConcentrations: {
      normal: { 'Gal-1-P': '<1 mg/dL', 'UDP-Glc': 'normal', 'Glycogen': 'normal' },
      blocked: { 'Gal-1-P': '>10 mg/dL ↑↑', 'UDP-Glc': '↓', 'Glycogen': '↓' },
    },
    i18nKey: 'gal',
  },
  fh: {
    nodes: ['LDL', 'LDLR', 'Uptake', 'Clearance'],
    enzyme: 1,
    refConcentrations: {
      normal: { 'LDL': '<130 mg/dL', 'Uptake': 'normal', 'Clearance': 'normal' },
      blocked: { 'LDL': '190–400+ mg/dL ↑↑', 'Uptake': '↓↓', 'Clearance': '↓↓' },
    },
    i18nKey: 'fh',
  },
};

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
  const lang = helixI18n.getLang();

  const pwData = PATHWAY_DATA[disease];
  if (!pwData) return;

  const pw = {
    nodes: pwData.nodes,
    enzyme: pwData.enzyme,
    colors: blocked
      ? pwData.nodes.map((_, i) => i < pwData.enzyme ? '#ef4444' : (i === pwData.enzyme ? '#ef4444' : '#475569'))
      : pwData.nodes.map((_, i) => i === pwData.enzyme ? '#10b981' : '#06b6d4'),
  };

  const nodeWidth = 90;
  const gap = 35;
  const startX = 30;
  const y = 60;

  let svgContent = '';

  // SVG viewBox might need to accommodate concentration labels
  const svgWidth = startX + pw.nodes.length * (nodeWidth + gap);
  svg.setAttribute('viewBox', `0 0 ${Math.max(svgWidth, 500)} 160`);

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

    // Accumulation / deficiency indicators
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

    // Reference concentration values below each non-enzyme node
    if (!isEnzyme) {
      const conc = blocked ? pwData.refConcentrations.blocked : pwData.refConcentrations.normal;
      const concValue = conc[name];
      if (concValue) {
        const concColor = blocked && i !== pw.enzyme ? (i < pw.enzyme ? '#ef4444' : '#64748b') : '#94a3b8';
        svgContent += `<text x="${x + nodeWidth/2}" y="${y + 25}" text-anchor="middle" fill="${concColor}" font-size="8" font-weight="400">${concValue}</text>`;
      }
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

  // Explanation text + expandable disease detail sections
  if (explainEl) {
    let html = '';

    if (blocked) {
      html += `<div class="pathway-summary" style="margin-bottom:12px;">${t(`pathway_${disease}`)}</div>`;

      // Build expandable sections for the detailed disease info
      const sectionKeys = ['biochem', 'clinic', 'diagnostics', 'therapy', 'counseling', 'vus'];
      const sectionI18nKeys = ['pw_section_biochem', 'pw_section_clinic', 'pw_section_diagnostics', 'pw_section_therapy', 'pw_section_counseling', 'pw_section_vus'];

      html += '<div class="pathway-detail-sections">';
      for (let s = 0; s < sectionKeys.length; s++) {
        const contentKey = `pw_${pwData.i18nKey}_${sectionKeys[s]}`;
        const contentText = t(contentKey);
        if (!contentText || contentText === contentKey) continue; // skip if no i18n key found

        const sectionTitle = t(sectionI18nKeys[s]);
        const sectionId = `pw-section-${disease}-${sectionKeys[s]}`;

        html += `
          <details class="pathway-detail" style="margin-bottom:6px;border:1px solid rgba(100,116,139,0.2);border-radius:6px;overflow:hidden;">
            <summary style="padding:8px 12px;cursor:pointer;font-weight:600;font-size:13px;background:rgba(100,116,139,0.05);user-select:none;">${sectionTitle}</summary>
            <div id="${sectionId}" style="padding:10px 14px;font-size:12px;line-height:1.7;color:#cbd5e1;">${contentText}</div>
          </details>
        `;
      }
      html += '</div>';
    }

    explainEl.innerHTML = html;
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
        q: lang === 'de' ? 'Was ist der Vorteil von Long-Read-Sequenzierung (PacBio HiFi / ONT) gegenüber Short-Read (Illumina)?' : 'What is the advantage of long-read sequencing (PacBio HiFi / ONT) over short-read (Illumina)?',
        options: [
          lang === 'de' ? 'Niedrigere Fehlerrate bei SNVs' : 'Lower error rate for SNVs',
          lang === 'de' ? 'Bessere Erkennung von Strukturvarianten und Phasing' : 'Better detection of structural variants and phasing',
          lang === 'de' ? 'Höhere Coverage bei gleichem Preis' : 'Higher coverage at the same price',
          lang === 'de' ? 'Schnellere Bibliotheksvorbereitung' : 'Faster library preparation',
        ],
        correct: 1,
        feedback: lang === 'de' ? 'Long-Reads spannen repetitive Regionen und SV-Breakpoints. Ein einzelner Read kann eine ganze Duplikation oder Deletion überspannen. Phasing (Zuordnung zu Allelen) wird direkt möglich. PacBio HiFi bietet dabei die höchste Genauigkeit (Q30+).' : 'Long reads span repetitive regions and SV breakpoints. A single read can span an entire duplication or deletion. Phasing (allele assignment) becomes directly possible. PacBio HiFi offers the highest accuracy (Q30+).',
      },
    ],
    2: [ // Diagnostic Strategy
      {
        q: lang === 'de' ? 'Ein Patient mit V.a. Stoffwechselerkrankung. Neugeborenenscreening auffällig (C8↑). Welche Sequenzierungsstrategie empfehlen Sie als Erstlinien-Diagnostik?' : 'A patient with suspected metabolic disease. Abnormal newborn screening (C8↑). Which sequencing strategy do you recommend as first-line diagnostics?',
        options: [
          lang === 'de' ? 'Genomsequenzierung (30x, )' : 'Genome sequencing (30x, )',
          lang === 'de' ? 'Stoffwechsel-Gen-Panel (50 Gene, 500x, )' : 'Metabolic gene panel (50 genes, 500x, )',
          lang === 'de' ? 'Exomsequenzierung (100x, )' : 'Exome sequencing (100x, )',
          lang === 'de' ? 'Sanger-Sequenzierung von ACADM' : 'Sanger sequencing of ACADM',
        ],
        correct: 1,
        feedback: lang === 'de' ? 'Bei klarem klinischem Verdacht (C8↑ → V.a. MCADD) ist ein zielgerichtetes Panel die Erstlinien-Wahl: hohe Coverage (500x), schnell, günstig (). Sanger wäre zu eng (nur 1 Gen). Exom/Genom sind Reserve für unklare Fälle.' : 'With clear clinical suspicion (C8↑ → suspected MCADD), a targeted panel is first-line: high coverage (500x), fast, affordable (). Sanger would be too narrow (1 gene only). Exome/genome are reserved for unclear cases.',
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
