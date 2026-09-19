# 参与第三期开发

先从一个边界明确的改动开始，不必理解所有历史版本。

## 1. 找到合适范围

| 你想做什么 | 入口 | 验证 |
|---|---|---|
| 改物品说明 | src/content/items.mjs | tests/loot.test.mjs |
| 改武器交换或箱子散落规则 | src/simulation/loot-rules.mjs | tests/loot.test.mjs |
| 改按键配置、显示 | src/input/ 与 src/ui/ | tests/settings.test.mjs |
| 验证新地图与角色组合 | content/extensions/ | tests/stages.test.mjs；?dev=1 |
| 调整场景进入、暂停、清理 | src/runtime/stage-session.mjs | tests/final-contract.test.mjs |

`npm run tasks` 只展示任务，不自动认领。先在 Issue 留言说明范围，维护者确认后创建功能分支。游戏的新能力、素材或大幅平衡调整先讨论。

## 2. 修改源码，不改产物

规则模块不读取 DOM、存档或音频设备；通过明确参数和端口衔接。`src/bridges/` 负责旧状态映射，不能把它变成新的补丁集中区。增加模块需登记 architecture/modules.json，并运行 `npm run docs:build`。

物品事务模块先产生计划，再由桥接提交并调用原音效、界面和持久化顺序。不是跨进程数据库事务，也不承诺磁盘崩溃恢复。

## 3. 检查并提交一个小 PR

```sh
npm run verify
npm run test:loot
npm run pack
```

PR 写清：关联任务、行为差异、已跑测试、候选校验值、没有验证的设备；不要提交 `.local/`、`dist/`、密钥或整个更新包。完整游戏对照 `npm run test:browser` 需要已有 Python Playwright 与 Chromium，不能把没安装或没执行记为通过。

## 合并与发布

审核通过后再合并。源码测试不是发布批准，发布必须完成 PUBLISH.md。维护者角色只表示审核职责；不虚构已经认领的网友、Issue 或已合并 PR。新提交者拿不到主仓库发布权限。
