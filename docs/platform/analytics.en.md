# Visit statistics and owner exclusion

[中文](analytics.md)

These are the owner-exclusion rules and their maintenance limits. Implementation review baseline: `8735b6bffa39dcbd1cc635bd897ec59dfc7ef839`. Implementation: `assets/site-analytics.js`; regression tests: `tests/analytics/privacy.test.mjs`.

## Visitor controls

The shared footer offers “Exclude my visits in this browser”, with a pressed state and visible status. Exclusion is off by default. Viewing a page or opening the explanation does not save an owner preference. Only a deliberate click saves `xiaoq-stats-owner-excluded=1` in same-origin localStorage; undo removes that key. It is a boolean choice, without an account, device identifier, IP, UA, path or inferred identity. Browsers, profiles and origins have separate settings; clearing site storage removes the preference.

A successful save reloads the clicked page, so both the aggregate counter and the existing Cloudflare beacon initial loader respect the preference. Previous counts cannot be undone. Other open tabs update their controls on a storage event and respect the preference on subsequent aggregate page events; they are not forcibly reloaded. Their already loaded independent beacon requires a reload to respect the initial-loader exclusion. Removing a script element cannot reliably stop executed code.

If storage is unavailable, the button retains a choice only in the current document and pauses subsequent aggregate reports, with an explicit persistence warning. It cannot reliably control an already loaded independent tracker. “Reopen with counting disabled” adds stats=off so both loaders are excluded when the new document starts. This same-origin link preserves other query parameters and the anchor; its URL is not submitted as analytics data.

## QA compatibility and counting semantics

- stats=off keeps the existing tab-scoped QA exclusion across routes and reloads when sessionStorage works. Without storage, exclusion still holds within the current document; a reopened link must retain the parameter.
- stats=on clears only QA exclusion. It cannot override the owner preference or the global disabled flag. Turning off owner exclusion does not clear QA exclusion.
- Aggregate POST requests still run only on the production HTTPS host, in a top-level page without an exclusion. The payload remains normalized path and visitStart only, with omitted credentials and no referrer. No query, fragment, referring page or visitor ID is submitted.
- **PV** still counts page views. Consecutive same-path events within one document, language/query/anchor changes, index.html aliases and duplicate initialization do not add views. A → B → A counts each view; a real reload can add a PV.
- **visits** still uses the last counted PV time in tab sessionStorage: an empty session or at least 30 minutes of inactivity sets visitStart=true; recent activity sets false. Duplicate events do not extend the window; exclusion does not update it. Unavailable storage yields null, retaining unknown coverage. An ordinary new tab with empty storage starts a window. Tabs receiving copied opener storage or duplicated tabs may inherit the previous time; this is an existing limitation.

visits is not UV, unique people or confirmed humans. The owner control excludes an explicitly chosen browser; it does not identify who is using it. No bot filter or short-dwell heuristic was added because there is no evidence supporting human identification here. unknown and uncategorized 404 rules remain unchanged. Past counts cannot be retroactively classified as human or deducted.

## Maintenance and verification limits

SITE_ANALYTICS.getState() exposes exclusion state. setOwnerExcluded(boolean) sets a preference and updates the controls; it does not synthesize a PV or reload. The footer click reloads only after a successful persistent save. A single initialization guard, successful-route event and path comparison remain the reporting entry points. Tests run through npm run test:analytics and npm test.

This implementation does not change backend databases, schema, secrets, historical counts, moderation or permissions. Transport and existing providers still have their own processing rules; a small front-end payload does not remove those. This change adds no persistent IP/UA records and does not claim that servers keep no logs. Front-end event deduplication cannot guarantee backend concurrency deduplication or human identification; backend idempotency or schema changes require a separate proposal.

Local browser checks use an isolated temporary profile and a loopback server for the publication artifact, without visiting production to create test traffic. Counting semantics: “You can explicitly exclude your own browser; repeated front-end events do not add PVs; all other counting semantics remain unchanged.” Record the effective version. Counts may decline because of exclusions; that does not indicate an increased human share.
