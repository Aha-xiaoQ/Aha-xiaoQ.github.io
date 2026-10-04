# 参与 Pixel Workshop

**简体中文** | [English](CONTRIBUTING.en.md)

欢迎贡献网站、工具和实验的反馈、文档、设计与测试，以及范围明确的代码改进。四期混合马里奥试玩、第三期 M07 / 0.4.3 开发候选、第四期 R43 源码整理工程与地图工坊分别维护；整个游戏和全部素材的许可审计尚未完成。

## 从哪里开始

先阅读 [本地启动](docs/collab/GETTING_STARTED.md)，打开 [参与页面](https://aha-xiaoq.github.io/notes/contribute/?lang=zh)，再选一个项目和任务。[网站指南](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/?lang=zh)说明当前网站的内容、结构与发布流程。[任务摘要](collab/TASKS.md)中的 ID 是项目内编号，不保证已存在对应 GitHub Issue。

先在任务讨论中说明意向；没有 Issue 时可以使用仓库任务表单，等待维护者确认范围。大功能、角色、关卡、引擎或资源替换先讨论；文档小错和明确的局部修复可直接提 PR。普通贡献者使用 Fork 和功能分支，无须主仓库写权限；维护者负责审查与合并。

## 提交容易审查的 PR

一次解决一个问题。写明关联任务、原因、复现步骤、原行为与新行为、实际验证和未验证设备。代码与全文件格式化分开，素材与机制修改尽量分开；不要用新的“最终整合版 HTML”绕过差异审查。

网站内容先改 `content/`、`config/` 或对应文档源，不手改生成页面。在完整仓库根目录运行：

```sh
npm run platform:verify
npm run oss:verify
```

`platform:verify` 运行既有构建、源码检查与测试、发布产物检查和浏览器回归；不会提交、推送或部署。若修改 `collab/project.json`，先运行 `npm run collab:build`，一起提交状态源、`dev/project-data.js` 和 `collab/TASKS.md`。游戏工程使用自己的检查链；网站测试不证明游戏手感、自然通关或实体手柄验收。PR 必须如实列出未执行项。

## 素材、上游代码与 AI 辅助

[LICENSE](LICENSE)、[RIGHTS.md](RIGHTS.md) 和 [逐文件审计](docs/oss/README.md)限定原创 MIT 范围；[LICENSE.collab](LICENSE.collab)保留已有协作工具授权。第三方代码、地图、美术、音频、字体、品牌与未知下载包不会因此获得新授权。不能因材料来自 GitHub、网盘、游戏截图或 AI 就推定可以再分发。

新增材料在 `collab/assets-register.json` 登记来源、作者、许可证、允许分发范围、改动和署名要求。未知项先保持待核验，不上传该素材。许可不清的游戏改动先讨论或提交文字分析，不未经核验宣布整个游戏开源。

AI 可以辅助，但提交者必须理解改动、核对来源并实际验证，不能只附“AI 说已经测试”。不要上传密钥、私人会议、聊天或录音。

## 项目贡献入口

- [第一期输入试点贡献指南（中文原文）](packages/mario-mix/CONTRIBUTING.md) · [网站阅读版](https://aha-xiaoq.github.io/notes/mario-mix/docs/episode-one-contributing/?lang=zh)：R05 历史工程范围，不能当作全游戏现状。
- [第三期贡献阅读版](https://aha-xiaoq.github.io/notes/mario-mix/docs/terra-contributing/?lang=zh)：当前 M07 候选的源码、测试和验收；合并与游戏发布分开。
- [网站参与入口](https://aha-xiaoq.github.io/notes/pixel-workshop/contribute/?lang=zh) · [实验室参与入口](https://aha-xiaoq.github.io/notes/lab/contribute/?lang=zh)。

## 状态、署名与行为

维护者合并后更新相应项目记录，保留作者和贡献记录。网页草稿不会认领远端 Issue 或自动通知别人。完成状态需有可复查依据，源码合并不等于部署或设备验收完成。

尊重贡献者，讨论实现与证据，不攻击个人，不公开他人私人信息。安全漏洞请按 [安全反馈指南](SECURITY.md)私下报告；普通问题使用 Issue 模板。
