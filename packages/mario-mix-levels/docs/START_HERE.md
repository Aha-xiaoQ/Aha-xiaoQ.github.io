# 从这里开始

## 我想先看游戏做到了哪里

网站“开发 / 混合马里奥”概览列出第一世界四关，资料中的“关卡进度与模板”可以查看完整计划。可试玩与开发中是制作状态；“已转录”只指底图资料，不表示整关完成。1-4 不提供正式试玩链接。

## 我想做一个关卡

1. 在工作台选择与角色动作匹配的底图，打开对象标记和房间列表。
2. 阅读 FIDELITY.md，确认尚需制作的机关与验收范围。
3. 创建独立草稿，不在参考文件上直接改设计。

```sh
npm run fork -- --id my-stage --from 1-1 --apply
```

草稿位于 content/forks/my-stage.json。修改后，使用 INTEGRATION.md 的命令装到 M06 开发源码副本。草稿不自动出现在公开网站，也不自动认领 GitHub 任务。

## 我想核对地图或参与管理

坐标源为 data/reference/world-1.json；生成结果在 data/generated/。按 FIDELITY.md 记录原版依据和差异，保持来源范围明确。管理记录只编辑 data/campaign.json，包含角色、制作状态、下一步、负责人及 Issue。网站运行 levels:sync 生成公开投影，禁止在投影文件中再维护一份进度。

## 验证和交付

```sh
npm run build
npm run verify
npm run pack
```

打包会输出完整源码和四份独立关卡模板到 .local/。不含原版音乐、人物贴图或字体。不应把测试中的几何画面当成最终美术。

坐标复核完成后，设置 template.originalReview 为 reviewed，并填写 reviewedBy、reviewEvidence。没有审核人和证据的完成状态会被检查拒绝；这也不自动改变正式角色/机关验收。
