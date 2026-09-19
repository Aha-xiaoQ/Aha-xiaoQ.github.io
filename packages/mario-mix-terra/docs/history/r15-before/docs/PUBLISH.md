# M05 发布清单

**可以先审阅本轮更新包；不因包叫发布候选就自动替换线上游戏。** 前两期和线上第三期保持原样，公开入口主要发布协作源码。

1. 在干净分支应用后运行 `npm run verify`、`npm run prepublish:check`，记录当前候选 SHA。
2. 原生 Windows 运行上述命令；实际浏览器通过HTTP打开模块化版，检验手柄/触屏/设置恢复/音效/自然通关与隐藏关。
3. 审核原 NOTICE、内嵌与远程资源的来源；无法确认的许可不得写成已授权。
4. 将证据放 `docs/evidence/`，按当前候选 SHA 填写 `docs/RELEASE_REVIEW.json`，再运行 `npm run release:check`。它默认拒绝；不准用空白文档或虚构测试代签。
5. 重新 `npm run pack`，核对网站上 M05 下载文件及 JSON 元数据与最新源码；本次固定交付快照修改后必须另行打包。
6. 查看完整 Git diff，运行网站的 journal:build、check、test，由维护者提交。部署后检查 /notes/mario-mix/docs/terra-source/ 的真实下载和解压。记录实际提交号，才把网页本地待验收更新改为 released。

`prepublish:check` 只证明版本/产物/文档一致，不证明人工验收。`release:check` 只证明记录结构和候选匹配，不认证证据真假，不触发任何上传。

旧源码下载不删除，旧文档地址继续可访问；主资料页只推荐M05。维护者修改过旧文件时安装器停止，不能倒退代码来强行套包。回退使用更新器记录的仓库旁备份。

M05还需逐项执行 [界面验收](ACCEPTANCE_UI_M05.md)。M04文档与下载保留为历史，不把旧批准复制为新候选批准。
