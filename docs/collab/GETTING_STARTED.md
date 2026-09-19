# 启动与路径

## 当前前提

`collab-r01` 是叠加到现有仓库的更新包，不包含原游戏本体、下载档案或字体。已有 Git 工作副本可先新建分支；只有仓库 ZIP 的情况也可以本地预览，但提交前仍需使用正确的 Git 仓库。

使用 Node.js 22 或更新版本。协作工具只使用 Node 标准库，没有第三方 npm 依赖，无需 `npm install`。本轮只在 Linux / Node 22.16.0 环境执行，Windows 命令脚本仍需在真实 Windows 验证。

## 启动

在仓库根目录运行：

```sh
npm run dev
```

访问 `http://127.0.0.1:4173/dev/`。Windows 也可双击 `start-dev.cmd`。服务只绑定本机 127.0.0.1，只允许读取，不提供写入或上传接口。停止方式是 Ctrl+C。端口占用可改为 `npm run dev -- --port 4174`。

不要把终端工作目录缩到 `games/mario-mix` 后用临时服务器启动；共享字体、网站资源与相对链接可能依赖整个仓库根目录。

| 用途 | 路径 |
|---|---|
| 原网站 | `/index.html` |
| 保留的笔记页 | `/notes/index.html` |
| 新开发中心 | `/dev/index.html` |
| 参与指南 | `/dev/guide.html` |
| 第一期 | `/games/mario-mix/play.html` |
| 第二期 | `/games/mario-mix-2/play.html` |
| 第三期 | `/games/mario-mix-3/play.html` |

## 改状态后需要做什么

编辑 `collab/project.json`，或在开发中心保存草稿后导出并覆盖该文件。核对 `updatedAt`、`nextTask`、`deliveryStatus` 和验收依据。然后运行 `npm run collab:build`；把状态源、`dev/project-data.js`、`collab/TASKS.md` 一起提交。

网页草稿不会自动同步 GitHub。新版源状态与旧草稿不匹配时，页面会隔离旧草稿，不能静默覆盖新版。需要先导出旧稿、逐项核对再修改。

## 检查命令

`npm run check` 检查本轮新增工具的数据、文档链接、脚本语法、模板结构和生成文件一致性。`npm test` 执行协作工具逻辑测试。`npm run doctor` 检查原游戏入口和本地 Git 状态，不验证游戏运行质量；缺失入口时退出失败。它不会下载游戏或修复缺失文件。

## 常见问题

- 增量包内游戏链接 404：这不是完整仓库，先按更新说明应用到原目录。
- 网页字体与原站不同：原字体文件未在更新包中再分发。应用到原仓库后继续引用原路径；没有字体时使用系统字体。
- 推送后还看不到导航入口：先直接打开 `/dev/`，再对原网页执行 Ctrl+F5；本轮不修改全站版本号机制，避免对其他页面造成错误更新提示。
- 双击 HTML 与 HTTP 服务表现不同：开发以 `npm run dev` 为准。开发中心采用普通脚本并可离线预览，但不承诺原游戏所有离线模式都通过本轮测试。
- 所有检查通过但手感有问题：工具检查不覆盖手柄、音频听感和通关，按玩法规范另测。
