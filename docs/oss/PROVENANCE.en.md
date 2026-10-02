# Provenance, licensed components and unresolved review

[简体中文](PROVENANCE.md) | **English**

Audit date: 2026-10-02. Baseline: `4bc75da9e038a45886a119b1d8c16402990702c9`. Original code and artifacts were byte-preserved in the licensing revision; the root license and exact-file manifest declare the grant. Baseline Git blobs pin identities; existing sources with original-component grants also record SHA-256. The inventory is not a claim that every file is original, licenses are compatible or every resource is authorized.

## Evidence for original components

### Website, collaboration and path safety

The fourteen program/style files and outer page structure previously covered by `RIGHTS.md` retain their original MIT scope. `LICENSE.collab` declares original collaboration tools, styles, configuration, tests and documentation. The audit adds original website builders, content/routing/UI implementation and test logic, excluding vendored parsers, article snapshots, quotations, media and external services.

`AGENTS.md`, `docs/platform/README.md` and `docs/platform/source-playback.md` document local native implementation, content sources and build boundaries. `scripts/lib/safe-path.mjs` implements lstat-based path boundaries and atomic writes; `tests/security/safe-path.test.mjs` uses synthetic directories/links. This is not a complete sandbox against a process that can race to replace directories.

Source review and existing license statements support licensing original components, but a maintainer commit alone cannot prove that a whole file contains no other authors' content. Component exclusions remain explicit, with no new grants for dependencies or embedded assets.

### Four geometric SVGs

`docs/design-r08/ASSET_SOURCES.md` identifies `assets/illustrations/controller.svg`, `web-studio.svg`, `workflow.svg` and `experiment.svg` as original geometric SVGs without copied reference-site images/marks, remote resources, scripts or external fonts. These four complete files are included in MIT. Nearby map posters, screenshots and the diagnostic-cat sprite are outside this evidence.

### Native map editor

`docs/collab/MAP_EDITOR_PLAN.md` records inspiration from Tiled/LDtk interaction and data organization without copying brands, code or unverified assets. Original editor commits: `6cc3bf8ca7d3494fa1baf9f9ea00aaeee44a7789` and `309f6c23fd66c586d72e635f3af2421cba29a16e`. The manifest lists native editing models/UI, ZIP export, gamepad input, offline builders, launcher/server and original tests. Reference-map loading, external asset paths and exports do not establish redistribution rights for those resources.

`editor-art.mjs` grants only original rendering/UI orchestration. Its inline `HUD_GLYPHS` bitmap table (baseline lines 63–84) completely matches tokens in the table around baseline line 311 of `games/mario-mix/classic-mix.js`, whose mixed provenance remains unresolved. That table is expressly excluded.

`editor-mario-stage.mjs`, `editor-mario-motor.mjs` and `editor-bill.mjs` contain reused platform/movement/weapon logic; Bill also embeds PNG data. Until adaptation and reused components are separated into sufficiently evidenced function scopes, the three complete files remain `NOASSERTION`, outside the new MIT grant.

Retained exceptions include upstream/mixed data in `source-sprite-data.mjs`, `classic-art.mjs` and `source-art.mjs`; embedded fonts in `chill-font.mjs`; `classic-1-1.json`, map-generation/reference files, `tests/fixtures/classic-mix.js` and route fixtures. The M06 runtime, map templates and exported single-file games were not wholly relicensed as original MIT. Using original editor code and distributing levels/ZIPs containing third-party resources are separate rights questions.

### Episode 4 source-organization tools

`packages/mario-mix-episode4/LICENSE-TOOLS.txt` grants the added organization tools, tests and documentation from commit `22e84a7321b77acfb289a51496c6ff36abf3da31`. The manifest includes only organization tools and tests; reused safe-path/ZIP code retains `LICENSE.collab` attribution. Extracted runtime, maps, artwork and audio receive no new license.

### Pelican cycling

`content/experiments/pelican-bicycle.json` records the original prompt, historical model field `GPT-6 Astra Pro`, date `2026-09-24`, 40441 bytes and SHA-256 `ff9bd59b4ab3dbd7ac0af37bc2661c707a73b6111d941325e5db4d64cd40907c`. The inline HTML/CSS/SVG/JavaScript imports no external media or libraries; naming system fonts does not bundle font files. Under the maintainer's original-work instruction, the complete artifact is included in MIT without changing its bytes.

This remains an AI-assisted creative example. AI assistance does not automatically establish exclusive copyright or absence of similar sources; see [Reproduction and limitations](REPRODUCIBILITY.en.md). Other pelican/music videos do not inherit this scope merely through a similar subject.

### Quina's optical workshop

`tools/quina-optics/README.txt` records planning/production by XiaoQ, collaboration with GPT-6 Astra, original mechanical illustrations and simulated sources/samples. `references/来源.md` attributes the manufacturer's manual to Thorlabs and describes an approximate model based on public Czerny–Turner principles, rather than copied manufacturer CAD.

Native WebGL, geometry, shaders, UI code and styles in the three HTML files belong to the audited original implementation. Mathematical/physical principles and references do not grant rights in manufacturer works. Provenance, export chains and licenses for `precision-assembly.glb`, `precision-assembly-bom.json`, PNGs, the logo and `Quina_Interactive_v009.zip` remain insufficiently evidenced; the manufacturer PDF is explicitly excluded. Original `manifest.json` hashes were unchanged and the offline archive was not declared relicensed.

## Retained upstream notices

- Acorn 8.15.0: original LICENSE, copyright and parser bytes retained. The verbatim AUTHORS file was added from upstream commit `6dc537416ad628b3959b3ff963fbdcfdb380e0a3`, Git blob `dc64dabef022eea06a9824f87b34feaa7634dede`; [upstream source](https://github.com/acornjs/acorn/blob/6dc537416ad628b3959b3ff963fbdcfdb380e0a3/AUTHORS).
- LXGW WenKai: SIL OFL 1.1, LXGW/Klee authors, reserved names and subsetting conditions retained. Font binaries and the original notice in `tests/platform/fixtures/wenkai-ofl-source.json` are not MIT. Original test code and synthetic geometric-font generation have their separately listed scope.
- Chill Bitmap/Misaki: `chill-font.mjs` embeds 7px v2.500 and 16px v2.502. Retain the complete 7px/Misaki notice and 16px GPLv2-or-later source, compiled-font OFL 1.1 / GPL embedding-exception terms in `CHILL_FONT_LICENSE.txt`. This audit neither simplifies/interprets their interaction nor relicenses the whole module as website MIT.
- Community Mario: retain the pinned `umaim/Mario` commit/source blob and MIT/Cloud attribution. This does not warrant rights in Nintendo/Contra maps, sprites, recordings, characters or other original-game assets.

## Unresolved audit questions

1. Q咪: site assets declare CC BY-NC 4.0. The local ZIP's complete LICENSE/NOTICE.md identifies Aha_xiaoQ; its sprite matches the site's sprite, SHA-256 `f79daf1a56b6dfabddf72de689e722876d53567350615d5b8af3c0e59e4348f4`. Compare the separate source repository and coordinate any future license changes. Original display code cannot substitute for changes to asset or independent-repository licensing.
2. Mixed games and historical source/offline ZIPs: trace embedded assets and upstream code independently. Retain known notices; do not claim completed authorization or create licenses for unknown content.
3. Optical tool: trace GLB, BOM, PNG, logo and ZIP production/export sources; separately determine whether current redistribution of the manufacturer manual is permitted.
4. Other non-code works, video, music, fan characters, screenshots, copy and media: path/blob inventory alone remains `inventory-only` / `NOASSERTION`, never a repository-wide commercial-use claim.

The provenance audit did not modify separate repositories or repack historical downloads. License documentation was later pushed normally and deployed; exact records are in [Maintainer and CI](MAINTAINER_AND_CI.en.md). No project application was submitted.

## Bilingual maintenance revisions

Subsequent bilingual maintenance on 2026-10-02 updates original language entry points and documentation; existing generators synchronize version aliases and public pages. The manifest’s `reviewedRevisions` records current SHA-256/Git blobs for explicit paths, while `files` retains baseline identities and classifications. Revisions cover existing original components only; unknown entries, upstream code and excluded assets receive no new grant. Original English audit prose is listed in `newFiles`; cited licenses, prompts and third-party works remain excluded.
