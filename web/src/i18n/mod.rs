use leptos::prelude::*;
use std::collections::HashMap;

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Locale {
    En,
    De,
}

impl Locale {
    pub fn code(&self) -> &'static str {
        match self {
            Locale::En => "en",
            Locale::De => "de",
        }
    }

    pub fn from_code(code: &str) -> Self {
        match code {
            "de" | "de-DE" | "de-AT" | "de-CH" => Locale::De,
            _ => Locale::En,
        }
    }
}

fn en_translations() -> HashMap<&'static str, &'static str> {
    let mut m = HashMap::new();
    // Nav
    m.insert("nav.home", "Home");
    m.insert("nav.language", "Language");
    // Home
    m.insert("home.title", "Helix");
    m.insert("home.subtitle", "Interactive Human Genetics — real data, real science");
    m.insert("home.powered_by", "powered by nano-zyrkel");
    // Modules
    m.insert("hardy_weinberg.title", "Hardy-Weinberg Calculator");
    m.insert("hardy_weinberg.desc", "Allele frequency equilibrium with real population data");
    m.insert("mutations.title", "Mutation Simulator");
    m.insert("mutations.desc", "Introduce mutations and observe protein effects");
    m.insert("mendel.title", "Mendel Lab");
    m.insert("mendel.desc", "Build families with real variants and calculate risks");
    m.insert("evolution.title", "Evolution Sandbox");
    m.insert("evolution.desc", "Simulate selection, drift, and migration across the globe");
    m.insert("meiosis.title", "Meiosis & Crossing-Over");
    m.insert("meiosis.desc", "Animated cell division with recombination");
    m.insert("karyotype.title", "Karyotype Workbench");
    m.insert("karyotype.desc", "Sort chromosomes and identify aberrations");
    m.insert("tumor.title", "Tumor Genetics");
    m.insert("tumor.desc", "Multi-hit cancer model with real COSMIC data");
    m.insert("pharma.title", "Pharmacogenetics");
    m.insert("pharma.desc", "Drug metabolism and CYP variant effects");
    m.insert("population.title", "Population Map");
    m.insert("population.desc", "Compare variant frequencies across populations");
    m.insert("epigenetics.title", "Epigenetics Sandbox");
    m.insert("epigenetics.desc", "Methylation, imprinting, and the Horvath clock");
    // Common
    m.insert("common.loading", "Loading...");
    m.insert("common.coming_soon", "Coming soon");
    m.insert("common.embed_hint", "Embeddable — add ?embed=true to URL");
    m
}

fn de_translations() -> HashMap<&'static str, &'static str> {
    let mut m = HashMap::new();
    // Nav
    m.insert("nav.home", "Start");
    m.insert("nav.language", "Sprache");
    // Home
    m.insert("home.title", "Helix");
    m.insert("home.subtitle", "Interaktive Humangenetik — echte Daten, echte Wissenschaft");
    m.insert("home.powered_by", "powered by nano-zyrkel");
    // Modules
    m.insert("hardy_weinberg.title", "Hardy-Weinberg-Rechner");
    m.insert("hardy_weinberg.desc", "Allelfrequenz-Gleichgewicht mit echten Populationsdaten");
    m.insert("mutations.title", "Mutations-Simulator");
    m.insert("mutations.desc", "Mutationen einfuehren und Protein-Effekte beobachten");
    m.insert("mendel.title", "Mendel-Labor");
    m.insert("mendel.desc", "Familien mit echten Varianten bauen und Risiken berechnen");
    m.insert("evolution.title", "Evolutions-Sandbox");
    m.insert("evolution.desc", "Selektion, Drift und Migration ueber den Globus simulieren");
    m.insert("meiosis.title", "Meiose & Crossing-Over");
    m.insert("meiosis.desc", "Animierte Zellteilung mit Rekombination");
    m.insert("karyotype.title", "Karyotyp-Werkbank");
    m.insert("karyotype.desc", "Chromosomen sortieren und Aberrationen identifizieren");
    m.insert("tumor.title", "Tumorgenetik");
    m.insert("tumor.desc", "Multi-Hit-Krebsmodell mit echten COSMIC-Daten");
    m.insert("pharma.title", "Pharmakogenetik");
    m.insert("pharma.desc", "Medikamentenmetabolismus und CYP-Varianten-Effekte");
    m.insert("population.title", "Populationskarte");
    m.insert("population.desc", "Variantenfrequenzen zwischen Populationen vergleichen");
    m.insert("epigenetics.title", "Epigenetik-Sandbox");
    m.insert("epigenetics.desc", "Methylierung, Imprinting und die Horvath-Uhr");
    // Common
    m.insert("common.loading", "Laden...");
    m.insert("common.coming_soon", "Kommt bald");
    m.insert("common.embed_hint", "Einbettbar — ?embed=true an URL anfuegen");
    m
}

pub fn t(locale: Locale, key: &str) -> String {
    let map = match locale {
        Locale::En => en_translations(),
        Locale::De => de_translations(),
    };
    map.get(key).unwrap_or(&key).to_string()
}

#[derive(Clone, Copy)]
pub struct I18nContext {
    pub locale: RwSignal<Locale>,
}

impl I18nContext {
    pub fn t(&self, key: &str) -> String {
        t(self.locale.get(), key)
    }
}

#[component]
pub fn I18nProvider(children: Children) -> impl IntoView {
    let locale = RwSignal::new(detect_locale());
    provide_context(I18nContext { locale });
    children()
}

fn detect_locale() -> Locale {
    // Check localStorage first
    if let Ok(Some(storage)) = web_sys::window()
        .unwrap()
        .local_storage()
    {
        if let Ok(Some(saved)) = storage.get_item("helix_locale") {
            return Locale::from_code(&saved);
        }
    }
    // Fall back to browser language
    if let Some(lang) = web_sys::window().unwrap().navigator().language() {
        return Locale::from_code(&lang);
    }
    Locale::En
}
