# R09 / Terra M01 · 第三期模块化源码与网站接入

本包以用户上传的第三期 `mario-mix-3.zip` 为唯一底稿。它不是城堡关，不改前两期，不覆盖线上第三期。**是供维护者验收的增量更新，不是整个网站替代品。**

## 两种使用方式

**直接开发游戏**：进入 `payload/packages/mario-mix-terra`，依次运行 `npm run check`、`npm test`、`npm run dev`。浏览器打开 `http://127.0.0.1:4193/play.html`。也可单独解压 `payload/downloads/source/MarioMix_Terraria_M01_Source.zip`。需要 Node.js 22+，无需 npm install。

**接入网站**：在已安装 R08 的完整网站副本上应用。把本更新包解压到仓库外，先备份/提交自己的工作区，在本包目录执行（替换路径）：

```powershell
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --check
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --apply
```

第一条通过后才执行第二条。也可双击 APPLY_R09.cmd。有同名文件、手改生成页或未知构建器会停止，不能把新文件倒退覆盖以通过检查。工具不执行 Git、不推送、不改权限。

## 网站中的入口

`开发 → 混合马里奥 → 资料 → 第三期源码与开发指南`

路径：`/notes/mario-mix/docs/terra-source/`。源码下载路径：`/downloads/source/MarioMix_Terraria_M01_Source.zip`。

该页面由原 R08 的通用文档模板生成，复用原站标题、导航、CSS 和转场。不增加一级导航，也没有另造一个独立后台。

## 应用后

```powershell
npm run terra:check
npm run terra:test
npm run terra:build
npm run journal:build
npm run check
npm test
npm run terra:dev
```

`terra:reference` 启动原版对照。项目已有的启动命令、任务、网站 UI 源码和 R05 工程保持不变。

## 回退

应用成功时打印仓库旁边的备份路径。先检查后回退：

```powershell
node apply-update.mjs --target "你的仓库路径" --rollback "实际备份路径" --check
node apply-update.mjs --target "你的仓库路径" --rollback "实际备份路径" --apply
```

安装后编辑过相关文件则停止保护新工作。若已经提交或生成后续版本，使用 Git 有针对性回退，不盲目重装。

## 文档与真实边界

源码从 START_HERE.md → CONTRIBUTING.md → docs/ARCHITECTURE.md → docs/MODULE_MAP.md → docs/TEST_REPORT.md → docs/HANDOFF_M01.md 开始阅读。网站接入交接在 docs/TERRA_M01_INTEGRATION.md。

八个模块已经实际接入候选；33 个 compat 片段尚有共享状态，**不是整个游戏已彻底解耦**。媒体在源码中拆开，运行时为保持行为重新内嵌，不声称实现流式加载或减小玩家下载量。部分可选远程素材仍依赖网络。保留原 NOTICE，没有给整个游戏另加 MIT，也没有附带字体文件。

Windows、实体设备、自然完整通关与实际 HTTP/ESM 网站链路仍待验收。本地成功不等于已经线上发布。包内 manifest/SHA256 用于检测损坏，不是数字签名或完整安全审计。
