# 贡献指南 · 从一个小而可验证的改动开始

## 找任务与认领

解压源码，运行 `npm run verify`，确认未修改时能通过。`npm run tasks` 列出候选任务；`npm run tasks -- --task M02-LABELS` 输出范围、验收与 PR 草稿。

这些是仓库内的工作项，不自动创建 GitHub Issue，也不表示有人已经认领。在对应 Issue 留言说明计划，等维护者确认避免重复开发；没有 Issue 时先提交问题/提案。不要直接修改他人的 owner。

## 小步工作流

Fork 仓库，基于最新维护者分支开自己的功能分支。一个 PR 只处理一个主题：例如补一种键名，或者完善 Windows 的验收记录。先添加失败用例，再改真实模块；不要编辑 dist 的生成代码。

```sh
npm run check
npm test
npm run verify:baseline
node scripts/build.mjs --check
```

修改 architecture 登记后先运行 docs:build。代码+测试+说明同一 PR；对外源码归档与发布页由维护者最终打包，普通 PR 不提交 dist/.local 或整个游戏 ZIP。

## 模块约定

新增模块须有稳定 ID、职责、层、exports、entryHook、注入依赖、测试和审阅角色；登记并接入 build.config。新增测试路径不等于测试有意义，审核者要确认它覆盖真实调用，而非未接入的演示。

纯数据/玩法/输入不得读 document/window/localStorage；需要平台操作时通过 bridge。bindings-view 是 UI 适配组件，允许接收 document，但不得改变游戏数据。现阶段不引入第二个输入监听器或通用插件框架。

## 说明变更类别

**等价迁移**：与原版/上一候选对照。**有意修复**：先复现，记录修复前后差异，不为通过测试去修改 golden。**新玩法/平衡**：先讨论设计，与架构改动分开。**资源**：来源、许可证据、锚点与体积一并记录。

PR 应包含任务编号、改动模块、测试命令、候选 SHA、复现或截图、未验证的设备/资源。AI 辅助可以，但提交者要能解释修改。维护者完成审阅、必要设备验收和发布批准；合并不自动发布。

## 暂未完成的外部验证

本轮没有真实外部 PR 已合并记录，Issue/PR 链接默认为 null。Windows、实体设备、音频和 HTTP/ESM 验收须附真实证据。不要用一份 Linux 日志填满其他平台。源码可读不等于第三方素材可以任意再分发。
