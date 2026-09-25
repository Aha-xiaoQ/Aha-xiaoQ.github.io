# 维护资料索引

网站读者从[开发栏目](https://aha-xiaoq.github.io/notes/)进入。本目录保存维护说明与历史记录，不作为作品展示首页。

## 当前网站指南

[本地启动](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/start/) · [内容编辑](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/content/) · [网站结构](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/architecture/) · [构建与发布](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/publishing/)

公开指南的数据源在 `content/development/projects/pixel-workshop.json`，请在那里修改，不另写一套相同步骤。

## 工程资料

游戏和地图工具的技术说明随各自 `packages/` 工程维护。从[混合马里奥资料目录](https://aha-xiaoq.github.io/notes/mario-mix/docs/)选择对应工程和版本；不要用历史交付包覆盖当前工程。

## 历史记录

`history/`、带版本号的设计与交接目录保留当时的背景和结果。标题中的旧版本不表示当前状态；历史测试结果不能证明现版本已通过检查。

原有历史路径保留，避免已有链接失效。新增维护记录应说明适用提交与范围，不把聊天过程、临时催办或“最终交付”口吻放到访客页面。

## 内容与加载约定

`config/documents.json` 登记可阅读的 Markdown。`scripts/dev-center/build.mjs` 生成开发目录快照与按需正文；`assets/journal/data/` 是生成物，不手工编辑。新增实验先登记元数据，再保留原始产物。

发布产物在 `.local/publish`。隐藏维护入口、robots 或 noindex 不构成访问控制；不要把密钥或私密数据放入公开仓库。

## 当前网站平台

日常维护从 [platform/README.md](platform/README.md) 开始。历史交接保留原地址，不作为当前发布流程入口。
