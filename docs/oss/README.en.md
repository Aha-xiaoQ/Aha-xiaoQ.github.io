# Audited original scope

[简体中文](README.md) | **English**

Only original components supported by provenance evidence are included in MIT. This is not a repository-wide relabeling. The fixed baseline is `4bc75da9e038a45886a119b1d8c16402990702c9`, reviewed on 2026-10-02.

- [Exact-file manifest](FILE_MANIFEST.json): complete baseline inventory, component scope, Git blob, classification and evidence; filter by `classification`.
- [Provenance and exceptions](PROVENANCE.en.md): originals, upstream licenses, unknown sources, mixed rights and unresolved review.
- [Reproduction and limitations](REPRODUCIBILITY.en.md): local startup, the retained creation record and model-evaluation limits.
- [Maintainer and CI](MAINTAINER_AND_CI.en.md): role evidence, exact commits and actual runs.
- [Validation record](VALIDATION.en.md): executed commands, results and uncovered scope.
- [Root license](../../LICENSE) and [rights notice](../../RIGHTS.md): the actual grant.

## Reading the manifest

`original-MIT` grants only the original components named in that entry's `scope`; exclusions still apply. `third-party-original-license` retains upstream notices. `existing-project-license` retains a previously declared project license, such as Q咪 CC BY-NC; it does not imply that this site owns or grants all rights in the underlying work. `unknown` / `NOASSERTION` grants no license. `review: inventory-only` records a path and source blob, not a completed legal review of its contents.

Scopes use explicit file paths, never directory globs. Mixed files can contain excluded third-party components. New or changed files do not automatically inherit a grant from a historical snapshot; review their provenance and exclusions first. Reviewed revisions retain baseline identities separately from current bytes and do not change the baseline classifications or exceptions.

## Local checks

Use Node.js 22+; npm installation is unnecessary:

```sh
npm run oss:verify
```

The verifier does not access the network, upload or push. It checks manifest structure, exact baseline inventory when Git objects are available, key exclusions, source bytes, original SVG dependencies, the original pelican artifact and retained licenses. It cannot decide copyright ownership or replace third-party authorization, full game/device acceptance or remote CI. It is a consistency test, not legal clearance or a performance benchmark.
