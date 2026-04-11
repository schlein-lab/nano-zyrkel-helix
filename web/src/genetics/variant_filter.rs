use serde::{Deserialize, Serialize};

/// A variant from a VCF file (simplified for teaching).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Variant {
    pub gene: String,
    pub hgvs_c: String,
    pub effect: String,
    pub maf_gnomad: f64,
    pub zygosity: String,
    pub quality: String,
    pub cadd: f64,
    pub is_causal: bool,
}

/// Filter configuration.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct FilterConfig {
    pub require_pass: bool,
    pub max_maf: f64,
    pub require_coding: bool,
    pub require_protein_effect: bool,
    pub gene_list: Vec<String>,
    pub inheritance_model: String, // "ar", "ad", "denovo", "none"
}

/// Result of filtering with counts at each step.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilterFunnel {
    pub step_counts: Vec<u64>,
    pub step_labels: Vec<String>,
    pub remaining: Vec<Variant>,
    pub causal_filtered_out: bool,
}

/// Apply cascading filters and return a funnel showing counts at each step.
pub fn filter_variants(variants: &[Variant], config: &FilterConfig) -> FilterFunnel {
    let mut remaining: Vec<Variant> = variants.to_vec();
    let mut step_counts = vec![remaining.len() as u64];
    let mut step_labels = vec!["Raw".to_string()];
    let mut causal_filtered_out = false;

    // Step 1: Quality filter
    if config.require_pass {
        let before_causal = remaining.iter().any(|v| v.is_causal);
        remaining.retain(|v| v.quality == "PASS");
        let after_causal = remaining.iter().any(|v| v.is_causal);
        if before_causal && !after_causal {
            causal_filtered_out = true;
        }
        step_counts.push(remaining.len() as u64);
        step_labels.push("Quality (PASS)".to_string());
    }

    // Step 2: MAF filter
    if config.max_maf > 0.0 {
        let before_causal = remaining.iter().any(|v| v.is_causal);
        remaining.retain(|v| v.maf_gnomad <= config.max_maf);
        let after_causal = remaining.iter().any(|v| v.is_causal);
        if before_causal && !after_causal {
            causal_filtered_out = true;
        }
        step_counts.push(remaining.len() as u64);
        step_labels.push(format!("MAF < {:.1}%", config.max_maf * 100.0));
    }

    // Step 3: Coding/splice filter
    if config.require_coding {
        let coding_effects = [
            "missense", "nonsense", "frameshift", "splice",
            "synonymous", "inframe_deletion", "inframe_insertion",
        ];
        let before_causal = remaining.iter().any(|v| v.is_causal);
        remaining.retain(|v| coding_effects.iter().any(|e| v.effect == *e));
        let after_causal = remaining.iter().any(|v| v.is_causal);
        if before_causal && !after_causal {
            causal_filtered_out = true;
        }
        step_counts.push(remaining.len() as u64);
        step_labels.push("Coding / Splice".to_string());
    }

    // Step 4: Protein effect filter
    if config.require_protein_effect {
        let effect_types = ["missense", "nonsense", "frameshift", "splice"];
        let before_causal = remaining.iter().any(|v| v.is_causal);
        remaining.retain(|v| effect_types.iter().any(|e| v.effect == *e));
        let after_causal = remaining.iter().any(|v| v.is_causal);
        if before_causal && !after_causal {
            causal_filtered_out = true;
        }
        step_counts.push(remaining.len() as u64);
        step_labels.push("Protein effect".to_string());
    }

    // Step 5: Gene list filter
    if !config.gene_list.is_empty() {
        let before_causal = remaining.iter().any(|v| v.is_causal);
        remaining.retain(|v| config.gene_list.iter().any(|g| v.gene == *g));
        let after_causal = remaining.iter().any(|v| v.is_causal);
        if before_causal && !after_causal {
            causal_filtered_out = true;
        }
        step_counts.push(remaining.len() as u64);
        step_labels.push("Gene list".to_string());
    }

    // Step 6: Inheritance model
    match config.inheritance_model.as_str() {
        "ar" => {
            // Keep hom variants and genes with ≥2 het variants
            let mut gene_het_count: std::collections::HashMap<String, usize> = std::collections::HashMap::new();
            for v in &remaining {
                if v.zygosity == "het" {
                    *gene_het_count.entry(v.gene.clone()).or_insert(0) += 1;
                }
            }
            let before_causal = remaining.iter().any(|v| v.is_causal);
            remaining.retain(|v| {
                v.zygosity == "hom"
                    || gene_het_count.get(&v.gene).copied().unwrap_or(0) >= 2
            });
            let after_causal = remaining.iter().any(|v| v.is_causal);
            if before_causal && !after_causal {
                causal_filtered_out = true;
            }
            step_counts.push(remaining.len() as u64);
            step_labels.push("Segregation (AR)".to_string());
        }
        "ad" => {
            remaining.retain(|v| v.zygosity == "het");
            step_counts.push(remaining.len() as u64);
            step_labels.push("Segregation (AD)".to_string());
        }
        _ => {}
    }

    FilterFunnel {
        step_counts,
        step_labels,
        remaining,
        causal_filtered_out,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_maf_trap() {
        let variants = vec![
            Variant {
                gene: "ACADM".into(),
                hgvs_c: "c.985A>G".into(),
                effect: "missense".into(),
                maf_gnomad: 0.014,
                zygosity: "hom".into(),
                quality: "PASS".into(),
                cadd: 28.0,
                is_causal: true,
            },
            Variant {
                gene: "OTHER".into(),
                hgvs_c: "c.100A>G".into(),
                effect: "synonymous".into(),
                maf_gnomad: 0.3,
                zygosity: "het".into(),
                quality: "PASS".into(),
                cadd: 5.0,
                is_causal: false,
            },
        ];

        // Strict MAF filter (1%) should filter out the causal variant
        let config = FilterConfig {
            require_pass: true,
            max_maf: 0.01,
            require_coding: false,
            require_protein_effect: false,
            gene_list: vec![],
            inheritance_model: "none".into(),
        };
        let result = filter_variants(&variants, &config);
        assert!(result.causal_filtered_out);

        // Relaxed MAF filter (5%) should keep it
        let config2 = FilterConfig {
            max_maf: 0.05,
            ..config
        };
        let result2 = filter_variants(&variants, &config2);
        assert!(!result2.causal_filtered_out);
    }
}
