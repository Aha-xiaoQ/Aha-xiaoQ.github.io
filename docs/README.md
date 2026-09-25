# 维护资料索引

**简体中文** | [English](README.en.md)

网站访客从[开发栏目](https://aha-xiaoq.github.io/notes/?lang=zh)进入。本目录面向源码维护者；当前操作说明与历史记录分开阅读。

## 当前网站指南

[本地启动](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/start/?lang=zh) · [内容编辑](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/content/?lang=zh) · [网站结构](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/architecture/?lang=zh) · [构建与发布](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/publishing/?lang=zh)

公开指南的数据源是 `content/development/projects/pixel-workshop.json`。在那里修改，再生成页面，不另写一份重复的操作步骤。

## 当前网站平台

[架构与维护](platform/README.md)说明模块职责、语言、字体、检查和更新打包。日常预览与正式验证使用不同入口：`platform:build` 只生成，`platform:verify` 执行完整流程。只需查看步骤时使用 `platform:plan`。

## 工程资料

游戏与地图工具的说明随各自 `packages/` 工程维护。从[混合马里奥资料目录](https://aha-xiaoq.github.io/notes/mario-mix/docs/?lang=zh)选择工程和版本；已发布试玩、开发候选和地图工具不互相替代。

## 历史记录

`history/` 和带版本号的记录保留当时的背景与结果。旧地址继续有效，但旧测试结果不是当前版本的验收结论。新增记录写明适用提交、已执行检查与未验证范围；当前操作以维护指南为准。

## 内容与加载约定

`config/documents.json` 登记 Markdown 阅读资料；开发目录快照和按需正文由 `scripts/dev-center/build.mjs` 生成。不要手改 `assets/journal/data/`。发布目录为 `.local/publish`，检查日志保存在 `.local/platform/`，不作为公开网页内容。

隐藏入口或 noindex 不是访问控制。不要把密钥、私人数据和个人浏览器配置放进公开仓库。
