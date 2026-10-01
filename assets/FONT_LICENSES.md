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

## 缺字补充（2026-09-21）

现有本地子集保留不变。`site-brand-tokens.css` 仅为 `尼`（U+5C3C）引用
`lxgw-wenkai-webfont@1.7.0` 的 Regular / Bold 第 114 号公开子集；按实际字重加载，
主 CDN 为 jsDelivr，失败时尝试 cdnjs。上游字体遵循 SIL OFL 1.1，webfont 包代码为 MIT；
不将 webfont 包代码许可当作字体或游戏素材许可。
来源：https://github.com/chawyehsu/lxgw-wenkai-webfont
字体许可：https://github.com/chawyehsu/lxgw-wenkai-webfont/blob/main/packages/lxgw-wenkai-webfont/OFL.txt

第四期标题以普通拉丁字母 `IV` 表示第四期，避免缺失的 Unicode 罗马数字字形混入系统字体。
本轮不附带字体文件；补充字形首次显示需要联网。两个 CDN 都无法访问时保留可读的系统回退。
