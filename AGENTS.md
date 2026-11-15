# Website maintenance

Read this file in every checkout before changing this website. These rules apply
to content additions, generated pages, layout repairs and publishing work.

- Preserve the accepted site identity: existing navigation, colors, typography,
  content categories, bilingual behavior and download conventions. A content
  update does not authorize a redesign or a second template system.
- Inspect the current branch, remote and dirty state; fetch and reconcile the
  latest intended upstream before editing and again before publishing. Preserve
  concurrent changes and removed content. Never publish an older checkout over
  newer work. If a push fails, stop that release sequence and reconcile first.
- Read the actual source/template and its runtime dependencies. Update the
  generator or renderer as well as the generated page. Keep prerendered HTML and
  client-side rendering consistent; do not rely on styles left by another route.
- The home route uses `assets/promo.css` and `assets/promo.js`; the router disables
  `assets/site-shell.css` there. Home additions need home-owned styles. Sections
  beneath the two-column hero must explicitly span the intended grid columns.
- Shared headers have brand, navigation and a tool group. Search and language
  controls belong together in `.q-header-tools`. Standalone pages without `#app`
  must provide their own correctly scoped initialization/styles instead of
  assuming the application runtime will repair copied markup.
- Before delivery, inspect the changed regions in a fresh direct load, refresh,
  and internal navigation away/back where supported. Check desktop, mobile and
  affected breakpoint widths; test both languages for changed navigation. Verify
  intended rows, alignment, card styles, overlap and overflow visually. A passing
  HTTP request, full-page screenshot or scroll-width check alone is insufficient.
  For navigation changes, also click successive sections before entry animation
  finishes and use browser back/forward. URL, page body and the single current
  navigation marker must agree; decorative transitions must not absorb input.
- Keep text/font coverage, asset URLs and cache/import-map versions consistent.
  Use existing build/publication commands and update all intended destinations
  from the same reviewed source. Verify each deployment separately.
- Keep internal reports, local paths, credentials and assistant conversation out
  of visitor pages and downloads. Preserve useful usage instructions, provenance
  and third-party notices. Changes to these repository rules are part of source
  review, not visible visitor UI.
- Record source revision, changed routes, checks, known gaps and deployment
  receipts in the existing task workbench. Distinguish edited, tested and live.
  A local check or one successful destination does not prove both sites updated.

When installed, use `q-html-interface-design` for targeted rendered checks and
`q-code-lifecycle` website release checks. Video-related updates also use
`q-video-publishing`. These supplement this repository contract; they do not
replace it or grant publishing authorization.
