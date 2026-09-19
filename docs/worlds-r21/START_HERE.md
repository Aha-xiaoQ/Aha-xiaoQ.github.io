# R21 · 剩余 28 关模板 / WorldKit W02

**适用于最近的 R20 / W01 网站副本（packages/mario-mix-worlds）。** 本包将 2-1 至 8-4 补入模板目录；不是整站替换包，不是 28 个正式游戏关卡。当前游戏维持 0.4.2 / M06，地图工具为 0.2.0 / W02。

历史上另一个 K01/R20 包使用 packages/mario-mix-levels，不与它混装；本安装器会拒绝不匹配的输入。完整 W02 Starter 可在仓库之外独立使用。

## 应用到网站

Node.js 22+，无需 npm install。提交或备份工作区，把更新包解压到仓库之外。双击 APPLY_R21.cmd；或执行（替换实际路径）：

```powershell
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --check
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --apply
```

只有预检通过再应用。源码、目录认领记录、下载、生成页出现冲突会停止，不提供强制覆盖。写入前在仓库旁创建备份并输出实际路径，不执行 Git、上传或自动发布。

安装后在网站根目录：

```powershell
npm run worlds:check
npm run test:worlds
npm run journal:build
npm run site:build
npm run release:preflight
npm run check
npm test
```

沿用网站启动命令，访问 **开发 / 混合马里奥 / 资料 / 关卡与地图模板（实验）**：
`/notes/mario-mix/docs/terra-stages/`。
32 关按 8 个世界折叠展示，每关与每世界可单独下载。项目概览仍突出原四关角色与发布状态，不把模板数量写成已发布游戏数。

地图册在 `/packages/mario-mix-worlds/atlas/index.html`；网站根目录也可以 `npm run worlds:atlas` 启动本地地图册。

## 独立使用

解压随包 payload/downloads/source/MarioMix_Worlds_W02_Starter.zip，进入 MarioMix_Worlds_W02：

```powershell
npm run verify
npm run atlas
```

打开 http://127.0.0.1:4196/atlas/index.html。查看区域、条件分段、缩放和下载 Tiled 对象层。

实验运行：`npm run dev`，打开 http://127.0.0.1:4195/play.html?dev=1，进入“开发工具 · 关卡试验场”并显示开发草稿。

```powershell
npm run new -- --base 2-1 --id my-stage --title "我的关卡" --apply
npm run new -- --base 8-4 --room area-1-section-0-before --id castle-study --title "城堡方案" --apply
```

草稿只写 content/adaptations/，共用底图与 M06 核心不改。世界 2–8 提供分区地形检查；5 个水下区域仅供地图/对象层查看，需游泳驱动后才能注册，不伪装成普通跳跃关。

## 实际范围

32 关参考模板 / 63 参考区域 / 33 条件路线分段 / 96 视图。源坐标来自社区复刻实现，尚未完成原作独立核验。敌人、奖励、平衡台、循环平台、火焰棒、Boss、桥斧及复杂管道逻辑分别保留缺口。原版人物与音频未新增。前三期稳定试玩、奥日开发分支、当前 M06 下载、主站主题、小图标与路由源码保持不变。

## 维护与回退

状态唯一源为 packages/mario-mix-worlds/content/catalog.json；修改后运行 worlds:sync、journal:build。不要把网页快照或 generated/ 当成编辑源。重新分发源码须执行 worlds:pack 并核对 metadata，防止网站挂旧包。

使用安装器输出的真实备份路径：

```powershell
node apply-update.mjs --target "仓库路径" --rollback "备份绝对路径" --check
node apply-update.mjs --target "仓库路径" --rollback "备份绝对路径" --apply
```

安装后又修改的受影响文件会阻止回退；无关的新工作保留。不要提交本更新 ZIP、备份、测试副本或 .local。SHA256 仅用于完整性和版本匹配，不是签名或发布批准。

先读本文件，再读 TEST_REPORT.md、payload/docs/worlds-r21/HANDOFF_R21.md 和地图工具 docs/MAP_CONTRACT.md。Windows、真实浏览器加载和自然通关仍须本地验收。
