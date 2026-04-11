use serde::{Deserialize, Serialize};

/// A detected CNV from coverage data.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CnvCall {
    pub start: usize,
    pub end: usize,
    pub cnv_type: String, // "DEL" or "DUP"
    pub mean_ratio: f64,
    pub size: usize,
}

/// Detect CNVs from a coverage array using a simple sliding-window approach.
///
/// `coverage` — per-position (or per-bin) coverage values.
/// `window_size` — number of positions per window for smoothing.
/// `del_threshold` — ratio below which a region is called as deletion (e.g. 0.3).
/// `dup_threshold` — ratio above which a region is called as duplication (e.g. 1.6).
pub fn detect_cnv(
    coverage: &[u32],
    window_size: usize,
    del_threshold: f64,
    dup_threshold: f64,
) -> Vec<CnvCall> {
    if coverage.is_empty() || window_size == 0 {
        return vec![];
    }

    // Calculate median coverage (robust to CNVs)
    let mut sorted_cov: Vec<u32> = coverage.to_vec();
    sorted_cov.sort_unstable();
    let median = sorted_cov[sorted_cov.len() / 2] as f64;
    if median < 1.0 {
        return vec![];
    }

    // Sliding window averages
    let n = coverage.len();
    let mut ratios = Vec::with_capacity(n);
    for i in 0..n {
        let start = if i >= window_size / 2 { i - window_size / 2 } else { 0 };
        let end = std::cmp::min(i + window_size / 2 + 1, n);
        let sum: u64 = coverage[start..end].iter().map(|&c| c as u64).sum();
        let avg = sum as f64 / (end - start) as f64;
        ratios.push(avg / median);
    }

    // Segment into regions that are consistently above/below thresholds
    let mut calls = Vec::new();
    let mut in_del = false;
    let mut in_dup = false;
    let mut region_start = 0;

    for i in 0..n {
        let r = ratios[i];

        if r < del_threshold && !in_del {
            in_del = true;
            region_start = i;
        } else if r >= del_threshold && in_del {
            in_del = false;
            let size = i - region_start;
            if size >= window_size {
                let mean_ratio: f64 = ratios[region_start..i].iter().sum::<f64>() / size as f64;
                calls.push(CnvCall {
                    start: region_start,
                    end: i,
                    cnv_type: "DEL".to_string(),
                    mean_ratio,
                    size,
                });
            }
        }

        if r > dup_threshold && !in_dup {
            in_dup = true;
            region_start = i;
        } else if r <= dup_threshold && in_dup {
            in_dup = false;
            let size = i - region_start;
            if size >= window_size {
                let mean_ratio: f64 = ratios[region_start..i].iter().sum::<f64>() / size as f64;
                calls.push(CnvCall {
                    start: region_start,
                    end: i,
                    cnv_type: "DUP".to_string(),
                    mean_ratio,
                    size,
                });
            }
        }
    }

    // Close any open regions
    if in_del {
        let size = n - region_start;
        if size >= window_size {
            let mean_ratio: f64 = ratios[region_start..n].iter().sum::<f64>() / size as f64;
            calls.push(CnvCall {
                start: region_start,
                end: n,
                cnv_type: "DEL".to_string(),
                mean_ratio,
                size,
            });
        }
    }
    if in_dup {
        let size = n - region_start;
        if size >= window_size {
            let mean_ratio: f64 = ratios[region_start..n].iter().sum::<f64>() / size as f64;
            calls.push(CnvCall {
                start: region_start,
                end: n,
                cnv_type: "DUP".to_string(),
                mean_ratio,
                size,
            });
        }
    }

    calls
}

/// Compare coverage profiles between panel, exome, and genome for a gene region.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoverageComparison {
    pub gene: String,
    pub panel_mean: f64,
    pub exome_mean: f64,
    pub genome_mean: f64,
    pub panel_pct_above_20x: f64,
    pub exome_pct_above_20x: f64,
    pub genome_pct_above_20x: f64,
}

pub fn compare_coverage(
    gene: &str,
    panel: &[u32],
    exome: &[u32],
    genome: &[u32],
) -> CoverageComparison {
    let mean = |arr: &[u32]| {
        if arr.is_empty() { 0.0 } else { arr.iter().sum::<u32>() as f64 / arr.len() as f64 }
    };
    let pct_above = |arr: &[u32], threshold: u32| {
        if arr.is_empty() { 0.0 } else {
            arr.iter().filter(|&&c| c >= threshold).count() as f64 / arr.len() as f64 * 100.0
        }
    };

    CoverageComparison {
        gene: gene.to_string(),
        panel_mean: mean(panel),
        exome_mean: mean(exome),
        genome_mean: mean(genome),
        panel_pct_above_20x: pct_above(panel, 20),
        exome_pct_above_20x: pct_above(exome, 20),
        genome_pct_above_20x: pct_above(genome, 20),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_deletion() {
        let mut cov = vec![30u32; 1000];
        // Create a deletion at positions 300-600
        for i in 300..600 {
            cov[i] = 0;
        }
        let calls = detect_cnv(&cov, 10, 0.3, 1.6);
        assert_eq!(calls.len(), 1);
        assert_eq!(calls[0].cnv_type, "DEL");
        assert!(calls[0].start <= 305);
        assert!(calls[0].end >= 595);
    }

    #[test]
    fn test_detect_duplication() {
        let mut cov = vec![30u32; 1000];
        // Create a duplication at positions 400-700
        for i in 400..700 {
            cov[i] = 60;
        }
        let calls = detect_cnv(&cov, 10, 0.3, 1.6);
        assert_eq!(calls.len(), 1);
        assert_eq!(calls[0].cnv_type, "DUP");
    }
}
