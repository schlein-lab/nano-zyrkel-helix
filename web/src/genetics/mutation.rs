/// Mutation effect prediction.

use super::codon::translate_codon;

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
}
