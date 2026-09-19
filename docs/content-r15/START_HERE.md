# R15 · 公开内容与版本一致性更新

适用于已安装 R14 / M05 的网站副本。游戏版本仍为 **0.4.1 · 待验收**；R15 是资料修订号。此包不覆盖线上试玩、前两期、城堡分支或游戏 UI，不修改网站主题、小图标和路由逻辑。

## 安装

需要 Node.js 22 或以上，无需 npm install。先备份或提交工作区，将更新包解压到原仓库之外。双击 APPLY_R15.cmd，或执行（替换示例路径）：

```powershell
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --check
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --apply
```

第一条通过后再执行第二条。文件或当前资料有本地修改时停止，先合并，不倒退源码以通过检查。原文件备份在仓库旁，准确路径会打印出来；不执行 Git 或远端发布。

## 验收

在原仓库根目录：

```sh
npm run content:check
npm run test:content
npm run terra:verify
npm run terra:prepublish:check
npm run journal:build
npm run site:build
npm run check
npm test
```

沿用 npm start 或 npm run dev。检查 `/notes/`、`/notes/mario-mix/`、`/notes/mario-mix/tasks/` 和 `/notes/mario-mix/docs/terra-source/`。首次用 Ctrl+F5 清除旧脚本缓存。真实网页、下载、前进后退和 Windows 仍需本地验证。

源码主入口只显示 0.4.1；当前下载为 `/downloads/source/MarioMix_Terraria_M05_R15_Source.zip`。游戏候选与 M05 的 SHA-256 相同，不需重装稳定游戏。原 M05 源码 ZIP 保留在历史资料中。

## 维护任务与版本

任务编辑 `packages/mario-mix-terra/docs/TASKS.json`，不是旧的 `docs/mario-mix/project-state.json` 或 `collab/project.json`。然后运行 `npm run content:sync`、`npm run journal:build`。网页状态是生成快照，手工修改会被拦截。旧状态、旧草稿键与工具仍在管理页历史区域，不同步到新任务。

更新条目使用明确的正整数 revision；同日按 revision 排序，无 revision 的旧条目以 ID 稳定排序。项目 currentRelease 关联当前更新、版本、源码与校验元数据。源码包变更后需同步重打包，不能只改页面按钮。

独立开发：解压 MarioMix_Terraria_M05_R15_Source.zip，进入 MarioMix_Terraria_M05 后运行 npm run verify、npm run dev。普通入口 http://127.0.0.1:4193/play.html；关卡试验入口 http://127.0.0.1:4193/play.html?dev=1。实验能力不包含完整 1-4。

## 回退

```powershell
node apply-update.mjs --target "仓库路径" --rollback "打印的备份路径" --check
node apply-update.mjs --target "仓库路径" --rollback "打印的备份路径" --apply
```

后续编辑会阻止覆盖。安装器回退只恢复本轮修改；安装后另行生成或编辑的文件需通过 Git 审阅。勿提交 .local、备份或整个更新 ZIP。

## 阅读入口

`docs/content-r15/`：HANDOFF_R15.md、CONTENT_POLICY.md、CHANGELOG.md、ACCEPTANCE.md、TEST_REPORT.md。源码包内的当前指南已更新，旧指南存入 docs/history/r15-before；原报告、署名和 NOTICE 不删除。

此包不是“全站没有任何 AI 用语”的认证；检查针对当前公开入口、项目、任务、源码指南与错误提示。历史文档、AGENTS 和原始验收证据单独保留。
