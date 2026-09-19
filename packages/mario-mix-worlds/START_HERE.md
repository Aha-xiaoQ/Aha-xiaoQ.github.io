# 地图开发工具 W02 · 0.2.0

## 选择地图

需要 Node.js 22 或以上，无需 npm install。完整 Starter 附 M06；网站源码包使用同级 `../mario-mix-terra`。

```sh
npm run verify
npm run atlas
```

打开 http://127.0.0.1:4196/atlas/index.html，选择世界、关卡、区域或循环分段。支持缩放、横向浏览、逐关 ZIP 和 Tiled 对象层下载。地图册本身不播放游戏，不加载原版美术或音频。

## 实验预览

```sh
npm run dev
```

打开 http://127.0.0.1:4195/play.html?dev=1，选择“开发工具 · 关卡试验场”，显示开发草稿。第一世界沿用 W01 场景。世界 2–8 提供独立分区地形检查，不自动把各区域串成完整通关路线；5 个水下区域不导入平台驱动。

## 创建方案

```sh
npm run new -- --base 2-1 --id my-stage --title "我的关卡" --apply
npm run new -- --base 8-4 --room area-1-section-0-before --id castle-study --title "城堡方案" --apply
```

新文件位于 `content/adaptations/`。`--room` 选择具体分区；不传时使用默认检查区域。水下区域需要独立的游泳驱动，命令会拒绝不兼容的选择。不要改 `generated/` 或共用底图来适配一个角色。

## 文件与状态

`reference/` 保存参考转录与来源；`content/catalog.json` 管理角色、制作状态、负责人和 Issue；`content/adaptations/` 是个人方案；`generated/levels/` 是模板、机制清单、源记录、SVG 和 Tiled 文件。

世界 1–8 均有参考模板。前三期试玩状态保持原样，奥日 1-4 仍在开发中。其余 28 关的正式角色尚未指定；模板完成度不自动提升游戏发布状态。

## 检查与分发

```sh
npm run build
npm run verify
npm run pack
```

重新生成后才分发。完整包生成在 `.local/MarioMix_Worlds_W02_Starter.zip`；逐关与逐世界包在 `generated/downloads/`。

Tiled 仅对象层导出，不支持编辑后自动回写。几何检查中的静态平衡台、弹簧、桥等不等于对应机制实现。完整范围见 `docs/MAP_CONTRACT.md`。
