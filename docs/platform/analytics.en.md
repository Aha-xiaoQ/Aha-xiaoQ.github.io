# Visit statistics maintenance

[中文](analytics.md)

The public footer control, explanation and owner-exclusion guide were withdrawn on 2026-10-03. Review baseline: `0c771ad1c4458f3b7c1e5585fc410db8a4395283`. Implementation: `assets/site-analytics.js`; regression: `tests/analytics/privacy.test.mjs`.

## Saved preferences and administration

An existing same-origin localStorage value `xiaoq-stats-owner-excluded=1` continues to exclude that browser. Withdrawal does not delete or rewrite preferences. This boolean is not authentication. Public pages expose no administration controls, and there is no authenticated owner-only entry. Repository maintenance documents remain public source documents, not private administration pages.

SITE_ANALYTICS.getState() supports maintenance checks. The compatible setOwnerExcluded(boolean) interface only changes the preference: it creates no PV, reload or controls, and cannot identify a user. Unavailable storage retains a choice only in the current document. An already loaded independent Cloudflare beacon needs a new document to respect initial-loader exclusion; previous reports cannot be undone. Other same-origin tabs read preference changes for subsequent aggregate events without an automatic reload.

## QA parameters and counting semantics

- stats=off retains tab-scoped QA exclusion across routes and reloads when sessionStorage works. Otherwise it still excludes the current document; reopened links must retain the parameter.
- stats=on clears only QA exclusion, without overriding saved preferences or the global disabled flag. Clearing the owner preference does not clear QA exclusion.
- Aggregate POST requests run only on the production HTTPS host in a top-level, unexcluded page. The payload remains normalized path and visitStart, with omitted credentials and no referrer. It includes no query, fragment, referring page or visitor ID.
- **PV** counts page views. Consecutive same-path events, language/query/anchor changes, index.html aliases and duplicate initialization add no view. A → B → A counts each; a real reload can add a PV.
- **visits** uses the last counted PV time in tab sessionStorage: empty storage or at least 30 minutes sets visitStart=true; recent activity sets false. Duplicate events do not extend the window and exclusion does not update it. Unavailable storage yields null. Duplicated tabs or copied opener storage may inherit the previous time.

visits is not UV, unique people or confirmed humans. No bot or dwell-time filter was added. unknown, uncategorized 404 and historical-count rules remain unchanged.

## Verification limits

This withdrawal changes public entry points without changing backend databases, schema, secrets, historical counts, moderation or permissions. It adds no persistent IP/UA records and makes no claim that existing services keep no logs. Front-end deduplication cannot guarantee backend concurrency deduplication or human identification. A future private administration page needs actual authentication; a query parameter, hidden URL or local boolean cannot substitute for access control.

npm run test:analytics checks exclusion and counting compatibility. npm run analytics:browser checks the local publication artifact in an isolated temporary browser: absent public controls, preserved existing preferences and unavailable storage, without creating production analytics traffic.
