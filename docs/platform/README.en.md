# Website architecture and maintenance

[中文](README.md)

The site keeps its static entries, shared shell and native router. This platform work does not replace the theme, primary navigation, card layout or transitions. Published games and original experiment artifacts remain separately protected.

## Daily commands

Run these in a complete repository checkout:

```sh
npm run platform:plan
npm run platform:verify
```

`platform:plan` is read-only. `platform:verify` generates content and pages, runs the existing complete checks and tests, reports local font coverage, checks the publication artifact, and runs browser regressions. It never commits, pushes, changes remote settings or manufactures human approval. `platform:build` only builds. `npm start` and the original commands remain available.

## Ownership and boundaries

`config/site-platform.json` declares site identity, module responsibilities, dependencies, generated-file records, original artifact protection and pipeline order. Content lives in `content/`; portable data contracts live in `assets/platform/contracts.mjs`; the locale owner is `assets/site-i18n.js`; views remain in their existing journal, search and shell modules. Publication creates a separate public artifact. Delivery coordinates these tools rather than defining a second set of business rules.

The module table documents responsibilities and rejects invalid/cyclic declarations. It is not a complete import sandbox for all historical code. Existing game engines have not been restructured by this website update.

Edit source content, not generated HTML. Each existing generator retains its manual-edit protections. Consult the `generated` records for ownership; `.local/` contains private build and verification artifacts, not website copy.

## Content and experiments

Work and video metadata stays in `content/site-data.js`. Project descriptions, stages and guides stay in `content/development/projects/<id>.json`. `startDocuments` selects overview shortcuts; `documentationGroups` groups existing guide IDs without changing the renderer. Unknown or repeated guide references fail validation. Archived documents keep their stable URLs.

Use the existing `journal:add` command for new project drafts. Register experiments in `content/experiments/catalog.json` with a corresponding record under that directory. An experiment records the original prompt, model, explicitly recorded reasoning setting, HTML path, byte count and SHA-256. Unknown reasoning effort is `null`, not an invented ranking.

```sh
npm run experiment:add -- --id paper-bird --title "Paper bird" --subtitle "An animation generation record" --model "Recorded model" --prompt-file experiments/paper-bird-prompt.txt --artifact experiments/paper-bird.html --dry-run
```

Remove `--dry-run` to write a draft registration. Review provenance, rights and actual behavior before setting visibility to `public`. Navigation, guide registration and the detail view derive from the registry, not ID-specific router branches. Original artifacts are not silently rewritten or translated. Preview requests start only on a click; leaving or stopping disposes their iframe and asynchronous lifetime.

## Localization and typography

Add bilingual messages to `content/locales/en.json`. IDs must be unique, and named parameters must match across languages. New modules can use stable keys:

```js
statusElement.textContent = SITE_I18N.message('status.loading-resource', { name: 'Guide' });
```

The source-text `SITE_I18N.translate()` interface remains compatible with legacy modules, and the original frozen dictionary is not mutated. One runtime owns language state across native pages, client navigation and deferred content. It translates placeholders and accessible labels without replacing controls or altering user-entered values. Code, editable content and `translate="no"` originals remain unchanged. Text without an English version is marked with its original language; this does not claim that historical articles are all translated.

Typography keeps the existing WenKai faces and sizes. The scoped layer improves control inheritance, code fonts and readable fallbacks. Pinned WenKai subsets supplement the known pelican characters; the earlier supplement remains. No font binaries are shipped by the platform update.

`npm run platform:fonts` reads the actual repository fonts' cmap tables and writes `.local/platform/font-coverage.json`. Local coverage, declared remote supplementation and required system fallback are distinct. The command does not download or modify fonts, and does not certify remote font loading.

## Page lifecycle

`assets/site-router.js` is the sole owner of internal navigation. Late initial preparation must not overwrite a later route. Back and forward between same-page anchors retain the existing DOM, search input, and experiment preview. Loading the module twice must not attach duplicate routing listeners.

The search module owns listeners per page and form. Remounting the same form preserves input; replacing a form detaches the previous listeners. Search waits until IME composition is committed. Asynchronous results update only the active page and do not reclaim focus after the visitor moves elsewhere. Result and error messages use the shared language owner before they are announced.

A stylesheet retry creates a new request only for the failed resource, while already loaded styles remain reusable. Neither ignoring resource errors nor downloading all styles again is a recovery strategy.

## Code identity and public output

A generated import map routes old module-version aliases to the current content hash, so one module does not acquire multiple runtime instances merely because its URL changed. Module entry script URLs are updated too. The public artifact rebuilds its own map from files it actually contains; a source map is not a public-file allowlist. Final audit checks map structure and target existence. Original embedded works do not receive site scripts.

## Verification

Independent checks continue after a failure; dependent steps are blocked. Logs and source fingerprints are recorded under `.local/platform/`. A successful local result is not a deployment or human approval.

Browser checks use a temporary Edge/Chrome/Chromium profile rather than a personal profile. Component regressions are followed by checks on the real public output: languages, desktop/narrow widths, local resource errors and history. Original game and animation scripts are excluded from this website browser check. External services/fonts are deliberately unavailable in its fallback scenario, which is not an external-availability certification. Set `XIAOQ_BROWSER` to a supported executable when auto-discovery cannot find one. Device policies are not changed or bypassed; a blocked browser test fails rather than being skipped.

## Future one-click packages

After editing and successfully verifying a complete checkout:

```sh
npm run platform:verify
npm run platform:pack -- --base <full-commit-sha> --out ../XiaoQ_Site_Update.zip
```

Packaging requires the current workspace fingerprint to match the successful verification. It takes authored changes relative to an explicit base; generated output is rebuilt on the receiving machine. Output must be outside the repository and must not already exist.

This generic delta workflow covers website code, copy, guides and new experiments. It rejects fonts, existing protected works, game packages, download archives, workflow changes and credentials; specialized game-release workflows remain separate.

Extract into a new directory. `CHECK_ONLY.cmd` verifies without committing or pushing; `START.cmd` runs the same gates and then performs a normal push. The updater uses an isolated checkout and official GitHub CLI credentials, checks account/branch/base/staged scope, refuses conflicting remote changes, never force-pushes and never changes Pages settings automatically.

Interaction regressions run the actual router and search source with controlled history, resource delivery, and fetch doubles. They test races and cleanup, not whole-site HTTP behavior. Keep component, publication-browser, and manual-device results separate.

## Video works

The Lab also supports `kind: "video"` records. They share registration, listings and detail routes with HTML experiments, without inventing prompts, model settings or downloadable source files. See [Maintaining Lab videos](lab-videos.en.md).
