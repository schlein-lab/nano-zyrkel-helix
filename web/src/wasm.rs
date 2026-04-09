use wasm_bindgen::prelude::*;

use crate::genetics::{codon, hardy_weinberg, mutation, population};

// ── Hardy-Weinberg ──────────────────────────────────────────────

#[wasm_bindgen]
pub fn hwe_calc(p: f64) -> String {
    let r = hardy_weinberg::hwe(p);
    serde_json::to_string(&serde_json::json!({
        "p": r.p,
        "q": r.q,
        "freq_aa": r.freq_aa,
        "freq_ab": r.freq_ab,
        "freq_bb": r.freq_bb,
    }))
    .unwrap()
}

#[wasm_bindgen]
pub fn hwe_inbreeding_calc(p: f64, f: f64) -> String {
    let r = hardy_weinberg::hwe_inbreeding(p, f);
    serde_json::to_string(&serde_json::json!({
        "p": r.p,
        "q": r.q,
        "freq_aa": r.freq_aa,
        "freq_ab": r.freq_ab,
        "freq_bb": r.freq_bb,
    }))
    .unwrap()
}

#[wasm_bindgen]
pub fn hwe_chi_squared_calc(obs_aa: u64, obs_ab: u64, obs_bb: u64) -> String {
    let (chi2, in_eq) = hardy_weinberg::hwe_chi_squared(obs_aa, obs_ab, obs_bb);
    serde_json::to_string(&serde_json::json!({
        "chi_squared": chi2,
        "in_equilibrium": in_eq,
    }))
    .unwrap()
}

// ── Mutation ────────────────────────────────────────────────────

#[wasm_bindgen]
pub fn predict_mutation(cds: &str, position: usize, new_base: char) -> String {
    let effect = mutation::predict_point_mutation(cds, position, new_base);
    let (effect_type, details) = match &effect {
        mutation::MutationEffect::Silent => ("Silent", String::new()),
        mutation::MutationEffect::Missense { from, to } => {
            ("Missense", format!("{} → {}", from, to))
        }
        mutation::MutationEffect::Nonsense { from } => ("Nonsense", format!("{} → Stop", from)),
        mutation::MutationEffect::Frameshift => ("Frameshift", String::new()),
        mutation::MutationEffect::SpliceAltered => ("Splice-site altered", String::new()),
    };
    serde_json::to_string(&serde_json::json!({
        "effect": effect_type,
        "details": details,
    }))
    .unwrap()
}

#[wasm_bindgen]
pub fn translate(dna: &str) -> String {
    let protein: String = codon::translate_dna(dna)
        .into_iter()
        .map(|aa| aa.unwrap_or('*'))
        .collect();
    protein
}

// ── Population Simulation ───────────────────────────────────────

#[wasm_bindgen]
pub fn simulate_population(
    initial_freq: f64,
    pop_size: u64,
    selection: f64,
    generations: u64,
    seed: u64,
) -> String {
    let initial_count = (initial_freq * 2.0 * pop_size as f64).round() as u64;
    let history = population::simulate(initial_count, pop_size, selection, generations, seed);
    serde_json::to_string(&history).unwrap()
}

#[wasm_bindgen]
pub fn fixation_prob(pop_size: u64, selection: f64, initial_freq: f64) -> f64 {
    population::fixation_probability(pop_size, selection, initial_freq)
}
