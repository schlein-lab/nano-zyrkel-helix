/// Hardy-Weinberg equilibrium calculations.

/// Genotype frequencies under HWE.
pub struct HweResult {
    pub p: f64,
    pub q: f64,
    pub freq_aa: f64,  // p^2
    pub freq_ab: f64,  // 2pq
    pub freq_bb: f64,  // q^2
}

/// Calculate HWE genotype frequencies from allele frequency p.
pub fn hwe(p: f64) -> HweResult {
    let q = 1.0 - p;
    HweResult {
        p,
        q,
        freq_aa: p * p,
        freq_ab: 2.0 * p * q,
        freq_bb: q * q,
    }
}

/// HWE with inbreeding coefficient F.
pub fn hwe_inbreeding(p: f64, f: f64) -> HweResult {
    let q = 1.0 - p;
    HweResult {
        p,
        q,
        freq_aa: p * p + f * p * q,
        freq_ab: 2.0 * p * q * (1.0 - f),
        freq_bb: q * q + f * p * q,
    }
}

/// Chi-squared test for HWE.
/// Returns (chi_squared, p_value_approx).
pub fn hwe_chi_squared(observed_aa: u64, observed_ab: u64, observed_bb: u64) -> (f64, bool) {
    let n = (observed_aa + observed_ab + observed_bb) as f64;
    if n == 0.0 {
        return (0.0, true);
    }
    let p = (2.0 * observed_aa as f64 + observed_ab as f64) / (2.0 * n);
    let expected = hwe(p);
    let exp_aa = expected.freq_aa * n;
    let exp_ab = expected.freq_ab * n;
    let exp_bb = expected.freq_bb * n;

    let chi2 = if exp_aa > 0.0 { (observed_aa as f64 - exp_aa).powi(2) / exp_aa } else { 0.0 }
        + if exp_ab > 0.0 { (observed_ab as f64 - exp_ab).powi(2) / exp_ab } else { 0.0 }
        + if exp_bb > 0.0 { (observed_bb as f64 - exp_bb).powi(2) / exp_bb } else { 0.0 };

    // 1 degree of freedom, critical value 3.841 for p=0.05
    let in_equilibrium = chi2 < 3.841;
    (chi2, in_equilibrium)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hwe_basic() {
        let r = hwe(0.5);
        assert!((r.freq_aa - 0.25).abs() < 1e-10);
        assert!((r.freq_ab - 0.50).abs() < 1e-10);
        assert!((r.freq_bb - 0.25).abs() < 1e-10);
    }

    #[test]
    fn test_hwe_sums_to_one() {
        let r = hwe(0.3);
        assert!((r.freq_aa + r.freq_ab + r.freq_bb - 1.0).abs() < 1e-10);
    }

    #[test]
    fn test_hwe_inbreeding() {
        let r = hwe_inbreeding(0.5, 0.0);
        assert!((r.freq_ab - 0.50).abs() < 1e-10);
        let r = hwe_inbreeding(0.5, 1.0);
        assert!((r.freq_ab - 0.0).abs() < 1e-10);
    }

    #[test]
    fn test_chi_squared_perfect_hwe() {
        let (chi2, eq) = hwe_chi_squared(25, 50, 25);
        assert!(chi2 < 0.01);
        assert!(eq);
    }
}
