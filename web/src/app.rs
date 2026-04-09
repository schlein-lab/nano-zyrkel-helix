use leptos::prelude::*;
use leptos_router::components::*;
use leptos_router::path;

use crate::components::embed_wrapper::is_embedded;
use crate::components::nav::Nav;
use crate::i18n::I18nProvider;
use crate::modules::*;

#[component]
fn Home() -> impl IntoView {
    let modules = vec![
        ("Hardy-Weinberg", "hardy-weinberg", "Allele frequency calculator with real population data"),
        ("Mutations", "mutations", "DNA mutation simulator with protein impact prediction"),
        ("Mendel Lab", "mendel", "Multi-variant family builder with pedigree analysis"),
        ("Evolution", "evolution", "Population genetics sandbox with Out-of-Africa simulation"),
        ("Meiosis", "meiosis", "Animated meiosis with crossing-over and LOD scores"),
        ("Karyotype", "karyotype", "Drag & drop chromosome sorting workbench"),
        ("Tumor Genetics", "tumor", "Multi-hit cancer model with COSMIC data"),
        ("Pharmacogenetics", "pharma", "Drug metabolism simulator with CYP variants"),
        ("Population Map", "population", "Global variant frequency comparator"),
        ("Epigenetics", "epigenetics", "Methylation and imprinting sandbox"),
    ];

    view! {
        <div class="home">
            <div class="hero">
                <h1>"Helix"</h1>
                <p class="subtitle">"Interactive Human Genetics — real data, real science"</p>
                <p class="powered-by">"powered by nano-zyrkel"</p>
            </div>
            <div class="module-grid">
                {modules.into_iter().map(|(name, path, desc)| {
                    let href = format!("/{path}");
                    view! {
                        <a class="module-card" href={href}>
                            <h3>{name}</h3>
                            <p>{desc}</p>
                        </a>
                    }
                }).collect::<Vec<_>>()}
            </div>
        </div>
    }
}

#[component]
pub fn App() -> impl IntoView {
    view! {
        <I18nProvider>
            <Router>
                <AppInner />
            </Router>
        </I18nProvider>
    }
}

#[component]
fn AppInner() -> impl IntoView {
    let embedded = is_embedded();

    view! {
        <Show when=move || !embedded.get()>
            <Nav />
        </Show>
        <main>
            <Routes fallback=|| view! { <p>"Page not found."</p> }>
                <Route path=path!("/") view=Home />
                <Route path=path!("/hardy-weinberg") view=hardy_weinberg::HardyWeinberg />
                <Route path=path!("/mutations") view=mutations::MutationSimulator />
                <Route path=path!("/mendel") view=mendel::MendelLab />
                <Route path=path!("/evolution") view=evolution::EvolutionSandbox />
                <Route path=path!("/meiosis") view=meiosis::MeiosisCrossingOver />
                <Route path=path!("/karyotype") view=karyotype::KaryotypeWorkbench />
                <Route path=path!("/tumor") view=tumor::TumorGenetics />
                <Route path=path!("/pharma") view=pharmacogenetics::Pharmacogenetics />
                <Route path=path!("/population") view=population_map::PopulationMap />
                <Route path=path!("/epigenetics") view=epigenetics::EpigeneticsSandbox />
            </Routes>
        </main>
    }
}
