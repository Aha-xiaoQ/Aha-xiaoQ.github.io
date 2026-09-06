# Site Font Record

## Current website typeface — LXGW WenKai / 霞鹜文楷 (2026-09-06)

- All website text, including headings and the clock, uses self-hosted LXGW WenKai.
- Regular and Medium WOFF2 web fonts are subsetted for website text; original glyph outlines and spacing are preserved.
- Upstream: https://github.com/lxgw/LxgwWenKai
- SIL Open Font License 1.1: `fonts/LXGWWenKai-OFL.txt` accompanies the fonts.
- The older LXGW Bright record below is retained for provenance; it is no longer the website face.

## LXGW Bright

- Files: `fonts/LXGWBright-Regular.woff2`, `fonts/LXGWBright-Medium.woff2`
- Source repository: https://github.com/lxgw/LxgwBright
- Pinned source: `v5.528` / commit `c87e019`
- Download source: `https://raw.githubusercontent.com/lxgw/LxgwBright/v5.528/LXGWBright/`
- License: SIL Open Font License 1.1 (`OFL.txt` in the source repository)
- Composition stated by the upstream project: LXGW WenKai Lite plus Ysabeau Office.
- Regular SHA-256: `135B078A1F209A9C0B06612DE4432BD16D4264DB2A0D0977D21D48B529C76521`
- Medium SHA-256: `9E5266FF382A38960E33A60039F1C9C96B22558640F987DDA77FED8BEF77C0A2`

The public site self-hosts these pinned WOFF2 files. The primary LXGW Bright faces use `font-display: block` so a cold entry cannot permanently lock the page to a different fallback glyph set; the declared fallback sequence (`LXGW WenKai`, `KaiTi`, `STKaiti`, `serif`) remains available if a local font file cannot load. `Ysabeau Office` is named as an upstream-recommended installed-font fallback only; this site does not claim to self-host it. No Segoe UI or Consolas declaration is used in visible UI text.
