# 混合马里奥 · 协作工程 R05

这是一条真正连接到游戏候选构建的开发通道，不是又一套管理页面。
当前范围是 **第一期比尔的瞄准与平台下穿输入意图**。它尚不是全游戏模块化，也不是三期整合版。原来的游戏、网站视觉、地图、声音、角色参数不直接覆盖。

## 新贡献者从这里开始

使用 Node.js 22+。不需要 npm install，不下载第三方依赖或素材。在安装 R05 的完整仓库根目录执行：

```sh
npm run game:check
npm run game:test
npm run game:audit
npm run game:build
npm run game:dev
```

候选版：`http://127.0.0.1:4180/games/mario-mix/play.html`。
另开终端运行 `npm run game:reference`，原始对照版：`http://127.0.0.1:4181/games/mario-mix/play.html`。
这两个端口与主站 4173 分开，浏览器存储不共享。不要把源文件直接拖进浏览器。修改源码后停止并重新运行 game:dev，再刷新；本轮没有自动热更新。

也可以 `cd packages/mario-mix` 后使用 npm test / npm run build / npm run dev。
单独拿到更新包、不含完整 games/ 时可以运行单元测试；构建和游戏试玩需要原仓库中的真实游戏及素材，缺失不会伪造成功。

## 改哪个文件才会生效？

| 文件 | 职责 |
|---|---|
| src/input/bill-aim.mjs | 方向与朝向 → 瞄准方向，纯函数 |
| src/input/bill-descent.mjs | 下+跳组合按键边沿、地面/房间门槛、可穿平台判定 |
| src/legacy/bill-controls.bridge.js | 连接原闭包状态；保持旧碰撞例外和副作用 |
| scripts/core.mjs | 核对原运行文件并生成候选，不写回 games/ |
| tests/fixtures/bill-controls.original.txt | 已核对 Git blob 的旧代码，测试对照，禁止为通过测试而改写 |
| docs/ACCEPTANCE.md | 人工试玩与可选浏览器对照方法 |

`games/mario-mix/play.html` 实际加载 `classic-mix.js`；旧的 `bill-controls.js` 只是片段，不会单独被浏览器加载。**本轮之后，这处输入逻辑的开发入口是 src/input/，不要只改旧片段或直接改生成物。**

## 基线与失败提示

本轮核对公开 main：`ed76f0b668a9e7c1a8d8f71bed2489cb2b063c9e`。这是 2026-09-15 的读取记录，不是永远的最新版。
`game:audit` 在 `.local/baseline-report.json` 逐项记录 I / II / III 与运行脚本：matched / different / missing；任何不一致退出码 2，不把“different”判断成更老或更新。它还生成第一期资产的待核验清单，**不会赋予授权**。
`game:build` 必须核对第一期运行 JS 和入口 HTML 的 Git blob；不同则停止。保留你的新版，不要用旧游戏覆盖去通过检查。二、三期的差异不会被偷偷“同步”成第一期。

## 构建与交付

候选生成于 `packages/mario-mix/.local/build/`，不应提交。build.json 记录原提交、输入哈希、候选 SHA-256、唯一替换区间及区间外摘要。
默认构建不含时间戳，相同输入产生相同输出。请提交 **源码、测试和文档**，不要提交候选成品当作开发源。
发布审核用 `npm run game:release-check`，默认会因人工验收/许可/批准缺失而阻止发布。没有自动覆盖稳定版的发布命令。

## 阅读顺序

[贡献方法](CONTRIBUTING.md) → [架构与源码边界](docs/ARCHITECTURE.md) → [验收](docs/ACCEPTANCE.md) → [首批任务](docs/WORK_ITEMS.md)。
维护者另读 [治理与合并](docs/GOVERNANCE.md)、[许可](docs/LICENSING.md)、[本轮交接](docs/HANDOFF_R05.md)。
