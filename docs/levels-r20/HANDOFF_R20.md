# R20 交接

2026-09-18。本地增量交付，未推送。前置R19网站体验合集，游戏仍为M06/0.4.2。

## 本轮核心

关卡现状清楚列为：1-1魂斗罗比尔/洛克人，1-2忍者龙剑传/坦克大战，1-3泰拉瑞亚，1-4奥日开发中。4份第一世界坐标转录模板、8房间、32位置管理记录；独立工作台；每关独立ZIP和完整工具源码；向M06独立副本新增JSON的接入工具。

## 单一来源

`packages/mario-mix-levels/data/campaign.json` → `scripts/levels/sync.mjs` → `content/development/projects/mario-mix.json.levelPlan` → 共享概览与资料组件。制作任务原来的 `packages/mario-mix-terra/docs/TASKS.json` 不迁走。

## 版本语义

新的更新记录kind=content，表示地图工具/资料活动，不改游戏currentRelease指针。旧无kind记录按release兼容处理。检查仍要求当前游戏指针指向最新游戏记录，不把工具更新误判为新的游戏版本。

## 保留与限制

M06源码、已有下载、稳定play文件、R12图标、主站主题CSS、site-shell/router源码保留。journal.css只追加局部章节目布局。为加载新组件，外层HTML更新缓存号；其他页面正文不改。原版逐格/机关时序、完整真实actor跨图、完整1-4机制、后续28图、资源许可、外部PR和实机仍待验收。

## 下轮优先顺序

先独立复验第一世界几何和房间连接，再迁出一个完整真实角色跨两图，对照验收。之后补顶砖/奖励、循环平台、火焰棒/Boss桥斧；按世界继续整理底图。不要在发布前同时换引擎或合并未完成奥日代码。工作台和数据在当前约定下可扩展，不代表任意角色/地图无成本组合。

## 阅读顺序

START_HERE → CHANGELOG → SOURCE_AND_RESEARCH → TEST_REPORT → 包内游戏模板FIDELITY/INTEGRATION/ROADMAP。
