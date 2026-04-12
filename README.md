# nano-zyrkel-helix

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://schlein-lab.github.io/nano-zyrkel-helix/)

**Interactive Human Genetics Teaching Suite** — 6 WASM-powered modules that teach genetics concepts with real genomic data.

---

## Modules

| # | Module | What Students Learn | Data Source |
|---|---|---|---|
| 1 | **Hardy-Weinberg** | Allele frequencies, equilibrium testing with real population data | gnomAD |
| 2 | **Mendel Lab** | Pedigree construction and inheritance pattern analysis | Simulated + textbook cases |
| 3 | **Evolution Sandbox** | Population genetics, genetic drift, migration | gnomAD populations |
| 4 | **Mutations** | Protein impact prediction — missense, nonsense, frameshift | ClinVar |
| 5 | **Sequencing Lab** | Coverage, read alignment, genome analysis | Simulated |
| 6 | **Karyotype** | Interactive chromosome sorting and banding patterns | Ensembl ideograms |

**Try it now** → [schlein-lab.github.io/nano-zyrkel-helix](https://schlein-lab.github.io/nano-zyrkel-helix/)

## How It Works

Each module is a self-contained Rust application compiled to WebAssembly. Modules run entirely in the browser — no server required after initial load. Real genomic datasets are bundled or fetched client-side from public APIs.

## Architecture

helix is a downstream consumer of the [nano-zyrkel](https://github.com/schlein-lab/nano-zyrkel) central core architecture:

- **Domain code (this repo)** — `web/`: Hardy-Weinberg, Mendelian inheritance, mutation simulation, population genetics, sequencing, karyotyping.
- **Generic primitives (central core)** — `nano-zyrkel-wasm-core` pinned via Cargo dep in `web/Cargo.toml`. Provides `DataLoader`, `ConfigReader`, `Stats` and a chart kit.
- **Updates** — `.nano-zyrkel-versions.json` pins the binary + WASM core versions.

## Embed in Your Course

Individual modules can be embedded as iframes in any LMS (Moodle, Canvas, etc.):

```html
<iframe
  src="https://schlein-lab.github.io/nano-zyrkel-helix/"
  width="100%" height="600" frameborder="0">
</iframe>
```

## Build

Requires [Rust](https://rustup.rs/):

```bash
cargo install wasm-pack
cd web && wasm-pack build --target web --out-dir pkg --features wasm --no-default-features
```

## Data Sources

| Source | Used By | License |
|---|---|---|
| [gnomAD](https://gnomad.broadinstitute.org/) | Hardy-Weinberg, Evolution | ODbL |
| [ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/) | Mutations | Public Domain |
| [Ensembl](https://www.ensembl.org/) | Karyotype | Apache 2.0 |

## License

MIT

---

<sub>Part of the [nano-zyrkel](https://github.com/schlein-lab) ecosystem. Built by [Schlein Lab](https://zyrkel.com).</sub>
