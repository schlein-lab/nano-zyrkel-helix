use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Gene {
    pub symbol: String,
    pub ensembl_id: String,
    pub chromosome: String,
    pub transcripts: Vec<Transcript>,
    pub variants: Vec<Variant>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Variant {
    pub rs_id: Option<String>,
    pub hgvs_c: Option<String>,
    pub hgvs_p: Option<String>,
    pub significance: String,
    pub populations: HashMap<String, f64>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Transcript {
    pub ensembl_id: String,
    pub exons: Vec<Exon>,
    pub cds_start: u64,
    pub cds_end: u64,
    pub protein_length: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Exon {
    pub number: u32,
    pub start: u64,
    pub end: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Population {
    pub code: String,
    pub name: String,
    pub sample_size: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TumorProfile {
    pub tumor_type: String,
    pub top_genes: Vec<(String, f64)>,
    pub driver_pathway: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DrugGenePair {
    pub drug: String,
    pub gene: String,
    pub cyp_variant: String,
    pub metabolizer_status: String,
    pub evidence_level: String,
}
