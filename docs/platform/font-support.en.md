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

## Matching the primary weights

The primary faces use exact weights 400, 500, 600 and 700. Supplemental CSS must use the same four exact descriptors. A `500 700` range in the same `LXGW WenKai` family can select an incomplete font group and send previously covered Chinese or Latin text to installed fonts.
The generated record keeps its existing regular/bold grouping. CSS expands the bold group to three exact weights referencing the same unchanged file; the browser can reuse that file.

## Pipeline and ownership

Fonts are prepared before page generation and refreshed afterward. Both the source check and the dedicated font-coverage gate reject uncovered text; a system fallback is not a passing result.
The existing coverage gate compares decoded DOM text and input labels with effective local coverage.
`font-render-regression` generates original geometric fixture glyphs at runtime and checks primary/supplement matching. Old range matching is diagnostic; corrected matching, missing resources and overridden element fonts remain mandatory positive/negative cases. A future browser is not required to preserve the old failure.
`font-source-pages` inspects actual elements in the source-branch HTML, in both languages at 1440, 390 and 320 pixels. It reads browser font selection for existing headings, prose and buttons, without inserting probe paragraphs or forcing their fonts; a separate mixed run covers authored primary and supplemental characters.
The public-artifact browser gate repeats the actual-element check. Missing font evidence, Chinese/Latin system fallbacks and font loading failures block publication. Code blocks and independent original works are outside this site-UI check.

`docs/platform/font-provider.json` stores pinned provider metadata; `docs/platform/generated-fonts.json` records owned outputs. The stylesheet is `assets/platform/font-support.css`; font files use SHA-256 filenames under `assets/platform/font-support/`. Diagnostics are written to `.local/platform/font-coverage.json`.
Do not hand-edit generated identities or overwrite the original site subsets. Conflicts stop the build. Update ZIP payloads still exclude fonts; only verified, registered, content-addressed files created in the receiving checkout may be staged. Future delta packages exclude these generated files and rebuild them instead.

The page's `data-platform-font-support` link uses the stylesheet content hash, not a fixed nested-import token. `font-finalize.mjs` refreshes stale links through the established page builders and verifies convergence; it does not bypass generated-page ownership.
`.local/platform/font-pages.json` records failing element selectors, text, weights and actual fonts. `.local/platform/font-regression.json` records the matching comparison.

## Text ownership and disclosure states

The browser audit queries each original DOM Text node. A paragraph's inline `code`, `kbd` or other descendant is not counted as the paragraph's own font use. Code remains monospace; a system fallback in the actual prose still fails. Text is not wrapped, cloned or restyled to obtain a passing result.

A closed `details` element may retain layout rectangles without painting its content. The audit checks the current state, opens native disclosures, checks the newly rendered text, then restores the original `open` attributes and scroll position. Nested disclosures and named exclusive groups are handled separately. Closed prose is neither treated as a missing font nor permanently excluded. Query and restoration failures remain blockers.

The mixed-character probe uses `"LXGW WenKai Local", "LXGW WenKai"`, including both the supplement and primary families. All four weights must pass; removing either font source must fail. A supplement-only family cannot demonstrate primary-text coverage.

Experiment playback labels and project-link text metadata inherit the surrounding site face. Decorative artwork, original games and code retain their separate roles; there is no global `!important` font override.

Readiness requires the selected same-origin document, parsed DOM, requested locale, live content and applicable local stylesheets. It does not wait for unrelated images or video downloads. Navigation errors, page error states and readiness timeouts remain failures with the observed URL, language and pending styles recorded.

`font-render-regression` also runs `scripts/platform/browser/font-ownership-regression.mjs`, covering the shipped label styles, inline code, nested text, disclosure states and exclusive groups, missing fonts and protocol failures. Its geometric fixture glyphs verify the audit mechanism; subsequent source-page and public-artifact gates still inspect the real site fonts.

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

## Readiness for standalone pages

`#app` is a router-shell implementation detail, not the font-audit contract. Standalone pages with a semantic `main` and `h1` under `body` must enter the same full audit. Do not skip selected URLs or add wrapper elements to production pages merely to satisfy the test.

`scripts/platform/browser/font-page-ready.mjs` still requires the target document, parsed DOM, matching locale, main content, heading and active local styles; development pages also require the journal mount. The `app` field remains diagnostic only. Missing main content or headings, incorrect language, unfinished styles and resource errors remain blockers.

The font regression also reuses the current Q Mimi main markup with standalone, router and alternative container layouts. Passing readiness does not replace original Text-node font inspection. Fixture URLs and locale state are controlled inputs and glyphs are generated geometry, not online-page or production WenKai visual acceptance. Source pages and publication artifacts retain their complete per-page checks and failure thresholds.
