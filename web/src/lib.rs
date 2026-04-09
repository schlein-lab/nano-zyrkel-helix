mod app;
mod components;
mod data;
mod gamification;
mod genetics;
mod i18n;
mod modules;

use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
    leptos::mount::mount_to_body(app::App);
}
