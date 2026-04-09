use leptos::prelude::*;

pub fn is_embedded() -> Signal<bool> {
    let embedded = web_sys::window()
        .and_then(|w| w.location().search().ok())
        .map(|s| s.contains("embed=true"))
        .unwrap_or(false);
    Signal::derive(move || embedded)
}
