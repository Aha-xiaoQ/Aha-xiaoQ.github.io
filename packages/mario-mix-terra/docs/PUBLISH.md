# 发布 0.4.2 开发源码

源码下载与线上试玩分别维护。0.4.2 为体验修正候选，不自动替换已发布游戏。

## 检查和证据

运行 `npm run verify` 与 `npm run prepublish:check`，记录候选校验值。在 Windows 和真实浏览器检查启动、设置恢复、手柄与触屏、音频、自然通关及隐藏房间。核验内嵌和远程素材来源，许可不明的条目继续待确认。

证据保存在 `docs/evidence/`。填写 `docs/RELEASE_REVIEW.json` 中的候选 SHA、审核人与证据路径，再运行 `npm run release:check`。该命令检查记录结构和版本匹配；真实性由维护者审核。

## 源码与网站同步

执行 `npm run pack`，输出 `.local/MarioMix_Terraria_M06_Source.zip`。解压后再次验证，确认与本地源码一致。将快照、版本和校验元数据同步到网站 currentRelease 指向的位置。

网站根目录运行 content:sync、journal:build、content:check、check 和 test，审阅 Git diff 后提交。上线后核对当前下载、解压目录、教程和任务页。只有真实部署及对应验收完成后，才把相关状态改为 released。

源码 ZIP 的 SHA 随文档变化而变化；游戏候选 SHA 仅在运行内容变化时变化。两种校验不要混用。代码或证据变化后重新核对审批范围。

## 历史与回退

保留原 M05 和更早下载。历史指南不作为当前操作步骤。应用器遇到本地编辑会停止，先合并再继续；使用安装时的备份回退，不覆盖后续工作。

[当前验收](ACCEPTANCE_M06.md) · [已知限制](KNOWN_LIMITS.md) · [当前测试记录](TEST_REPORT_M06.md)
