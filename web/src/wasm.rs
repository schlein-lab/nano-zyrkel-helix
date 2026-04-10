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

#[wasm_bindgen]
pub fn predict_indel_effect(cds: &str, position: usize, inserted: &str, deleted: usize) -> String {
    let effect = mutation::predict_indel(cds, position, inserted, deleted);
    serde_json::to_string(&serde_json::json!({
        "is_frameshift": effect.is_frameshift,
        "net_change": effect.net_change,
        "original_protein_len": effect.original_protein_len,
        "mutated_protein_len": effect.mutated_protein_len,
        "first_changed_aa_pos": effect.first_changed_aa_pos,
        "new_stop_codon_pos": effect.new_stop_codon_pos,
        "label": effect.label,
    }))
    .unwrap()
}

#[wasm_bindgen]
pub fn compare_protein_effect(original_cds: &str, mutated_cds: &str) -> String {
    let aln = mutation::compare_proteins(original_cds, mutated_cds);
    serde_json::to_string(&serde_json::json!({
        "original": aln.original,
        "mutated": aln.mutated,
        "diff_positions": aln.diff_positions,
        "first_diff": aln.first_diff,
    }))
    .unwrap()
}

#[wasm_bindgen]
pub fn predict_nmd_risk(exon_boundaries_json: &str, ptc_cds_position: usize) -> bool {
    let boundaries: Vec<usize> = serde_json::from_str(exon_boundaries_json).unwrap_or_default();
    mutation::predict_nmd(&boundaries, ptc_cds_position)
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

// ── Evolution Sandbox ───────────────────────────────────────────

#[wasm_bindgen]
pub fn evo_simulate_batch(
    initial_freq: f64,
    pop_size: u64,
    selection: f64,
    dominance: f64,
    generations: u64,
    num_runs: u32,
    base_seed: u64,
) -> String {
    let batch = population::simulate_batch(
        initial_freq, pop_size, selection, dominance, generations, num_runs, base_seed,
    );
    serde_json::to_string(&batch).unwrap()
}

#[wasm_bindgen]
pub fn evo_simulate_bottleneck(
    initial_freq: f64,
    pop_size: u64,
    selection: f64,
    dominance: f64,
    generations: u64,
    bottleneck_at: u64,
    bottleneck_size: u64,
    bottleneck_duration: u64,
    seed: u64,
) -> String {
    let history = population::simulate_with_bottleneck(
        initial_freq, pop_size, selection, dominance, generations,
        bottleneck_at, bottleneck_size, bottleneck_duration, seed,
    );
    serde_json::to_string(&history).unwrap()
}

#[wasm_bindgen]
pub fn evo_simulate_migration(
    num_pops: usize,
    pop_size: u64,
    initial_freqs_json: &str,
    selection_json: &str,
    dominance: f64,
    migration_rate: f64,
    generations: u64,
    seed: u64,
) -> String {
    let initial_freqs: Vec<f64> = serde_json::from_str(initial_freqs_json).unwrap_or_default();
    let selection: Vec<f64> = serde_json::from_str(selection_json).unwrap_or_default();
    let histories = population::simulate_migration(
        num_pops, pop_size, &initial_freqs, &selection,
        dominance, migration_rate, generations, seed,
    );
    serde_json::to_string(&histories).unwrap()
}

#[wasm_bindgen]
pub fn evo_fixation_stats(batch_json: &str) -> String {
    let batch: Vec<Vec<f64>> = serde_json::from_str(batch_json).unwrap_or_default();
    let (fixed, lost, poly) = population::batch_fixation_stats(&batch);
    serde_json::to_string(&serde_json::json!({
        "fixed": fixed, "lost": lost, "polymorphic": poly,
        "total": fixed + lost + poly,
    })).unwrap()
}
