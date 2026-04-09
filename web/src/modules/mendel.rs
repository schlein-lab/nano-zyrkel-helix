use leptos::prelude::*;

#[component]
pub fn MendelLab() -> impl IntoView {
    view! {
        <div class="module mendel">
            <h2>"Mendel Lab"</h2>
            <p class="coming-soon">"Coming soon — build families with real ClinVar variants, calculate inheritance risks, and solve pedigree puzzles."</p>
        </div>
    }
}
