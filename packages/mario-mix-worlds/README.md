# 混合马里奥 · 关卡地图册与地图工坊 W02

> 文档状态：2026-09-20 · 本地试玩候选正在复核，远端发布版仍以仓库主分支为准。

W02 收录世界 1–8 的 32 关参考底图、63 个区域和循环路线分段。它用于查看地形、制作地图方案和核验通用机制，不是原版八世界的完整复刻。

## 地图工坊

从网站工具页进入 [在线地图工坊](https://aha-xiaoq.github.io/packages/mario-mix-worlds/atlas/editor.html)，或在本地运行：

```sh
node scripts/editor-launch.mjs
```

打开 <http://127.0.0.1:4184/packages/mario-mix-worlds/atlas/editor.html>。工坊支持从底图创建副本或新建空白地图，编辑地形、平台、管道、敌人和奖励，保存并导出 `.qmap.json` 工程。

试玩顶部的“更换主角”可以选择马里奥或魂斗罗·比尔。比尔复用已有动作、M／S／F／L 武器、奖励、音乐和音效；选择角色不会替换地图的敌人、管道或隐藏区域，也不会加入魂斗罗专属敌人和隐藏地图。单关离线试玩与连续闯关版都会保留选择的主角。其他已存在角色的地图工坊适配仍在本地验证，确认手感、资源和离线打包无误后再进入远端发布流程。

详细操作、武器标识、字体署名和已知限制见[地图工坊使用说明](docs/MAP_EDITOR_GUIDE.md)。复杂路线、设备兼容性和完整自然通关仍需逐关核验。

## 地图册与通用运行器

```sh
npm run verify
npm run atlas
```

打开 <http://127.0.0.1:4196/atlas/index.html>，选择世界、关卡、区域或循环分段。地图册支持缩放、横向浏览、逐关 ZIP 和 Tiled 对象层下载。

通用开发运行器与地图工坊试玩分开：

```sh
npm run dev
```

然后打开 <http://127.0.0.1:4195/play.html?dev=1>。世界 2–8 提供独立分区检查，不会自动把所有区域串成完整路线；水下区域需要专门的游泳驱动。

## 创建与分发

```sh
npm run new -- --base 2-1 --id my-stage --title "我的关卡" --apply
npm run build
npm run verify
npm run pack
```

新方案位于 `content/adaptations/`；完整 Starter 生成在 `.local/MarioMix_Worlds_W02_Starter.zip`，逐关和逐世界包在 `generated/downloads/`。不要直接修改 `generated/` 或共用底图来适配角色。

[开始开发](START_HERE.md) · [地图与坐标约定](docs/MAP_CONTRACT.md) · [地图工坊使用说明](docs/MAP_EDITOR_GUIDE.md) · [协作说明](CONTRIBUTING.md) · [GitHub 仓库](https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io)
