# Local validation record

[简体中文](VALIDATION.md) | **English**

Independent provenance review, complete source checks and the local public-artifact checks for the licensing revision were completed. These are historical results for that revision, not automatic certification of later bilingual maintenance.

- Fixed Git baseline: `4bc75da9e038a45886a119b1d8c16402990702c9`.
- Local environment: Node.js v24.19.0; source requires Node.js 22+.
- A sparse checkout was expanded with every baseline asset. Existing works, maps, art, fonts, recordings and download ZIP bytes were unchanged.
- Exact-manifest checks and new regressions: 7/7 passed.
- Path safety, editor model/interaction, gamepads, room selection and collaboration state: 48/48 passed.
- `npm run collab:build` updated `dev/project-data.js` and `collab/TASKS.md`; the final `--check` was synchronized.
- `npm run journal:build` and `npm run site:build` passed and reported zero changes.
- The initial sparse-checkout `npm run check` stopped because fonts were deliberately absent. The complete checkout passed after restoring them; that environment gap was not a functional regression.
- `npm run check`: complete aggregate checks passed, including licensing checks.
- `npm test`: 27 Node test groups, 1975/1975 passed, no failures/skips, including the seven license regressions.
- `npm run release:test`: 145/145 passed.
- `node --check scripts/oss/check.mjs` and `node --check tests/oss/license.test.mjs` passed.
- `npm run release:prepare` / `npm run release:check`: final local public artifact passed. An earlier prepare correctly refused to write while LICENSE changed during its check; the final rerun passed. This describes the checks before publication.
- Independent read-only review examined provenance, notices, embedded data and identity of the original 351 candidate sources, and compared editor sources with existing Terra/Episode 1/runtime implementations. Three mixed adapters were excluded, leaving 348 original-component scopes; the HUD bitmap glyph table was separately excluded. This was a limited provenance review, not complete repository-wide legal clearance.

The three baseline CI runs apply only to the historical baseline. The licensing revision was subsequently published on 2026-10-02; exact source/deployment SHAs and CI links are recorded in [Maintainer and CI](MAINTAINER_AND_CI.en.md). Later bilingual maintenance must run its own validation.

This record does not cover full visual/device/physical-gamepad/natural-completion acceptance, third-party legal clearance, manufacturer GLB/PDF/ZIP provenance, or relicensing Q咪's separate repository and historical archives. No application was submitted.
