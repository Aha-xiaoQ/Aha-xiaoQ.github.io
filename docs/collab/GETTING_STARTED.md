# 本地启动与路径

**简体中文** | [English](GETTING_STARTED.en.md)

## 当前前提

使用完整仓库和 Node.js 22+。网站与协作脚本使用 Node 标准库，没有第三方 npm 依赖，无需 `npm install`。旧 `collab-r01` 增量包不含游戏本体、字体或完整下载档案，不能替代完整 checkout。历史 Linux 测试不代表 Windows 原生验收已完成。

## 启动

在完整仓库根目录运行：

```sh
npm run dev
```

访问 `http://127.0.0.1:4173/notes/?lang=zh`。Windows 可以使用 `start-dev.cmd`；端口占用时运行 `npm run dev -- --port 4174`。服务只绑定本机 127.0.0.1，只读，不提供上传或写入；Ctrl+C 停止。不要从游戏子目录启动临时服务器，共享资源依赖仓库根路径。

| 用途 | 当前路径 |
| --- | --- |
| 网站首页 | `/` |
| 开发目录 | `/notes/` |
| 参与指南 | `/notes/contribute/` |
| 网站开发资料 | `/notes/pixel-workshop/docs/` |
| 混合马里奥资料 | `/notes/mario-mix/docs/` |
| 四期已发布试玩 | `/games/mario-mix/play.html`、`/games/mario-mix-2/play.html`、`/games/mario-mix-3/play.html`、`/games/mario-mix-4/play.html` |

`/dev/` 与 `/dev/guide.html` 是兼容旧链接，不再是新贡献者的主入口。网址的 `lang=zh` / `lang=en` 选择网站语言；游戏、原始实验及未翻译的历史资料保留自己的原语言。

## 改内容与状态

网站内容改 `content/` 与 `config/`，项目资料改 `content/development/projects/`。阅读[当前网站指南](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/?lang=zh)，再运行 `npm run platform:verify`。它执行构建、检查、测试与发布产物浏览器回归，不自动推送或部署。

协作状态改 `collab/project.json`，核对日期、下一步、交付状态与验收依据，再运行 `npm run collab:build`；将源、`dev/project-data.js`、`collab/TASKS.md` 一起提交。网页草稿不自动同步 GitHub；旧草稿与新版源冲突时先导出逐项核对，不覆盖新版。

`npm run check` 与 `npm test` 是当前仓库 aggregate 检查和测试，已不限于旧协作工具。`npm run doctor` 检查入口与 Git 状态，不下载或修复缺失文件，也不验证游戏体验。`npm run oss:verify` 校验精确许可清单与来源一致性，不证明未知素材已授权。

## 验证边界

缺失游戏、字体或下载文件时应补齐正确仓库内容；不要以系统回退或假文件掩盖缺失。使用 HTTP 服务开发，不以双击 HTML 代表全部运行方式。自动测试不能替代音频听感、自然通关、触屏或实体手柄验收，未测的设备必须明示。
