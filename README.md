# nano-zyrkel-helix

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://schlein-lab.github.io/nano-zyrkel-helix/)
[![Build](https://img.shields.io/github/actions/workflow/status/schlein-lab/nano-zyrkel-helix/deploy.yml?label=build)](https://github.com/schlein-lab/nano-zyrkel-helix/actions)

**Interactive Human Genetics Teaching Suite** — 10 WASM-powered modules that teach genetics concepts with real genomic data.

<!-- ![Helix Modules](docs/screenshot.png) -->

---

## Modules

| # | Module | What Students Learn | Data Source |
|---|---|---|---|
| 1 | **Hardy-Weinberg** | Equilibrium testing with real allele frequencies | gnomAD |
| 2 | **Mutations** | Protein impact prediction — missense, nonsense, frameshift | ClinVar |
| 3 | **Mendel Lab** | Pedigree construction and inheritance pattern analysis | Simulated + textbook cases |
| 4 | **Evolution** | Out-of-Africa migration and genetic drift visualization | gnomAD populations |
| 5 | **Meiosis** | Crossing-over mechanics and LOD score calculation | Simulated recombination |
| 6 | **Karyotype** | Interactive chromosome sorting and banding patterns | Ensembl ideograms |
| 7 | **Tumor Genetics** | Somatic mutation landscapes and driver gene identification | COSMIC |
| 8 | **Pharmacogenetics** | CYP variant phenotypes and drug metabolism prediction | PharmGKB |
| 9 | **Population Map** | Global allele frequency distributions across populations | gnomAD |
| 10 | **Epigenetics** | CpG methylation patterns and genomic imprinting | Ensembl Regulatory |

**Try it now** &rarr; [schlein-lab.github.io/nano-zyrkel-helix](https://schlein-lab.github.io/nano-zyrkel-helix/)

## How It Works

Each module is a self-contained Rust application compiled to WebAssembly via [Trunk](https://trunkrs.dev/). Modules run entirely in the browser — no server required after initial load. Real genomic datasets are bundled or fetched client-side from public APIs.

## Embed in Your Course

Individual modules can be embedded as iframes in any LMS (Moodle, Canvas, etc.):

```html
<!-- Example: Hardy-Weinberg module -->
<iframe
  src="https://schlein-lab.github.io/nano-zyrkel-helix/hardy-weinberg/"
  width="100%" height="600" frameborder="0">
</iframe>
```

## Build

Requires [Rust](https://rustup.rs/) and [Trunk](https://trunkrs.dev/):

```bash
# Install trunk
cargo install trunk

# Development server
trunk serve

# Production build
trunk build --release
```

Output is static HTML/JS/WASM in `dist/` — deploy anywhere.

## Data Sources & Credits

| Source | Used By | License |
|---|---|---|
| [gnomAD](https://gnomad.broadinstitute.org/) | Hardy-Weinberg, Evolution, Population Map | ODbL |
| [ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/) | Mutations | Public Domain |
| [COSMIC](https://cancer.sanger.ac.uk/cosmic) | Tumor Genetics | Academic use |
| [PharmGKB](https://www.pharmgkb.org/) | Pharmacogenetics | CC BY-SA 4.0 |
| [Ensembl](https://www.ensembl.org/) | Karyotype, Epigenetics | Apache 2.0 |

## License

MIT

---

<sub>Part of the [nano-zyrkel](https://github.com/schlein-lab) ecosystem — autonomous agents for computational biology. Built by [Schlein Lab](https://zyrkel.com).</sub>
