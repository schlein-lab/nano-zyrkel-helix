use leptos::prelude::*;

use crate::i18n::{I18nContext, Locale};

#[component]
pub fn Nav() -> impl IntoView {
    let i18n = use_context::<I18nContext>().expect("I18nContext");

    let toggle_locale = move |_| {
        let new_locale = match i18n.locale.get() {
            Locale::En => Locale::De,
            Locale::De => Locale::En,
        };
        i18n.locale.set(new_locale);
        // Persist
        if let Ok(Some(storage)) = web_sys::window().unwrap().local_storage() {
            let _ = storage.set_item("helix_locale", new_locale.code());
        }
    };

    view! {
        <nav class="main-nav">
            <a class="nav-brand" href="/">"Helix"</a>
            <div class="nav-links">
                <a href="/hardy-weinberg">"HWE"</a>
                <a href="/mutations">"Mutations"</a>
                <a href="/mendel">"Mendel"</a>
                <a href="/evolution">"Evolution"</a>
                <a href="/meiosis">"Meiosis"</a>
                <a href="/karyotype">"Karyotype"</a>
                <a href="/tumor">"Tumor"</a>
                <a href="/pharma">"Pharma"</a>
                <a href="/population">"Population"</a>
                <a href="/epigenetics">"Epigenetics"</a>
            </div>
            <button class="locale-toggle" on:click=toggle_locale>
                {move || match i18n.locale.get() {
                    Locale::En => "DE",
                    Locale::De => "EN",
                }}
            </button>
        </nav>
    }
}
