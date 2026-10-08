# Five Regions website revision / 五门挑战网站修订

Date: 2026-10-08. Fetched website parent: 03556c9254469c249e79a906171c9ab57f49c6c6.

This review binds new bytes of already inventoried original website components. The existing game and tool templates receive the Five Regions entry, matching bilingual labels, and a verified Bilibili cover link. The game detail uses the existing image-anchor video panel; no hosted MP4 player or download control is added. Generated pages and shared modules update content/cache identities. The generated font stylesheet retains its licensed source and covers the current text; its identity is the original CSS wrapper, not a new font grant. Both README languages retain stable catalog entries and existing license statements; the Map Workshop entry now points to the tool catalog.

The offline import-map validator checks canonical workshop module names and encodings, parses embedded JavaScript, and verifies the static/literal import graph is closed. Other asset maps retain their existing restrictions. The publication exporter preserves downloadable single-file game HTML bytes. Focused regression tests cover invalid module graphs, escaping, image links and unchanged downloadable HTML.

The baseline inventory, original classification, third-party exceptions and existing licenses are unchanged. This does not extend MIT to the added game HTML, covers, workshop archive or font binaries. The workshop source archive retains its included license; the website directs readers to it. Existing public game/source licenses and attributions remain applicable. Deployment is verified separately.

Reviewed original-component identity paths:

- about/index.html
- assets/i18n/messages.js
- assets/journal/documents.mjs
- assets/journal/experiment.mjs
- assets/journal/public-layout.mjs
- assets/journal/render.mjs
- assets/journal/runtime.mjs
- assets/launch/journey.js
- assets/platform/font-support.css
- assets/release/public-content.mjs
- assets/site-router.js
- assets/ui/site-actions.js
- games/index.html
- games/mario-classic/index.html
- games/mario-mix/index.html
- games/pipebound/index.html
- games/pixel-pipe-adventure/index.html
- games/voxel-frontier/index.html
- index.html
- notes/index.html
- projects/index.html
- projects/q-mimi/index.html
- scripts/launch/build.mjs
- scripts/platform/import-map-audit.mjs
- scripts/publication/build.mjs
- tools/index.html

The shared router and shell now register the existing tool guide by its data-owned detail URL and id, retaining native navigation and browser back/forward. Rendered history navigation is checked alongside direct routes.
- assets/site-shell.js
