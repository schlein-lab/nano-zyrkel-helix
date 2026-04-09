/// Population genetics simulation (Wright-Fisher model).

use rand::prelude::*;

/// Single generation step with dominance coefficient h.
/// Genotype fitnesses: AA = 1, Aa = 1 + h*s, aa = 1 + s
/// Returns new allele count after sampling.
fn wright_fisher_step_dom(
    allele_count: u64,
    pop_size: u64,
    selection: f64,
    dominance: f64,
    rng: &mut impl Rng,
) -> u64 {
    if pop_size == 0 {
        return 0;
    }
    let n2 = (2 * pop_size) as f64;
    let p = allele_count as f64 / n2; // freq of A (selected allele)
    let q = 1.0 - p;

    // Mean fitness
    let w_aa = 1.0 + selection;
    let w_ab = 1.0 + dominance * selection;
    let w_bb = 1.0;
    let w_bar = p * p * w_aa + 2.0 * p * q * w_ab + q * q * w_bb;

    // Frequency after selection
    let p_next = if w_bar > 0.0 {
        (p * p * w_aa + p * q * w_ab) / w_bar
    } else {
        p
    };
    let p_clamped = p_next.clamp(0.0, 1.0);

    // Binomial sampling (genetic drift)
    let total = (2 * pop_size) as u32;
    let mut count = 0u64;
    for _ in 0..total {
        if rng.gen_bool(p_clamped) {
            count += 1;
        }
    }
    count
}

/// Legacy step function (no dominance).
pub fn wright_fisher_step(
    allele_count: u64,
    pop_size: u64,
    selection: f64,
    rng: &mut impl Rng,
) -> u64 {
    wright_fisher_step_dom(allele_count, pop_size, selection, 0.5, rng)
}

/// Run simulation with dominance for n generations.
pub fn simulate_with_dominance(
    initial_freq: f64,
    pop_size: u64,
    selection: f64,
    dominance: f64,
    generations: u64,
    seed: u64,
) -> Vec<f64> {
    let mut rng = SmallRng::seed_from_u64(seed);
    let n2 = 2 * pop_size;
    let mut count = (initial_freq * n2 as f64).round() as u64;
    let mut history = Vec::with_capacity(generations as usize + 1);
    history.push(count as f64 / n2 as f64);

    for _ in 0..generations {
        count = wright_fisher_step_dom(count, pop_size, selection, dominance, &mut rng);
        history.push(count as f64 / n2 as f64);
        if count == 0 || count == n2 {
            let final_freq = count as f64 / n2 as f64;
            while history.len() <= generations as usize {
                history.push(final_freq);
            }
            break;
        }
    }
    history
}

/// Batch simulation: multiple runs with different seeds.
pub fn simulate_batch(
    initial_freq: f64,
    pop_size: u64,
    selection: f64,
    dominance: f64,
    generations: u64,
    num_runs: u32,
    base_seed: u64,
) -> Vec<Vec<f64>> {
    (0..num_runs)
        .map(|i| {
            simulate_with_dominance(
                initial_freq,
                pop_size,
                selection,
                dominance,
                generations,
                base_seed.wrapping_add(i as u64 * 7919), // different seed per run
            )
        })
        .collect()
}

/// Simulation with a bottleneck event.
pub fn simulate_with_bottleneck(
    initial_freq: f64,
    pop_size: u64,
    selection: f64,
    dominance: f64,
    generations: u64,
    bottleneck_at: u64,
    bottleneck_size: u64,
    bottleneck_duration: u64,
    seed: u64,
) -> Vec<f64> {
    let mut rng = SmallRng::seed_from_u64(seed);
    let n2 = 2 * pop_size;
    let mut count = (initial_freq * n2 as f64).round() as u64;
    let mut history = Vec::with_capacity(generations as usize + 1);
    history.push(count as f64 / n2 as f64);

    for gen in 0..generations {
        let current_n = if gen >= bottleneck_at && gen < bottleneck_at + bottleneck_duration {
            bottleneck_size
        } else {
            pop_size
        };

        // If transitioning into bottleneck, resample to new pop size
        let current_n2 = 2 * current_n;
        let freq = count as f64 / n2 as f64; // use original proportion
        count = wright_fisher_step_dom(
            (freq * current_n2 as f64).round() as u64,
            current_n,
            selection,
            dominance,
            &mut rng,
        );

        // Always report frequency relative to current population
        history.push(count as f64 / current_n2 as f64);

        if count == 0 || count == current_n2 {
            let final_freq = count as f64 / current_n2 as f64;
            while history.len() <= generations as usize {
                history.push(final_freq);
            }
            break;
        }
    }
    history
}

/// Count fixation outcomes from batch results.
pub fn batch_fixation_stats(trajectories: &[Vec<f64>]) -> (u32, u32, u32) {
    let mut fixed = 0u32;
    let mut lost = 0u32;
    let mut poly = 0u32;
    for traj in trajectories {
        if let Some(&last) = traj.last() {
            if last >= 0.999 {
                fixed += 1;
            } else if last <= 0.001 {
                lost += 1;
            } else {
                poly += 1;
            }
        }
    }
    (fixed, lost, poly)
}

/// Multi-population migration simulation.
/// Populations are connected in a stepping-stone model (chain).
/// Migration rate m = fraction exchanged between adjacent populations per generation.
pub fn simulate_migration(
    num_pops: usize,
    pop_size: u64,
    initial_freqs: &[f64],
    selection: &[f64],
    dominance: f64,
    migration_rate: f64,
    generations: u64,
    seed: u64,
) -> Vec<Vec<f64>> {
    let mut rng = SmallRng::seed_from_u64(seed);
    let n2 = 2 * pop_size;

    // Initialize allele counts
    let mut counts: Vec<u64> = initial_freqs
        .iter()
        .map(|&f| (f * n2 as f64).round() as u64)
        .collect();
    // Pad if fewer initial_freqs than num_pops
    while counts.len() < num_pops {
        counts.push(0);
    }

    // Selection per population (pad with 0)
    let sel: Vec<f64> = (0..num_pops)
        .map(|i| selection.get(i).copied().unwrap_or(0.0))
        .collect();

    // History: one trajectory per population
    let mut histories: Vec<Vec<f64>> = (0..num_pops)
        .map(|i| vec![counts[i] as f64 / n2 as f64])
        .collect();

    for _ in 0..generations {
        // 1. Migration: exchange alleles between adjacent populations
        let freqs: Vec<f64> = counts.iter().map(|&c| c as f64 / n2 as f64).collect();
        let mut new_freqs = freqs.clone();
        for i in 0..num_pops {
            let mut f = freqs[i];
            if i > 0 {
                f += migration_rate * (freqs[i - 1] - freqs[i]);
            }
            if i < num_pops - 1 {
                f += migration_rate * (freqs[i + 1] - freqs[i]);
            }
            new_freqs[i] = f.clamp(0.0, 1.0);
        }

        // 2. Selection + Drift per population
        for i in 0..num_pops {
            counts[i] = wright_fisher_step_dom(
                (new_freqs[i] * n2 as f64).round() as u64,
                pop_size,
                sel[i],
                dominance,
                &mut rng,
            );
            histories[i].push(counts[i] as f64 / n2 as f64);
        }
    }

    histories
}

/// Legacy simulate function.
pub fn simulate(
    initial_count: u64,
    pop_size: u64,
    selection: f64,
    generations: u64,
    seed: u64,
) -> Vec<f64> {
    let freq = initial_count as f64 / (2 * pop_size) as f64;
    simulate_with_dominance(freq, pop_size, selection, 0.5, generations, seed)
}

/// Fixation probability (Kimura 1962).
pub fn fixation_probability(pop_size: u64, selection: f64, initial_freq: f64) -> f64 {
    if selection.abs() < 1e-10 {
        return initial_freq;
    }
    let s = 4.0 * pop_size as f64 * selection;
    let num = 1.0 - (-s * initial_freq).exp();
    let den = 1.0 - (-s).exp();
    if den.abs() < 1e-15 {
        initial_freq
    } else {
        num / den
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_neutral_fixation_probability() {
        let p = fixation_probability(1000, 0.0, 0.1);
        assert!((p - 0.1).abs() < 1e-10);
    }

    #[test]
    fn test_simulation_length() {
        let history = simulate(100, 100, 0.0, 50, 42);
        assert_eq!(history.len(), 51);
    }

    #[test]
    fn test_simulation_bounds() {
        let history = simulate(50, 100, 0.0, 100, 42);
        for &freq in &history {
            assert!((0.0..=1.0).contains(&freq));
        }
    }

    #[test]
    fn test_batch_size() {
        let batch = simulate_batch(0.5, 100, 0.0, 0.5, 50, 10, 42);
        assert_eq!(batch.len(), 10);
        for traj in &batch {
            assert_eq!(traj.len(), 51);
        }
    }

    #[test]
    fn test_batch_fixation_stats() {
        let batch = simulate_batch(0.5, 20, 0.0, 0.5, 200, 50, 42);
        let (fixed, lost, poly) = batch_fixation_stats(&batch);
        assert_eq!(fixed + lost + poly, 50);
        // With N=20 and 200 generations, most should be fixed or lost
        assert!(fixed + lost > 30);
    }

    #[test]
    fn test_bottleneck_runs() {
        let history = simulate_with_bottleneck(0.5, 1000, 0.0, 0.5, 100, 30, 10, 20, 42);
        assert_eq!(history.len(), 101);
        for &freq in &history {
            assert!((0.0..=1.0).contains(&freq));
        }
    }

    #[test]
    fn test_dominance_additive() {
        // With h=0.5, should behave like old additive model
        let h1 = simulate_with_dominance(0.3, 500, 0.05, 0.5, 100, 42);
        assert_eq!(h1.len(), 101);
        // Positive selection should increase frequency on average
        assert!(h1.last().unwrap() > &0.3);
    }

    #[test]
    fn test_strong_selection_fixes() {
        let h = simulate_with_dominance(0.5, 1000, 0.1, 0.5, 500, 42);
        // Very strong selection should drive to fixation
        assert!(*h.last().unwrap() > 0.95);
    }
}
