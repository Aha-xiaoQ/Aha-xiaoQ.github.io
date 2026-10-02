# Reproduction and limitations

[简体中文](REPRODUCIBILITY.md) | **English**

## Pin the source and start locally

Baseline: `4bc75da9e038a45886a119b1d8c16402990702c9`. Use Node.js 22+. The original website scripts have no third-party npm dependencies and need no `npm install`.

```sh
git clone https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io.git
cd Aha-xiaoQ.github.io
git checkout 4bc75da9e038a45886a119b1d8c16402990702c9
# To reproduce the published license-document revision, use this exact commit instead:
# git checkout 12e4afacbe4e24e1514bc80f5054e5c61bb7acae
npm run dev
```

Open `http://127.0.0.1:4173/`. The pelican artifact can also be opened directly at `experiments/pelican-bicycle.html`, or served at `/experiments/pelican-bicycle.html`. Start the map editor at `/packages/mario-mix-worlds/atlas/editor.html`; preset maps and play resources have separate rights. `/tools/quina-optics/index.html` requires WebGL 2 and graphics acceleration, with the referenced local assets present for the complete experience.

## Retained creation record: pelican cycling

Source registration: `content/experiments/pelican-bicycle.json`. These are historical recorded fields, not independently verified product specifications or a complete runtime record.

| Field | Recorded value |
| --- | --- |
| Original prompt | 生成一个鹈鹕骑自行车的SVG动画，用html实现，不用做任何测试 |
| Model field | GPT-6 Astra Pro |
| Date | 2026-09-24 |
| Reasoning effort | Not recorded; the source field is `null` |
| Output | Self-contained HTML with inline SVG/CSS/JavaScript |
| Bytes | 40441 |
| SHA-256 | ff9bd59b4ab3dbd7ac0af37bc2661c707a73b6111d941325e5db4d64cd40907c |

The exact model snapshot/API ID, platform, sampling settings, seed, temperature, token limit, elapsed time, cost, attempt count, candidate-selection process, complete earlier conversation and manual edits before/after generation were not fully retained. Do not invent those parameters or interpret `null` as a default or maximum reasoning setting. The original prompt requested no tests; current repository consistency checks do not establish whether testing occurred during generation.

### Results that can be checked again

The same HTML's byte identity is precisely verifiable. In a browser, inspect speed selection, pause/resume, Space controls and reduced-motion preferences. Rendering depends on the browser, device, viewport, system fonts and graphics performance. Automated audit checks verify original bytes and structure, rather than acceptance of all devices and visual interactions.

The original generation process cannot be exactly reproduced from the prompt alone. Even the same model name may later refer to different model versions or service settings; identical output is not promised.

## This is not a standardized performance benchmark

The pelican artifact is a retained creative output. It is not a multi-model comparison, random-sampled test set, blind assessment or reproducible standardized benchmark. It cannot establish success rates, rankings, general code quality, performance gains or superiority over other models.

There is no uniform test set, independent scoring rubric, preregistered experiment, repeat count, control group, failure sample, confidence interval or inter-reviewer consistency record. Documentation can show the prompt and actual artifact, but must not claim proven model capability or superiority. Code and license tests support only their limited checks.

## Educational limits of the optical model

The tool uses public optical principles for approximate light paths and original mechanical illustrations. Sources and samples are simulated, and colors approximate wavelengths. It is not manufacturer CAD, a calibrated instrument, experimental measurements or commercial engineering acceptance. Spectrum displays and native WebGL do not establish scientific accuracy, manufacturing tolerances or instrument performance. Copyright and redistribution of the referenced manual require separate review.

## Open-source and reproduction boundaries

MIT for original source is separate from redistribution rights for third-party assets. A runnable program does not make its maps, art, fonts, music, reference PDF or exported ZIP commercially reusable under MIT. Successful CI does not certify asset authorization, natural game completion, device compatibility, visual results or deployment.
