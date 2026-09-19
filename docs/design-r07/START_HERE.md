# R07 · 从这里开始

本轮统一作品列表和素材展示规则，保留现有红黑米白风格及主站转场。适用：已经安装 R06 的完整网站副本；R05 游戏工程可有可无。它不是整站替换包，不包含游戏、图片、字体或许可重授。

## 阅读顺序
1. 本文与 HANDOFF_R07.md：当前范围与下一步。
2. DESIGN_SPEC.md、MEDIA_CONTRACT.md：布局和素材配置。
3. ARCHITECTURE.md、ACCEPTANCE.md：如何修改、如何验收。
4. TEST_REPORT.md：实际跑过的检查和仍须人工验收的边界。
5. RELEASE.md：安装、发布、回退。

## 主要路径
源码 `assets/workshop-{media,cards,media-runtime}.js`，样式 `assets/workshop-{components,media}.css`；表现源 `content/presentation.json`；构建 `scripts/workshop/build.mjs`。

修改素材登记或作品数据后执行 `npm run site:build`，修改开发项目记录后仍执行 `npm run journal:build`。运行 `npm run check` 与 `npm test`，由维护者审阅、提交。两套构建的对象不同，不互相冒充。
