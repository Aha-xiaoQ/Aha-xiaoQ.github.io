# 编译片段导航

以下编号也是固定的编译顺序。各片段不是独立模块。

| 顺序 | 文件 | 可查找的原版开头注释 |
| --- | --- | --- |
| 1 | `src/runtime/00-bootstrap.part.js` | // Capture the launch source once for safe single-file export. No runtime DOM state. |
| 2 | `src/runtime/01-classic-core.part.js` | /* CLASSIC LOCAL 1-1. Browser implementation derived from the prior local build. |
| 3 | `src/runtime/02-classic-sprites-characters.part.js` | /* Classic sprite layer. Selected pixel encodings are sourced from: |
| 4 | `src/runtime/03-ninja.part.js` | /* Mario Mix / Ninja Episode - playable alpha 0.1. |
| 5 | `src/runtime/04-world12.part.js` | /* Source-faithful World 1-2 transcription, FullScreenMario maps.js @980c275. |
| 6 | `src/runtime/05-world12-feel.part.js` | /* 0.4.0 input / feel repair. No map, progression, or asset replacements. |
| 7 | `src/runtime/06-world12-presentation.part.js` | /* 0.6 — character presentation/rules. Canonical 1-2 geometry is unchanged. |
| 8 | `src/runtime/07-world12-renderer.part.js` | /* v0.10 — focused repair on the user's exact v0.9 upload. |
| 9 | `src/runtime/08-terra-foundation.part.js` | /* BEGIN SANDBOX TRIO R04 */ |
| 10 | `src/runtime/09-terra-boss-art.part.js` | /* R05: native-pixel Eye encounter. No code here changes episode-two physics. |
| 11 | `src/runtime/10-terra-integration.part.js` | /* R11 — one installed runtime; native face/hand layers; physical chest/pipe route. */ |
| 12 | `src/runtime/11-terra-player-input.part.js` | /* R15 — one in-game HUD. The canvas keeps its original 16:15 / 16:9 view. |
| 13 | `src/runtime/12-terra-release.part.js` | /* R20: recovered R17 + single-owner input, contact interactions, readable boss |
| 14 | `src/runtime/13-campaign-castle.part.js` | /* Native 1-4 campaign integration. Shares the existing canvas, clock, Mario |
| 15 | `src/runtime/14-ori-base.part.js` | /* Ori / Blind Forest DE-inspired native chapter. The terrain, bridge and castle |
| 16 | `src/runtime/15-ori-presentation.part.js` | /* R25 public-art integration. No new physics, input polling, iframe or game loop. |
| 17 | `src/runtime/16-ori-two-act-world.part.js` | /* R28 — one connected two-act chapter, in the existing Canvas / fixed step. |
| 18 | `src/runtime/17-ori-shared-world.part.js` | /* R29: SharedWorld is live. Every original brick/bridge keeps its canonical ID. |
| 19 | `src/runtime/18-ori-checkpoint-bash.part.js` | /* R30 — release polish, checkpoint persistence and local atmosphere. |
| 20 | `src/runtime/19-sonic-adapter.part.js` | /* R33 · Native Sonic adapter. Authored for MarioMix; no extra engine/RAF. |
| 21 | `src/runtime/20-sonic-classic-route.part.js` | /* R34 — Separate Sonic's classic SMB 1-4 route from Ori's two-act route. |
| 22 | `src/runtime/21-ending-ring-cart.part.js` | /* R35 — visual/feedback repair on R34, preserving gameplay geometry and UI modal. |
| 23 | `src/runtime/22-water-grandfather.part.js` | /* R36 — a continuous, more urgent Ori flood; no map or ability changes. |
| 24 | `src/runtime/23-ginso-audio-lifecycle.part.js` | // R41: dedicated Ginso music slot. No substituted composition, guessed stream, |
| 25 | `src/runtime/24-actions-fluid-backdrop.part.js` | /* R38: draw-only cleanup. Canonical objects, hidden-block rewards, collision |
| 26 | `src/runtime/25-r43-climax-and-test-hooks.part.js` | /* R43: user-supplied 48 s climax edit, native looping audio; gameplay unchanged. */ |
