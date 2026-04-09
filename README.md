# nano-zyrkel-helix

Interactive Human Genetics Teaching Suite — WASM-powered, real data, embeddable.

## Modules

| Module | Description |
|--------|-------------|
| Hardy-Weinberg | Allele frequency calculator with real gnomAD data |
| Mutations | DNA mutation simulator with protein impact prediction |
| Mendel Lab | Multi-variant family builder with pedigree analysis |
| Evolution | Population genetics sandbox with Out-of-Africa simulation |
| Meiosis | Animated meiosis with crossing-over and LOD scores |
| Karyotype | Drag & drop chromosome sorting workbench |
| Tumor Genetics | Multi-hit cancer model with COSMIC data |
| Pharmacogenetics | Drug metabolism simulator with CYP variants |
| Population Map | Global variant frequency comparator |
| Epigenetics | Methylation and imprinting sandbox |

## Data Sources

All data is pre-cached from public databases:
- [gnomAD](https://gnomad.broadinstitute.org/) — Population frequencies
- [ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/) — Variant classifications
- [COSMIC](https://cancer.sanger.ac.uk/cosmic) — Tumor mutation profiles
- [PharmGKB](https://www.pharmgkb.org/) — Pharmacogenetics
- [Ensembl](https://rest.ensembl.org/) — Gene structure

## Build

```bash
cd web
trunk serve        # Dev server
trunk build --release  # Production build
```

## Embed

Every module is embeddable as an iframe:

```html
<iframe src="https://schlein-lab.github.io/nano-zyrkel-helix/hardy-weinberg?variant=rs334&pop=AFR&embed=true"
        width="800" height="500" frameborder="0"></iframe>
```

## Powered by

[nano-zyrkel](https://github.com/christian-schlein/nano-zyrkel) — autonomous GitHub-native agents by [zyrkel.com](https://zyrkel.com)
