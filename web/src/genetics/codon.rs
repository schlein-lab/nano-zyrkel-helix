/// Codon table and DNA/RNA translation utilities.

/// Translate a 3-letter codon to amino acid (single letter).
pub fn translate_codon(codon: &str) -> Option<char> {
    match codon.to_uppercase().as_str() {
        "TTT" | "TTC" => Some('F'),
        "TTA" | "TTG" | "CTT" | "CTC" | "CTA" | "CTG" => Some('L'),
        "ATT" | "ATC" | "ATA" => Some('I'),
        "ATG" => Some('M'), // Start
        "GTT" | "GTC" | "GTA" | "GTG" => Some('V'),
        "TCT" | "TCC" | "TCA" | "TCG" | "AGT" | "AGC" => Some('S'),
        "CCT" | "CCC" | "CCA" | "CCG" => Some('P'),
        "ACT" | "ACC" | "ACA" | "ACG" => Some('T'),
        "GCT" | "GCC" | "GCA" | "GCG" => Some('A'),
        "TAT" | "TAC" => Some('Y'),
        "TAA" | "TAG" | "TGA" => None, // Stop
        "CAT" | "CAC" => Some('H'),
        "CAA" | "CAG" => Some('Q'),
        "AAT" | "AAC" => Some('N'),
        "AAA" | "AAG" => Some('K'),
        "GAT" | "GAC" => Some('D'),
        "GAA" | "GAG" => Some('E'),
        "TGT" | "TGC" => Some('C'),
        "TGG" => Some('W'),
        "CGT" | "CGC" | "CGA" | "CGG" | "AGA" | "AGG" => Some('R'),
        "GGT" | "GGC" | "GGA" | "GGG" => Some('G'),
        _ => None,
    }
}

/// Translate a DNA sequence (from CDS start) to amino acid sequence.
pub fn translate_dna(dna: &str) -> Vec<Option<char>> {
    let upper = dna.to_uppercase();
    let chars: Vec<char> = upper.chars().collect();
    chars
        .chunks(3)
        .filter(|c| c.len() == 3)
        .map(|c| {
            let codon: String = c.iter().collect();
            translate_codon(&codon)
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_start_codon() {
        assert_eq!(translate_codon("ATG"), Some('M'));
    }

    #[test]
    fn test_stop_codons() {
        assert_eq!(translate_codon("TAA"), None);
        assert_eq!(translate_codon("TAG"), None);
        assert_eq!(translate_codon("TGA"), None);
    }

    #[test]
    fn test_translate_sequence() {
        let protein = translate_dna("ATGTTTAAA");
        assert_eq!(protein, vec![Some('M'), Some('F'), Some('K')]);
    }
}
