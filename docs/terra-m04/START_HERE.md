# R13 / Terraria M04 · 当前源码与协作收尾包

这是当前第三期工程的本轮定稿，版本 0.4.0 / M04；仍为待人工验收的发布候选，不是整个游戏开发结束。**应用到已安装R11/M03和R12小图标修复的完整网站副本**，不是整站覆盖。没有更换引擎、不引入城堡、不覆盖前三期稳定试玩。

## 安装

Node.js22+，无npm第三方依赖。把本包解压到原仓库外。双击APPLY_R13.cmd，或先检查再应用（替换路径）：

```powershell
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --check
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --apply
```

同名文件、M03源码、生成页或公共构建器发生冲突就停止；不要倒退文件来通过。备份在仓库旁，执行后打印真实路径；不自动执行Git或更改远端。

## 应用后

```powershell
npm run terra:verify
npm run terra:prepublish:check
npm run journal:build
npm run check
npm test
```

沿用网站启动命令，访问 `/notes/mario-mix/docs/`。前三入口为当前源码M04、参与开发、关卡接口（实验）；历史折叠保留。旧M01–M03下载与原文档直链仍在。

源码可独立解压 `payload/downloads/source/MarioMix_Terraria_M04_Source.zip`，进入源码根 `npm run verify`、`npm run dev`；候选在4193/play.html，原版对照使用npm run reference（4194）。实验关卡入口明确以 `?dev=1` 开启，默认玩家页面不再展示试验按钮。

## 发布前

`prepublish:check`不替代人工审批。先完成 Windows、实际HTTP、手柄/触屏、音频与通关验收，记录实际候选SHA后再运行release:check。发布的是可协作的第三期源码，不可宣传为完整通用马里奥引擎或已完成1-4。

游戏模块说明、已知限制与任务在源码START_HERE.md；站点接入详见payload/docs/terra-m04/HANDOFF_R13.md。主站CSS、小图标、转场源码和任务状态不修改。为加载新的资料折叠组件，外层页面只有必要的脚本缓存号更新。

## 回退

```powershell
node apply-update.mjs --target "你的仓库" --rollback "打印的备份路径" --check
node apply-update.mjs --target "你的仓库" --rollback "打印的备份路径" --apply
```

回退拒绝覆盖安装后的编辑；不删除不属于本轮的新源码。备份、ZIP、.local不要提交。校验值是损坏/冲突检测，不是数字签名。
