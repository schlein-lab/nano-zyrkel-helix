// ── Mutations Lab ────────────────────────────────────────────────
// Three modes: Learn (guided tour), Explore (real ClinVar/gnomAD), Quiz.

import init, {
  predict_mutation as wasmPredictMutation,
  predict_indel_effect as wasmPredictIndel,
  compare_protein_effect as wasmCompareProteins,
  predict_nmd_risk as wasmPredictNmd,
  translate as wasmTranslate,
} from './pkg/helix.js';

// ── i18n ────────────────────────────────────────────────────────

const I18N_DICT = {
  de: {
    mut_header: 'Mutationen-Labor',
    mut_subtitle: 'Punktmutationen · Frameshifts · Protein-Effekte',
    mode_learn: 'Lernen',
    mode_explore: 'Erkunden',
    mode_quiz: 'Quiz',
    depth_title: 'Tiefengrad — Basis, Klinisch, Experte',
    depth_basic: 'Basis',
    depth_clinical: 'Klinisch',
    depth_expert: 'Experte',
    depth_basic_label: 'Basis', depth_clinical_label: 'Klinisch', depth_expert_label: 'Experte',

    step1_label: 'Übersetzen',
    step2_label: 'Mutieren',
    step3_label: 'Indels',
    step4_label: 'Echte Fälle',
    step1_intro: 'Jede Aminosäure im Protein wird durch ein <strong>Codon</strong> aus 3 DNA-Basen codiert. Klick auf ein <strong>Codon in der Sequenz</strong> — oder benutze den Button unten — um die Translation Schritt für Schritt mitzuverfolgen.',
    step2_intro: 'Jetzt ändere einzelne Basen. Klick auf eine beliebige <strong>Base</strong> in der Sequenz und wähle eine Alternative. Jede Änderung wird sofort kommentiert — probier verschiedene Positionen und schau, was passiert (Silent? Missense? Stop-Codon?).',
    step3_intro: 'Was passiert, wenn Basen <strong>eingefügt oder gelöscht</strong> werden? Vergleiche eine 3-Basen-Deletion (in-frame) mit einer 1-Basen-Deletion (Frameshift) — der Unterschied ist entscheidend.',
    step4_intro: 'Du hast die Grundlagen verstanden. Hier sind echte Mutationen, die genau das tun, was du gerade ausprobiert hast — jede mit klinischem Kontext und einstellbarer Tiefe (Basis / Klinisch / Experte).',

    next_codon: 'Nächstes Codon →',
    translate_all: 'Alle übersetzen',
    reset: 'Zurücksetzen',
    to_mutations: 'Weiter zu Mutationen →',
    to_indels: 'Weiter zu Indels →',
    to_real_cases: 'Echte Fälle →',
    explore_real_data: 'Echte Daten erkunden →',
    back: '← Zurück',
    all_modules: '← Alle Module',
    powered_by: 'powered by <a href="https://github.com/schlein-lab/nano-zyrkel-helix" target="_blank">nano-zyrkel</a>',
    original: 'Original',
    mutated: 'Mutiert',

    indel_del1: '1 Base löschen',
    indel_del3: '3 Basen löschen',
    indel_ins1: '1 Base einfügen',
    indel_ins3: '3 Basen einfügen',

    gene_search_placeholder: 'Gen suchen (z. B. CFTR, BRCA1, TP53)…',
    quick_select: 'Schnellauswahl:',
    explore_empty_title: 'Wähle ein Gen, um echte Varianten zu erkunden',
    explore_empty_sub: 'Live-Daten von ClinVar (via VUS Tracker), gnomAD und UniProt',

    quiz_intro_title: 'Prüfe dein Verständnis',
    quiz_intro_sub: 'Drei Schwierigkeitsstufen mit echten Fällen aus der klinischen Praxis.',
    quiz_lvl1_title: 'Grundlagen',
    quiz_lvl1_desc: 'Mutations-Typ erkennen, Codon-Änderung verstehen',
    quiz_lvl2_title: 'Klinische Fälle',
    quiz_lvl2_desc: 'HGVS lesen, Pathomechanismen, NMD, Splice-Mutationen',
    quiz_lvl3_title: 'Interpretation',
    quiz_lvl3_desc: 'ACMG-Klassifikation, Genotype-Phenotype, klinische Entscheidungen',
    quiz_next: 'Nächste Frage →',
    quiz_quit: 'Quiz beenden',
    quiz_finished: 'Quiz beendet!',
    quiz_restart: 'Neues Quiz',
    quiz_progress_fmt: 'Frage {n} von {total}',
    quiz_score_fmt: 'Punkte: {n}',

    // Learn-Step-1 explain texts
    explain_start: 'Klick auf das grüne Start-Codon (oder auf "Nächstes Codon"), um die Translation zu starten. Das Start-Codon <strong>ATG</strong> markiert den Anfang jedes Proteins und codiert Methionin.',
    explain_step_fmt: 'Codon {n}: <strong>{codon}</strong> → <strong>{aa}</strong> ({aaName}).{extra}',
    explain_first_extra: ' Methionin ist die erste Aminosäure jedes Proteins — bei vielen Proteinen wird es nach der Translation wieder abgespalten.',
    explain_complete: 'Translation komplett! Du hast aus 30 DNA-Basen ein 9 Aminosäuren langes Protein gebaut. Das <strong>Stop-Codon</strong> (TAA) wird nicht in eine Aminosäure übersetzt — es signalisiert dem Ribosom: "Stopp, fertig hier."',

    // Effect cards (Learn Step 2)
    effect_no_mutation_badge: 'Keine Mutation',
    effect_no_mutation: 'Die Sequenz entspricht dem Original. Klick auf eine Base um eine Mutation einzuführen.',
    effect_revert: 'Rückgängig',
    effect_revert_body: 'Du hast diese Position wieder auf das Original gesetzt. Dieses Codon ist jetzt identisch zum Wildtyp: <strong>{codon}</strong> ({aaName}).',
    effect_silent: 'Silent (synonyme Mutation)',
    effect_silent_body: 'Das Codon <strong>{orig}</strong> wurde zu <strong>{mut}</strong>. Beide codieren <strong>{aaName} ({aa})</strong>. Die Aminosäure ändert sich nicht — der genetische Code ist redundant (Wobble-Position).',
    effect_nonsense: 'Nonsense (vorzeitiges Stop)',
    effect_nonsense_body: 'Das Codon <strong>{orig}</strong> ({aaName}) wurde zu <strong>{mut}</strong> — ein <strong>Stop-Codon</strong>! Die Translation bricht hier ab, das Protein ist verkürzt. Solche Mutationen führen oft zu komplettem Funktionsverlust und können Nonsense-Mediated-Decay (NMD) auslösen.',
    effect_stoploss: 'Stop-Loss',
    effect_stoploss_body: 'Du hast das Stop-Codon <strong>{orig}</strong> zerstört! Statt zu stoppen, wird jetzt <strong>{aaName} ({aa})</strong> eingebaut — die Translation läuft über die normale Grenze hinaus, bis das Ribosom zufällig auf ein anderes Stop-Codon trifft.',
    effect_missense: 'Missense',
    effect_missense_body: 'Das Codon <strong>{orig}</strong> wurde zu <strong>{mut}</strong>. Statt <strong>{fromName} ({from})</strong> wird nun <strong>{toName} ({to})</strong> eingebaut. Ob das pathogen ist, hängt davon ab, wie ähnlich die Aminosäuren sind (Ladung, Größe, Hydrophobizität) und wo sie im Protein liegen (Funktionsdomäne? Aktives Zentrum?).',
    effect_meta_codon: 'Codon:',
    effect_meta_cds: 'CDS-Position:',
    effect_meta_total: 'Gesamt:',
    effect_meta_total_subs: '{n} Substitutionen',

    effect_fs_body: 'Du hast den <strong>Leserahmen verschoben</strong>! Ab der Mutation wird die gesamte folgende Sequenz falsch abgelesen. Nach <strong>{n}</strong> falschen Aminosäuren entsteht ein vorzeitiges Stop-Codon. Das Protein ist von <strong>{orig}</strong> auf <strong>{mut}</strong> Aminosäuren verkürzt.',
    effect_fs_label: 'Frameshift',
    effect_del_body: 'Du hast <strong>{n} Basen</strong> gelöscht — das sind {codons} Codon(s). Der Leserahmen bleibt erhalten (in-frame), aber das Protein hat <strong>{codons} Aminosäure(n) weniger</strong>. Ob das pathogen ist, hängt davon ab, ob die fehlende Aminosäure strukturell wichtig ist (klassisches Beispiel: CFTR p.Phe508del).',
    effect_ins_body: 'Du hast <strong>{n} Basen</strong> eingefügt — das sind {codons} Codon(s). Der Leserahmen bleibt erhalten (in-frame), das Protein hat <strong>{codons} Aminosäure(n) mehr</strong>. Solche Insertionen können die Proteinstruktur stören (Beispiel: Polyalanin-Expansionen in HOX-Genen).',
    effect_meta_orig_len: 'Original-Länge:',
    effect_meta_mut_len: 'Mutiertes Protein:',
    effect_meta_net: 'Netto:',
    aa_unit: 'AS',

    // Explore mode
    loading_variants: 'Lade Varianten…',
    fetching_clinvar: 'Hole ClinVar-Daten vom VUS Tracker…',
    n_variants_fmt: '{n} Varianten',
    gene_index_unavailable: 'Gen-Index nicht verfügbar',
    no_matches: 'Keine Treffer',
    load_error_fmt: 'Fehler beim Laden: {msg}',
    variants_filter_placeholder: 'Filter (c./p./Klassifikation)…',
    filter_all_classes: 'Alle Klassen',
    cls_pathogenic: 'Pathogen',
    cls_likely_pathogenic: 'Wahrscheinlich pathogen',
    cls_uncertain: 'VUS',
    cls_likely_benign: 'Wahrscheinlich benign',
    cls_benign: 'Benign',
    no_matching_variants: 'Keine passenden Varianten',
    clinvar_section: 'ClinVar',
    explain_section: 'Erklärung',
    gnomad_section: 'gnomAD v4 — Allelfrequenzen',
    gnomad_loading: 'Lade gnomAD-Frequenzen…',
    gnomad_not_found: 'Variante zu selten oder nicht in gnomAD vorhanden.',
    gnomad_no_coords: 'Keine genomischen Koordinaten verfügbar',
    gnomad_error_fmt: 'Fehler: {msg}',
    global_fmt: 'Global: <strong>{af}</strong> ({ac}/{an} Allele)',

    type_nonsense: 'Nonsense',
    type_missense: 'Missense',
    type_silent: 'Silent',
    type_frameshift_del: 'Frameshift (Deletion)',
    type_inframe_del: 'In-frame Deletion',
    type_frameshift_ins: 'Frameshift (Insertion)',
    type_inframe_ins: 'In-frame Insertion',
    type_splice: 'Splice-Site (kanonisch)',
    type_unknown: 'Unbekannt',

    expl_nonsense_basic: 'Eine einzelne Base ändert sich und erzeugt ein vorzeitiges Stop-Codon. Die Translation bricht ab → das Protein ist verkürzt und meist funktionslos.',
    expl_nonsense_clin: 'Nonsense-Mutationen führen zu Loss-of-Function. Wenn die Mutation NMD auslöst, wird die mRNA abgebaut → Haploinsuffizienz. Wenn nicht, wird ein trunkiertes Protein produziert (manchmal dominant-negativ).',
    expl_nonsense_exp: 'NMD-Vorhersage essentiell: PTC mehr als 50 nt upstream der letzten Exon-Exon-Junction → NMD wahrscheinlich. Letztes Exon oder Single-Exon-Gen → NMD-Escape, trunkiertes Protein wird produziert.',
    expl_missense_basic: 'Eine einzelne Base ändert sich, dadurch wird eine andere Aminosäure eingebaut. Das Protein hat die gleiche Länge, aber an einer Stelle eine andere Aminosäure.',
    expl_missense_clin: 'Ob eine Missense-Mutation pathogen ist, hängt davon ab: Wo im Protein? In einer Funktionsdomäne? Ähnlichkeit der Aminosäuren (Ladung, Größe, Hydrophobizität)? Konservierung? Computational Predictions (CADD, REVEL, AlphaMissense) helfen bei der Einschätzung.',
    expl_missense_exp: 'ACMG-Kriterien für Missense: PM1 (Mutational Hotspot), PM5 (gleiche Position bekannt pathogen), PP3 (computational evidence), BP4 (computational benign). Funktionsstudien (PS3) sind der Goldstandard, aber selten verfügbar.',
    expl_silent_basic: 'Die DNA-Base ändert sich, aber wegen der Redundanz des genetischen Codes (Wobble-Position) bleibt die Aminosäure gleich. Klinisch meist irrelevant.',
    expl_silent_clin: 'Vorsicht: Manche scheinbar stillen Mutationen verändern Splice-Enhancer/Silencer-Motive und können Exon-Skipping auslösen. SpliceAI-Vorhersage empfohlen.',
    expl_silent_exp: 'Codon Usage Bias kann theoretisch die Translationsgeschwindigkeit beeinflussen → veränderte Protein-Faltung. In der Praxis fast nie klinisch relevant. ACMG: BP7 (synonyme Variante mit niedrigem Splice-Impact).',
    expl_fsdel_basic: 'Eine oder mehrere Basen werden gelöscht, und die Anzahl ist nicht durch 3 teilbar → der Leserahmen verschiebt sich. Ab der Mutation wird alles falsch abgelesen, bis ein neues Stop-Codon kommt.',
    expl_fsdel_clin: 'Frameshift-Mutationen sind fast immer pathogen (Loss-of-Function). NMD wird häufig ausgelöst → Haploinsuffizienz. Bei Genen, in denen Haploinsuffizienz nicht zu Krankheit führt, können sie aber tolerabel sein.',
    expl_fsdel_exp: 'PVS1 (Very Strong Pathogenic) gilt für Null-Varianten in Genen, in denen LoF der bekannte Pathomechanismus ist. PVS1 muss auf Strong/Moderate herabgestuft werden, wenn: PTC im letzten Exon (kein NMD), NMD-Escape, alternative Spleißvarianten den Bereich umgehen.',
    expl_ifdel_basic: 'Eine oder mehrere Basen werden gelöscht, aber die Anzahl ist durch 3 teilbar → der Leserahmen bleibt erhalten. Das Protein ist um eine oder mehrere Aminosäuren verkürzt, behält aber seine Grundstruktur.',
    expl_ifdel_clin: 'In-frame Deletionen können pathogen (z. B. CFTR p.Phe508del) oder benign sein, abhängig davon, ob die fehlende Region funktionell wichtig ist. Pathomechanismus oft Protein-Misfolding statt kompletter LoF.',
    expl_ifdel_exp: 'PM4 (Protein-Länge verändert in non-repeat Region) bei in-frame Indels in funktionellen Domänen. Funktionelle Studien besonders wichtig, da die Pathogenität nicht aus der Sequenz allein vorhersagbar ist.',
    expl_fsins_basic: 'Basen werden eingefügt, und die Anzahl ist nicht durch 3 teilbar → Frameshift. Der Leserahmen verschiebt sich, downstream alles falsch.',
    expl_fsins_clin: 'Wie bei Deletions-Frameshifts: meist Loss-of-Function durch NMD oder Protein-Trunkierung.',
    expl_fsins_exp: 'Duplikationen sind häufig durch Slippage in repetitiven Regionen. ACMG-Bewertung wie bei anderen Frameshifts (PVS1).',
    expl_ifins_basic: 'Basen werden eingefügt, Anzahl durch 3 teilbar → in-frame. Das Protein wird um eine oder mehrere Aminosäuren länger.',
    expl_ifins_clin: 'In-frame Insertionen in funktionellen Domänen können die Proteinstruktur stören. Beispiel: Polyalanin-Expansionen in Transkriptionsfaktoren (HOX-Gene).',
    expl_ifins_exp: 'PM4 anwendbar. Bei Duplikationen ganzer Exons: Prüfen, ob der Reading Frame erhalten bleibt.',
    expl_splice_basic: 'Die Mutation liegt direkt an der Splice-Site (GT-Donor oder AG-Akzeptor). Diese Stellen sind essentiell für korrektes Spleißen — eine Mutation hier zerstört das Splicen fast immer.',
    expl_splice_clin: 'Folgen: Exon-Skipping, kryptischer Splice-Site oder Intron-Retention. Wenn das Skipping einen Frameshift erzeugt → wahrscheinlich NMD. Wenn in-frame → verkürztes Protein.',
    expl_splice_exp: 'PVS1_Strong für kanonische Splice-Sites (±1, ±2). Die genaue Konsequenz auf RNA-Ebene hängt vom Kontext ab — RNA-Analyse aus Patientenblut ist der Goldstandard.',

    quiz_correct_prefix: '<strong>Richtig!</strong> ',
    quiz_wrong_prefix: '<strong>Leider falsch.</strong> ',
    quiz_fb_excellent: 'Exzellent! Du beherrschst die Mutations-Interpretation auf hohem Niveau.',
    quiz_fb_good: 'Gut gemacht! Solides Verständnis. Schau dir die falschen Antworten an, um deine Wissenslücken zu schließen.',
    quiz_fb_ok: 'Ordentlich, aber noch Luft nach oben. Probier den Lernen-Modus, um die Konzepte interaktiv zu vertiefen.',
    quiz_fb_poor: 'Lass dich nicht entmutigen! Mutations-Interpretation ist komplex. Schau dir den Lernen-Modus an und versuche es dann nochmal.',
    quiz_acmg_q: 'Wie würdest du diese Variante nach ACMG klassifizieren?',
    quiz_acmg_opt0: 'Pathogen / Wahrscheinlich pathogen',
    quiz_acmg_opt1: 'VUS',
    quiz_acmg_opt2: 'Benign / Wahrscheinlich benign',
  },
  en: {
    mut_header: 'Mutations Lab',
    mut_subtitle: 'Point mutations · frameshifts · protein effects',
    mode_learn: 'Learn',
    mode_explore: 'Explore',
    mode_quiz: 'Quiz',
    depth_title: 'Depth — Basic, Clinical, Expert',
    depth_basic: 'Basic',
    depth_clinical: 'Clinical',
    depth_expert: 'Expert',
    depth_basic_label: 'Basic', depth_clinical_label: 'Clinical', depth_expert_label: 'Expert',

    step1_label: 'Translate',
    step2_label: 'Mutate',
    step3_label: 'Indels',
    step4_label: 'Real cases',
    step1_intro: 'Every amino acid in a protein is encoded by a <strong>codon</strong> of 3 DNA bases. Click a <strong>codon in the sequence</strong> — or use the button below — to follow translation step by step.',
    step2_intro: 'Now change individual bases. Click any <strong>base</strong> in the sequence and pick an alternative. Every change is commented instantly — try different positions and see what happens (Silent? Missense? Stop codon?).',
    step3_intro: 'What happens when bases are <strong>inserted or deleted</strong>? Compare a 3-base deletion (in-frame) with a 1-base deletion (frameshift) — the difference is decisive.',
    step4_intro: 'You\'ve got the basics. Here are real mutations doing exactly what you just tried — each with clinical context and adjustable depth (Basic / Clinical / Expert).',

    next_codon: 'Next codon →',
    translate_all: 'Translate all',
    reset: 'Reset',
    to_mutations: 'To mutations →',
    to_indels: 'To indels →',
    to_real_cases: 'Real cases →',
    explore_real_data: 'Explore real data →',
    back: '← Back',
    all_modules: '← All modules',
    powered_by: 'powered by <a href="https://github.com/schlein-lab/nano-zyrkel-helix" target="_blank">nano-zyrkel</a>',
    original: 'Original',
    mutated: 'Mutated',

    indel_del1: 'Delete 1 base',
    indel_del3: 'Delete 3 bases',
    indel_ins1: 'Insert 1 base',
    indel_ins3: 'Insert 3 bases',

    gene_search_placeholder: 'Search gene (e.g. CFTR, BRCA1, TP53)…',
    quick_select: 'Quick select:',
    explore_empty_title: 'Pick a gene to explore real variants',
    explore_empty_sub: 'Live data from ClinVar (via VUS Tracker), gnomAD and UniProt',

    quiz_intro_title: 'Test your understanding',
    quiz_intro_sub: 'Three difficulty levels with real cases from clinical practice.',
    quiz_lvl1_title: 'Fundamentals',
    quiz_lvl1_desc: 'Recognize mutation types, understand codon changes',
    quiz_lvl2_title: 'Clinical cases',
    quiz_lvl2_desc: 'Read HGVS, pathomechanisms, NMD, splice mutations',
    quiz_lvl3_title: 'Interpretation',
    quiz_lvl3_desc: 'ACMG classification, genotype-phenotype, clinical decisions',
    quiz_next: 'Next question →',
    quiz_quit: 'End quiz',
    quiz_finished: 'Quiz finished!',
    quiz_restart: 'New quiz',
    quiz_progress_fmt: 'Question {n} of {total}',
    quiz_score_fmt: 'Score: {n}',

    explain_start: 'Click the green start codon (or "Next codon") to begin translation. The start codon <strong>ATG</strong> marks the beginning of every protein and encodes methionine.',
    explain_step_fmt: 'Codon {n}: <strong>{codon}</strong> → <strong>{aa}</strong> ({aaName}).{extra}',
    explain_first_extra: ' Methionine is the first amino acid of every protein — in many proteins it is cleaved off again after translation.',
    explain_complete: 'Translation complete! From 30 DNA bases you built a 9-amino-acid protein. The <strong>stop codon</strong> (TAA) is not translated into an amino acid — it tells the ribosome: "Stop, done here."',

    effect_no_mutation_badge: 'No mutation',
    effect_no_mutation: 'The sequence matches the original. Click a base to introduce a mutation.',
    effect_revert: 'Reverted',
    effect_revert_body: 'You\'ve reset this position back to the original. This codon is now identical to the wildtype: <strong>{codon}</strong> ({aaName}).',
    effect_silent: 'Silent (synonymous mutation)',
    effect_silent_body: 'The codon <strong>{orig}</strong> changed to <strong>{mut}</strong>. Both encode <strong>{aaName} ({aa})</strong>. The amino acid doesn\'t change — the genetic code is redundant (wobble position).',
    effect_nonsense: 'Nonsense (premature stop)',
    effect_nonsense_body: 'The codon <strong>{orig}</strong> ({aaName}) changed to <strong>{mut}</strong> — a <strong>stop codon</strong>! Translation halts here, the protein is truncated. These mutations often cause complete loss of function and can trigger nonsense-mediated decay (NMD).',
    effect_stoploss: 'Stop-loss',
    effect_stoploss_body: 'You destroyed the stop codon <strong>{orig}</strong>! Instead of stopping, <strong>{aaName} ({aa})</strong> is now incorporated — translation runs past the normal end until the ribosome randomly hits another stop codon.',
    effect_missense: 'Missense',
    effect_missense_body: 'The codon <strong>{orig}</strong> changed to <strong>{mut}</strong>. Instead of <strong>{fromName} ({from})</strong>, now <strong>{toName} ({to})</strong> is incorporated. Whether this is pathogenic depends on how similar the amino acids are (charge, size, hydrophobicity) and where they sit in the protein (functional domain? active site?).',
    effect_meta_codon: 'Codon:',
    effect_meta_cds: 'CDS position:',
    effect_meta_total: 'Total:',
    effect_meta_total_subs: '{n} substitutions',

    effect_fs_body: 'You\'ve <strong>shifted the reading frame</strong>! From the mutation onwards the entire downstream sequence is read incorrectly. After <strong>{n}</strong> wrong amino acids a premature stop codon appears. The protein is shortened from <strong>{orig}</strong> to <strong>{mut}</strong> amino acids.',
    effect_fs_label: 'Frameshift',
    effect_del_body: 'You deleted <strong>{n} bases</strong> — that\'s {codons} codon(s). The reading frame is preserved (in-frame), but the protein has <strong>{codons} fewer amino acid(s)</strong>. Whether this is pathogenic depends on whether the missing amino acid is structurally important (classic example: CFTR p.Phe508del).',
    effect_ins_body: 'You inserted <strong>{n} bases</strong> — that\'s {codons} codon(s). The reading frame is preserved (in-frame), the protein has <strong>{codons} extra amino acid(s)</strong>. Such insertions can disrupt protein structure (example: polyalanine expansions in HOX genes).',
    effect_meta_orig_len: 'Original length:',
    effect_meta_mut_len: 'Mutated protein:',
    effect_meta_net: 'Net:',
    aa_unit: 'AA',

    loading_variants: 'Loading variants…',
    fetching_clinvar: 'Fetching ClinVar data from VUS Tracker…',
    n_variants_fmt: '{n} variants',
    gene_index_unavailable: 'Gene index unavailable',
    no_matches: 'No matches',
    load_error_fmt: 'Loading error: {msg}',
    variants_filter_placeholder: 'Filter (c./p./classification)…',
    filter_all_classes: 'All classes',
    cls_pathogenic: 'Pathogenic',
    cls_likely_pathogenic: 'Likely pathogenic',
    cls_uncertain: 'VUS',
    cls_likely_benign: 'Likely benign',
    cls_benign: 'Benign',
    no_matching_variants: 'No matching variants',
    clinvar_section: 'ClinVar',
    explain_section: 'Explanation',
    gnomad_section: 'gnomAD v4 — Allele frequencies',
    gnomad_loading: 'Loading gnomAD frequencies…',
    gnomad_not_found: 'Variant too rare or not in gnomAD.',
    gnomad_no_coords: 'No genomic coordinates available',
    gnomad_error_fmt: 'Error: {msg}',
    global_fmt: 'Global: <strong>{af}</strong> ({ac}/{an} alleles)',

    type_nonsense: 'Nonsense',
    type_missense: 'Missense',
    type_silent: 'Silent',
    type_frameshift_del: 'Frameshift (deletion)',
    type_inframe_del: 'In-frame deletion',
    type_frameshift_ins: 'Frameshift (insertion)',
    type_inframe_ins: 'In-frame insertion',
    type_splice: 'Splice site (canonical)',
    type_unknown: 'Unknown',

    expl_nonsense_basic: 'A single base changes and creates a premature stop codon. Translation halts → the protein is truncated and usually nonfunctional.',
    expl_nonsense_clin: 'Nonsense mutations cause loss of function. If the mutation triggers NMD, the mRNA is degraded → haploinsufficiency. Otherwise a truncated protein is produced (sometimes dominant-negative).',
    expl_nonsense_exp: 'NMD prediction is essential: PTC more than 50 nt upstream of the last exon-exon junction → NMD likely. Last exon or single-exon gene → NMD escape, truncated protein is produced.',
    expl_missense_basic: 'A single base changes, causing a different amino acid to be incorporated. The protein has the same length but a different amino acid at one position.',
    expl_missense_clin: 'Whether a missense mutation is pathogenic depends on: Where in the protein? In a functional domain? How similar are the amino acids (charge, size, hydrophobicity)? Conservation? Computational predictions (CADD, REVEL, AlphaMissense) help with assessment.',
    expl_missense_exp: 'ACMG criteria for missense: PM1 (mutational hotspot), PM5 (same position known pathogenic), PP3 (computational evidence), BP4 (computational benign). Functional studies (PS3) are the gold standard but rarely available.',
    expl_silent_basic: 'The DNA base changes, but due to the redundancy of the genetic code (wobble position) the amino acid stays the same. Clinically usually irrelevant.',
    expl_silent_clin: 'Caution: some seemingly silent mutations alter splice enhancer/silencer motifs and can trigger exon skipping. SpliceAI prediction recommended.',
    expl_silent_exp: 'Codon usage bias can theoretically affect translation speed → altered protein folding. In practice almost never clinically relevant. ACMG: BP7 (synonymous variant with low splice impact).',
    expl_fsdel_basic: 'One or more bases are deleted, and the number is not divisible by 3 → the reading frame shifts. From the mutation onwards everything is read incorrectly, until a new stop codon appears.',
    expl_fsdel_clin: 'Frameshift mutations are almost always pathogenic (loss of function). NMD is often triggered → haploinsufficiency. In genes where haploinsufficiency does not cause disease they may be tolerable.',
    expl_fsdel_exp: 'PVS1 (very strong pathogenic) applies to null variants in genes where LoF is the known pathomechanism. PVS1 must be downgraded to strong/moderate when: PTC in the last exon (no NMD), NMD escape, alternative splice variants bypass the region.',
    expl_ifdel_basic: 'One or more bases are deleted, but the number is divisible by 3 → the reading frame is preserved. The protein is shortened by one or more amino acids but retains its basic structure.',
    expl_ifdel_clin: 'In-frame deletions can be pathogenic (e.g. CFTR p.Phe508del) or benign, depending on whether the missing region is functionally important. Pathomechanism is often protein misfolding rather than complete LoF.',
    expl_ifdel_exp: 'PM4 (protein length changed in non-repeat region) applies to in-frame indels in functional domains. Functional studies are especially important because pathogenicity cannot be predicted from sequence alone.',
    expl_fsins_basic: 'Bases are inserted, and the number is not divisible by 3 → frameshift. The reading frame shifts, everything downstream is wrong.',
    expl_fsins_clin: 'Like deletion frameshifts: usually loss of function through NMD or protein truncation.',
    expl_fsins_exp: 'Duplications are often caused by slippage in repetitive regions. ACMG assessment as for other frameshifts (PVS1).',
    expl_ifins_basic: 'Bases are inserted, number divisible by 3 → in-frame. The protein becomes longer by one or more amino acids.',
    expl_ifins_clin: 'In-frame insertions in functional domains can disrupt protein structure. Example: polyalanine expansions in transcription factors (HOX genes).',
    expl_ifins_exp: 'PM4 applicable. For duplications of entire exons: check whether the reading frame is preserved.',
    expl_splice_basic: 'The mutation sits directly at the splice site (GT donor or AG acceptor). These positions are essential for correct splicing — a mutation here almost always destroys splicing.',
    expl_splice_clin: 'Consequences: exon skipping, cryptic splice site, or intron retention. If skipping causes a frameshift → NMD likely. If in-frame → truncated protein.',
    expl_splice_exp: 'PVS1_Strong for canonical splice sites (±1, ±2). The exact consequence at the RNA level depends on context — RNA analysis from patient blood is the gold standard.',

    quiz_correct_prefix: '<strong>Correct!</strong> ',
    quiz_wrong_prefix: '<strong>Sorry, that\'s wrong.</strong> ',
    quiz_fb_excellent: 'Excellent! You handle mutation interpretation at a high level.',
    quiz_fb_good: 'Well done! Solid understanding. Review the wrong answers to close your knowledge gaps.',
    quiz_fb_ok: 'Decent, but room to grow. Try the Learn mode to deepen the concepts interactively.',
    quiz_fb_poor: 'Don\'t be discouraged! Mutation interpretation is complex. Try the Learn mode and come back for another round.',
    quiz_acmg_q: 'How would you classify this variant according to ACMG?',
    quiz_acmg_opt0: 'Pathogenic / Likely pathogenic',
    quiz_acmg_opt1: 'VUS',
    quiz_acmg_opt2: 'Benign / Likely benign',
  },
};

const AA_FULL_NAME_DE = {
  A: 'Alanin', R: 'Arginin', N: 'Asparagin', D: 'Asparaginsäure',
  C: 'Cystein', E: 'Glutaminsäure', Q: 'Glutamin', G: 'Glycin',
  H: 'Histidin', I: 'Isoleucin', L: 'Leucin', K: 'Lysin',
  M: 'Methionin', F: 'Phenylalanin', P: 'Prolin', S: 'Serin',
  T: 'Threonin', W: 'Tryptophan', Y: 'Tyrosin', V: 'Valin', '*': 'Stop',
};
const AA_FULL_NAME_EN = {
  A: 'Alanine', R: 'Arginine', N: 'Asparagine', D: 'Aspartate',
  C: 'Cysteine', E: 'Glutamate', Q: 'Glutamine', G: 'Glycine',
  H: 'Histidine', I: 'Isoleucine', L: 'Leucine', K: 'Lysine',
  M: 'Methionine', F: 'Phenylalanine', P: 'Proline', S: 'Serine',
  T: 'Threonine', W: 'Tryptophan', Y: 'Tyrosine', V: 'Valine', '*': 'Stop',
};

// Register with the shared i18n helper and provide a local t()
if (window.helixI18n) window.helixI18n.registerI18n(I18N_DICT);
function t(key) { return window.helixI18n ? window.helixI18n.t(key) : I18N_DICT.de[key] || key; }
function getLang() { return window.helixI18n ? window.helixI18n.getLang() : 'de'; }
function aaName(aa) { return (getLang() === 'en' ? AA_FULL_NAME_EN : AA_FULL_NAME_DE)[aa] || aa; }
function fmt(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ''));
}

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

  // Initial i18n pass + listen for language changes
  applyStaticI18n();
  window.addEventListener('helix:lang-changed', () => {
    applyStaticI18n();
    // Re-render dynamic content
    renderLearnStep1();
    renderLearnStep2();
    renderLearnStep3();
    if (state.learnStep === 4) renderLearnCases();
    if (state.currentGene) renderGenePage(state.currentGene);
    if (currentVariantDetail) refreshVariantDetail();
  });

  // Initial renders
  renderLearnStep1();
  renderLearnStep2();
  renderLearnStep3();
}

function applyStaticI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
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
    aaEl.title = aaName(aa);
    proteinViewer.appendChild(aaEl);
  }

  // Explanation text
  if (state.translateProgress === 0) {
    explain.innerHTML = t('explain_start');
    explain.classList.remove('empty');
  } else if (state.translateProgress < codons.length) {
    const lastCodon = codons[state.translateProgress - 1];
    const aa = CODON_TABLE[lastCodon];
    const extra = state.translateProgress === 1 ? t('explain_first_extra') : '';
    explain.innerHTML = fmt(t('explain_step_fmt'), { n: state.translateProgress, codon: lastCodon, aa, aaName: aaName(aa), extra });
  } else {
    explain.innerHTML = t('explain_complete');
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
    card.innerHTML = `<span class="effect-badge silent">${t('effect_no_mutation_badge')}</span><span class="effect-explain">${t('effect_no_mutation')}</span>`;
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
    let title = '';
    let body = '';

    if (origCodon === mutCodon) {
      badge = 'silent';
      title = t('effect_revert');
      body = fmt(t('effect_revert_body'), { codon: origCodon, aaName: aaName(origAA) });
    } else if (origAA === mutAA) {
      badge = 'silent';
      title = t('effect_silent');
      body = fmt(t('effect_silent_body'), { orig: origCodon, mut: mutCodon, aa: origAA, aaName: aaName(origAA) });
    } else if (mutAA === '*') {
      badge = 'nonsense';
      title = t('effect_nonsense');
      body = fmt(t('effect_nonsense_body'), { orig: origCodon, mut: mutCodon, aaName: aaName(origAA) });
    } else if (origAA === '*') {
      badge = 'in-frame';
      title = t('effect_stoploss');
      body = fmt(t('effect_stoploss_body'), { orig: origCodon, aa: mutAA, aaName: aaName(mutAA) });
    } else {
      badge = 'missense';
      title = t('effect_missense');
      body = fmt(t('effect_missense_body'), {
        orig: origCodon, mut: mutCodon,
        from: origAA, to: mutAA,
        fromName: aaName(origAA), toName: aaName(mutAA),
      });
    }

    html = `<span class="effect-badge ${badge}">${title}</span><span class="effect-explain">${body}</span>`;
    html += `<div class="effect-meta">
      <span>${t('effect_meta_codon')} <strong>${Math.floor(targetPos/3)+1}</strong></span>
      <span>${t('effect_meta_cds')} <strong>c.${targetPos+1}</strong></span>
      ${totalSubs > 1 ? `<span>${t('effect_meta_total')} <strong>${fmt(t('effect_meta_total_subs'), { n: totalSubs })}</strong></span>` : ''}
    </div>`;
  } else {
    // Indel — use WASM if possible
    const indelInfo = computeIndelInfo(originalCds, mutatedCds);
    let badge = indelInfo.is_frameshift ? 'frameshift' : 'in-frame';
    let title = indelInfo.is_frameshift ? t('effect_fs_label') : (lenDiff < 0 ? t('type_inframe_del') : t('type_inframe_ins'));
    let body;

    if (indelInfo.is_frameshift) {
      const wrongAA = indelInfo.mutated_protein_len - (indelInfo.first_changed_aa_pos || 0);
      body = fmt(t('effect_fs_body'), {
        n: wrongAA,
        orig: indelInfo.original_protein_len,
        mut: indelInfo.mutated_protein_len,
      });
    } else if (lenDiff < 0) {
      body = fmt(t('effect_del_body'), { n: -lenDiff, codons: -lenDiff / 3 });
    } else {
      body = fmt(t('effect_ins_body'), { n: lenDiff, codons: lenDiff / 3 });
    }

    html = `<span class="effect-badge ${badge}">${title}</span><span class="effect-explain">${body}</span>`;
    html += `<div class="effect-meta">
      <span>${t('effect_meta_orig_len')} <strong>${indelInfo.original_protein_len} ${t('aa_unit')}</strong></span>
      <span>${t('effect_meta_mut_len')} <strong>${indelInfo.mutated_protein_len} ${t('aa_unit')}</strong></span>
      <span>${t('effect_meta_net')} <strong>${indelInfo.net_change > 0 ? '+' : ''}${indelInfo.net_change} bp</strong></span>
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
  const teaching = (c.teaching && c.teaching[state.depth]) || (c.teaching && c.teaching.basis) || '';
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
      ac.innerHTML = `<div class="ac-item"><span class="gene" style="color:var(--text-dim)">${t('gene_index_unavailable')}</span></div>`;
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
    ac.innerHTML = `<div class="ac-item"><span class="gene" style="color:var(--text-dim)">${t('no_matches')}</span></div>`;
  } else {
    ac.innerHTML = matches.map(([g, info]) =>
      `<div class="ac-item" data-gene="${g}"><span class="gene">${g}</span><span class="count">${fmt(t('n_variants_fmt'), { n: info.total || 0 })}</span></div>`
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
      <span class="gh-count">${t('loading_variants')}</span>
    </div>
    <div class="vdp-loading">${t('fetching_clinvar')}</div>
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
    content.innerHTML = `<div class="vdp-error">${fmt(t('load_error_fmt'), { msg: e.message })}</div>`;
  }
}

function renderGenePage(gene) {
  const content = document.getElementById('explore-content');
  content.innerHTML = `
    <div class="gene-header">
      <span class="gh-name">${gene}</span>
      <span class="gh-count">${fmt(t('n_variants_fmt'), { n: state.currentVariants.length })}</span>
    </div>
    <div class="variants-filter">
      <input type="text" id="variant-filter" placeholder="${t('variants_filter_placeholder')}">
      <select id="class-filter">
        <option value="">${t('filter_all_classes')}</option>
        <option value="pathogenic">${t('cls_pathogenic')}</option>
        <option value="likely_pathogenic">${t('cls_likely_pathogenic')}</option>
        <option value="uncertain_significance">${t('cls_uncertain')}</option>
        <option value="likely_benign">${t('cls_likely_benign')}</option>
        <option value="benign">${t('cls_benign')}</option>
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
    list.innerHTML = `<div class="vdp-loading">${t('no_matching_variants')}</div>`;
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
        <div class="vdp-section-title">${t('clinvar_section')}</div>
        <div class="vdp-section-body">
          <strong>${(v.classification || '').replace(/_/g, ' ')}</strong>${v.condition ? ' &mdash; ' + v.condition : ''}
        </div>
      </div>
      <div class="vdp-section" id="vdp-explain"></div>
      <div class="vdp-section" id="vdp-gnomad"><div class="vdp-loading">${t('gnomad_loading')}</div></div>
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
      <div class="vdp-section-body" style="color:var(--text-dim)">${t('gnomad_no_coords')}</div>
    `;
  }
}

function refreshVariantDetail() {
  if (currentVariantDetail) renderVariantExplanation(currentVariantDetail);
}

function renderVariantExplanation(v) {
  const el = document.getElementById('vdp-explain');
  if (!el) return;

  // Classify by HGVS pattern → pick a (typeKey, explKeyBase) pair
  const hgvs = v.hgvs.toLowerCase();
  let typeKey = 'type_unknown';
  let base = null;

  if (hgvs.match(/[acgt]>[acgt]/)) {
    if (hgvs.includes('p.') && hgvs.match(/p\.[a-z]+\d+\*/)) {
      typeKey = 'type_nonsense'; base = 'expl_nonsense';
    } else if (hgvs.match(/p\..*=$/) || hgvs.match(/p\.\([^)]*\)/)) {
      typeKey = 'type_silent'; base = 'expl_silent';
    } else if (hgvs.includes('p.')) {
      typeKey = 'type_missense'; base = 'expl_missense';
    }
  } else if (hgvs.includes('del')) {
    if (hgvs.includes('fs') || hgvs.includes('frameshift')) {
      typeKey = 'type_frameshift_del'; base = 'expl_fsdel';
    } else {
      typeKey = 'type_inframe_del'; base = 'expl_ifdel';
    }
  } else if (hgvs.includes('ins') || hgvs.includes('dup')) {
    if (hgvs.includes('fs')) {
      typeKey = 'type_frameshift_ins'; base = 'expl_fsins';
    } else {
      typeKey = 'type_inframe_ins'; base = 'expl_ifins';
    }
  } else if (hgvs.includes('+1') || hgvs.includes('-1') || hgvs.includes('+2') || hgvs.includes('-2')) {
    typeKey = 'type_splice'; base = 'expl_splice';
  }

  const depthSuffix = state.depth === 'basis' ? '_basic' : state.depth === 'klinisch' ? '_clin' : '_exp';
  const body = base ? t(base + depthSuffix) : '';
  const depthLabel = t('depth_' + (state.depth === 'basis' ? 'basic' : state.depth === 'klinisch' ? 'clinical' : 'expert') + '_label');

  el.innerHTML = `
    <div class="vdp-section-title">${t('explain_section')} · ${depthLabel}</div>
    <div class="vdp-section-body">
      <strong>${t(typeKey)}</strong><br>
      ${body}
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
      el.innerHTML = `<div class="vdp-section-title">${t('gnomad_section')}</div><div class="vdp-section-body" style="color:var(--text-dim)">${t('gnomad_not_found')}</div>`;
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

    const afStr = af < 0.0001 ? af.toExponential(2) : (af * 100).toFixed(4) + '%';
    el.innerHTML = `
      <div class="vdp-section-title">${t('gnomad_section')}</div>
      <div class="vdp-section-body" style="margin-bottom:0.4rem;">
        ${fmt(t('global_fmt'), { af: afStr, ac: totalAc, an: totalAn })}
      </div>
      <div class="vdp-freq-grid">${popHtml}</div>
    `;
  } catch (e) {
    el.innerHTML = `<div class="vdp-section-title">gnomAD</div><div class="vdp-error">${fmt(t('gnomad_error_fmt'), { msg: e.message })}</div>`;
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
        q: t('quiz_acmg_q'),
        options: [t('quiz_acmg_opt0'), t('quiz_acmg_opt1'), t('quiz_acmg_opt2')],
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

  document.getElementById('quiz-progress-text').textContent = fmt(t('quiz_progress_fmt'), { n: state.quiz.currentIdx + 1, total: state.quiz.questions.length });
  document.getElementById('quiz-progress-fill').style.width = ((state.quiz.currentIdx) / state.quiz.questions.length * 100) + '%';
  document.getElementById('quiz-score-text').textContent = fmt(t('quiz_score_fmt'), { n: state.quiz.score });

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
  fb.innerHTML = (correct ? t('quiz_correct_prefix') : t('quiz_wrong_prefix')) + (q.explanation || '');
  fb.classList.add('show', correct ? 'correct' : 'wrong');

  document.getElementById('quiz-next-btn').style.display = '';
  document.getElementById('quiz-score-text').textContent = fmt(t('quiz_score_fmt'), { n: state.quiz.score });
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
  let feedbackKey;
  if (pct >= 90) feedbackKey = 'quiz_fb_excellent';
  else if (pct >= 70) feedbackKey = 'quiz_fb_good';
  else if (pct >= 50) feedbackKey = 'quiz_fb_ok';
  else feedbackKey = 'quiz_fb_poor';
  document.getElementById('quiz-final-feedback').textContent = t(feedbackKey);
}

function quitQuiz() {
  state.quiz = null;
  document.getElementById('quiz-game').style.display = 'none';
  document.getElementById('quiz-start').style.display = '';
}

// ── Go ───────────────────────────────────────────────────────────
init_app();
