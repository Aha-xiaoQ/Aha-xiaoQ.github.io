# Oscilloscope preview revision review / 示波器预发布修订审阅

Date: 2026-10-06. Website parent: d7519db80eb9e9d4ee262f27022e20ef83ed4295.

This local revision adds the simulated oscilloscope music player to the existing Tools template, with a source download and the published Bilibili video BV1b7pF63Ei7. This note records the reviewed source candidate; website deployment is verified separately.

Reviewed scope: six JavaScript modules change only the generated module alias. The shared public layout additionally renders optional cover images on HTML work cards using the existing video-cover template, preserving destinations, fallback and contain sizing. The experiment contract applies its existing cover path/description checks to HTML as well as video; it does not widen the allowed path/file types. Of twelve generated HTML files, ten change cache/import-map identities only, while notes/index.html and tools/index.html also add the new work. assets/i18n/messages.js retains existing English mappings and updates the player/library copy and cover descriptions. These are revisions of already inventoried original website components. Build output was compared with the fetched parent; source registrations remain the authority. Targeted contract/render tests cover the three real cards, fallback, escaping and invalid cover paths. The three images retain their actual scene provenance.

Three unchanged build scripts were restored from CRLF to the repository's declared LF bytes. They retain their previous identities. The original inventory, baseline Git objects, file classifications and third-party exclusions are unchanged. The added player archive, reference photograph, full-materials page and Bad Apple source are outside this identity update; their source notices do not create a new MIT grant.

The existing font-support generator adds the pinned subset-106 declaration needed by the three cover descriptions. The original fonts are unchanged; existing verified provider files are reused, the generated font record matches the stylesheet, and the coverage gate reports zero missing characters. Font URLs in generated pages update accordingly. This review records the original stylesheet wrapper identity, not a license grant for the third-party font binaries.

Four existing original test components now verify stable README catalog and documentation entries while retaining the separate current-source guide and Episode 4 archive availability checks. Both README languages preserve their bounded generated video section, usage and license text. The publication audit counts every actual ZIP in its public file map, including companion source archives; its error and warning checks remain unchanged. This records only the four original test revisions. README classifications remain unchanged and receive no new license grant.

本次只记录既有网站原创组件的内容、翻译及构建缓存修订，不扩大授权范围，不给示波器照片、模型、字体、第三方库或下载包新增许可声明。视频链接为 BV1b7pF63Ei7；此处记录源码审阅，网站部署状态另行验证。

Reviewed paths:
- about/index.html
- assets/i18n/messages.js
- assets/journal/documents.mjs
- assets/journal/experiment.mjs
- assets/journal/public-layout.mjs
- assets/journal/render.mjs
- assets/journal/runtime.mjs
- assets/release/public-content.mjs
- assets/site-router.js
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
- tools/index.html
- assets/platform/contracts.mjs
- assets/platform/font-support.css
- tests/dev-center/readme.test.mjs
- tests/helpers/source-readme.mjs
- tests/platform/readme-links.test.mjs
- tests/platform/lab-public-copy.test.mjs
