# 第三期开发源码 · 0.4.3

第三期泰拉瑞亚的模块化开发候选。附源码、构建工具、测试与贡献指南。当前重点是玩家界面；关卡扩展仍为实验功能。

## 运行

使用 Node.js 22 或以上，无需 npm install。在本目录执行：

```sh
npm run build
npm run verify
npm run prepublish:check
npm run dev
```

普通试玩：http://127.0.0.1:4193/play.html

关卡试验：http://127.0.0.1:4193/play.html?dev=1

原版对照：另开终端执行 `npm run reference`，访问 http://127.0.0.1:4194/ 。

修改 `src/` 后重新启动开发服务并刷新。`dist/` 是生成目录，不直接编辑。单文件候选由 `npm run build` 生成。

## 修改界面

当前候选模板为 `src/app/player.template.html`，样式为 `src/ui/adventure.css`。文案、交互协调器及高清 HUD 分别在 `player-copy.mjs`、`player-interface.mjs`、`hud-surface.mjs`。原始模板与 console.css 专用于重建底稿。

角色选择同时说明对应关卡。顶部提供操作、按键、设置与专注；重新开始和切换角色会先确认。窄屏 HUD 独立排列，不缩小文字。拾取说明可以在“最近提示”再次查看。

## 测试与参与

`npm run test:player-ui` 验证界面契约。`npm run test:player-browser` 需要 Python Playwright 与 Chromium，仅验证离线完整候选交互；`npm run test:browser` 对照原版与候选的阶段状态。

先读 `CONTRIBUTING.md`、`docs/UI_CONTRACT.md`、`docs/generated/MODULES.md` 和 `docs/KNOWN_LIMITS.md`。当前交接为 `docs/HANDOFF_M07.md`，实机验收为 `docs/ACCEPTANCE_M07.md`。

`prepublish:check` 核对自动产物，不批准发布。维护者需另填确切候选对应的人工验收。WorldKit W02 继续使用其固定 M06 运行时，不自动升级；当前模板与本 UI 候选分别维护。已有稳定试玩不会被本源码工程自动覆盖。
