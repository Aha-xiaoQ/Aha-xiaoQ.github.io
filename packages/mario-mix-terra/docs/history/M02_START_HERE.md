# 第三期泰拉瑞亚 · M02 开发源码

这是一份可修改、可测试、可构建的第三期游戏工程，不是城堡关，也不覆盖既有线上试玩。唯一底稿校验见 baseline.json。先读本页，再读 CONTRIBUTING.md 和 docs/HANDOFF_M02.md。

## 运行

需要 Node.js 22+。没有第三方 npm 依赖，不需要 npm install。

```sh
npm run verify
npm run dev
```

候选：http://127.0.0.1:4193/play.html 。另开终端 `npm run reference`，在 4194 端口对照原始底稿。修改 src 后重启 dev 并刷新；本轮没有热更新。

构建会生成 `dist/play.html`（HTTP 模块入口）、`dist/MarioMix_Terraria_M02.html`（单 HTML 候选）和 `dist/reference.html`（原版重建）。不要直接编辑生成产物。带锁定校验的媒体仍会重新内嵌；未完成按需加载，也不称为完全离线版。

## 找到合适的任务

```sh
npm run tasks
npm run tasks -- --task M02-LABELS
npm run arch:check
npm run docs:build
npm run handoff
```

- MODULE_MAP.md：每个源码入口、边界和测试。
- architecture/modules.json：模块登记，检查运行时接入、测试、注入依赖和兼容层预算。
- docs/TASKS.json：任务状态的唯一源，不代表远端 GitHub Issue。
- CONTRIBUTING.md：认领、分支、验证、PR、审阅和发布的分工。
- docs/TEST_REPORT_M02.md：本轮真实结果与未验证项。

当前 15 个独立模块已接入。另有 33 个 compat 文件（46 号是桥接占位）和一个 bindings.bridge.js；剩余游戏状态仍没有全部解耦。原图像、音频、授权说明保留，不将整个游戏重新授权为 MIT。

## 发布者

`npm run pack` 输出 `.local/MarioMix_Terraria_M02_Source.zip`。下载站的 ZIP 与元数据须同时更新；网站子页由 R10 更新包接入。交接资料与源码一起提交。`dist`、`.local`、个人存档和 private 凭据不能进入 PR。
