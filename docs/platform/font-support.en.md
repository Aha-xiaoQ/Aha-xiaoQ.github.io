# Website font maintenance

Run `npm run platform:verify` in the complete repository. The one-click updater uses the same pipeline; system font installation is not required.
The first build and any later text that needs new glyphs require a network connection to retrieve pinned font assets. Verified files are then self-hosted with the website rather than fetched from a third-party font CDN by visitors.

The existing WenKai Regular / Medium subsets remain unchanged. `scripts/platform/font-support.mjs` collects bilingual content, runtime strings and generated site-shell text, reads actual cmap tables and selects only missing letters, numbers, Han characters and punctuation from `lxgw-wenkai-webfont@1.7.0`.
The pinned Git tree, stylesheets and font blob identities are checked before the font's actual cmap. Generated CSS restricts each face to required missing codepoints. It provides both the isolated `LXGW WenKai Local` alias and compatibility with explicit `LXGW WenKai` declarations.
The isolated alias avoids loading obsolete remote supplement faces through the same FontFaceSet.load request. Original covered glyphs, sizes, colors and spacing are preserved.

## Text extraction boundaries

The build uses pinned Acorn 8.15.0 to parse JavaScript without executing it. String values and template segments are collected; comments, identifiers and regular-expression syntax are not display text. JavaScript and JSON escapes are decoded once, separately from HTML entities.
Ordinary data and object keys remain conservative inputs. Only the known `SITE_EN` and `SITE_LOCALE_MESSAGES.en` translation maps distinguish lookup keys from output values. Real Chinese page content and `SITE_LOCALE_KEYS` Chinese outputs still require glyph coverage.
Episode IV uses the same Latin `IV` spelling in both stable message IDs. The legacy `SITE_EN` lookup alias remains compatible with English translation.
The build-only parser and its MIT license are under `scripts/platform/vendor/acorn/`; no extra npm installation is needed and no parser is loaded by public pages.

Static extraction is not complete data-flow or visibility analysis. The final DOM check remains mandatory. There is no character blacklist: the same codepoint is rejected when actually used as unsupported display text.

## Pipeline and ownership

Fonts are prepared before page generation and refreshed afterward. Both the source check and the dedicated font-coverage gate reject uncovered text; a system fallback is not a passing result.
The browser gate compares decoded DOM text and input labels with effective local coverage and checks real font decoding/selection at weights 400, 500, 600 and 700.

`docs/platform/font-provider.json` stores pinned provider metadata; `docs/platform/generated-fonts.json` records owned outputs. The stylesheet is `assets/platform/font-support.css`; font files use SHA-256 filenames under `assets/platform/font-support/`. Diagnostics are written to `.local/platform/font-coverage.json`.
Do not hand-edit generated identities or overwrite the original site subsets. Conflicts stop the build. Update ZIP payloads still exclude fonts; only verified, registered, content-addressed files created in the receiving checkout may be staged. Future delta packages exclude these generated files and rebuild them instead.

## Scope

Emoji and non-text symbols are reported separately and may use installed fallbacks. This is not a guarantee for every Unicode scalar or every operating system's rendering.
Independent games and original standalone works are not rewritten. The Mid-Autumn redraw tool has its own glyph checks; the final MP4 has burned-in captions and needs no fonts to play.
Existing complete source, publication and browser checks remain mandatory.

## License copy

The font build reads the existing `assets/fonts/LXGWWenKai-OFL.txt` without changing its source bytes.
Only the generated `assets/platform/font-support/OFL.txt` is formatted with LF line endings, no ASCII spaces or tabs at line ends, and one final newline. Copyright notices, license terms, paragraph order, punctuation, indentation and spaces inside lines are preserved.
The generated record stores the source and output SHA-256 digests, byte lengths and the formatting rule separately. Coverage checks verify both the copy and its provenance, not merely its presence.
Existing generated records are verified against their old digests before an upgrade. Hand-edited or missing owned outputs still stop the build. A repeated build does not reintroduce the source's trailing spaces.
The normal Git whitespace check remains enabled for all staged files, including the license copy; no path is exempted.
