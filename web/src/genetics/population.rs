/// Population genetics simulation (Wright-Fisher model).

use rand::prelude::*;

/// Single generation step in Wright-Fisher model.
/// Returns new allele count after sampling.
pub fn wright_fisher_step(allele_count: u64, pop_size: u64, selection: f64, rng: &mut impl Rng) -> u64 {
    if pop_size == 0 {
        return 0;
    }
    let p = allele_count as f64 / (2 * pop_size) as f64;
    // Adjust for selection: fitness of A allele is 1+s relative to a
    let p_adj = (p * (1.0 + selection)) / (p * (1.0 + selection) + (1.0 - p));
    let p_clamped = p_adj.clamp(0.0, 1.0);

    // Binomial sampling
    let mut count = 0u64;
    for _ in 0..(2 * pop_size) {
        if rng.gen_bool(p_clamped) {
            count += 1;
        }
    }
    count
}

/// Run simulation for n generations.
pub fn simulate(
    initial_count: u64,
    pop_size: u64,
    selection: f64,
    generations: u64,
    seed: u64,
) -> Vec<f64> {
    let mut rng = SmallRng::seed_from_u64(seed);
    let mut count = initial_count;
    let mut history = Vec::with_capacity(generations as usize + 1);
    history.push(count as f64 / (2 * pop_size) as f64);

    for _ in 0..generations {
        count = wright_fisher_step(count, pop_size, selection, &mut rng);
        history.push(count as f64 / (2 * pop_size) as f64);
        if count == 0 || count == 2 * pop_size {
            // Fixed or lost — fill remaining
            let final_freq = count as f64 / (2 * pop_size) as f64;
            while history.len() <= generations as usize {
                history.push(final_freq);
            }
            break;
        }
    }
    history
}

/// Fixation probability (Kimura 1962).
pub fn fixation_probability(pop_size: u64, selection: f64, initial_freq: f64) -> f64 {
    if selection.abs() < 1e-10 {
        return initial_freq; // neutral
    }
    let s = 4.0 * pop_size as f64 * selection;
    let num = 1.0 - (-s * initial_freq).exp();
    let den = 1.0 - (-s).exp();
    if den.abs() < 1e-15 { initial_freq } else { num / den }
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
        assert_eq!(history.len(), 51); // initial + 50 generations
    }

    #[test]
    fn test_simulation_bounds() {
        let history = simulate(50, 100, 0.0, 100, 42);
        for &freq in &history {
            assert!(freq >= 0.0 && freq <= 1.0);
        }
    }
}
