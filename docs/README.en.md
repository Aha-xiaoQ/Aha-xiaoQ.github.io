# Maintenance index

[简体中文](README.md) | **English**

Visitors can start in [Development](https://aha-xiaoq.github.io/notes/?lang=en). This directory is for source maintainers; current instructions and historical records serve different purposes.

## Current website guides

[Local setup](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/start/?lang=en) · [Content editing](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/content/?lang=en) · [Website structure](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/architecture/?lang=en) · [Publishing](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/publishing/?lang=en)

The public guides are authored in `content/development/projects/pixel-workshop.json`. Edit that source and regenerate pages rather than maintaining duplicate instructions here.

## Current website platform

[Architecture and maintenance](platform/README.en.md) covers module ownership, languages, fonts, verification, and packaging. `platform:build` only generates pages; `platform:verify` runs the complete workflow. Use `platform:plan` to inspect the steps without running them.

## Project engineering guides

Games and map tools keep their instructions in their own `packages/` projects. Select the project and version in the [Mario Mix guide directory](https://aha-xiaoq.github.io/notes/mario-mix/docs/?lang=en). Released games, development candidates, and map tools are separate entries, not interchangeable versions.

## Historical records

`history/` and versioned records preserve the context and results from that time. Their URLs remain available, but earlier test results do not certify the current version. New records should identify the relevant commit, executed checks, and unverified scope. Use current maintenance guides for current procedures. Historical documents without an English edition retain their original language.

## Content and loading

`config/documents.json` registers Markdown reading material. `scripts/dev-center/build.mjs` generates the navigation snapshot and on-demand article bodies. Do not hand-edit `assets/journal/data/`. Publication output is in `.local/publish`; verification logs stay in `.local/platform/` and are not public page content.

Hidden routes and noindex are not access control. Keep credentials, private data, and personal browser profiles out of the public repository.
