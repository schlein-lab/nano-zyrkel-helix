use serde::{Deserialize, Serialize};

/// A single sequencing read (pre-processed from BAM).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Read {
    pub start: usize,
    pub length: usize,
    pub strand: char,
    pub mapq: u8,
}

/// Pileup layout result — assigns each read to a non-overlapping row.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReadLayout {
    pub read_index: usize,
    pub row: usize,
    pub start: usize,
    pub end: usize,
}

/// Compute pileup layout (assign reads to rows so they don't overlap).
pub fn layout_reads(reads: &[Read]) -> Vec<ReadLayout> {
    let mut indexed: Vec<(usize, &Read)> = reads.iter().enumerate().collect();
    indexed.sort_by_key(|(_, r)| r.start);

    let mut row_ends: Vec<usize> = Vec::new();
    let mut result = Vec::with_capacity(reads.len());

    for (idx, read) in indexed {
        let end = read.start + read.length;
        let mut placed = false;

        for (row, row_end) in row_ends.iter_mut().enumerate() {
            if *row_end <= read.start {
                *row_end = end + 1;
                result.push(ReadLayout {
                    read_index: idx,
                    row,
                    start: read.start,
                    end,
                });
                placed = true;
                break;
            }
        }
        if !placed {
            let row = row_ends.len();
            row_ends.push(end + 1);
            result.push(ReadLayout {
                read_index: idx,
                row,
                start: read.start,
                end,
            });
        }
    }

    result
}

/// Compute per-position coverage from reads.
pub fn compute_coverage(reads: &[Read], region_length: usize) -> Vec<u32> {
    let mut cov = vec![0u32; region_length];
    for read in reads {
        for i in read.start..std::cmp::min(read.start + read.length, region_length) {
            cov[i] += 1;
        }
    }
    cov
}

/// Simple variant detection from coverage (for teaching purposes).
/// Finds positions where the alternate allele fraction suggests a variant.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectedVariant {
    pub position: usize,
    pub ref_count: u32,
    pub alt_count: u32,
    pub allele_fraction: f64,
    pub likely_zygosity: String,
}

/// Detect variants from allele counts at each position.
/// `alt_counts[i]` = number of reads showing alternate allele at position i.
/// `total_counts[i]` = total coverage at position i.
pub fn detect_variants(
    alt_counts: &[u32],
    total_counts: &[u32],
    min_alt_fraction: f64,
    min_coverage: u32,
) -> Vec<DetectedVariant> {
    let mut variants = Vec::new();
    let len = std::cmp::min(alt_counts.len(), total_counts.len());

    for i in 0..len {
        let total = total_counts[i];
        let alt = alt_counts[i];
        if total < min_coverage || alt == 0 {
            continue;
        }
        let af = alt as f64 / total as f64;
        if af >= min_alt_fraction {
            let zygosity = if af > 0.85 {
                "hom".to_string()
            } else if af > 0.3 {
                "het".to_string()
            } else {
                "low_fraction".to_string()
            };
            variants.push(DetectedVariant {
                position: i,
                ref_count: total - alt,
                alt_count: alt,
                allele_fraction: af,
                likely_zygosity: zygosity,
            });
        }
    }

    variants
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_layout_no_overlap() {
        let reads = vec![
            Read { start: 0, length: 10, strand: '+', mapq: 60 },
            Read { start: 5, length: 10, strand: '-', mapq: 60 },
            Read { start: 15, length: 10, strand: '+', mapq: 60 },
        ];
        let layout = layout_reads(&reads);
        assert_eq!(layout.len(), 3);
        // First and third should be on same row (no overlap)
        let r0 = layout.iter().find(|l| l.read_index == 0).unwrap();
        let r2 = layout.iter().find(|l| l.read_index == 2).unwrap();
        assert_eq!(r0.row, r2.row);
    }

    #[test]
    fn test_coverage() {
        let reads = vec![
            Read { start: 0, length: 5, strand: '+', mapq: 60 },
            Read { start: 3, length: 5, strand: '-', mapq: 60 },
        ];
        let cov = compute_coverage(&reads, 10);
        assert_eq!(cov[0], 1);
        assert_eq!(cov[3], 2);
        assert_eq!(cov[4], 2);
        assert_eq!(cov[8], 0);
    }
}
