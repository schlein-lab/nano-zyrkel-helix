use wasm_bindgen::prelude::*;

use crate::genetics::{acmg, cnv, codon, hardy_weinberg, mutation, population, reads, variant_filter};

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

// ── Sequencing Module: Reads ───────────────────────────────────

#[wasm_bindgen]
pub fn layout_reads(reads_json: &str) -> String {
    let parsed: Vec<reads::Read> = serde_json::from_str(reads_json).unwrap_or_default();
    let layout = reads::layout_reads(&parsed);
    serde_json::to_string(&layout).unwrap()
}

#[wasm_bindgen]
pub fn compute_coverage(reads_json: &str, region_length: usize) -> String {
    let parsed: Vec<reads::Read> = serde_json::from_str(reads_json).unwrap_or_default();
    let cov = reads::compute_coverage(&parsed, region_length);
    serde_json::to_string(&cov).unwrap()
}

// ── Sequencing Module: Variant Filtering ───────────────────────

#[wasm_bindgen]
pub fn filter_variants(variants_json: &str, config_json: &str) -> String {
    let variants: Vec<variant_filter::Variant> =
        serde_json::from_str(variants_json).unwrap_or_default();
    let config: variant_filter::FilterConfig =
        serde_json::from_str(config_json).unwrap_or_default();
    let result = variant_filter::filter_variants(&variants, &config);
    serde_json::to_string(&result).unwrap()
}

// ── Sequencing Module: ACMG Classification ─────────────────────

#[wasm_bindgen]
pub fn classify_acmg(criteria_json: &str) -> String {
    let criteria: Vec<String> = serde_json::from_str(criteria_json).unwrap_or_default();
    let result = acmg::classify(&criteria);
    serde_json::to_string(&result).unwrap()
}

// ── Sequencing Module: CNV Detection ───────────────────────────

#[wasm_bindgen]
pub fn detect_cnv(
    coverage_json: &str,
    window_size: usize,
    del_threshold: f64,
    dup_threshold: f64,
) -> String {
    let coverage: Vec<u32> = serde_json::from_str(coverage_json).unwrap_or_default();
    let calls = cnv::detect_cnv(&coverage, window_size, del_threshold, dup_threshold);
    serde_json::to_string(&calls).unwrap()
}

// ── Sequencing Module: Pathway Simulation ──────────────────────

#[wasm_bindgen]
pub fn simulate_pathway(pathway_json: &str, blocked_enzyme: usize, steps: u32) -> String {
    // Simple Michaelis-Menten pathway simulation
    #[derive(serde::Deserialize)]
    struct PathwayNode {
        name: String,
        #[serde(default = "default_concentration")]
        initial_concentration: f64,
        #[serde(default = "default_vmax")]
        vmax: f64,
        #[serde(default = "default_km")]
        km: f64,
    }
    fn default_concentration() -> f64 { 1.0 }
    fn default_vmax() -> f64 { 1.0 }
    fn default_km() -> f64 { 0.5 }

    let nodes: Vec<PathwayNode> = serde_json::from_str(pathway_json).unwrap_or_default();
    if nodes.is_empty() {
        return "[]".to_string();
    }

    let n = nodes.len();
    let mut concentrations: Vec<Vec<f64>> = vec![vec![0.0; steps as usize + 1]; n];

    // Initialize
    for i in 0..n {
        concentrations[i][0] = nodes[i].initial_concentration;
    }

    // Simulate
    let dt = 0.1;
    for t in 0..steps as usize {
        for i in 0..n {
            let mut dc = 0.0;

            // Production from upstream (enzyme i converts node i to node i+1)
            if i > 0 {
                let upstream = concentrations[i - 1][t];
                let enzyme_idx = i - 1;
                let activity = if enzyme_idx == blocked_enzyme { 0.0 } else { 1.0 };
                let rate = activity * nodes[enzyme_idx].vmax * upstream
                    / (nodes[enzyme_idx].km + upstream);
                dc += rate * dt;
            }

            // Consumption (enzyme i converts node i to node i+1)
            if i < n - 1 {
                let substrate = concentrations[i][t];
                let activity = if i == blocked_enzyme { 0.0 } else { 1.0 };
                let rate = activity * nodes[i].vmax * substrate / (nodes[i].km + substrate);
                dc -= rate * dt;
            }

            // Influx for first node
            if i == 0 {
                dc += 0.5 * dt; // constant dietary influx
            }

            concentrations[i][t + 1] = (concentrations[i][t] + dc).max(0.0);
        }
    }

    // Return as {name, values} array
    let result: Vec<serde_json::Value> = nodes
        .iter()
        .enumerate()
        .map(|(i, node)| {
            serde_json::json!({
                "name": node.name,
                "values": concentrations[i],
            })
        })
        .collect();

    serde_json::to_string(&result).unwrap()
}
