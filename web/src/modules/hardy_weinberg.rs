use leptos::prelude::*;

#[component]
pub fn HardyWeinberg() -> impl IntoView {
    let p = RwSignal::new(0.5_f64);

    let q = Memo::new(move |_| 1.0 - p.get());
    let p2 = Memo::new(move |_| p.get() * p.get());
    let pq2 = Memo::new(move |_| 2.0 * p.get() * q.get());
    let q2 = Memo::new(move |_| q.get() * q.get());

    view! {
        <div class="module hardy-weinberg">
            <h2>"Hardy-Weinberg Calculator"</h2>
            <div class="controls">
                <label>
                    "Allele frequency p: " {move || format!("{:.2}", p.get())}
                    <input
                        type="range"
                        min="0" max="1" step="0.01"
                        prop:value=move || p.get().to_string()
                        on:input=move |ev| {
                            if let Ok(val) = event_target_value(&ev).parse::<f64>() {
                                p.set(val);
                            }
                        }
                    />
                </label>
            </div>
            <div class="results">
                <div class="genotype-bar">
                    <div class="bar-segment aa" style=move || format!("width: {}%", p2.get() * 100.0)>
                        {move || format!("AA: {:.1}%", p2.get() * 100.0)}
                    </div>
                    <div class="bar-segment ab" style=move || format!("width: {}%", pq2.get() * 100.0)>
                        {move || format!("Aa: {:.1}%", pq2.get() * 100.0)}
                    </div>
                    <div class="bar-segment bb" style=move || format!("width: {}%", q2.get() * 100.0)>
                        {move || format!("aa: {:.1}%", q2.get() * 100.0)}
                    </div>
                </div>
                <p class="formula">
                    {move || format!("p={:.2}, q={:.2} | p²={:.4}, 2pq={:.4}, q²={:.4}",
                        p.get(), q.get(), p2.get(), pq2.get(), q2.get())}
                </p>
            </div>
        </div>
    }
}
