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
    { q: 'Ist Triploidie mit dem Leben vereinbar?', choices: ['Nein, immer letal', 'Ja, mit schwerer Behinderung', 'Ja, wenn Mosaik vorhanden', 'Ja, bei Therapie'], answer: 0, explain: 'Vollständige Triploidie ist immer letal. Triploidie-Mosaike sind extrem selten, können aber begrenzt überleben.' },
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

];

// Export for use by karyotype.js
if (typeof window !== 'undefined') window.QUIZ_CASES = QUIZ_CASES;
