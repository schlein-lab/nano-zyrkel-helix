# Real Chromosome Crops — Attribution

## Source

Single-chromosome image crops in this directory are derived from:

**Lin C., Yin A., Wu Q., et al. (2023).**
"A novel dataset of human metaphase cell images annotated for cytogenetic analysis."
*Scientific Data* 10, 104.
DOI: https://doi.org/10.1038/s41597-023-02003-7

Dataset DOI: https://doi.org/10.7295/W9CIL54816
Hosted by: Cell Image Library (UC San Diego)

## License

**CC BY 4.0** (Creative Commons Attribution 4.0 International)
https://creativecommons.org/licenses/by/4.0/

You are free to use, share, and adapt these images, including for commercial
purposes, provided you give appropriate credit to the original authors.

## Processing

Each chromosome class (1–22, X, Y) has 30 random crops selected from the
24_chromosomes_object subset of the dataset. Selection criteria:

1. Aspect ratio between 0.15 and 0.85 (filters out fragments and overlapping clumps)
2. Minimum bounding box height of 40 pixels
3. Sorted by lowest IoU with neighboring boxes (cleanest crops first)
4. Random sample from the top 200 cleanest per class

Crops are converted to grayscale, resized to 220px height, and JPEG-compressed
at quality 82 for web delivery.

Processing script: `extract_crops.py` (seed=42 for reproducibility)
