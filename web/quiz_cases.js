// ═══════════════════════════════════════════════════════════════════
// Facharzt-Examens-Quiz: 50 Fälle × 5 Subfragen = 250 Fragen
// ═══════════════════════════════════════════════════════════════════
//
// Jeder Fall hat:
//   - iscn: ISCN-Notation (wird als SVG-Karyogramm gerendert wenn kein Bild)
//   - img: optionales echtes Foto (14 von 50 haben eines)
//   - vignette: klinische Vignette
//   - subquestions[5]: je { q, choices[4], answer, explain }
//     0 = Diagnose/Karyotyp
//     1 = Klinik
//     2 = Diagnostik
//     3 = Vererbung/Genetik
//     4 = Beratung
//
// Quelle Bilder: Wikimedia Commons (PD/CC-BY/CC-BY-SA), Lin et al. 2023 (CC BY 4.0)

const QUIZ_CASES = [

// ══════════════════════════════════════════════════════════════
// NUMERISCHE ABERRATIONEN — AUTOSOMEN (10 Fälle)
// ══════════════════════════════════════════════════════════════

{ id: 1, cat: 'num_auto', iscn: '47,XX,+21', img: 'img/quiz/case_01_trisomy21.png',
  vignette: 'Neugeborenes Mädchen mit muskulärer Hypotonie, einzelner Palmarfurche, nach oben geschrägten Lidspalten und Herzgeräusch. Echo zeigt AVSD.',
  sub: [
    { q: 'Welche Diagnose ist am wahrscheinlichsten?', choices: ['Trisomie 21 (Down-Syndrom)', 'Trisomie 18 (Edwards)', 'Turner-Syndrom', 'Noonan-Syndrom'], answer: 0, explain: 'AVSD + Hypotonie + einzelne Palmarfurche + faziale Dysmorphien = klassische Trisomie 21.' },
    { q: 'Welcher Herzfehler ist am charakteristischsten für Trisomie 21?', choices: ['AVSD (AV-Septumdefekt)', 'Aortenisthmusstenose', 'Truncus arteriosus', 'Pulmonalatresie'], answer: 0, explain: 'AVSD ist DER Herzfehler bei Down-Syndrom (~40% der Herzfehler). Cave: auch TOF und VSD häufig.' },
    { q: 'Welche Erstdiagnostik ist indiziert?', choices: ['Chromosomenanalyse (Karyotyp)', 'BRCA-Gentest', 'Array-CGH als Erstes', 'Exom-Sequenzierung'], answer: 0, explain: 'Standard: Karyotypisierung aus peripherem Blut. Damit unterscheidet man freie Trisomie (95%), Translokation (4%), Mosaik (1%).' },
    { q: 'Wie entsteht die häufigste Form der Trisomie 21?', choices: ['Meiotische Non-Disjunction', 'Mitotische Non-Disjunction', 'Robertsonsche Translokation', 'Uniparentale Disomie'], answer: 0, explain: '95% sind freie Trisomien durch meiotische Non-Disjunction. ~80% maternaler Herkunft (Meiose I). Risiko steigt mit mütterlichem Alter.' },
    { q: 'Wie beraten Sie die Eltern bezüglich des Wiederholungsrisikos?', choices: ['~1% bei freier Trisomie (altersabhängig)', '25% bei allen Formen', '50% immer', 'Kein Wiederholungsrisiko'], answer: 0, explain: 'Freie Trisomie: empirisch ~1% + altersabhängiges Basisrisiko. Bei Translokation: Eltern-Karyotyp entscheidend! rob(21;21) = 100%.' }
  ]},

{ id: 2, cat: 'num_auto', iscn: '47,XY,+18', img: 'img/quiz/case_02_trisomy18.jpg',
  vignette: 'Neugeborener Junge mit schwerer IUGR, überkreuzten Fingern (Überlappung Zeige-/Mittelfinger), Tintenlöscherfüßen, VSD.',
  sub: [
    { q: 'Diagnose?', choices: ['Trisomie 18 (Edwards)', 'Trisomie 13 (Patau)', 'Smith-Lemli-Opitz', 'Cornelia de Lange'], answer: 0, explain: 'Überkreuzte Finger + Tintenlöscherfüße + IUGR + Herzfehler = pathognomonisch für Edwards.' },
    { q: 'Wie ist die Prognose?', choices: ['>90% Mortalität im 1. Lebensjahr', '50% überleben bis zum Erwachsenenalter', 'Normale Lebenserwartung', '100% intrauteriner Tod'], answer: 0, explain: 'Median Überlebenszeit 5-15 Tage. ~10% überleben das erste Jahr, v.a. Mädchen. Einzelfälle bis ins Jugendalter.' },
    { q: 'Welche Pränataldiagnostik hätte dies erkennen können?', choices: ['Ersttrimester-Screening + ggf. Amniozentese', 'Nur Nabelschnurblut nach Geburt', 'Ausschließlich MRT', 'Keine Diagnostik möglich'], answer: 0, explain: 'NT-Messung + Biochemie im 1. Trimester → Risikoberechnung → ggf. Amniozentese/CVS für Karyotyp. Auch NIPT möglich.' },
    { q: 'Welches Chromosom ist betroffen?', choices: ['Chromosom 18', 'Chromosom 13', 'Chromosom 8', 'X-Chromosom'], answer: 0, explain: 'Trisomie 18 = drei Kopien von Chromosom 18. Denver-Gruppe E (16, 17, 18).' },
    { q: 'Wiederholungsrisiko?', choices: ['~1% (+ altersabhängig)', '25%', '50%', '100%'], answer: 0, explain: 'Wie bei Trisomie 21: sporadic non-disjunction → ~1% empirisches Wiederholungsrisiko + mütterliches Altersrisiko.' }
  ]},

{ id: 3, cat: 'num_auto', iscn: '47,XY,+13',
  vignette: 'Neugeborener mit Lippen-Kiefer-Gaumenspalte, Hexadaktylie, Holoprosenzephalie im MRT, Aplasia cutis am Schädel.',
  sub: [
    { q: 'Diagnose?', choices: ['Patau-Syndrom (Trisomie 13)', 'Edwards-Syndrom', 'CHARGE-Syndrom', 'Pallister-Hall'], answer: 0, explain: 'Holoprosenzephalie + LKG-Spalte + Hexadaktylie + Aplasia cutis = Triade für Patau.' },
    { q: 'Welcher Anteil ist durch Translokation bedingt?', choices: ['~20%', '95%', '1%', '50%'], answer: 0, explain: '~75-80% freie Trisomie, ~20% Robertsonsche Translokation (v.a. rob(13;14)), Rest Mosaik.' },
    { q: 'Welches ZNS-Fehlbildungsmuster ist typisch?', choices: ['Holoprosenzephalie', 'Lissenzephalie', 'Polymikrogyrie', 'Dandy-Walker-Malformation'], answer: 0, explain: 'Holoprosenzephalie (unvollständige Teilung des Vorderhirns) ist die Leitfehlbildung bei Trisomie 13.' },
    { q: 'Warum ist die Abklärung des Translokationstyps wichtig?', choices: ['Wiederholungsrisiko bei rob(13;14) deutlich erhöht', 'Therapie unterscheidet sich', 'Prognose ist besser bei Translokation', 'Kein Unterschied'], answer: 0, explain: 'Bei freier Trisomie: ~1%. Bei rob(13;14)-Träger-Elternteil: empirisch ~1% (Mutter) bzw. <1% (Vater). Bei rob(13;13): 100%!' },
    { q: 'Wie sollte die Beratung bei Pränataldiagnose Trisomie 13 aussehen?', choices: ['Non-direktiv, letale Prognose vermitteln, palliatives Konzept anbieten', 'Therapie empfehlen', 'Zwangsberatung zur Schwangerschaftsbeendigung', 'Keine Beratung nötig'], answer: 0, explain: '>80% sterben im 1. Lebensjahr. Non-direktive Beratung: Eltern entscheiden. Perinatal-palliatives Konzept anbieten.' }
  ]},

{ id: 4, cat: 'num_auto', iscn: '69,XXY', img: 'img/quiz/case_04_triploidy.jpg',
  vignette: 'Schwere IUGR, große Plazenta mit zystischen Veränderungen, Syndaktylie III/IV. Amniozentese-Befund.',
  sub: [
    { q: 'Karyotyp?', choices: ['Triploidie (69,XXY)', 'Trisomie 13', 'Trisomie 18', '45,X'], answer: 0, explain: '3n = 69 Chromosomen. Große Plazenta + Zystische Veränderungen = diandrische Triploidie (partielle Blasenmole).' },
    { q: 'Was ist der Unterschied zwischen diandrischer und digynischer Triploidie?', choices: ['Diandrisch: große Plazenta/Blasenmole; Digynisch: kleine Plazenta/schwere IUGR', 'Kein Unterschied', 'Diandrisch ist lebensfähig', 'Digynisch hat normalen Phänotyp'], answer: 0, explain: 'Diandrisch (2 väterliche Genome): partielle Mole, Plazenta übergroß. Digynisch (2 mütterliche): schwere IUGR, kleine Plazenta.' },
    { q: 'Welches Gestationsrisiko besteht nach diandrischer Triploidie?', choices: ['Gestations-Trophoblasttumor (GTD/GTN)', 'Wiederholte Triploidie', 'Autoimmunerkrankung', 'Kein Risiko'], answer: 0, explain: 'Partielle Blasenmole → ~5% Risiko für persistierende GTD. hCG-Monitoring nach Ausräumung über 6-12 Monate.' },
    { q: 'Ist Triploidie mit dem Leben vereinbar?', choices: ['Nein, immer letal', 'Ja, mit schwerer Behinderung', 'Nur als Mosaik extrem selten lebensfaehig', 'Ja, bei Therapie'], answer: 2, explain: 'Vollstaendige Triploidie ist immer letal in utero. Triploidie-Mosaike (diploid/triploid) sind extrem selten dokumentiert, koennen aber mit schwerer Beeintraechtigung ueberleben.' },
    { q: 'Wie beraten Sie bei Zufallsbefund Triploidie in der Amniozentese?', choices: ['Letaler Befund, Schwangerschaftsbeendigung besprechen, hCG-Monitoring danach', 'Abwarten', 'Zweite Amniozentese in 4 Wochen', 'Keine Beratung nötig'], answer: 0, explain: 'Inkompatibel mit Leben. Beratung über Schwangerschaftsabbruch. Nach Beendigung: hCG-Kontrollen wegen GTD-Risiko.' }
  ]},

{ id: 5, cat: 'num_auto', iscn: '47,XX,+8[15]/46,XX[85]',
  vignette: '5-jähriges Kind mit milder Intelligenzminderung, dicker evertierter Unterlippe, tiefen Palmar-/Plantarfurchen, Gelenkkontrakturen.',
  sub: [
    { q: 'Diagnose?', choices: ['Trisomie 8 Mosaik (Warkany-Syndrom 2)', 'Trisomie 9 Mosaik', 'Trisomie 22 Mosaik', 'Fragiles-X-Syndrom'], answer: 0, explain: 'Tiefe Palmar-/Plantarfurchen + evertierte Unterlippe + Kontrakturen + milde ID = pathognomonisch für Trisomie 8 Mosaik.' },
    { q: 'Warum liegt nur ein Mosaik vor?', choices: ['Vollständige Trisomie 8 ist letal', 'Alle Trisomien sind immer Mosaike', 'Technischer Artefakt', 'Postnatale Correction'], answer: 0, explain: 'Volle Trisomie 8 ist mit postnatalem Leben nicht vereinbar. Nur Mosaike mit ausreichend normalem Zellanteil überleben.' },
    { q: 'Welches Gewebe ist diagnostisch am zuverlässigsten?', choices: ['Hautfibroblastenkultur', 'Blutlymphozyten allein', 'Mundschleimhaut allein', 'Serum'], answer: 0, explain: 'Mosaikgrad variiert zwischen Geweben. Die trisome Linie kann im Blut fehlen! Hautfibroblasten oft zuverlässiger.' },
    { q: 'Wie wird der Mosaikgrad angegeben?', choices: ['Anteil abnormaler Zellen in eckigen Klammern: [15]/[85]', 'Prozent nach dem Komma', 'Durch Schrägstrich', 'Wird nicht angegeben'], answer: 0, explain: 'ISCN: 47,XX,+8[15]/46,XX[85] = 15 trisome Zellen, 85 normale Zellen in der Analyse.' },
    { q: 'Wiederholungsrisiko?', choices: ['Sehr gering (~sporadic)', '25%', '50%', 'Wie bei freier Trisomie 21'], answer: 0, explain: 'Mosaik-Trisomien entstehen postzygotisch → nahezu kein familiäres Wiederholungsrisiko.' }
  ]},

// ══════════════════════════════════════════════════════════════
// NUMERISCHE ABERRATIONEN — GONOSOMEN (5 Fälle)
// ══════════════════════════════════════════════════════════════

{ id: 6, cat: 'num_sex', iscn: '45,X', img: 'img/quiz/case_11_turner.jpg',
  vignette: 'Adoleszentin mit Kleinwuchs (<3. Perzentile), Pterygium colli, Schildthorax mit weitem Mamillenabstand, primärer Amenorrhoe, normaler Intelligenz.',
  sub: [
    { q: 'Diagnose?', choices: ['Turner-Syndrom (45,X)', 'Noonan-Syndrom', 'Klinefelter-Syndrom', 'Prader-Willi'], answer: 0, explain: 'Kleinwuchs + Pterygium colli + primäre Amenorrhoe + Schildthorax = klassisches Turner-Syndrom.' },
    { q: 'Welche kardiale Diagnostik ist obligat?', choices: ['Echokardiographie (bikuspide Aortenklappe, Aortenisthmusstenose)', 'Nur EKG', 'Keine kardiale Diagnostik nötig', 'Herzkatheter als Erstdiagnostik'], answer: 0, explain: 'Bikuspide Aortenklappe (30%), Aortenisthmusstenose (10%), Aortenwurzeldilatation mit Dissektionsrisiko! Lebenslange Überwachung.' },
    { q: 'Warum gibt es Fertilität bei manchen Turner-Patientinnen?', choices: ['Mosaik 45,X/46,XX bewahrt ovarielle Reserve teilweise', 'Alle Turner sind fertil', 'Nur durch IVF möglich', 'Durch Hormontherapie allein'], answer: 0, explain: 'Mosaik-Turner (45,X/46,XX) haben manchmal residuelle Ovarialfunktion. Eizellspende ist sonst die Option.' },
    { q: 'Welche Therapie ist im Kindesalter indiziert?', choices: ['Wachstumshormon (sGH) ab Diagnose', 'Östrogen ab 5 Jahren', 'Keine Therapie im Kindesalter', 'Testosteron'], answer: 0, explain: 'sGH: Endgrößengewinn ~5-8 cm. Östrogen: erst ab Pubertätsalter (~12 J.) zur Pubertätsinduktion beginnen.' },
    { q: 'Wann muss nach Y-Material gesucht werden?', choices: ['Immer bei Turner — Gonadoblastom-Risiko bei Y-Fragment', 'Nur bei Virilisierung', 'Nie nötig', 'Nur bei 45,X/46,XY Mosaik'], answer: 0, explain: 'Y-Material (auch kryptisch) → ~15-30% Gonadoblastom-Risiko → prophylaktische Gonadektomie. Jede Turner-Patientin testen!' }
  ]},

{ id: 7, cat: 'num_sex', iscn: '47,XXY', img: 'img/quiz/case_13_klinefelter.jpg',
  vignette: 'Erwachsener Mann, Infertilitätsdiagnostik: Hochwuchs, kleine feste Hoden, Gynäkomastie, Azoospermie, niedriges Testosteron, erhöhtes FSH/LH.',
  sub: [
    { q: 'Diagnose?', choices: ['Klinefelter-Syndrom (47,XXY)', 'XYY-Syndrom', 'Kallmann-Syndrom', 'Androgenresistenz'], answer: 0, explain: '47,XXY — häufigste Ursache für primären Hypogonadismus beim Mann. Oft erst bei Infertilitätsabklärung diagnostiziert.' },
    { q: 'Welcher Laborbefund unterscheidet Klinefelter von sekundärem Hypogonadismus?', choices: ['Erhöhtes FSH/LH (hypergonadotrop)', 'Erniedrigtes FSH/LH (hypogonadotrop)', 'Normales FSH', 'Erhöhtes Testosteron'], answer: 0, explain: 'Klinefelter = primärer (hypergonadotroper) Hypogonadismus: Testosteron niedrig, FSH/LH hoch (keine negative Rückkopplung).' },
    { q: 'Ist Fertilität möglich?', choices: ['Ja, mittels TESE (testikuläre Spermienextraktion) + ICSI', 'Nein, niemals', 'Ja, durch Hormontherapie allein', 'Ja, spontan bei den meisten'], answer: 0, explain: 'TESE + ICSI: ~50% Spermien-Gewinnungsrate. Kein erhöhtes Trisomie-Risiko beim Nachwuchs.' },
    { q: 'Welche Langzeitkomplikationen drohen ohne Therapie?', choices: ['Osteoporose, metabolisches Syndrom, Brustkrebs-Risiko erhöht', 'Nur psychische Probleme', 'Keine Komplikationen', 'Leukämie'], answer: 0, explain: 'Testosteronmangel → Osteoporose, viszerale Adipositas, Diabetes Typ 2. Brustkrebsrisiko 20-50× erhöht (wie bei Frauen).' },
    { q: 'Empfohlene Therapie?', choices: ['Lebenslange Testosteron-Substitution', 'Östrogen', 'Keine Therapie', 'Chemotherapie'], answer: 0, explain: 'Testosteron-Substitution: Normalisierung von Energie, Libido, Knochendichte, Metabolismus. Beginn ab Pubertätsalter.' }
  ]},

{ id: 8, cat: 'num_sex', iscn: '47,XXX',
  vignette: 'Großgewachsenes Mädchen mit leichter Sprachentwicklungsverzögerung, Lernschwierigkeiten, normaler Pubertät. Karyotyp-Zufallsbefund.',
  sub: [
    { q: 'Karyotyp?', choices: ['47,XXX (Triple-X)', '47,XXY', '45,X', '46,XX,inv(X)'], answer: 0, explain: 'Triple X: großwüchsig + milde kognitive Auffälligkeiten + normale Fertilität = oft Zufallsbefund.' },
    { q: 'Wie ist die Fertilität?', choices: ['Normal, eigene Kinder möglich', 'Immer infertil', 'Nur durch IVF', 'Fertil aber 50% betroffene Kinder'], answer: 0, explain: 'Die meisten 47,XXX Frauen haben normale Fertilität und gesunde Kinder. Theoretisches Risiko für Aneuploidie-Nachkommen leicht erhöht.' },
    { q: 'Welcher Mechanismus führt dazu, dass der Phänotyp mild ist?', choices: ['X-Inaktivierung: 2 von 3 X werden inaktiviert', 'Alle 3 X sind aktiv', 'Das 3. X wird deletiert', 'Mosaik-Effekt'], answer: 0, explain: 'Obwohl 2 X inaktiviert werden, entgehen einige Gene der Inaktivierung (PAR-Gene, XIST-Umgebung) → milder Phänotyp.' },
    { q: 'Wird Triple X häufig diagnostiziert?', choices: ['Nein, >90% bleiben undiagnostiziert', 'Ja, bei der Geburt', 'Nur bei Infertilität', 'Immer pränatal'], answer: 0, explain: '~1:1000 Mädchen, aber >90% werden nie diagnostiziert weil der Phänotyp so mild ist.' },
    { q: 'Welche Früherkennung ist sinnvoll?', choices: ['Logopädische und lerntherapeutische Förderung', 'Keine nötig', 'Chirurgie', 'Hormongabe'], answer: 0, explain: 'Hauptrisiko: Sprach-/Lernentwicklungsverzögerung. Frühzeitige logopädische Förderung und schulische Unterstützung.' }
  ]},

{ id: 9, cat: 'num_sex', iscn: '47,XYY',
  vignette: 'Großgewachsener Mann, milde Lernschwierigkeiten als Kind, sonst unauffällig. Karyotyp als Zufallsbefund bei Infertilitätsdiagnostik.',
  sub: [
    { q: 'Karyotyp?', choices: ['47,XYY', '47,XXY', '46,XY/47,XXY Mosaik', '48,XXYY'], answer: 0, explain: 'XYY-Syndrom (Jacobs). Hochwuchs + milde kognitive Auffälligkeiten. Alte (widerlegte) Assoziation mit Kriminalität.' },
    { q: 'Ist die Fertilität betroffen?', choices: ['Meist normal', 'Immer infertil', 'Nur durch IVF', 'Azoospermie obligat'], answer: 0, explain: 'Die meisten 47,XYY Männer sind fertil. Leicht erhöhte Rate von Spermienaneuploidien, aber klinisch selten relevant.' },
    { q: 'Wie häufig ist 47,XYY?', choices: ['~1:1000 Jungen', '~1:100.000', '~1:5.000.000', 'Extrem selten'], answer: 0, explain: '~1:1000 männliche Geburten — ebenso häufig wie Klinefelter, aber viel seltener diagnostiziert.' },
    { q: 'Besteht ein erhöhtes Krebsrisiko?', choices: ['Nein', 'Ja, Hodenkrebs', 'Ja, Leukämie', 'Ja, Brustkrebs'], answer: 0, explain: 'Kein erhöhtes Krebsrisiko bei 47,XYY. Das ist ein Unterschied zu 47,XXY (Klinefelter), wo Brustkrebs-Risiko erhöht ist.' },
    { q: 'Wie beraten Sie bei Pränataldiagnose 47,XYY?', choices: ['Milder Phänotyp, meist normale Entwicklung, Unterstützung bei Lernschwierigkeiten', 'Schwerer Phänotyp, Abbruch empfehlen', 'Kein klinisches Bild', 'Identisch mit Klinefelter'], answer: 0, explain: 'Non-direktive Beratung: >90% haben ein normales Leben. Keine Stigmatisierung! Alte XYY-"Kriminellen"-Hypothese ist widerlegt.' }
  ]},

{ id: 10, cat: 'num_sex', iscn: '45,X/46,XX', img: 'img/quiz/case_12_turner_mosaic.png',
  vignette: 'Junge Frau mit milden Turner-Stigmata, regulärem Zyklus, normaler Körpergröße. Karyotyp zeigt Mosaik.',
  sub: [
    { q: 'Welches Mosaik liegt wahrscheinlich vor?', choices: ['45,X/46,XX (Turner-Mosaik)', '45,X/47,XXX', '46,XX/47,XXX', '45,X/46,XY'], answer: 0, explain: '45,X/46,XX Mosaik: milder Turner-Phänotyp, oft residuelle ovarielle Funktion. Regulärer Zyklus spricht für ausreichend 46,XX-Anteil.' },
    { q: 'Wie beeinflusst der Mosaikgrad den Phänotyp?', choices: ['Je mehr 46,XX-Zellen, desto milder', 'Kein Zusammenhang', 'Mehr 45,X = milder', 'Nur im ZNS relevant'], answer: 0, explain: 'Der Phänotyp korreliert grob mit dem Anteil 45,X-Zellen, aber die Verteilung in verschiedenen Geweben ist entscheidend.' },
    { q: 'Ist eine Schwangerschaft möglich?', choices: ['Ja, natürliche Konzeption bei ausreichend ovariellem Rest möglich', 'Niemals', 'Nur durch Eizellspende', 'Nur durch Adoption'], answer: 0, explain: 'Turner-Mosaik mit 46,XX-Anteil: spontane Schwangerschaften dokumentiert. Cave: Aortendissektion-Risiko in der Schwangerschaft!' },
    { q: 'Welches Schwangerschaftsrisiko ist besonders zu beachten?', choices: ['Aortendissektion (auch bei mildem Turner)', 'Gestationsdiabetes ausschließlich', 'Kein erhöhtes Risiko', 'Plazenta-Insuffizienz allein'], answer: 0, explain: 'Aortendissektion-Risiko ist bei JEDER Turner-Patientin in der Schwangerschaft erhöht, auch bei Mosaik! Kardiologische Mitbetreuung obligat.' },
    { q: 'Welche Diagnostik vor geplanter Schwangerschaft?', choices: ['Kardio-MRT (Aortenwurzel), Nierensono, TSH, kardiologisches Konsil', 'Nur Blutbild', 'Keine spezielle Diagnostik', 'Genetische Beratung allein reicht'], answer: 0, explain: 'Aortenwurzel-Diameter entscheidend: >25mm/m² BSA → hohes Risiko! Dazu: Nieren (Hufeisenniere), Schilddrüse (Hashimoto).' }
  ]},

// ══════════════════════════════════════════════════════════════
// ROBERTSONSCHE TRANSLOKATIONEN (5 Fälle)
// ══════════════════════════════════════════════════════════════

{ id: 11, cat: 'rob', iscn: '45,XX,rob(13;14)(q10;q10)', img: 'img/quiz/case_20_rob1314.jpg',
  vignette: '32-jährige Frau, gesund, 3 Spontanaborte im 1. Trimenon. Karyotyp: 45 Chromosomen.',
  sub: [
    { q: 'Warum ist sie mit 45 Chromosomen gesund?', choices: ['Die kurzen Arme akrozentrischer Chromosomen enthalten nur redundante rRNA-Gene', 'X-Inaktivierung kompensiert', 'Ein Chromosom wurde verdoppelt', 'Technischer Fehler'], answer: 0, explain: 'rob(13;14): Fusion der langen Arme, Verlust der p-Arme. p-Arme enthalten nur rRNA-Repeats (hundertfach redundant).' },
    { q: 'Welche Chromosomen können Robertsonsche Translokationen bilden?', choices: ['Nur akrozentrische: 13, 14, 15, 21, 22', 'Alle Chromosomen', 'Nur Chromosom 13 und 14', 'Nur Gonosomen'], answer: 0, explain: 'Nur akrozentrische Chromosomen (13, 14, 15, 21, 22) — weil die Fusion am Centromer/Centromer-nahen Region stattfindet.' },
    { q: 'Warum hat sie rezidivierende Aborte?', choices: ['Meiotische Segregation erzeugt unbalancierte Gameten', 'Immunologische Ursache', 'Uterus-Fehlbildung', 'Thrombophilie'], answer: 0, explain: '6 mögliche Segregationstypen: Normal, Balanciert, Trisomie 13, Monosomie 13, Trisomie 14, Monosomie 14. Die meisten unbalancierten → Abort.' },
    { q: 'Wie hoch ist das Risiko für ein lebendes Kind mit Trisomie 13?', choices: ['~1% empirisch', '33% theoretisch', '50%', '0%'], answer: 0, explain: 'Theoretisch 1/6, aber die meisten Trisomie/Monosomie-Concepte werden in utero selektiert. Empirisch: ~1% bei Mutter als Trägerin.' },
    { q: 'Was empfehlen Sie der Patientin?', choices: ['PND bei nächster SS (CVS/Amnio), Angebot PGT-SR', 'Keine weitere Diagnostik', 'IVF ohne PGT', 'Eizellspende'], answer: 0, explain: 'Optionen: PND (Amniozentese/CVS) in jeder SS, oder PGT-SR (Präimplantationsdiagnostik für strukturelle Rearrangements) zur Selektion balancierter Embryonen.' }
  ]},

{ id: 12, cat: 'rob', iscn: '45,XY,rob(14;21)(q10;q10)',
  vignette: '28-jähriger Mann, genetische Beratung nach Geburt eines Kindes mit Translokations-Down-Syndrom in der Familie.',
  sub: [
    { q: 'Sein Risiko für ein Kind mit Down-Syndrom?', choices: ['~1-2% (bei männlichem Träger)', '~10-15%', '50%', 'Kein Risiko'], answer: 0, explain: 'Männliche rob(14;21)-Träger: ~1-2%. Weibliche Trägerinnen: ~10-15%. Geschlechtsspezifischer Unterschied durch differentielle Gameten-Viabilität.' },
    { q: 'Wie unterscheidet sich Translokations-Down klinisch von freier Trisomie 21?', choices: ['Klinisch identisch', 'Milder', 'Schwerer', 'Ohne Herzfehler'], answer: 0, explain: 'Phänotypisch identisch! Der Unterschied liegt nur im Wiederholungsrisiko und der familiären Implikation.' },
    { q: 'Welche Familiendiagnostik ist indiziert?', choices: ['Karyotypisierung aller Verwandten 1. Grades', 'Nur die Mutter testen', 'Keine Familiendiagnostik', 'Nur den Vater des betroffenen Kindes'], answer: 0, explain: 'Kaskadenscreening: Eltern → Geschwister → weitere Verwandte. Jeder Träger hat erhöhtes Risiko für betroffene Nachkommen.' },
    { q: 'Was wäre bei rob(21;21) das Wiederholungsrisiko?', choices: ['100% Down-Syndrom bei allen Lebendgeborenen', '50%', '25%', '~1%'], answer: 0, explain: 'Homologe Robertsonsche: jeder Gamet hat entweder Disomie 21 (→ Trisomie) oder Nullisomie 21 (→ letale Monosomie). 100% der überlebenden Kinder sind betroffen.' },
    { q: 'Therapieoption für Kinderwunsch?', choices: ['PGT-SR (Embryo-Selektion) oder Keimzellspende', 'Keine Option', 'CRISPR-Korrektur', 'Adoption als einzige Option'], answer: 0, explain: 'PGT-SR ermöglicht Selektion balancierter/normaler Embryonen. Bei rob(21;21): Spendersamem/-eizellen oder Adoption.' }
  ]},

// ══════════════════════════════════════════════════════════════
// TRANSLOKATIONEN — ONKOLOGISCH (3 Fälle)
// ══════════════════════════════════════════════════════════════

{ id: 13, cat: 'recip', iscn: '46,XX,t(9;22)(q34;q11.2)', img: 'img/quiz/case_25_philadelphia.jpg',
  vignette: 'Erwachsene mit Leukozytose (120.000/μl), Splenomegalie, Basophilie, niedriger LAP-Score. Knochenmark-Karyotyp.',
  sub: [
    { q: 'Welches Fusionsgen entsteht?', choices: ['BCR-ABL1', 'PML-RARA', 'MYC-IgH', 'ETV6-RUNX1'], answer: 0, explain: 'Philadelphia-Chromosom: t(9;22) → BCR-ABL1 Fusionsgen → konstitutiv aktive Tyrosinkinase.' },
    { q: 'Welche Therapie revolutionierte die CML-Behandlung?', choices: ['Imatinib (Gleevec) — erster Tyrosinkinase-Inhibitor', 'Strahlentherapie', 'Alleinige Chemotherapie', 'Splenektomie'], answer: 0, explain: 'Imatinib (2001): erste zielgerichtete Krebstherapie. CML ging von ~5 Jahre Überleben auf nahezu normale Lebenserwartung.' },
    { q: 'Wie wird BCR-ABL1 zum Monitoring verwendet?', choices: ['Quantitative RT-PCR: BCR-ABL1/ABL1 Ratio (molekulares Ansprechen)', 'Nur Karyotyp alle 6 Monate', 'Kein Monitoring nötig', 'Nur Blutbild'], answer: 0, explain: 'qPCR-Monitoring alle 3 Monate. Ziel: Major Molecular Response (MMR, <0.1%) und Deep Molecular Response (MR4.5).' },
    { q: 'Was ist der Unterschied der Philadelphia-Translokation bei CML vs. ALL?', choices: ['Gleiche Translokation, aber unterschiedliche BCR-Bruchpunkte (Major vs. Minor)', 'Verschiedene Chromosomen betroffen', 'Nur bei CML', 'Kein Unterschied'], answer: 0, explain: 'CML: Major-BCR (p210 Protein). ALL: Minor-BCR (p190 Protein). Unterschiedliche Prognose und Therapieansprache.' },
    { q: 'Ist die Philadelphia-Translokation konstitutionell oder erworben?', choices: ['Erworben (somatische Mutation in hämatopoetischer Stammzelle)', 'Konstitutionell (von Geburt an)', 'Vererbbar', 'Beides möglich'], answer: 0, explain: 'Somatische Mutation — nur in den Leukämiezellen, nicht in der Keimbahn. Nicht vererbbar.' }
  ]},

{ id: 14, cat: 'recip', iscn: '46,XY,t(15;17)(q24;q21)',
  vignette: 'Junger Erwachsener mit Panzytopenie, DIC bei Aufnahme. KM: hypergranulierte Promyelozyten mit Auerstäbchen.',
  sub: [
    { q: 'Diagnose?', choices: ['APL (Akute Promyelozytenleukämie, AML M3)', 'CML', 'Burkitt-Lymphom', 'AML M0'], answer: 0, explain: 'Promyelozyten + Auerstäbchen + DIC + t(15;17) = APL. Onkologischer Notfall wegen DIC!' },
    { q: 'Welches Fusionsgen entsteht und welche Therapie ist kurativ?', choices: ['PML-RARA → ATRA + Arsentrioxid (kurativ!)', 'BCR-ABL1 → Imatinib', 'MYC-IgH → Chemotherapie', 'KMT2A-AF4 → Stammzelltransplantation'], answer: 0, explain: 'PML-RARA blockiert Differenzierung. ATRA (all-trans-Retinsäure) + Arsentrioxid = >90% Heilungsrate. Paradigma der differenzierungsinduzierten Therapie.' },
    { q: 'Warum ist DIC die gefährlichste Komplikation bei Diagnose?', choices: ['Promyelozyten setzen prokoagulatorische Substanzen frei', 'Therapienebenwirkung', 'Nicht mit APL assoziiert', 'Nur bei Kindern'], answer: 0, explain: 'Promyelozyten-Granula enthalten Tissue Factor und annexin II → disseminierte intravasale Gerinnung. Vor ATRA-Ära: 30% Frühmortalität durch DIC.' },
    { q: 'Warum muss ATRA sofort bei VERDACHT gegeben werden?', choices: ['DIC-Risiko → nicht auf Zytogenetik-Bestätigung warten!', 'Weil ATRA harmlos ist', 'Weil die Diagnose immer klar ist', 'Weil Zytogenetik Wochen dauert'], answer: 0, explain: 'ATRA bei klinischem Verdacht sofort starten (DIC-Prävention), BEVOR die t(15;17) bestätigt ist. Jede Stunde zählt.' },
    { q: 'Wie wird das molekulare Ansprechen überwacht?', choices: ['PML-RARA RT-PCR (molekulare Remission = negativer PML-RARA)', 'Nur Blutbild', 'Nur Knochenmark-Morphologie', 'Kein Monitoring nötig'], answer: 0, explain: 'PML-RARA-PCR nach Konsolidierung. Negativ = molekulare Remission. Rezidiv = erneuter PCR-Nachweis → Arsentrioxid-Rescue.' }
  ]},

{ id: 15, cat: 'recip', iscn: '46,XX,t(8;14)(q24;q32)',
  vignette: 'Jugendlicher mit rasch wachsender Kiefermasse. Biopsie: hochgradiges Lymphom mit Sternhimmel-Muster.',
  sub: [
    { q: 'Translokationsprodukt?', choices: ['MYC-IgH Fusion', 'BCR-ABL1', 'PML-RARA', 'BCL2-IgH'], answer: 0, explain: 'Burkitt-Lymphom: t(8;14) stellt MYC unter Kontrolle des IgH-Enhancers → konstitutive Überexpression.' },
    { q: 'Was ist das "Sternhimmel-Muster" histologisch?', choices: ['Makrophagen-Phagozytose zwischen schnell proliferierenden Lymphomzellen', 'Bakterienkolonien', 'Verkalkungen', 'Fibrose'], answer: 0, explain: 'Tingible-Body-Makrophagen (= Sterne) in einem Teppich aus uniformen B-Lymphozyten. Sehr hohe Proliferationsrate (Ki-67 ~100%).' },
    { q: 'Welche Varianten der MYC-Translokation gibt es?', choices: ['t(2;8) (Igκ-MYC) und t(8;22) (MYC-Igλ)', 'Nur t(8;14)', 't(8;21)', 't(9;22)'], answer: 0, explain: 'Drei Varianten: t(8;14) ~80%, t(2;8) (Igκ) ~15%, t(8;22) (Igλ) ~5%. Alle aktivieren MYC über Immunglobulin-Enhancer.' },
    { q: 'Welche Assoziation besteht mit EBV?', choices: ['Endemischer Burkitt (Afrika): >95% EBV-positiv; sporadisch: ~20%', 'Nie mit EBV assoziiert', 'Immer EBV-positiv', 'Nur bei HIV'], answer: 0, explain: 'Endemische Form (äquatoriales Afrika): fast immer EBV+. Sporadische Form (Europa/USA): meist EBV-negativ. HIV-assoziiert: variabel.' },
    { q: 'Prognose mit Therapie?', choices: ['~90% Heilungsrate mit intensiver Chemotherapie (pädiatrisches Protokoll)', 'Immer letal', '50%', 'Nur palliativ'], answer: 0, explain: 'Paradox: trotz höchster Aggressivität exzellent therapierbar wegen hoher Chemosensitivität. Rituximab + intensive Chemotherapie.' }
  ]},

// ══════════════════════════════════════════════════════════════
// MIKRODELETIONSSYNDROME (5 Fälle)
// ══════════════════════════════════════════════════════════════

{ id: 16, cat: 'del', iscn: '46,XX,del(5)(p15.2)', img: 'img/quiz/case_31_cri_du_chat.jpg',
  vignette: 'Neugeborenes mit hochfrequentem, katzenähnlichem Schrei, Mikrozephalie, rundem Gesicht, Hypertelorismus, schwerer Hypotonie.',
  sub: [
    { q: 'Diagnose?', choices: ['Cri-du-chat (5p-Deletionssyndrom)', 'Wolf-Hirschhorn (4p-)', 'Smith-Magenis', 'Williams-Syndrom'], answer: 0, explain: 'Katzenartiger Schrei (Larynxhypoplasie) + Mikrozephalie + Hypertelorismus = pathognomonisch für Cri-du-chat.' },
    { q: 'Warum entsteht der charakteristische Schrei?', choices: ['Larynx-/Epiglottis-Hypoplasie durch Deletion des CTNND2-Bereichs', 'Tracheomalazie', 'Stimmbandparese', 'Laryngozele'], answer: 0, explain: 'Die Deletion auf 5p15 betrifft Gene für Larynxentwicklung. Der Schrei normalisiert sich oft mit dem Alter.' },
    { q: 'Welche Diagnostik bestätigt die Diagnose?', choices: ['Array-CGH/SNP-Array oder FISH für 5p15', 'Nur Standard-Karyotyp reicht immer', 'Exom-Sequenzierung', 'Nur klinisch'], answer: 0, explain: 'Bei großer Deletion: im Karyotyp sichtbar. Bei kleinerer: Array-CGH/FISH. Array ist heute Standard-Erstdiagnostik bei V.a. Mikrodeletion.' },
    { q: 'Wie ist die Lebenserwartung?', choices: ['Meist Überleben bis ins Erwachsenenalter bei guter Betreuung', 'Immer letal im 1. Lebensjahr', 'Normal', 'Maximal 5 Jahre'], answer: 0, explain: 'Keine schwere Organbeteiligung (anders als Trisomie 13/18). Überlebensrate >85% bis Erwachsenenalter. Schwere ID, aber lebensfähig.' },
    { q: 'Ist die Deletion meist de novo oder ererbt?', choices: ['~85% de novo, ~15% durch parentale Translokation', '100% ererbt', '100% de novo', '50/50'], answer: 0, explain: '~85% de novo (meist paternaler Herkunft). ~15% aus unbalancierter Segregation einer parentalen Translokation → Eltern-Karyotyp obligat!' }
  ]},

{ id: 17, cat: 'del', iscn: '46,XY,del(22)(q11.2)',
  vignette: 'Neugeborener mit unterbrochener Aorta Typ B, hypokalzämischen Krampfanfällen, T-Zell-Defizienz in der Durchflusszytometrie.',
  sub: [
    { q: 'Wahrscheinliche Deletion?', choices: ['del(22)(q11.2) — DiGeorge/VCFS', 'del(7)(q11.23) — Williams', 'del(15)(q11.2) — PWS', 'del(17)(p11.2) — Smith-Magenis'], answer: 0, explain: '22q11.2-Deletionssyndrom (CATCH-22): Cardiac, Abnormal facies, Thymic hypoplasia, Cleft, Hypocalcemia.' },
    { q: 'Welches Gen ist für den kardialen Phänotyp hauptverantwortlich?', choices: ['TBX1', 'ELN', 'UBE3A', 'RAI1'], answer: 0, explain: 'TBX1: Transkriptionsfaktor für Entwicklung der Pharyngealbögen. Haploinsuffizienz → konotrunkale Herzfehler.' },
    { q: 'Warum ist dieser Befund im Karyotyp oft nicht sichtbar?', choices: ['~3 Mb Deletion — submikroskopisch, braucht FISH/Array', 'Immer im Karyotyp sichtbar', 'Ist ein Einzelgen-Defekt', 'Liegt auf dem Y-Chromosom'], answer: 0, explain: 'Die 22q11.2-Deletion ist meist 3 Mb groß und im konventionellen G-Banding nicht sicher erkennbar. FISH oder Array-CGH ist diagnostischer Standard.' },
    { q: 'Wie hoch ist das Wiederholungsrisiko?', choices: ['10% wenn ein Elternteil Träger, 50% beim betroffenen Patienten', 'Immer 25%', '0%', '100%'], answer: 0, explain: '~90% de novo, ~10% von betroffenem Elternteil ererbt. Betroffene haben 50% Risiko für ihre Kinder (autosomal dominant).' },
    { q: 'Welche Langzeitkomplikation wird im Erwachsenenalter wichtig?', choices: ['Psychiatrische Erkrankungen (Schizophrenie-Risiko 25-30×)', 'Nur kardiale Probleme', 'Kein Langzeitproblem', 'Nur Immundefekt'], answer: 0, explain: '22q11.2-Deletion ist der stärkste genetische Risikofaktor für Schizophrenie (~25-30× erhöhtes Risiko). Auch Angststörungen, ADHS häufig.' }
  ]},

{ id: 18, cat: 'del', iscn: '46,XX,del(15)(q11.2q13)pat',
  vignette: 'Säugling mit schwerer neonataler Hypotonie und Trinkschwäche. Später: Hyperphagie, Adipositas, Kleinwuchs, Hypogonadismus.',
  sub: [
    { q: 'Diagnose und elterliche Herkunft?', choices: ['Prader-Willi, paternale Deletion', 'Angelman, maternale Deletion', 'Prader-Willi, maternale Deletion', 'Fragiles-X-Syndrom'], answer: 0, explain: 'Prader-Willi = Verlust der PATERNALEN 15q11-q13 Region. Biphasischer Verlauf: Hypotonie → Hyperphagie.' },
    { q: 'Welche Methode unterscheidet Prader-Willi von Angelman bei gleicher Deletion?', choices: ['Methylierungsanalyse (DNA-Methylierung am SNRPN-Locus)', 'Standard-Karyotyp', 'Nur klinisch', 'Blutbild'], answer: 0, explain: 'Methylierungstest: einzige Methode die alle PWS-Mechanismen (Deletion, UPD, Imprintingdefekt) erkennt. Goldstandard-Erstdiagnostik.' },
    { q: 'Welche genetischen Mechanismen verursachen Prader-Willi?', choices: ['Deletion 70%, maternale UPD 25%, Imprinting-Defekt 2-5%', 'Nur Deletion', 'Nur UPD', 'Trinukleotid-Expansion'], answer: 0, explain: '~70% paternale de-novo-Deletion, ~25% maternale UPD(15) (beide Kopien von der Mutter), ~2-5% Imprinting-Defekt.' },
    { q: 'Warum ist das gleiche Syndrom nicht bei maternaler Deletion?', choices: ['Genomic Imprinting: paternale Gene in 15q11-q13 sind aktiv, maternale silenced', 'Zufällig', 'Maternale Deletion ist letal', 'X-Inaktivierung'], answer: 0, explain: 'Imprinting: SNRPN, MAGEL2, NDN etc. werden nur vom paternalen Allel exprimiert. Maternale Deletion → diese Gene sind sowieso still → Angelman (UBE3A ist umgekehrt maternal exprimiert).' },
    { q: 'Welche Beratung bezüglich Wiederholungsrisiko?', choices: ['Mechanismus-abhängig: Deletion <1%, UPD <1%, Imprinting-Defekt bis 50%', '25% immer', '50% immer', 'Kein Risiko bei keiner Form'], answer: 0, explain: 'Deletion: <1% (de novo). UPD: <1%. Aber: Imprinting-Center-Deletion kann bis 50% betragen! Daher: exakte Abklärung des Mechanismus essentiell.' }
  ]},

{ id: 19, cat: 'del', iscn: '46,XY,del(15)(q11.2q13)mat',
  vignette: 'Kind mit schwerer Intelligenzminderung, fehlender Sprache, ataktischem puppenhaftem Gang, unangemessenen Lachattacken, Krampfanfällen, Mikrozephalie.',
  sub: [
    { q: 'Diagnose und elterliche Herkunft?', choices: ['Angelman-Syndrom, maternale Deletion', 'Prader-Willi, paternale Deletion', 'Rett-Syndrom', 'Fragiles X'], answer: 0, explain: 'Angelman: Verlust der MATERNALEN UBE3A-Expression in 15q11-q13. "Happy puppet" — Lachattacken + Ataxie + Epilepsie.' },
    { q: 'Warum ist PWS und Angelman die gleiche Region aber verschiedene Phänotypen?', choices: ['Genomic Imprinting: verschiedene Gene sind parent-of-origin-spezifisch aktiv', 'Verschiedene Deletionsgrößen', 'Unterschiedliche Chromosomen', 'Alter bei Auftreten'], answer: 0, explain: 'PWS-Gene (SNRPN etc.): nur paternal aktiv. UBE3A: nur maternal aktiv (im ZNS). Gleiche Region, aber verschiedene Seiten des Imprints.' },
    { q: 'Welches EEG-Muster ist charakteristisch?', choices: ['Hochamplitudige 2-3 Hz delta-Aktivität mit epileptiformen Spikes', 'Normales EEG', 'Nur Absence-Muster', 'Alpha-Koma'], answer: 0, explain: 'Pathognomonisches EEG: großamplitudige rhythmische Delta-Aktivität, besonders posterior. Oft schon im 1. Lebensjahr auffällig, noch vor Krampfanfällen.' },
    { q: 'Welche anderen Mechanismen außer Deletion verursachen Angelman?', choices: ['UBE3A-Mutation (10%), paternale UPD (5%), Imprinting-Defekt (5%)', 'Nur Deletion', 'Trinukleotid-Expansion', 'Mitochondriale Mutation'], answer: 0, explain: 'Deletion ~70%, UBE3A-Punktmutation ~10%, pat. UPD ~5%, Imprinting-Defekt ~5%, unbekannt ~10%. Methylierungstest erkennt nicht alle!' },
    { q: 'Welche Therapie ist bei Angelman-Epilepsie Mittel der Wahl?', choices: ['Valproat, Levetiracetam, Benzodiazepine; CAVE: kein Carbamazepin!', 'Carbamazepin First-line', 'Keine Therapie nötig', 'Nur chirurgische Therapie'], answer: 0, explain: 'Carbamazepin und Lamotrigin können Anfälle bei Angelman verschlechtern! Valproat und Benzodiazepine sind Mittel der Wahl.' }
  ]},

{ id: 20, cat: 'del', iscn: '46,XX,del(7)(q11.23)',
  vignette: 'Kleinkind mit elfenartigen Fazies, supravalvulärer Aortenstenose, Hyperkalzämie, "Cocktailparty-Persönlichkeit", milder ID.',
  sub: [
    { q: 'Diagnose?', choices: ['Williams-Beuren-Syndrom (7q11.23-Deletion)', 'DiGeorge-Syndrom', 'Smith-Magenis', 'Noonan-Syndrom'], answer: 0, explain: 'Elfenartiges Gesicht + SVAS + Hyperkalzämie + Hypersozialität = Williams-Beuren.' },
    { q: 'Welches Gen verursacht die Aortenstenose?', choices: ['ELN (Elastin)', 'TBX1', 'CFTR', 'TP53'], answer: 0, explain: 'ELN-Haploinsuffizienz → Elastinmangel → supravalvuläre Aortenstenose + periphere Pulmonalstenose.' },
    { q: 'Was ist die reziproke Duplikation (dup(7)(q11.23)) und wie unterscheidet sie sich?', choices: ['Gleiche Region verdoppelt → schwere expressive Sprachstörung, Ängstlichkeit (Gegenteil von Williams)', 'Identischer Phänotyp', 'Letale Mutation', 'Betrifft andere Gene'], answer: 0, explain: 'Williams del: hypersozial. 7q11.23 dup: starke Ängstlichkeit + Sprachdefizit. Gleiche NAHR-Mechanismus, entgegengesetzte Richtung.' },
    { q: 'Welcher Mechanismus führt zur Deletion?', choices: ['NAHR zwischen flankierenden LCRs (Low Copy Repeats)', 'Strahlung', 'Trinukleotid-Expansion', 'Virale Integration'], answer: 0, explain: 'NAHR (Non-Allelic Homologous Recombination) zwischen LCRs die die 1,5 Mb Region flankieren. Gleicher Mechanismus erzeugt auch die reziproke Duplikation.' },
    { q: 'Welche Besonderheit zeigen Williams-Patienten kognitiv?', choices: ['Relativ gut erhaltene verbale Fähigkeiten, aber schwere visuell-räumliche Defizite', 'Generell schwere ID', 'Autismus-typisch', 'Normale Kognition'], answer: 0, explain: 'Dissoziiertes kognitives Profil: verbale Fähigkeiten überraschend gut, visuell-konstruktive massiv gestört. Musikbegabung häufig.' }
  ]},

// ══════════════════════════════════════════════════════════════
// WEITERE MIKRODELETIONEN / DUPLIKATIONEN (5 Fälle)
// ══════════════════════════════════════════════════════════════

{ id: 21, cat: 'del', iscn: '46,XY,del(4)(p16.3)',
  vignette: 'Neugeborener mit "griechischem Kriegerhelm"-Fazies (breite Stirn, Hypertelorismus, prominente Glabella), schwerer IUGR, Krampfanfällen, Mittelliniendefekten.',
  sub: [
    { q: 'Diagnose?', choices: ['Wolf-Hirschhorn-Syndrom (4p-)', 'Cri-du-chat (5p-)', 'DiGeorge', 'Cornelia de Lange'], answer: 0, explain: 'Griechischer-Helm-Fazies + schwere IUGR + Krampfanfälle + Mittelliniendefekte = Wolf-Hirschhorn.' },
    { q: 'Welches Gen ist für den Phänotyp kritisch?', choices: ['NSD2 (WHSC1)', 'ELN', 'TBX1', 'UBE3A'], answer: 0, explain: 'NSD2 (Wolf-Hirschhorn syndrome candidate 1): Histon-Methyltransferase. Haploinsuffizienz verursacht den Kern-Phänotyp.' },
    { q: 'Wie groß ist die Deletion typischerweise?', choices: ['Variabel: 1-30 Mb (terminal 4p)', 'Immer exakt 3 Mb', 'Submikroskopisch immer', 'Ganzes Chromosom 4'], answer: 0, explain: 'Terminal 4p-Deletion, sehr variabel. Größere Deletionen = schwererer Phänotyp. Kleine Deletionen brauchen Array-CGH.' },
    { q: 'Welcher Epilepsie-Typ ist charakteristisch?', choices: ['Atypische Absencen mit generalisierten tonisch-klonischen Anfällen, oft therapieresistent', 'West-Syndrom ausschließlich', 'Keine Epilepsie', 'Nur Fieberkrämpfe'], answer: 0, explain: '~90% haben Epilepsie. Charakteristisch: atypische Absencen, oft mit Fieber-getriggerten Status epilepticus. Valproat first-line.' },
    { q: 'Wiederholungsrisiko?', choices: ['~85% de novo; ~15% parentale Translokation → Elternkaryotyp obligat', '100% ererbt', 'Immer de novo', '50%'], answer: 0, explain: 'Wie bei Cri-du-chat: ~15% aus unbalancierter Segregation einer elterlichen Translokation. Immer Eltern-Karyotyp anfordern!' }
  ]},

{ id: 22, cat: 'del', iscn: '46,XX,del(17)(p11.2)',
  vignette: '4-jähriges Kind mit Brachyzephalie, breiter Fazies, Schlafstörungen (invertierter zirkadianer Rhythmus: tags müde, nachts wach), Selbstverletzung (Onychotillomanie), milder ID.',
  sub: [
    { q: 'Diagnose?', choices: ['Smith-Magenis-Syndrom (del 17p11.2)', 'Potocki-Lupski', 'Williams-Syndrom', 'Angelman'], answer: 0, explain: 'Invertierter Schlaf-Wach-Rhythmus + Selbstverletzung (Nagelreißen) + breite Fazies = Smith-Magenis.' },
    { q: 'Welches Gen ist hauptverantwortlich?', choices: ['RAI1 (Retinoic Acid Induced 1)', 'ELN', 'TBX1', 'UBE3A'], answer: 0, explain: 'RAI1-Haploinsuffizienz verursacht den Kern-Phänotyp. RAI1-Punktmutationen erzeugen einen ähnlichen Phänotyp (ohne die anderen deletierten Gene).' },
    { q: 'Was ist das reziproke Duplikationssyndrom?', choices: ['Potocki-Lupski-Syndrom (dup 17p11.2)', 'Charcot-Marie-Tooth 1A', 'Williams-Syndrom', 'DiGeorge'], answer: 0, explain: 'Gleiche NAHR, entgegengesetzte Richtung: del → Smith-Magenis, dup → Potocki-Lupski (milde ID, Autismus-Spektrum).' },
    { q: 'Warum ist der Schlafrhythmus invertiert?', choices: ['RAI1 reguliert die zirkadiane Melatonin-Sekretion — Melatonin-Peak tagsüber statt nachts', 'Lichtempfindlichkeit', 'Hirnstamm-Fehlbildung', 'Medikamentennebenwirkung'], answer: 0, explain: 'RAI1 kontrolliert Transkription von Genen im zirkadianen System. Resultat: Melatonin-Sekretion tags statt nachts → invertierter Rhythmus.' },
    { q: 'Therapeutischer Ansatz für die Schlafstörung?', choices: ['Abendliches Melatonin + morgendlicher Beta-Blocker (Acebutolol)', 'Nur Schlafhygiene', 'Benzodiazepine dauerhaft', 'Lichttherapie allein'], answer: 0, explain: 'Exogenes Melatonin abends + Acebutolol morgens (unterdrückt inadäquaten tageslichen Melatonin-Peak). Evidenzbasiert für Smith-Magenis.' }
  ]},

{ id: 23, cat: 'del', iscn: '46,XY,del(11)(p13)',
  vignette: 'Neugeborener Junge mit bilateralem Kryptorchismus, Aniridie (fehlende Iris), urogenitalen Anomalien. Mit 3 Jahren Wilms-Tumor der Niere.',
  sub: [
    { q: 'Syndrom?', choices: ['WAGR-Syndrom (del 11p13)', 'Beckwith-Wiedemann', 'Denys-Drash', 'Frasier-Syndrom'], answer: 0, explain: 'WAGR = Wilms tumor, Aniridie, Genitourinary anomalies, Retardation. Contiguous gene deletion auf 11p13.' },
    { q: 'Welche zwei Gene sind deletiert?', choices: ['PAX6 (Aniridie) und WT1 (Wilms-Tumor)', 'RB1 und TP53', 'BRCA1 und BRCA2', 'ELN und GTF2I'], answer: 0, explain: 'PAX6: Master-Regulator der Augenentwicklung → Aniridie. WT1: Tumorsuppressor → Wilms-Tumor + Urogenitalfehlbildungen.' },
    { q: 'Wie oft entwickelt sich ein Wilms-Tumor?', choices: ['~50% der WAGR-Patienten', '100%', '<5%', 'Nie bei Deletion'], answer: 0, explain: '~50% Wilms-Tumor-Risiko. Screening: Nierensonographie alle 3 Monate bis zum 8. Lebensjahr.' },
    { q: 'Was unterscheidet WAGR von isolierter Aniridie?', choices: ['WAGR hat WT1-Deletion → Tumorrisiko; isolierte Aniridie hat nur PAX6-Mutation', 'Kein Unterschied', 'Isolierte Aniridie ist schwerer', 'WAGR hat keine Aniridie'], answer: 0, explain: 'Bei Aniridie-Erstdiagnose: IMMER Array-CGH/FISH für 11p13! Wenn WT1 mitdeletiert → Wilms-Screening. Wenn nur PAX6 → kein Tumorrisiko.' },
    { q: 'Empfohlenes Tumorscreening?', choices: ['Abdomensonographie alle 3 Monate bis 8 Jahre, dann alle 6 Monate', 'Jährliches MRT', 'Kein Screening nötig', 'Nur bei Symptomen'], answer: 0, explain: '3-monatliche Nierensonographie: evidenzbasiert für Wilms-Früherkennung. Nach dem 8. Lebensjahr Risiko deutlich geringer.' }
  ]},

{ id: 24, cat: 'del', iscn: '46,XX,del(1)(p36.33)',
  vignette: 'Neugeborenes mit Mikrozephalie, prominenter Stirn, tiefliegenden Augen, Hypotonie, Herzfehler (Kardiomyopathie), Krampfanfällen.',
  sub: [
    { q: 'Diagnose?', choices: ['1p36-Deletionssyndrom', 'Wolf-Hirschhorn', 'Cri-du-chat', 'Miller-Dieker'], answer: 0, explain: '1p36-Deletion: häufigste terminale Deletion (~1:5000). Mikrozephalie + prominente Stirn + tiefliegende Augen + Kardiomyopathie.' },
    { q: 'Was ist die häufigste Herzfehlbildung?', choices: ['Dilatative Kardiomyopathie / nichtobstruktive Kardiomyopathie', 'AVSD', 'TGA', 'Pulmonalatresie'], answer: 0, explain: 'Kardiomyopathie (nicht klassische Strukturdefekte!) ist die Leit-Herzerkrankung bei 1p36. ~70% haben kardiale Beteiligung.' },
    { q: 'Wie wird die Deletion diagnostiziert?', choices: ['Array-CGH / SNP-Array (Goldstandard)', 'Nur Karyotyp', 'Exom-Sequenzierung', 'Klinisch allein'], answer: 0, explain: 'Terminale 1p36-Deletionen sind oft submikroskopisch. Array-CGH detektiert sie zuverlässig mit exakter Bruchpunkt-Kartierung.' },
    { q: 'Welche Epilepsieform ist typisch?', choices: ['Infantile Spasmen (West-Syndrom), dann oft Lennox-Gastaut', 'Nur Absencen', 'Keine Epilepsie', 'Rolandische Epilepsie'], answer: 0, explain: '~50% entwickeln Epilepsie. Häufig: infantile Spasmen → Übergang in Lennox-Gastaut. Schwer therapierbar.' },
    { q: 'Wiederholungsrisiko?', choices: ['Meist de novo (<1%); selten parentale Translokation/Inversion', '25%', '50%', 'Immer ererbt'], answer: 0, explain: 'Überwiegende Mehrheit de novo. Aber: ~5-7% aus parentalem Rearrangement → Eltern-Karyotyp + Array empfohlen.' }
  ]},

{ id: 25, cat: 'del', iscn: '46,XX,del(17)(p13.3)',
  vignette: 'Neugeborenes mit glatter Lissenzephalie (keine Gyri) im MRT, Mikrozephalie, schwerer ID, Krampfanfällen, charakteristischer Fazies.',
  sub: [
    { q: 'Diagnose?', choices: ['Miller-Dieker-Syndrom (del 17p13.3)', 'Walker-Warburg', 'Smith-Lemli-Opitz', 'Wolf-Hirschhorn'], answer: 0, explain: 'Lissenzephalie Typ 1 + Mikrozephalie + Fazies = Miller-Dieker. Deletion enthält PAFAH1B1 (LIS1) + YWHAE.' },
    { q: 'Welches Gen verursacht die Lissenzephalie?', choices: ['PAFAH1B1 (LIS1) — neuronale Migration', 'PAX6', 'NSD2', 'RAI1'], answer: 0, explain: 'LIS1 (Lissencephaly-1) ist essentiell für neuronale Migration. Haploinsuffizienz → klassische Lissenzephalie mit agyrem Cortex.' },
    { q: 'Was unterscheidet Miller-Dieker von isolierter Lissenzephalie?', choices: ['MDS hat zusätzlich YWHAE-Deletion → dysmorphe Fazies; isoliert = nur LIS1', 'Kein Unterschied', 'Isoliert ist schwerer', 'MDS hat keine Lissenzephalie'], answer: 0, explain: 'Isolierte LIS1-Mutation/Deletion: Lissenzephalie ohne Fazies. MDS: größere Deletion mit YWHAE → Fazies + meist schwerer.' },
    { q: 'Prognose?', choices: ['Schwere ID, therapieresistente Epilepsie, Lebenserwartung stark eingeschränkt', 'Normale Entwicklung', 'Mild mit Therapie', 'Nur motorische Defizite'], answer: 0, explain: 'Profunde Entwicklungsstörung, keine Sprache, schwerste Epilepsie. Mittlere Lebenserwartung ~2 Jahre, manche bis ins Jugendalter.' },
    { q: 'Welche bildgebende Methode zeigt den Befund am besten?', choices: ['MRT Schädel (fehlende Gyrierung, glatter Cortex, 4-Schichten-Cortex)', 'Röntgen Schädel', 'Sonographie allein postnatal', 'CT als Goldstandard'], answer: 0, explain: 'MRT: typisch 4-Schichten-Cortex statt 6 (fehlende neuronale Migration). Bereits pränatal im MRT erkennbar (ab ~28. SSW).' }
  ]},

// ══════════════════════════════════════════════════════════════
// INVERSIONEN + DUPLIKATIONEN (5 Fälle)
// ══════════════════════════════════════════════════════════════

{ id: 26, cat: 'dup_inv', iscn: '46,XY,inv(9)(p12q13)',
  vignette: 'Routinemäßiger pränataler Karyotyp (wegen mütterlichen Alters): perizentrische Inversion Chromosom 9. Eltern sind besorgt.',
  sub: [
    { q: 'Beratung?', choices: ['Normalvariante — klinisch nicht relevant', 'Pathologischer Befund, Abbruch empfehlen', 'Wiederholung in 4 Wochen', 'Array-CGH zwingend'], answer: 0, explain: 'inv(9)(p12q13) ist die häufigste konstitutionelle Inversion (~1-3% der Bevölkerung). Heterochromatinvariante, KEINE klinische Bedeutung.' },
    { q: 'Warum ist diese Inversion harmlos?', choices: ['Betrifft nur heterochromatisches (inaktives, repetitives) Material', 'Betrifft keine Gene', 'Ist instabil und verschwindet', 'Wird korrigiert'], answer: 0, explain: 'Chromosom 9 hat einen großen perizentrischen Heterochromatin-Block (9qh). Die Inversion verschiebt nur repetitive Sequenzen ohne Gengehalt.' },
    { q: 'Welche anderen Normalvarianten sollte man kennen?', choices: ['Heterochromatinpolymorphismen (1qh, 9qh, 16qh, Yqh), Satellitenvarianten (acrozentrische)', 'Keine weiteren existieren', 'Nur inv(9)', 'Nur Y-Polymorphismen'], answer: 0, explain: 'Häufige Normalvarianten: Heterochromatin-Größenvarianten (1qh+, 9qh+, 16qh+, Yqh+), Satellitenvarianten (acrozentrische p-Arme), inv(9).' },
    { q: 'Was wäre bei einer inv(7)(p14q36) anders?', choices: ['Euchromatin-Inversion → Rekombinationsrisiko in Meiose → unbalancierte Nachkommen möglich', 'Auch harmlos', 'Letaler Befund', 'Identisch mit inv(9)'], answer: 0, explain: 'Euchromatin-Inversionen → Inversionsschleife in Meiose → Crossing-over kann unbalancierte Rekombinanten erzeugen → dup/del-Nachkommen.' },
    { q: 'Braucht die Patientin weitere Diagnostik?', choices: ['Nein, Befund ist abschließend', 'Ja, FISH obligat', 'Ja, Array-CGH', 'Ja, WES'], answer: 0, explain: 'inv(9) ist ein Befund, kein Befundsanlass. Keine weitere Diagnostik nötig. Wichtig: klar als Normalvariante im Befund dokumentieren.' }
  ]},

{ id: 27, cat: 'dup_inv', iscn: '46,XX,inv(16)(p13.1q22)',
  vignette: 'Erwachsene mit AML, Knochenmark zeigt abnorme Eosinophile mit atypischen Granula. Zytogenetik: perizentrische inv(16).',
  sub: [
    { q: 'AML-Subtyp und Fusionsgen?', choices: ['AML M4eo (CBFB-MYH11) — günstiger Subtyp', 'AML M3 (PML-RARA)', 'AML M0', 'CML (BCR-ABL1)'], answer: 0, explain: 'inv(16) erzeugt CBFB-MYH11-Fusion: Core Binding Factor-Leukämie mit abnormen Eosinophilen. Günstige Prognose.' },
    { q: 'Warum ist die Prognose günstig?', choices: ['CBF-Leukämien sprechen exzellent auf hochdosiertes Cytarabin an', 'Spontanremission', 'Keine Chemotherapie nötig', 'Weil Eosinophile protektiv sind'], answer: 0, explain: 'CBF-AML (inv(16) und t(8;21)): ~65-70% Langzeitüberleben mit Cytarabin-Konsolidierung. Kein routinemäßiges Transplantations-Indikation in CR1.' },
    { q: 'Welche andere CBF-AML gibt es?', choices: ['t(8;21)(q22;q22.1) — RUNX1-RUNX1T1, AML M2', 'Nur inv(16)', 't(9;22)', 't(15;17)'], answer: 0, explain: 'Zwei CBF-AML: inv(16)/t(16;16) = CBFB-MYH11, und t(8;21) = RUNX1-RUNX1T1. Beide günstig, beide brauchen hochdosiertes AraC.' },
    { q: 'Ist inv(16) konstitutionell oder erworben?', choices: ['Erworben (somatisch, nur in Leukämiezellen)', 'Konstitutionell', 'Beides möglich', 'Vererbt'], answer: 0, explain: 'Somatische Mutation in der hämatopoetischen Stammzelle. Nicht in der Keimbahn, nicht vererbbar.' },
    { q: 'Monitoring nach Therapie?', choices: ['CBFB-MYH11 RT-PCR alle 3 Monate für MRD-Monitoring', 'Nur Blutbild', 'Kein Monitoring', 'Jährliche Knochenmarkpunktion'], answer: 0, explain: 'Quantitative RT-PCR für CBFB-MYH11: sensitiver als Zytogenetik für Rezidivfrüherkennung (MRD = Minimal Residual Disease).' }
  ]},

{ id: 28, cat: 'dup_inv', iscn: '47,XX,+i(12p)',
  vignette: 'Gewebespezifischer Mosaik-Befund: Hautfibroblasten zeigen extra kleines Marker-Chromosom (i(12p)), Blut-Karyotyp normal. Grobe Fazies, temporale Alopezie, schwere ID, streifige Pigmentierung.',
  sub: [
    { q: 'Diagnose?', choices: ['Pallister-Killian-Syndrom (Tetrasomie 12p mosaic)', 'Tetrasomie 9p', 'Cat-Eye-Syndrom', 'Marker 15'], answer: 0, explain: 'Pallister-Killian: mosaikale Tetrasomie 12p durch supernumeräres i(12p). Gewebslimitierter Mosaik = im Blut oft nicht nachweisbar!' },
    { q: 'Warum muss die Diagnose an Hautfibroblasten gestellt werden?', choices: ['Das i(12p) wird in Lymphozyten selektiv verloren → im Blut oft normal', 'Haut ist einfacher zu gewinnen', 'Blut ist nie diagnostisch', 'Nur weil es Routine ist'], answer: 0, explain: 'Tissue-limited mosaicism: i(12p) geht in sich schnell teilenden Zellen (Lymphozyten) verloren. Fibroblasten bewahren es. Cave: normaler Blut-Karyotyp schließt PKS nicht aus!' },
    { q: 'Was ist ein Isochromosom?', choices: ['Chromosom mit zwei identischen Armen (hier: zwei 12p-Kopien)', 'Ring-Chromosom', 'Invertiertes Chromosom', 'Translokation mit sich selbst'], answer: 0, explain: 'Isochromosom: misdivision am Centromer → statt p+q-Arm entstehen zwei identische Arme. i(12p) = doppelter 12p.' },
    { q: 'Welche Pigmentveränderung ist pathognomonisch?', choices: ['Streifige Hyper-/Hypopigmentierung entlang der Blaschko-Linien', 'Café-au-lait-Flecken', 'Vitiligo', 'Keine Pigmentstörung'], answer: 0, explain: 'Blaschko-Linien-Pigmentierung reflektiert den Mosaik-Charakter: Zellklone mit und ohne i(12p) bilden verschiedenfarbige Streifen.' },
    { q: 'Wiederholungsrisiko?', choices: ['Extrem gering (~sporadic, postzygotisch)', '25%', '50%', 'Hoch bei Verwandten'], answer: 0, explain: 'Postzygotische Entstehung des i(12p): kein familiäres Wiederholungsrisiko. Genetische Beratung: beruhigend bezüglich weiterer Schwangerschaften.' }
  ]},

{ id: 29, cat: 'dup_inv', iscn: '46,XY,dup(7)(q11.23)',
  vignette: 'Kind mit schwerer expressiver Sprachstörung, Ängstlichkeit, Autismus-Spektrum-Symptomatik, normalem IQ. Microarray: 7q11.23-Duplikation.',
  sub: [
    { q: 'Wie verhält sich dieser Phänotyp zum Williams-Syndrom?', choices: ['Gleiche Region, aber Duplikation statt Deletion → nahezu spiegelbildlicher Phänotyp', 'Identisch mit Williams', 'Kein Zusammenhang', 'Schwerer als Williams'], answer: 0, explain: 'Williams (del): hypersozial, verbale Stärke. 7q11.23 dup: Ängstlichkeit, Sprach-Expressionsdefizit. Konzept der "Genomic Mirror".' },
    { q: 'Welcher Mechanismus verursacht beides?', choices: ['NAHR zwischen den gleichen flankierenden LCRs — Deletion und Duplikation als reziproke Produkte', 'Zufällige Punktmutationen', 'Virale Integration', 'Trinukleotid-Expansion'], answer: 0, explain: 'NAHR: Non-Allelic Homologous Recombination. Die LCRs (Low Copy Repeats) flankieren ~1,5 Mb. Fehlpaarung → Deletion ODER Duplikation.' },
    { q: 'Was ist die klinische Bedeutung der Duplikation?', choices: ['Autismus-Risiko erhöht, schwere Sprach-Expressionsstörung', 'Keine klinische Bedeutung', 'Nur kosmetisch', 'Identisch mit Deletion'], answer: 0, explain: '7q11.23 dup syndrome: ~14% ASD-Diagnose. Hauptproblem: schwere expressive Sprachstörung bei oft normalem rezeptiven Verständnis.' },
    { q: 'Wie wird die Diagnose gestellt?', choices: ['Chromosomaler Microarray (Array-CGH/SNP-Array)', 'Standard-Karyotyp reicht', 'Klinisch allein', 'FISH für ELN'], answer: 0, explain: '1,5 Mb Duplikation: im Karyotyp nicht sichtbar. Array-CGH ist Goldstandard. FISH kann als Bestätigung dienen.' },
    { q: 'Vererbungsmodus?', choices: ['Autosomal dominant, ~30% de novo, ~70% ererbt (variable Expressivität!)', 'Immer de novo', 'Autosomal rezessiv', 'X-chromosomal'], answer: 0, explain: 'Wichtig: ~70% ererbt! Elternteile können milde oder keine Symptome haben (variable Expressivität). Immer Eltern testen.' }
  ]},

{ id: 30, cat: 'dup_inv', iscn: '46,XX,dup(17)(p12)',
  vignette: '6-jähriges Kind mit langsam progredienter distaler Muskelschwäche, Pes cavus (Hohlfüße), abgeschwächten Muskeleigenreflexen, verzögerter NLG.',
  sub: [
    { q: 'Diagnose?', choices: ['Charcot-Marie-Tooth 1A (CMT1A, dup 17p12)', 'Smith-Magenis-Syndrom', 'Potocki-Lupski', 'Spinale Muskelatrophie'], answer: 0, explain: 'CMT1A: häufigste hereditäre Neuropathie. 1,5 Mb Duplikation auf 17p12 enthält PMP22 (3 Kopien → Demyelinisierung).' },
    { q: 'Welches Gen ist betroffen?', choices: ['PMP22 (Peripheral Myelin Protein 22) — Gendosis-sensitiv', 'RAI1', 'SMN1', 'NF1'], answer: 0, explain: 'PMP22-Überexpression (3 statt 2 Kopien) stört die Myelinbildung. Reziproke Deletion (1 Kopie) → HNPP (Hereditary Neuropathy with Pressure Palsies).' },
    { q: 'Welche elektrophysiologische Auffälligkeit ist diagnostisch?', choices: ['Gleichmäßig verlangsamte NLG <38 m/s (demyelinisierend)', 'Normaler NLG-Befund', 'Nur sensibel betroffen', 'Fibrillationen im EMG allein'], answer: 0, explain: 'CMT1A = demyelinisierend: uniform verlangsamte motorische NLG. Unterscheidung von axonalen Formen (CMT2) durch NLG-Werte.' },
    { q: 'Was ist die reziproke Deletion (del 17p12)?', choices: ['HNPP (Hereditary Neuropathy with Pressure Palsies) — episodische Druckparesen', 'Smith-Magenis', 'CMT2', 'Keine Erkrankung'], answer: 0, explain: 'HNPP: PMP22-Haploinsuffizienz → episodische Paresen bei Druckexposition (Peroneus-Parese beim Übereinanderschlagen, Karpaltunnel). Gleicher NAHR-Mechanismus.' },
    { q: 'Vererbung?', choices: ['Autosomal dominant, hohe Penetranz, variable Expressivität', 'Autosomal rezessiv', 'X-chromosomal', 'Sporadisch immer'], answer: 0, explain: 'AD mit ~100% Penetranz aber variabler Expressivität. Einige Träger sind klinisch mild, andere schwer. De-novo-Rate ~10%.' }
  ]},

// ══════════════════════════════════════════════════════════════
// ISOCHROMOSOMEN + RINGCHROMOSOMEN (4 Fälle)
// ══════════════════════════════════════════════════════════════

{ id: 31, cat: 'iso_ring', iscn: '46,X,i(Xq)', img: 'img/quiz/case_47_iso_xq.jpg',
  vignette: 'Mädchen mit Turner-ähnlichen Merkmalen, aber größer als typisch für Turner. Karyotyp zeigt Isochromosom Xq.',
  sub: [
    { q: 'Was bedeutet i(Xq)?', choices: ['Isochromosom: Xp verloren, Xq dupliziert → nur q-Arme vorhanden', 'Inversion von Xq', 'Ring-X', 'Deletion Xq'], answer: 0, explain: 'i(Xq) = Misdivision am Centromer: Xp-Arm geht verloren, Xq-Arm wird verdoppelt. Ergebnis: Chromosom mit zwei q-Armen.' },
    { q: 'Warum ist der Phänotyp milder als 45,X?', choices: ['Nur Xp-Gene fehlen (SHOX etc.), Xq-Gene sind in 2 Kopien vorhanden', 'X-Inaktivierung kompensiert komplett', 'Zufällig', 'Kein Unterschied'], answer: 0, explain: 'Xp-Verlust erklärt Kleinwuchs (SHOX auf Xp22.33) und einige Turner-Stigmata. Aber Xq-Gene sind vorhanden → milderer Phänotyp.' },
    { q: 'Welche Turner-Stigmata sind bei i(Xq) typisch?', choices: ['Kleinwuchs (SHOX-Verlust), aber ovarielle Funktion oft besser erhalten', 'Vollständiges Turner-Bild', 'Keine Turner-Stigmata', 'Nur Herzfehler'], answer: 0, explain: 'SHOX-Haploinsuffizienz → Kleinwuchs. Ovarielle Reserve manchmal besser als bei 45,X. Herzfehler-Risiko wie bei 45,X.' },
    { q: 'Ist i(Xq) häufig unter Turner-Varianten?', choices: ['Ja, ~15-20% aller Turner-Karyotypen', 'Extrem selten (<1%)', '50%', 'Nur bei Mosaik'], answer: 0, explain: '45,X = ~50%, Mosaike ~30%, i(Xq) ~15-20%. Gehört zu den häufigsten Turner-Varianten.' },
    { q: 'Besteht ein Gonadoblastom-Risiko?', choices: ['Nein — kein Y-Material vorhanden', 'Ja', 'Nur bei Mosaik', 'Immer'], answer: 0, explain: 'Gonadoblastom-Risiko nur bei Y-Material (kryptisch oder offen). i(Xq) hat kein Y → kein Gonadoblastom-Risiko.' }
  ]},

{ id: 32, cat: 'iso_ring', iscn: '46,XY,r(13)', img: 'img/quiz/case_48_ring_chr.jpg',
  vignette: 'Neugeborener mit Wachstumsretardierung, Mikrozephalie, Hypertelorismus, Analatresie, Holoprosenzephalie-Spektrum.',
  sub: [
    { q: 'Wie entsteht ein Ringchromosom?', choices: ['Beide Arm-Enden brechen, klebrige Enden fusionieren → Ring + Verlust des terminalen Materials', 'Zentromerteilung', 'Translokation mit sich selbst', 'Trinukleotid-Expansion'], answer: 0, explain: 'Bruch in p und q → terminale Fragmente gehen verloren → freie Enden ligieren zum Ring. Phänotyp = terminale Deletion beider Arme.' },
    { q: 'Welches Problem verursachen Ringchromosomen in der Mitose?', choices: ['Ringinstabilität: Schwesterchromatiden-Austausch → interlocked Ringe → Mosaik', 'Keine mitotischen Probleme', 'Schnellere Replikation', 'Bevorzugte Segregation'], answer: 0, explain: 'Mitotische Instabilität: SCE in Ringen → dizentrischer Ring → Bruch → Monosomie/sekundäre Deletionen → somatischer Mosaik.' },
    { q: 'Warum ähnelt r(13) partiell der Trisomie 13?', choices: ['Falsch — r(13) ähnelt einer 13q-Deletion (Material geht verloren)', 'Weil zusätzliches Material vorhanden ist', 'Durch Mosaikeffekte', 'Zufällige Ähnlichkeit'], answer: 0, explain: 'r(13) = terminale Deletion 13p + 13q. Holoprosenzephalie-Spektrum durch ZIC2/SHH-Region-Verlust auf 13q.' },
    { q: 'Wie ist die Prognose?', choices: ['Variabel — abhängig von der Menge des verlorenen Materials und dem Mosaikgrad', 'Immer letal', 'Immer normal', 'Wie Trisomie 13'], answer: 0, explain: 'Große Deletionen = schwerer. Kleine Ringe mit wenig Materialverlust + Mosaik = milder. Sehr variable Expressivität.' },
    { q: 'Diagnostik?', choices: ['Karyotyp zeigt den Ring + Array-CGH für exakte Bruchpunkte', 'Nur Array reicht', 'Nur klinisch', 'FISH allein'], answer: 0, explain: 'Karyotyp: Ring-Struktur sichtbar. Array-CGH: exakte Bruchpunkte und deletiertes Material. Beides komplementär.' }
  ]},

{ id: 33, cat: 'iso_ring', iscn: '45,X/46,X,r(X)',
  vignette: 'Mädchen mit Turner-Stigmata UND schwerer Intelligenzminderung (ungewöhnlich für Turner!). Karyotyp: Mosaik 45,X/46,X,r(X).',
  sub: [
    { q: 'Warum ist die ID schwerer als bei typischem Turner?', choices: ['r(X) kann XIST verloren haben → keine Inaktivierung → funktionelle Disomie von X-Genen', 'Turner hat immer schwere ID', 'Durch den Ring selbst', 'Zufallsbefund'], answer: 0, explain: 'Wenn r(X) das XIST-Zentrum verliert → kein X-Inaktivierung → biallelische Expression vieler X-Gene → schwerer Phänotyp.' },
    { q: 'Welcher Test klärt die Ursache?', choices: ['FISH für XIST-Locus auf dem Ring-X', 'Nur Standard-Karyotyp', 'Array allein', 'Blutbild'], answer: 0, explain: 'FISH oder Array: Ist XIST auf dem r(X) vorhanden? Wenn ja → Inaktivierung möglich → milder. Wenn nicht → funktionelle Disomie → schwer.' },
    { q: 'Besteht ein Gonadoblastom-Risiko?', choices: ['Nur wenn kryptisches Y-Material auf dem Ring nachweisbar', 'Immer', 'Nie bei Ring', 'Nur bei 45,X-Zellen'], answer: 0, explain: 'r(X) selbst enthält kein Y → kein Gonadoblastom-Risiko. Aber: immer SRY-FISH durchführen um kryptisches Y auszuschließen!' },
    { q: 'Ist die Epilepsie häufig bei r(X) ohne XIST?', choices: ['Ja — schwere Epilepsie ist Teil des funktionell-disomen Phänotyps', 'Nein', 'Nur bei Jungen', 'Nur bei großem Ring'], answer: 0, explain: 'XIST-negative r(X): schwere ID + therapieresistente Epilepsie + multiple Fehlbildungen = viel schwerer als Standard-Turner.' },
    { q: 'Beratung?', choices: ['Prognose abhängig von XIST-Status; ohne XIST deutlich schwerer als 45,X allein', 'Wie normaler Turner', 'Kein Beratungsbedarf', 'Normale Entwicklung zu erwarten'], answer: 0, explain: 'Entscheidend: XIST-Nachweis auf r(X). Mit XIST → eher Turner-ähnlich. Ohne XIST → schwere Entwicklungsstörung.' }
  ]},

{ id: 34, cat: 'iso_ring', iscn: '47,XY,+mar',
  vignette: 'Pränataler Karyotyp: 47 Chromosomen mit extra kleinem Marker-Chromosom unbekannter Herkunft.',
  sub: [
    { q: 'Welcher nächste diagnostische Schritt?', choices: ['Chromosomaler Microarray (Array-CGH/SNP-Array) zur Identifikation des Markers', 'Abwarten bis Geburt', 'Sofort Abbruch', 'Wiederholung des Karyotyps allein'], answer: 0, explain: 'Array-CGH identifiziert chromosomale Herkunft und Gengehalt des Markers. Entscheidend für Prognose und Beratung.' },
    { q: 'Von welchem Chromosom stammen die meisten sSMC?', choices: ['Chromosom 15 (am häufigsten)', 'Chromosom 1', 'Y', 'Chromosom 22'], answer: 0, explain: '~30% der sSMC stammen von Chromosom 15. Wichtig: enthält er den PWS/AS-kritischen Bereich? inv dup(15) = Tetrasomie 15q11.' },
    { q: 'Welche Information ist entscheidend für die Beratung?', choices: ['Enthält der Marker Euchromatin (Gene) oder nur Heterochromatin?', 'Nur die Größe zählt', 'Nur ob er de novo ist', 'Kein Faktor ist entscheidend'], answer: 0, explain: 'Euchromatin-haltige Marker → klinische Auswirkung wahrscheinlich. Rein heterochromatische Marker → meist harmlos. Array-CGH differenziert.' },
    { q: 'Welche Rolle spielt der Eltern-Karyotyp?', choices: ['Familiärer Marker (Elternteil gesund) = günstig; de novo = unsicherer', 'Eltern-Karyotyp irrelevant', 'Nur Mutter testen', 'Nur wenn Kind symptomatisch'], answer: 0, explain: 'Familiär: Elternteil hat gleichen Marker und ist gesund → sehr günstig. De novo: Prognose unsicher, abhängig von Gengehalt.' },
    { q: 'Häufigkeit von sSMC?', choices: ['~0.04% aller Lebendgeburten, ~0.08% bei Amniozentesen', '1:100', '1:1.000.000', 'Extrem häufig'], answer: 0, explain: '~1:2500 in Amniozentesen. In ~70% klinisch unauffällig (besonders wenn familiär oder rein heterochromatisch).' }
  ]},

// ══════════════════════════════════════════════════════════════
// TRANSLOKATIONEN — KONSTITUTIONELL (3 Fälle)
// ══════════════════════════════════════════════════════════════

{ id: 35, cat: 'recip', iscn: '46,XY,t(11;22)(q23;q11.2)',
  vignette: 'Gesunder Erwachsener, balancierte reziproke Translokation t(11;22). Rezidivierende Aborte, ein Kind mit Emanuel-Syndrom.',
  sub: [
    { q: 'Warum ist t(11;22) die häufigste konstitutionelle reziproke Translokation?', choices: ['Palindromische AT-reiche Sequenzen (PATRR) an beiden Bruchpunkten begünstigen de-novo-Entstehung', 'Zufall', 'Founder-Effekt', 'Weil sie häufig getestet wird'], answer: 0, explain: 'PATRR (Palindromic AT-Rich Repeats) auf 11q23 und 22q11.2 bilden Haarnadelstrukturen → DNA-Brüche → reziproke Translokation.' },
    { q: 'Was ist das Emanuel-Syndrom?', choices: ['Unbalanciert: supernumeräres der(22) → partielle Trisomie 11q23 + 22pter-q11.2', 'Balancierte Translokation', 'Identisch mit DiGeorge', 'Nur Carrier-Status'], answer: 0, explain: 'Unbalancierte Segregation: Kind erbt der(22) + normale 11 + normale 22 → Trisomie für Teile von 11q und 22q. Schwere ID, Herzfehler.' },
    { q: 'Segregationsmuster bei reziproker Translokation?', choices: ['Adjacent-1, Adjacent-2, Alternate, 3:1 — nur Alternate ist balanciert', 'Immer 50:50 balanciert', 'Nur 2 Möglichkeiten', 'Keine Segregationsprobleme'], answer: 0, explain: 'Quadrivalent in Meiose I: Alternate (balanciert/normal), Adjacent-1 (unbal.), Adjacent-2 (unbal.), 3:1 (unbal.). Meist Adjacent-1 am häufigsten.' },
    { q: 'Risiko für unbalancierte Nachkommen?', choices: ['~5-10% Lebendgeburt-Risiko für Emanuel-Syndrom', '50%', '0%', '25%'], answer: 0, explain: 'Theoretisch ~50% unbalanciert, aber die meisten sind letal. Empirisches Risiko für Lebendgeburt mit Emanuel: ~5-10%.' },
    { q: 'Therapieoption bei Kinderwunsch?', choices: ['PGT-SR (Präimplantationsdiagnostik) oder PND (Amniozentese/CVS)', 'Keine Optionen', 'Nur Spontanzeugung', 'Gentherapie'], answer: 0, explain: 'PGT-SR: IVF + Biopsie + Array → nur balancierte/normale Embryonen übertragen. Alternativ: PND bei jeder Schwangerschaft.' }
  ]},

{ id: 36, cat: 'recip', iscn: '46,XX,t(4;11)(q21;q23)',
  vignette: 'Säugling mit Leukämie: extreme Leukozytose, ZNS-Beteiligung, sehr schlechte Prognose.',
  sub: [
    { q: 'Welches Gen ist rearrangiert?', choices: ['KMT2A (MLL) auf 11q23 — fusioniert mit AFF1 (AF4) auf 4q21', 'BCR-ABL1', 'PML-RARA', 'ETV6-RUNX1'], answer: 0, explain: 'KMT2A (MLL)-Rearrangements auf 11q23: >130 bekannte Fusionspartner. t(4;11) → KMT2A-AFF1 = häufigste bei Infant-ALL.' },
    { q: 'Warum ist die Prognose bei Säuglings-ALL mit KMT2A besonders schlecht?', choices: ['Schnelle Proliferation, hohe Leukozytenzahl, ZNS-Beteiligung, Chemoresistenz', 'Weil es eine T-ALL ist', 'Weil Säuglinge Chemotherapie nicht vertragen', 'Spontanremission verhindert Therapie'], answer: 0, explain: '5-Jahres-Überleben <40% bei Infant-ALL mit KMT2A. Hohe Leukozytenzahl, häufig ZNS positiv, oft Chemoresistenz. Stammzelltransplantation in CR1 diskutiert.' },
    { q: 'Welcher Immunphänotyp ist typisch?', choices: ['Pro-B-ALL (CD19+, CD10-, unreif)', 'Reife B-ALL (Burkitt-Typ)', 'T-ALL', 'AML'], answer: 0, explain: 'KMT2A-rearrangierte ALL: typisch pro-B (unreif), CD10-negativ, oft mit myeloischen Ko-Markern (CD15, CD65). "Mixed phenotype" möglich.' },
    { q: 'Entsteht diese Leukämie in utero?', choices: ['Ja, nachgewiesen durch Guthrie-Karten-Analyse und Zwillingsstudien', 'Nein, immer postnatal', 'Nur bei Frühgeborenen', 'Unbekannt'], answer: 0, explain: 'Backtracking-Studien: KMT2A-Fusion oft bereits auf neonataler Guthrie-Karte nachweisbar. Pränataler Ursprung, sehr kurze Latenz.' },
    { q: 'Gibt es eine Assoziation mit Topoisomerase-II-Hemmern?', choices: ['Ja, sekundäre AML/ALL mit 11q23/KMT2A nach Etoposid/Doxorubicin', 'Nein', 'Nur bei Erwachsenen', 'Nur bei Alkylantien'], answer: 0, explain: 'Topoisomerase-II-Inhibitoren (Etoposid) verursachen DNA-Doppelstrangbrüche bevorzugt an MLL/KMT2A → therapiebedingte Leukämie mit kurzer Latenz (~2 Jahre).' }
  ]},

{ id: 37, cat: 'rob', iscn: '45,XX,rob(13;13)(q10;q10)',
  vignette: 'Gesunde Frau, Karyotyp nach 5 Spontanaborten: 45,XX,rob(13;13). Genetische Beratung bezüglich Kinderwunsch.',
  sub: [
    { q: 'Warum ist rob(13;13) besonders problematisch?', choices: ['Homologe Robertsonsche: JEDER Gamet ist unbalanciert → 100% abnormale Nachkommen', 'Wie jede Robertsonsche', 'Harmlos', 'Nur 50% Risiko'], answer: 0, explain: 'rob(13;13) produziert nur Gameten mit Disomie 13 oder Nullisomie 13. Keine normalen/balancierten Gameten möglich!' },
    { q: 'Was ist der Unterschied zu rob(13;14)?', choices: ['rob(13;14) hat heterologe Partner → alternate Segregation liefert auch normale/balancierte Gameten', 'Kein Unterschied', 'rob(13;14) ist schlimmer', 'rob(13;13) ist milder'], answer: 0, explain: 'Heterologe rob (verschiedene Chromosomen): alternate Segregation → normale + balancierte Gameten möglich. Homologe rob: unmöglich.' },
    { q: 'Welche Nachkommen können geboren werden?', choices: ['Nur Trisomie 13 (Patau) oder Abort (Monosomie 13 ist letal)', 'Normale Kinder möglich', '50% normal', '25% normal'], answer: 0, explain: 'Disomie 13 im Gamet + Partner → Trisomie 13 (Patau). Nullisomie 13 + Partner → Monosomie 13 (letal). Kein normaler Ausgang.' },
    { q: 'Was empfehlen Sie?', choices: ['Eizellspende oder Adoption — eigene Eizellen führen IMMER zu abnormalem Ausgang', 'Spontan versuchen', 'PGT-SR kann helfen', 'IVF ohne PGT'], answer: 0, explain: 'Bei homologer rob: keine eigenen balancierten Gameten möglich. PGT-SR kann hier NICHT helfen. Einzige Option: Spender-Keimzellen oder Adoption.' },
    { q: 'Wie entsteht eine homologe Robertsonsche?', choices: ['Isochromosom-Bildung oder sehr frühe postzygotische Rearrangement', 'Eltern haben heterologe rob', 'Durch Strahlung', 'Häufige Variante'], answer: 0, explain: 'Meist durch Isochromosom-Bildung (Misdivision): zwei identische q-Arme eines akrozentrischen. Selten: UPD + Trisomie-Rescue.' }
  ]},

// ══════════════════════════════════════════════════════════════
// SPEZIALFÄLLE + SELTENE (13 Fälle)
// ══════════════════════════════════════════════════════════════

{ id: 38, cat: 'num_auto', iscn: '92,XXYY',
  vignette: 'Hydatiforme-Molen-ähnlicher Befund, schwere IUGR, multiple Fehlbildungen im Ultraschall. Karyotyp: 92,XXYY.',
  sub: [
    { q: 'Was ist dieser Karyotyp?', choices: ['Tetraploidie (4n = 92)', 'Triploidie', 'Mosaik-Trisomie', 'Normale Variante'], answer: 0, explain: 'Tetraploidie: 4 vollständige Chromosomensätze. Meist durch Cytokinese-Versagen nach erster Zellteilung.' },
    { q: 'Ist Tetraploidie mit dem Leben vereinbar?', choices: ['Nein, immer letal in utero', 'Ja, mit schwerer Behinderung', 'Ja, bei Mosaik', 'Ja, wie Triploidie'], answer: 0, explain: 'Vollständige Tetraploidie ist immer letal. Diploid/Tetraploid-Mosaike sind extrem selten dokumentiert.' },
    { q: 'Wie unterscheidet man Tetraploidie von Triploidie im Ultraschall?', choices: ['Schwierig — beides schwere IUGR + Fehlbildungen; Karyotyp entscheidend', 'Am Plazentabefund', 'Am fetalen Geschlecht', 'Durch Doppler allein'], answer: 0, explain: 'Ultraschall allein kann nicht zuverlässig differenzieren. Karyotyp (Amniozentese oder CVS) ist der Goldstandard.' },
    { q: 'Häufigster Mechanismus?', choices: ['Endoreplikation (DNA-Verdopplung ohne Zellteilung) in der Zygote', 'Dispermie', 'Digynie', 'Strahlung'], answer: 0, explain: 'Meist Endoreplikation: Zygote verdoppelt DNA, teilt sich aber nicht → tetraploide Zelle. Seltener: Fusion zweier Zygoten.' },
    { q: 'Wiederholungsrisiko?', choices: ['Extrem gering (sporadic)', '25%', '50%', 'Hoch'], answer: 0, explain: 'Sporadisches Ereignis. Kein erhöhtes Wiederholungsrisiko. Beruhigende Beratung.' }
  ]},

{ id: 39, cat: 'num_auto', iscn: '47,XY,+22',
  vignette: 'Rezidivierender Abort im 1. Trimenon. POC-Karyotyp: Trisomie 22.',
  sub: [
    { q: 'Klinische Bedeutung?', choices: ['Häufige Abortursache; vollständige Trisomie 22 ist nicht lebensfähig', 'Lebensfähig mit schwerer ID', 'Normvariante', 'Häufig bei Lebendgeborenen'], answer: 0, explain: 'Trisomie 22 ist die zweithäufigste autosomale Trisomie bei Spontanaborten (nach Trisomie 16). Nicht mit postnatalem Leben vereinbar.' },
    { q: 'Gibt es lebensfähige Formen?', choices: ['Ja, Mosaik-Trisomie 22 (selten) und Cat-Eye-Syndrom (partielle Tetrasomie 22)', 'Nein, nie', 'Ja, alle Formen', 'Nur bei Mädchen'], answer: 0, explain: 'Mosaik-Trisomie 22 und Cat-Eye-Syndrom (inv dup(22)(q11.2) → Tetrasomie 22pter-q11.2) sind lebensfähige Varianten.' },
    { q: 'Was ist das Cat-Eye-Syndrom?', choices: ['Partielle Tetrasomie 22: extra bisatellitiertes Marker aus inv dup(22) → Kolobom, Anal-atresie, Herzfehler', 'Katzenschrei', 'Trisomie 22 allein', 'X-chromosomal'], answer: 0, explain: 'Cat-Eye: vertikales Iris-Kolobom (Katzenaugen-Effekt) + Analaltresie + Herzfehler. Durch supernumeräres inv dup(22)(q11.2).' },
    { q: 'Wiederholungsrisiko nach Trisomie-22-Abort?', choices: ['Gering (~sporadic), aber Karyotyp der Eltern empfohlen', '25%', '50%', '0%'], answer: 0, explain: 'Meist sporadic non-disjunction. Bei rezidivierenden Aborten: Eltern-Karyotyp zum Ausschluss balancierter Translokation.' },
    { q: 'Was ist der häufigste Abortus-Karyotyp überhaupt?', choices: ['Trisomie 16 (häufigste Einzeldiagnose); Monosomie X häufigste Gesamt', '45,X', 'Trisomie 21', 'Tetraploidie'], answer: 0, explain: 'Trisomie 16 = häufigste autosomale Trisomie bei Aborten. 45,X = insgesamt häufigste Einzelanomalie in Spontanaborten (~20%).' }
  ]},

{ id: 40, cat: 'num_sex', iscn: '48,XXYY',
  vignette: 'Hochgewachsener Mann mit ID, Hypogonadismus, dysmorpher Fazies, mildem Klinefelter-ähnlichem Phänotyp aber schwerer.',
  sub: [
    { q: 'Karyotyp?', choices: ['48,XXYY', '47,XXY', '49,XXXYY', '47,XYY'], answer: 0, explain: '48,XXYY: Kombination aus Features von Klinefelter (extra X) und XYY (extra Y). Seltener als 47,XXY.' },
    { q: 'Wie unterscheidet sich 48,XXYY von 47,XXY?', choices: ['Schwerere ID, ausgeprägtere Verhaltensauffälligkeiten, Hypogonadismus ähnlich', 'Identisch', 'Milder', 'Nur Hochwuchs'], answer: 0, explain: '48,XXYY: stärkere kognitive Einschränkung (mittlere IQ ~70-80), mehr Verhaltensauffälligkeiten (Aggression, ADHS) als 47,XXY.' },
    { q: 'Fertilitätsprognose?', choices: ['Infertil (Azoospermie, wie Klinefelter aber TESE seltener erfolgreich)', 'Normal fertil', 'Reduziert aber möglich', 'Nur mit Hormontherapie'], answer: 0, explain: 'Schwerer Hypogonadismus, Azoospermie. TESE weniger erfolgreich als bei 47,XXY. Testosteron-Substitution trotzdem indiziert.' },
    { q: 'Häufigkeit?', choices: ['~1:18.000-40.000 männliche Geburten', '~1:1000', '~1:100.000', 'Extrem selten (<1:1.000.000)'], answer: 0, explain: 'Seltener als 47,XXY (~1:660) und 47,XYY (~1:1000), aber häufiger als 49,XXXXY.' },
    { q: 'Entstehungsmechanismus?', choices: ['Non-disjunction in Meiose I (paternal: XY → XY-Gamet) + maternale Non-disjunction oder umgekehrt', 'Nur maternale Non-disjunction', 'Mitotisch postzygotisch', 'Immer de novo'], answer: 0, explain: 'Erfordert zwei Non-disjunction-Ereignisse: eines liefert XXY, das andere YY. Komplexe Meiose-Fehler in beiden Keimzellen.' }
  ]},

{ id: 41, cat: 'num_sex', iscn: '49,XXXXY',
  vignette: 'Junge mit schwerer ID, charakteristischer Fazies (Hypertelorismus, flache Nasenwurzel), Hypogonadismus, radioulnarer Synostose, Mikrozephalie.',
  sub: [
    { q: 'Karyotyp?', choices: ['49,XXXXY (Fraccaro-Syndrom)', '47,XXY', '48,XXXY', 'Triple X'], answer: 0, explain: '49,XXXXY: schwerste X-Aneuploidie beim Mann. Jedes zusätzliche X: ~15-16 IQ-Punkte Reduktion.' },
    { q: 'Pathognomonisches Skelettmerkmal?', choices: ['Radioulnare Synostose (Fusion Radius-Ulna)', 'Polydaktylie', 'Skoliose', 'Syndaktylie'], answer: 0, explain: 'Radioulnare Synostose: ~60-70% der 49,XXXXY-Fälle. Eingeschränkte Pro-/Supination. Auch bei 48,XXXY.' },
    { q: 'Wie viele Barr-Körperchen hat dieser Patient?', choices: ['3 (n-1 Regel: 4 X-Chromosomen, davon 3 inaktiviert)', '1', '2', '4'], answer: 0, explain: 'n-1 Regel: Anzahl Barr-Körperchen = Anzahl X minus 1. Bei XXXXY: 4 X, 3 inaktiv = 3 Barr-Körperchen.' },
    { q: 'Warum trotz X-Inaktivierung ein Phänotyp?', choices: ['PAR-Gene und ~15% der X-Gene entgehen der Inaktivierung (Escape-Gene)', 'X-Inaktivierung ist komplett', 'Nur während Embryogenese aktiv', 'XIST fehlt'], answer: 0, explain: 'Pseudoautosomal Region (PAR) Gene + ~15% Escape-Gene = Gendosis-Effekt proportional zur X-Zahl. Mehr X = schwererer Phänotyp.' },
    { q: 'Differentialdiagnose zum Down-Syndrom bei Neugeborenen?', choices: ['Überlappende Fazies möglich; Karyotyp klärt — bei V.a. Down immer Karyotyp, nicht nur FISH für 21', 'Keine Überlappung', 'Nur klinisch unterscheidbar', 'MRT unterscheidet'], answer: 0, explain: 'Neonatale Fazies kann Down ähneln. CAVE: FISH nur für Trisomie 21 würde XXXXY verpassen! Immer vollständigen Karyotyp anfordern.' }
  ]},

{ id: 42, cat: 'num_auto', iscn: '47,XX,+16',
  vignette: 'Spontanabort in der 8. SSW. Karyotyp der Abortgewebe.',
  sub: [
    { q: 'Häufigste autosomale Trisomie bei Spontanaborten?', choices: ['Trisomie 16', 'Trisomie 21', 'Trisomie 13', 'Trisomie 22'], answer: 0, explain: 'Trisomie 16: ~1% aller Konzeptionen, häufigste autosomale Trisomie überhaupt. Aber: IMMER letal, nie als Lebendgeburt.' },
    { q: 'Gibt es lebensfähige Formen?', choices: ['Nur als Mosaik extrem selten beschrieben, nie als volle Trisomie', 'Ja, häufig', 'Nein, nie in keiner Form', 'Ja, mit Therapie'], answer: 0, explain: 'Mosaik-Trisomie 16 (16/46): sehr selten, IUGR, Herzfehler, variable Prognose. Kann aus Trisomy Rescue entstehen (→ UPD 16 cave!).' },
    { q: 'Was ist ein "Trisomy Rescue"?', choices: ['Trisome Zygote verliert ein Chromosom postzygotisch → 2 normale + UPD-Risiko', 'Therapeutische Intervention', 'Spontane Heilung', 'Externe Korrektur'], answer: 0, explain: 'Trisomy Rescue: postzygotischer Verlust des überzähligen Chromosoms. 1/3 Chance → UPD (beide Kopien vom gleichen Elternteil). Bei Chr 16: maternale UPD → IUGR.' },
    { q: 'Welche Komplikation droht bei Mosaik-Trisomie 16 durch Trisomy Rescue?', choices: ['Maternale UPD 16 → IUGR, Präeklampsie', 'Keine', 'Paternale UPD', 'Nur Fehlbildungen'], answer: 0, explain: 'UPD(16)mat: assoziiert mit schwerer IUGR und Präeklampsie, auch ohne Mosaik-Anteile im Kind. Imprintete Region auf Chr 16.' },
    { q: 'Beratung nach Trisomie-16-Abort?', choices: ['Sporadic, niedriges Wiederholungsrisiko, beruhigende Beratung', '25% Wiederholung', 'Hohe Wiederholung', 'Nie wieder schwanger werden'], answer: 0, explain: 'Sporadische Non-disjunction. Wiederholungsrisiko nicht erhöht. Einfühlsame Beratung: die Häufigkeit von Trisomie 16 ist "normal".' }
  ]},

{ id: 43, cat: 'num_auto', iscn: '46,XX/47,XX,+21',
  vignette: 'Mädchen mit milden Down-Merkmalen, nahezu normaler Intelligenz. FISH zeigt Trisomie 21 in 30% der Zellen.',
  sub: [
    { q: 'Bezeichnung?', choices: ['Mosaik-Down-Syndrom', 'Translokations-Down', 'Uniparentale Disomie 21', 'Partielle Trisomie 21'], answer: 0, explain: 'Mosaik: 46,XX/47,XX,+21 — zwei Zelllinien. Phänotyp korreliert (grob) mit dem Anteil trisomer Zellen.' },
    { q: 'Wie entsteht Mosaik-Trisomie 21?', choices: ['Postzygotische Non-disjunction (mitotisch) oder Trisomy Rescue', 'Meiotisch', 'Immer ererbt', 'Durch Umweltfaktoren'], answer: 0, explain: 'Zwei Wege: 1. Normale Zygote → mitotische Non-disjunction → Mosaik. 2. Trisome Zygote → Verlust des extra Chr21 in einer Zelllinie (Rescue).' },
    { q: 'Korreliert der Anteil trisomer Zellen mit der Schwere?', choices: ['Grob ja, aber die Gewebeverteilung ist wichtiger als der Blut-Anteil', 'Perfekte Korrelation', 'Keine Korrelation', 'Nur im Gehirn relevant'], answer: 0, explain: 'Blut-Mosaik ≠ Gehirn-Mosaik. Daher: klinischer Phänotyp nicht exakt aus dem Blut-Anteil vorhersagbar.' },
    { q: 'Wiederholungsrisiko?', choices: ['Sehr gering (<1%), da postzygotisch entstanden', 'Wie bei freier Trisomie 21', '25%', '50%'], answer: 0, explain: 'Postzygotische Entstehung = kein erhöhtes Keimzell-Risiko. Deutlich niedriger als bei freier Trisomie 21.' },
    { q: 'Klinische Konsequenz der milderen Ausprägung?', choices: ['Bessere kognitive Prognose, aber ALLE Screening-Programme wie bei Voll-Down durchführen', 'Kein Screening nötig', 'Identisch mit Voll-Trisomie', 'Nur kardiales Screening'], answer: 0, explain: 'Auch Mosaik-Down kann Herzfehler, Hypothyreose, atlantoaxiale Instabilität haben. Alle Standard-Down-Screenings durchführen!' }
  ]},

{ id: 44, cat: 'rob', iscn: '46,XY,rob(14;21)(q10;q10),+21', img: 'img/quiz/case_10_down_translocation.png',
  vignette: 'Junge mit Down-Syndrom-Merkmalen. Karyotyp: 46 Chromosomen (nicht 47!) aber rob(14;21) plus freie 21.',
  sub: [
    { q: 'Warum 46 Chromosomen bei Down?', choices: ['Das rob(14;21) ersetzt Chr 14 + Chr 21 (= 45), plus freie 21 = 46 total, aber trisom für 21q', 'Laborartefakt', 'Mosaik', 'Kein echtes Down'], answer: 0, explain: 'rob(14;21) = Fusion → zählt als 1 Chromosom (statt 2). 45 + freie 21 = 46 total. Aber 21q-Material liegt 3× vor = funktionelle Trisomie 21.' },
    { q: 'Nächster obligater Schritt?', choices: ['Karyotyp BEIDER Eltern — ist ein Elternteil balancierter Träger?', 'Keine weitere Diagnostik', 'Array-CGH des Kindes', 'Nur klinische Verlaufskontrolle'], answer: 0, explain: 'Entscheidend: Wenn ein Elternteil bal. rob(14;21) Träger → hohes Wiederholungsrisiko + Familienscreening! Wenn de novo → niedrigeres Risiko.' },
    { q: 'Wiederholungsrisiko wenn Mutter Trägerin?', choices: ['~10-15%', '~1%', '50%', '100%'], answer: 0, explain: 'Mütterliche Trägerinnen: ~10-15% empirisches Risiko. Väterliche Träger: ~1-2%. Geschlechtsspezifischer Unterschied!' },
    { q: 'Was muss man bei ALLEN Translokations-Down-Familien tun?', choices: ['Kaskadenscreening: alle Verwandten 1. Grades des Träger-Elternteils karyotypisieren', 'Nur die Eltern testen', 'Niemanden testen', 'Nur das Kind verfolgen'], answer: 0, explain: 'Kaskadenscreening: Geschwister des Trägers könnten ebenfalls Träger sein → eigenes Reproduktionsrisiko! Genetische Beratung für alle.' },
    { q: 'Phänotypischer Unterschied zu freier Trisomie 21?', choices: ['Kein Unterschied — klinisch identisch', 'Milder', 'Schwerer', 'Ohne Herzfehler'], answer: 0, explain: 'Phänotypisch nicht unterscheidbar. Der Unterschied ist rein zytogenetisch mit Auswirkungen auf Wiederholungsrisiko und Familienberatung.' }
  ]},

{ id: 45, cat: 'num_sex', iscn: '49,XXXXX', img: 'img/quiz/case_19_pentasomy_x.png',
  vignette: 'Neugeborenes Mädchen mit schwerer Hypotonie, Mikrozephalie, multiplen Skelettanomalien, Herzfehler, schwerer ID.',
  sub: [
    { q: 'Karyotyp?', choices: ['49,XXXXX (Pentasomie X)', '47,XXX', '48,XXXX', '45,X'], answer: 0, explain: 'Pentasomie X: extrem selten. Jedes zusätzliche X addiert ~15 IQ-Punkte Reduktion → bei 5X massive Beeinträchtigung.' },
    { q: 'Wie viele Barr-Körperchen?', choices: ['4 (n-1 Regel)', '1', '2', '5'], answer: 0, explain: 'n-1 = 5-1 = 4 Barr-Körperchen. Maximale Zahl bei biologisch dokumentierten Fällen.' },
    { q: 'Warum wird der Phänotyp mit jeder Kopie schwerer?', choices: ['Escape-Gene werden proportional zur X-Zahl überexprimiert', 'Jedes X wird vollständig exprimiert', 'X-Inaktivierung funktioniert nicht', 'Nur SHOX-Effekt'], answer: 0, explain: '~15% der X-Gene entkommen der Inaktivierung. Bei 5 Kopien: 5× Expression dieser Gene statt 2× → dosisabhängiger Schweregrad.' },
    { q: 'Fertilität?', choices: ['Infertil — schwere Gonadendysgenesie', 'Normal fertil', 'Reduziert aber möglich', 'Nur mit IVF'], answer: 0, explain: 'Schwere Gonadendysgenesie: streifenförmige Gonaden, primäre Amenorrhoe, keine Pubertät ohne Substitution.' },
    { q: 'Häufigkeit?', choices: ['<100 Fälle weltweit beschrieben', '1:1000', '1:10.000', '1:100.000'], answer: 0, explain: 'Extrem selten: weniger als 100 Fälle in der Literatur. Jeder Fall ist eine Einzelbeobachtung.' }
  ]},

{ id: 46, cat: 'del', iscn: '46,XY,del(22)(q11.2)',
  vignette: '25-jähriger Patient mit bekanntem 22q11.2-Deletionssyndrom (DiGeorge), jetzt erstmals psychotische Symptome (Stimmenhören, Wahnideen).',
  sub: [
    { q: 'Wie hoch ist das Schizophrenie-Risiko bei 22q11.2-Deletion?', choices: ['25-30% (stärkster bekannter genetischer Risikofaktor)', '1% wie in der Allgemeinbevölkerung', '50%', '100%'], answer: 0, explain: '22q11.2-Deletion: 25-30× erhöhtes Schizophrenie-Risiko. ~25-30% entwickeln eine schizophrenieforme Psychose, meist im jungen Erwachsenenalter.' },
    { q: 'Welches Gen in der Deletion ist am stärksten mit Schizophrenie assoziiert?', choices: ['COMT (Catechol-O-Methyltransferase) — Dopamin-Abbau', 'TBX1', 'ELN', 'PAX6'], answer: 0, explain: 'COMT-Haploinsuffizienz → veränderter Dopamin-Metabolismus im präfrontalen Cortex. Diskutiert als Mediator der Psychose-Anfälligkeit.' },
    { q: 'Unterscheidet sich die Schizophrenie klinisch von idiopathischer Schizophrenie?', choices: ['Phänomenologisch ähnlich, aber oft milderer Verlauf und besseres Ansprechen', 'Identisch', 'Viel schwerer', 'Keine echte Schizophrenie'], answer: 0, explain: 'Klinisch wie Schizophrenie (Positivsymptome, Negativsymptome), aber tendenziell besser behandelbar. Wichtig: nicht als "organische Psychose" bagatellisieren.' },
    { q: 'Welche psychiatrische Komorbidität ist ebenfalls häufig?', choices: ['Angststörungen und ADHS (~30-40%)', 'Nur Depression', 'Keine Komorbidität', 'Nur Psychose'], answer: 0, explain: 'Angststörungen: ~30-40%, ADHS: ~30-40%, ASD: ~15-20%. Die psychiatrische Morbidität ist insgesamt sehr hoch und erfordert interdisziplinäre Betreuung.' },
    { q: 'Welche Langzeitnachsorge ist indiziert?', choices: ['Psychiatrisches Screening ab Adoleszenz, kardiologisch, endokrinologisch, immunologisch lebenslang', 'Nur im Kindesalter', 'Keine Nachsorge im Erwachsenenalter', 'Nur kardiologisch'], answer: 0, explain: 'Transition-Programm: Kardiologie (Aortenwurzel), Endokrinologie (Hypoparathyreoidismus), Immunologie (T-Zellen), Psychiatrie (Psychose-Screening ab 16J.).' }
  ]},

{ id: 47, cat: 'recip', iscn: '46,XY,t(12;21)(p13;q22)',
  vignette: '5-jähriger Junge mit B-Vorläufer-ALL, günstiges Risikoprofil. Zytogenetik: kryptische t(12;21).',
  sub: [
    { q: 'Fusionsgen?', choices: ['ETV6-RUNX1 (TEL-AML1)', 'BCR-ABL1', 'MYC-IgH', 'KMT2A-AFF1'], answer: 0, explain: 'ETV6-RUNX1: häufigste Translokation bei Kinder-ALL (~25%). Kryptisch = im Karyotyp oft nicht sichtbar, braucht FISH/RT-PCR.' },
    { q: 'Warum ist sie kryptisch?', choices: ['Die translozierten Segmente sind klein und ähnlich gefärbt', 'Sie existiert nicht wirklich', 'Nur bei Erwachsenen sichtbar', 'Durch Mosaik verdeckt'], answer: 0, explain: 'Die Bruchpunkte liegen in Regionen mit ähnlicher G-Banding-Intensität → im Karyotyp nicht erkennbar. FISH oder RT-PCR nötig.' },
    { q: 'Prognose?', choices: ['Exzellent: >90% Heilungsrate (günstigster ALL-Subtyp bei Kindern)', '50%', 'Schlecht', 'Wie bei Erwachsenen'], answer: 0, explain: 'ETV6-RUNX1-ALL bei Kindern: günstigster Subtyp. >90% Langzeitüberleben mit Standardrisiko-Chemotherapie.' },
    { q: 'In welchem Alter tritt ETV6-RUNX1-ALL am häufigsten auf?', choices: ['2-5 Jahre (Peak der Kinder-ALL insgesamt)', 'Neugeborene', 'Jugendliche', 'Erwachsene'], answer: 0, explain: 'Peak bei 2-5 Jahren. ETV6-RUNX1-Fusion entsteht oft pränatal (nachweisbar auf Guthrie-Karten), aber ein zweiter Hit ist für Leukämie nötig.' },
    { q: 'Was bedeutet "Two-Hit-Modell" bei dieser Leukämie?', choices: ['ETV6-RUNX1 allein reicht nicht — ein zweiter genetischer Hit (oft Verlust des normalen ETV6-Allels) ist nötig', 'Zwei Therapiezyklen', 'Zwei verschiedene Leukämien', 'Bilaterale Erkrankung'], answer: 0, explain: 'Präleukmisches Klon (ETV6-RUNX1) kann jahrelang persistieren. Erst ein zweiter Hit (del(12p), TP53-Mutation etc.) löst die Leukämie aus.' }
  ]},

{ id: 48, cat: 'rob', iscn: '45,XY,rob(21;21)(q10;q10)',
  vignette: 'Vater dreier Kinder mit Down-Syndrom, alle mit derselben Partnerin. Karyotyp: 45,XY,rob(21;21).',
  sub: [
    { q: 'Wiederholungsrisiko?', choices: ['100% Down-Syndrom bei allen Nachkommen', '50%', '25%', '~1%'], answer: 0, explain: 'Homologe rob(21;21): JEDER Gamet hat entweder Disomie 21 (→ Trisomie 21) oder Nullisomie 21 (→ letal). 100% der Lebendgeborenen = Down.' },
    { q: 'Warum ist PGT-SR hier NICHT hilfreich?', choices: ['Es gibt KEINE balancierten/normalen Gameten — alle Embryonen haben Trisomie 21', 'PGT-SR funktioniert bei Robertsonschen nicht', 'Technisch nicht möglich', 'Zu teuer'], answer: 0, explain: 'Bei homologer rob: 100% unbalancierte Gameten. PGT-SR kann nur selektieren, nicht reparieren. Keine normale Option vorhanden.' },
    { q: 'Unterschied zu rob(14;21)?', choices: ['rob(14;21) hat alternate Segregation → normale/balancierte Gameten möglich (~95%)', 'Kein Unterschied', 'rob(14;21) ist schwerer', 'rob(14;21) = auch 100%'], answer: 0, explain: 'Heterologe rob: alternate Segregation → normale + balancierte Gameten. Homologe rob: unmöglich → 100% unbalanciert.' },
    { q: 'Welche Optionen hat das Paar?', choices: ['Spendersamen oder Adoption — eigene Keimzellen des Vaters führen immer zu Down', 'Weiter versuchen', 'CRISPR', 'PGT wird helfen'], answer: 0, explain: 'Spendersamen: einzige Möglichkeit für ein Kind ohne Trisomie 21. Alternativ: Adoption. Wichtig: einfühlsame, non-direktive Beratung.' },
    { q: 'Wie entsteht rob(21;21)?', choices: ['Isochromosom-Bildung oder UPD + Trisomie-Rescue', 'Vererbung von beiden Eltern', 'Durch Bestrahlung', 'Häufige Variante'], answer: 0, explain: 'Meist de novo: Isochromosom-Bildung (Fehlhafte Zentromerteilung → zwei 21q-Arme). Kann auch durch Trisomy Rescue mit UPD entstehen.' }
  ]},

{ id: 49, cat: 'del', iscn: '46,XX,del(22)(q11.2)',
  vignette: 'Neugeborenes mit Gaumensegel-Insuffizienz (velopharyngeale Insuffizienz), nasaler Sprache (bei älterem Kind), Lernstörung, mildem Herzfehler.',
  sub: [
    { q: 'Welche Variante des 22q11.2-Deletionssyndroms liegt hier vor?', choices: ['VCFS (Velo-Cardio-Facial Syndrome / Shprintzen)', 'DiGeorge (Thymusaplasie im Vordergrund)', 'Conotrunkaler Facies-Anomalie', 'Keines — normaler Befund'], answer: 0, explain: 'Gleiches Deletionssyndrom (22q11.2), verschiedene klinische Manifestation: VCFS betont Gaumenspalte + Fazies + Lernstörung, DiGeorge betont T-Zell-Defekt + Hypokalzämie.' },
    { q: 'Warum heißen DiGeorge und VCFS heute gleich?', choices: ['Gleiche 22q11.2-Deletion — verschiedene Namen für das Spektrum des gleichen Syndroms', 'Verschiedene Chromosomen', 'Verschiedene Gene', 'Historischer Irrtum'], answer: 0, explain: 'Historisch separat beschrieben (DiGeorge 1965, Shprintzen 1978). Erst molekular als identische Deletion erkannt. Heute: "22q11.2-Deletionssyndrom".' },
    { q: 'Welche logopädische Maßnahme ist prioritär?', choices: ['Velopharyngoplastik oder Obturator bei VPI + Logopädie', 'Keine Maßnahme', 'Nur Logopädie ohne OP', 'Tracheotomie'], answer: 0, explain: 'VPI → nasale Sprache, Nahrungsaspiration. Velopharyngoplastik oder pharyngealer Obturator. CAVE: vor OP Carotis-Verlauf prüfen (medialisierte Karotiden bei 22q11.2!).' },
    { q: 'Welche Besonderheit der Halsanatomie ist chirurgisch relevant?', choices: ['Medialisierte Karotiden (Aa. carotides internae liegen medial-posterior → OP-Risiko!)', 'Normaler Gefäßverlauf', 'Erweiterte Jugularvene', 'Doppelte Aorta'], answer: 0, explain: 'Bei ~25% der 22q11.2-Patienten: medialisierte/aberrante Karotiden. Vor jeder pharyngealen OP: MR-Angiographie zum Ausschluss!' },
    { q: 'Wie häufig ist das 22q11.2-Deletionssyndrom?', choices: ['~1:4000 (häufigstes Mikrodeletionssyndrom)', '1:100.000', '1:1.000.000', '~1:50.000'], answer: 0, explain: 'Häufigstes Mikrodeletionssyndrom: ~1:4000. Wahrscheinlich unterdiagnostiziert wegen des breiten Phänotyp-Spektrums.' }
  ]},

{ id: 50, cat: 'recip', iscn: '46,XX,der(22)t(11;22)(q23;q11.2)mat',
  vignette: 'Neugeborenes mit schwerer ID, Mikrozephalie, Ohranomalien (präaurikuläre Anhängsel), Herzfehler. Mutter: balancierte t(11;22) Trägerin.',
  sub: [
    { q: 'Diagnose?', choices: ['Emanuel-Syndrom (unbalanciert aus t(11;22))', 'DiGeorge', 'Cat-Eye-Syndrom', 'WAGR'], answer: 0, explain: 'Emanuel-Syndrom: Kind erbt das der(22) von der Trägermutter → supernumeräres der(22) → partielle Trisomie 11q23 + 22pter-q11.2.' },
    { q: 'Welche Testung ist bei der Mutter erfolgt?', choices: ['Karyotyp zeigt balancierte t(11;22) — häufigste konstitutionelle reziproke Translokation', 'Nur Array-CGH', 'WES', 'Keine Testung'], answer: 0, explain: 'Die t(11;22) ist die häufigste konstitutionelle reziproke Translokation, bedingt durch PATRR-Sequenzen an beiden Bruchpunkten.' },
    { q: 'Warum gibt es bei dieser Translokation bevorzugt 3:1-Segregation?', choices: ['Das kleine der(22) wird bevorzugt als supernumeräres Chromosom segregiert', 'Zufällig', 'Centromer-Effekt', 'Immer 2:2'], answer: 0, explain: '3:1-Segregation: der(22) ist klein → wird als extras Chromosom an eine Tochterzelle verteilt. Kind: 46 + der(22) = 47 funktionell.' },
    { q: 'Welche Familiendiagnostik ist indiziert?', choices: ['Alle Verwandten 1. Grades der Mutter karyotypisieren — Träger identifizieren', 'Nur den Vater', 'Keine', 'Nur bei weiterer Schwangerschaft'], answer: 0, explain: 'Kaskadenscreening: Geschwister und Eltern der Mutter könnten Träger sein. Jeder Träger hat ~5-10% Risiko für Emanuel-Kind.' },
    { q: 'Prognose des Emanuel-Syndroms?', choices: ['Schwere ID, keine Sprachentwicklung, aber Überlebensrate bis Erwachsenenalter bei guter Pflege', 'Letal im 1. Jahr', 'Milde Beeinträchtigung', 'Normale Entwicklung'], answer: 0, explain: 'Schwere globale Entwicklungsstörung, keine expressive Sprache, aber mit guter medizinischer Versorgung Überleben bis ins Erwachsenenalter möglich.' }
  ]},

];

// Export for use by karyotype.js
if (typeof window !== 'undefined') window.QUIZ_CASES = QUIZ_CASES;
