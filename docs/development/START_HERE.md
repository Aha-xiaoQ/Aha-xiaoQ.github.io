# 从这里开始 · R04 多项目开发日志

**版本：journal-r04。交付状态：本地待验收；没有提交、推送或修改 GitHub 设置。**

这个栏目记录整个工作室的制作过程，不再是混合马里奥专用后台。先选项目，再读进展、任务、资料或参与方式。

## 阅读顺序

| 你要做什么 | 阅读文件 |
|---|---|
| 接续上一轮 | [HANDOFF_R04.md](HANDOFF_R04.md) |
| 理解页面与口吻 | [DESIGN_SPEC.md](DESIGN_SPEC.md) |
| 看技术组织 | [ARCHITECTURE.md](ARCHITECTURE.md)、[DATA_CONTRACT.md](DATA_CONTRACT.md) |
| 新增一个项目 | [ADD_PROJECT.md](ADD_PROJECT.md) |
| 安装、验收、回退 | [RELEASE.md](RELEASE.md)、[ACCEPTANCE.md](ACCEPTANCE.md) |
| 判断实际测试覆盖 | [TEST_REPORT_R04.md](TEST_REPORT_R04.md) |
| 了解为何这样做 | [DECISIONS.md](DECISIONS.md)、[REFERENCES.md](REFERENCES.md) |
| 安排后续工作 | [ROADMAP.md](ROADMAP.md) |
| 查找旧游戏状态 | 安装后生成的 `STATE_SOURCES.json`；不要在两套 R01 中猜选 |

## 源文件地图

`content/development/catalog.json`：项目索引与旧地址映射。

`content/development/projects/<id>.json`：公开介绍、阶段、链接、资料、更新、参与范围、状态数据源。

`content/development/states/<id>.json`：新项目的独立任务。混合马里奥保留既有 A 或 B 状态文件，不迁移、不重置。

`assets/journal/`：数据校验、通用页面、交互与局部布局。全站主题和转场不归它管理。

`notes/` 下的已登记项目页面：由数据生成的主站直达入口；不要手改生成页。修改内容应回到 JSON。

## 每轮必须留下

源码、变化范围、数据来源、设计决定、测试和未验证项、交接、下一步、安装/回退记录。已实现、已验证、已发布必须分开。用户没有提供实际部署证据时，不能把本地包版本写成线上版本。

## 续接说明

> 请先读取本索引、HANDOFF_R04.md、STATE_SOURCES.json 和当前项目状态，再核对最新远端与用户本地基线。开发日志是多项目栏目，保持主站六项导航、共享样式和统一转场。修改后交付增量包与文档，由用户审核并推送。不得用旧文件倒退覆盖来通过安装检查。

## 一键生成续接摘要

`npm run journal:handoff` 输出整个栏目；`npm run journal:handoff -- --project mario-mix` 只输出该项目。摘要只读，不替代最新文件核验。安装前的笔记页原文另保存在 `LEGACY_NOTES_R03.html.txt`，便于找回未录入站点数据的文字。
