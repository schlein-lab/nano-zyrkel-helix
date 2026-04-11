use serde::{Deserialize, Serialize};

/// ACMG criteria with their Bayesian point values (2015 guidelines + 2024 update).
/// Positive = pathogenic evidence, negative = benign evidence.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AcmgCriterion {
    pub code: String,
    pub points: i32,
    pub category: String, // "pathogenic" or "benign"
    pub strength: String, // "very_strong", "strong", "moderate", "supporting", "standalone"
}

/// ACMG classification result.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AcmgClassification {
    pub total_points: i32,
    pub classification: String,
    pub criteria_used: Vec<String>,
}

/// All standard ACMG criteria with their point values.
pub fn all_criteria() -> Vec<AcmgCriterion> {
    vec![
        // Pathogenic
        AcmgCriterion { code: "PVS1".into(), points: 8, category: "pathogenic".into(), strength: "very_strong".into() },
        AcmgCriterion { code: "PS1".into(), points: 4, category: "pathogenic".into(), strength: "strong".into() },
        AcmgCriterion { code: "PS2".into(), points: 4, category: "pathogenic".into(), strength: "strong".into() },
        AcmgCriterion { code: "PS3".into(), points: 4, category: "pathogenic".into(), strength: "strong".into() },
        AcmgCriterion { code: "PS4".into(), points: 4, category: "pathogenic".into(), strength: "strong".into() },
        AcmgCriterion { code: "PM1".into(), points: 2, category: "pathogenic".into(), strength: "moderate".into() },
        AcmgCriterion { code: "PM2".into(), points: 2, category: "pathogenic".into(), strength: "moderate".into() },
        AcmgCriterion { code: "PM3".into(), points: 2, category: "pathogenic".into(), strength: "moderate".into() },
        AcmgCriterion { code: "PM4".into(), points: 2, category: "pathogenic".into(), strength: "moderate".into() },
        AcmgCriterion { code: "PM5".into(), points: 2, category: "pathogenic".into(), strength: "moderate".into() },
        AcmgCriterion { code: "PM6".into(), points: 2, category: "pathogenic".into(), strength: "moderate".into() },
        AcmgCriterion { code: "PP1".into(), points: 1, category: "pathogenic".into(), strength: "supporting".into() },
        AcmgCriterion { code: "PP2".into(), points: 1, category: "pathogenic".into(), strength: "supporting".into() },
        AcmgCriterion { code: "PP3".into(), points: 1, category: "pathogenic".into(), strength: "supporting".into() },
        AcmgCriterion { code: "PP4".into(), points: 1, category: "pathogenic".into(), strength: "supporting".into() },
        AcmgCriterion { code: "PP5".into(), points: 1, category: "pathogenic".into(), strength: "supporting".into() },
        // Benign
        AcmgCriterion { code: "BA1".into(), points: -8, category: "benign".into(), strength: "standalone".into() },
        AcmgCriterion { code: "BS1".into(), points: -4, category: "benign".into(), strength: "strong".into() },
        AcmgCriterion { code: "BS2".into(), points: -4, category: "benign".into(), strength: "strong".into() },
        AcmgCriterion { code: "BS3".into(), points: -4, category: "benign".into(), strength: "strong".into() },
        AcmgCriterion { code: "BS4".into(), points: -4, category: "benign".into(), strength: "strong".into() },
        AcmgCriterion { code: "BP1".into(), points: -1, category: "benign".into(), strength: "supporting".into() },
        AcmgCriterion { code: "BP2".into(), points: -1, category: "benign".into(), strength: "supporting".into() },
        AcmgCriterion { code: "BP3".into(), points: -1, category: "benign".into(), strength: "supporting".into() },
        AcmgCriterion { code: "BP4".into(), points: -1, category: "benign".into(), strength: "supporting".into() },
        AcmgCriterion { code: "BP5".into(), points: -1, category: "benign".into(), strength: "supporting".into() },
        AcmgCriterion { code: "BP6".into(), points: -1, category: "benign".into(), strength: "supporting".into() },
        AcmgCriterion { code: "BP7".into(), points: -1, category: "benign".into(), strength: "supporting".into() },
    ]
}

/// Classify a variant based on selected ACMG criteria codes.
/// Uses the Bayesian point-based system.
pub fn classify(criteria_codes: &[String]) -> AcmgClassification {
    let all = all_criteria();
    let mut total: i32 = 0;
    let mut used = Vec::new();

    for code in criteria_codes {
        if let Some(c) = all.iter().find(|c| c.code == *code) {
            total += c.points;
            used.push(code.clone());
        }
    }

    let classification = if total >= 10 {
        "Pathogenic"
    } else if total >= 6 {
        "Likely Pathogenic"
    } else if total <= -7 {
        "Benign"
    } else if total <= -1 {
        "Likely Benign"
    } else {
        "VUS"
    };

    AcmgClassification {
        total_points: total,
        classification: classification.to_string(),
        criteria_used: used,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pathogenic() {
        let result = classify(&["PVS1".into(), "PM2".into()]);
        assert_eq!(result.classification, "Pathogenic");
        assert_eq!(result.total_points, 10);
    }

    #[test]
    fn test_vus() {
        let result = classify(&["PP3".into()]);
        assert_eq!(result.classification, "VUS");
    }

    #[test]
    fn test_benign() {
        let result = classify(&["BA1".into()]);
        assert_eq!(result.classification, "Benign");
        assert_eq!(result.total_points, -8);
    }

    #[test]
    fn test_likely_pathogenic() {
        let result = classify(&["PS3".into(), "PM2".into()]);
        assert_eq!(result.classification, "Likely Pathogenic");
        assert_eq!(result.total_points, 6);
    }
}
