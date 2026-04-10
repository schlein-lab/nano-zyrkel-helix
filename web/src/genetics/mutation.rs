/// Mutation effect prediction.

use super::codon::{translate_codon, translate_dna};

#[derive(Clone, Debug, PartialEq)]
pub enum MutationEffect {
    Silent,
    Missense { from: char, to: char },
    Nonsense { from: char },
    Frameshift,
    SpliceAltered,
}

impl MutationEffect {
    pub fn label(&self) -> &'static str {
        match self {
            MutationEffect::Silent => "Silent",
            MutationEffect::Missense { .. } => "Missense",
            MutationEffect::Nonsense { .. } => "Nonsense",
            MutationEffect::Frameshift => "Frameshift",
            MutationEffect::SpliceAltered => "Splice-site altered",
        }
    }
}

/// Predict effect of a single nucleotide substitution at a given CDS position.
pub fn predict_point_mutation(cds: &str, position: usize, new_base: char) -> MutationEffect {
    let chars: Vec<char> = cds.to_uppercase().chars().collect();
    if position >= chars.len() {
        return MutationEffect::Silent;
    }

    let codon_index = position / 3;
    let codon_start = codon_index * 3;
    if codon_start + 3 > chars.len() {
        return MutationEffect::Silent;
    }

    let original_codon: String = chars[codon_start..codon_start + 3].iter().collect();
    let mut mutated: Vec<char> = original_codon.chars().collect();
    mutated[position % 3] = new_base.to_ascii_uppercase();
    let mutated_codon: String = mutated.into_iter().collect();

    let original_aa = translate_codon(&original_codon);
    let mutated_aa = translate_codon(&mutated_codon);

    match (original_aa, mutated_aa) {
        (Some(a), Some(b)) if a == b => MutationEffect::Silent,
        (Some(a), Some(b)) => MutationEffect::Missense { from: a, to: b },
        (Some(a), None) => MutationEffect::Nonsense { from: a },
        _ => MutationEffect::Silent,
    }
}

// ── Indel Prediction ────────────────────────────────────────────

#[derive(Clone, Debug, PartialEq)]
pub struct IndelEffect {
    pub is_frameshift: bool,
    pub net_change: i64,                 // inserted_len - deleted_len
    pub original_protein_len: usize,
    pub mutated_protein_len: usize,
    pub first_changed_aa_pos: Option<usize>,
    pub new_stop_codon_pos: Option<usize>, // protein position (1-based) of new stop
    pub label: &'static str,
}

/// Predict effect of an indel (insertion, deletion, or both) at a CDS position.
/// `position` is 0-based CDS position. `inserted` is the inserted sequence (may be empty).
/// `deleted` is the number of bases deleted starting at `position`.
pub fn predict_indel(cds: &str, position: usize, inserted: &str, deleted: usize) -> IndelEffect {
    let upper_cds = cds.to_uppercase();
    let upper_ins = inserted.to_uppercase();
    let bases: Vec<char> = upper_cds.chars().collect();

    let net_change = upper_ins.len() as i64 - deleted as i64;
    let is_frameshift = net_change.rem_euclid(3) != 0;

    // Build mutated CDS
    let safe_pos = position.min(bases.len());
    let safe_del = deleted.min(bases.len().saturating_sub(safe_pos));
    let mut mutated = String::with_capacity(bases.len() + upper_ins.len());
    mutated.push_str(&upper_cds[..safe_pos]);
    mutated.push_str(&upper_ins);
    mutated.push_str(&upper_cds[safe_pos + safe_del..]);

    // Translate both
    let orig_protein: Vec<Option<char>> = translate_dna(&upper_cds);
    let mut_protein: Vec<Option<char>> = translate_dna(&mutated);

    // Find length until first stop in original (excluding stop itself)
    let original_len = orig_protein
        .iter()
        .position(|aa| aa.is_none())
        .unwrap_or(orig_protein.len());

    // Find length until first stop in mutated
    let mutated_len = mut_protein
        .iter()
        .position(|aa| aa.is_none())
        .unwrap_or(mut_protein.len());

    // Find first changed amino acid (relative to start)
    let first_changed = orig_protein
        .iter()
        .zip(mut_protein.iter())
        .position(|(a, b)| a != b);

    // New stop position (1-based protein position)
    let new_stop_pos = if mutated_len < original_len || is_frameshift {
        Some(mutated_len + 1)
    } else {
        None
    };

    let label = if is_frameshift {
        "Frameshift"
    } else if upper_ins.is_empty() {
        if mutated_len < original_len {
            "In-frame deletion (with PTC)"
        } else {
            "In-frame deletion"
        }
    } else if deleted == 0 {
        "In-frame insertion"
    } else {
        "In-frame indel (delins)"
    };

    IndelEffect {
        is_frameshift,
        net_change,
        original_protein_len: original_len,
        mutated_protein_len: mutated_len,
        first_changed_aa_pos: first_changed,
        new_stop_codon_pos: new_stop_pos,
        label,
    }
}

// ── Protein Alignment (for Split-View) ──────────────────────────

#[derive(Clone, Debug, PartialEq)]
pub struct ProteinAlignment {
    pub original: String,           // amino acid sequence (* = stop)
    pub mutated: String,
    pub diff_positions: Vec<usize>, // 0-based positions where AAs differ
    pub first_diff: Option<usize>,
}

/// Compare original and mutated CDS at the protein level.
/// Returns aligned sequences (truncated at the first stop) plus diff positions.
pub fn compare_proteins(original_cds: &str, mutated_cds: &str) -> ProteinAlignment {
    let orig: String = translate_dna(&original_cds.to_uppercase())
        .into_iter()
        .map(|aa| aa.unwrap_or('*'))
        .take_while(|&c| c != '*')
        .collect();

    let mutated: String = translate_dna(&mutated_cds.to_uppercase())
        .into_iter()
        .map(|aa| aa.unwrap_or('*'))
        .take_while(|&c| c != '*')
        .collect();

    let max_len = orig.len().max(mutated.len());
    let orig_chars: Vec<char> = orig.chars().collect();
    let mut_chars: Vec<char> = mutated.chars().collect();

    let mut diff_positions = Vec::new();
    for i in 0..max_len {
        let a = orig_chars.get(i).copied();
        let b = mut_chars.get(i).copied();
        if a != b {
            diff_positions.push(i);
        }
    }

    ProteinAlignment {
        first_diff: diff_positions.first().copied(),
        original: orig,
        mutated,
        diff_positions,
    }
}

// ── NMD Prediction ──────────────────────────────────────────────

/// Predict whether nonsense-mediated decay (NMD) is likely triggered.
///
/// Rule of thumb: NMD is triggered if the premature termination codon (PTC) is
/// located more than 50-55 nucleotides upstream of the LAST exon-exon junction.
/// PTCs in the last exon (or single-exon genes) escape NMD.
///
/// `cds_exon_boundaries` are 0-based CDS positions where each exon starts (so
/// first entry is always 0). `ptc_cds_position` is the 0-based CDS position of
/// the first base of the stop codon.
pub fn predict_nmd(cds_exon_boundaries: &[usize], ptc_cds_position: usize) -> bool {
    // Single-exon gene → no downstream EJC → no NMD
    if cds_exon_boundaries.len() <= 1 {
        return false;
    }

    // Last exon-exon junction = start of last exon
    let last_exon_start = *cds_exon_boundaries.last().unwrap();

    // PTC in last exon → no NMD
    if ptc_cds_position >= last_exon_start {
        return false;
    }

    // Distance from PTC to last exon-exon junction
    // (using junction = start of last exon as the reference point)
    let distance_to_last_eej = last_exon_start.saturating_sub(ptc_cds_position);

    // 50-55 nt rule (use 50 as threshold)
    distance_to_last_eej > 50
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_silent_mutation() {
        // CTT -> CTC = both Leucine
        let effect = predict_point_mutation("CTT", 2, 'C');
        assert_eq!(effect, MutationEffect::Silent);
    }

    #[test]
    fn test_missense() {
        // GAG (E) -> GTG (V) at position 1
        let effect = predict_point_mutation("GAG", 1, 'T');
        assert_eq!(effect, MutationEffect::Missense { from: 'E', to: 'V' });
    }

    #[test]
    fn test_nonsense() {
        // CAG (Q) -> TAG (Stop) at position 0
        let effect = predict_point_mutation("CAG", 0, 'T');
        assert_eq!(effect, MutationEffect::Nonsense { from: 'Q' });
    }

    #[test]
    fn test_frameshift_single_deletion() {
        // ATG GCC GCC GCC TAA → delete pos 3 (G of GCC) → ATG CCG CCG CCT AA…
        // Frameshift, original protein length = 4 (M, A, A, A)
        let cds = "ATGGCCGCCGCCTAA";
        let effect = predict_indel(cds, 3, "", 1);
        assert!(effect.is_frameshift);
        assert_eq!(effect.net_change, -1);
        assert_eq!(effect.original_protein_len, 4);
    }

    #[test]
    fn test_in_frame_deletion() {
        // ATG GCC GCC GCC TAA → delete CDS pos 3..6 (GCC) → ATG GCC GCC TAA
        // In-frame, one fewer amino acid
        let cds = "ATGGCCGCCGCCTAA";
        let effect = predict_indel(cds, 3, "", 3);
        assert!(!effect.is_frameshift);
        assert_eq!(effect.net_change, -3);
        assert_eq!(effect.original_protein_len, 4);
        assert_eq!(effect.mutated_protein_len, 3);
    }

    #[test]
    fn test_in_frame_insertion() {
        // Insert GCC (one Ala codon) at position 3
        let cds = "ATGGCCGCCGCCTAA";
        let effect = predict_indel(cds, 3, "GCC", 0);
        assert!(!effect.is_frameshift);
        assert_eq!(effect.net_change, 3);
        assert_eq!(effect.mutated_protein_len, 5);
    }

    #[test]
    fn test_compare_proteins() {
        let orig = "ATGGAGGCCTAA"; // M E A *
        let mut_ = "ATGGTGGCCTAA"; // M V A *
        let aln = compare_proteins(orig, mut_);
        assert_eq!(aln.original, "MEA");
        assert_eq!(aln.mutated, "MVA");
        assert_eq!(aln.diff_positions, vec![1]);
        assert_eq!(aln.first_diff, Some(1));
    }

    #[test]
    fn test_nmd_single_exon() {
        // Single exon → no NMD
        assert!(!predict_nmd(&[0], 100));
    }

    #[test]
    fn test_nmd_ptc_in_last_exon() {
        // PTC in last exon → no NMD
        // Exons start at 0 and 200; PTC at position 250 (in last exon)
        assert!(!predict_nmd(&[0, 200], 250));
    }

    #[test]
    fn test_nmd_ptc_far_from_last_eej() {
        // Exons at 0, 100, 500. PTC at position 50 → distance to last EEJ (500) = 450 > 50 → NMD
        assert!(predict_nmd(&[0, 100, 500], 50));
    }

    #[test]
    fn test_nmd_ptc_close_to_last_eej() {
        // Exons at 0, 100, 500. PTC at position 470 → distance = 30 < 50 → no NMD
        assert!(!predict_nmd(&[0, 100, 500], 470));
    }
}
