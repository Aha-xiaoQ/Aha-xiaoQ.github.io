# R16 / Terraria M06 · 发布前体验加固

在 **已经安装R15 / M05的完整网站副本**上使用。当前开发游戏0.4.2，仍待人工验收。不是整站替代，不覆盖前三期稳定试玩，也不包含城堡关。网站的主题、图标和转场源码保留。

## 先检查再应用

需要Node.js22+，不用npm install。把更新包解压到原仓库之外：

```powershell
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --check
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --apply
```

或双击APPLY_R16.cmd。第一条通过再应用。源码、任务、当前资料或生成页已有本地编辑会停止；先合并，不倒退原文件。安装器不执行Git、不自动推送。备份在仓库旁，打印实际路径。

## 验收

在原仓库运行：

```sh
npm run terra:verify
npm run journal:build
npm run site:build
npm run release:preflight
npm run check
npm test
```

`release:preflight`检查当前产物与主要页面，不是发布批准。完整仓库根脚本仍需维护者运行；本包测试站点外围是历史文本夹具，不是完整线上站点。

网站：开发 → 混合马里奥 → 资料 → 第三期开发源码。

独立源码位于payload/downloads/source/MarioMix_Terraria_M06_Source.zip。解压进入MarioMix_Terraria_M06，运行npm run verify、npm run dev。普通入口http://127.0.0.1:4193/play.html；关卡试验http://127.0.0.1:4193/play.html?dev=1。修改src后重启服务，不编辑dist。

## 这轮改动

可选操作速查、反馈模板、输入与暂停所有权、缓存页生命周期、显示偏好保存状态、旧生成产物保护；源码指南新增复制命令与真实下载标记。主要资料仍三个入口，公开只突出0.4.2，历史源码保留。

## 回退

```powershell
node apply-update.mjs --target "仓库路径" --rollback "打印的备份路径" --check
node apply-update.mjs --target "仓库路径" --rollback "打印的备份路径" --apply
```

回退保护后续编辑。不属于本更新的新增文件不会被删除。再次构建的dist不在安装器跟踪中，可删除构建产物后按回退后的源码重建；不要手工编辑dist。

## 阅读顺序

docs/release-r16/START_HERE.md → CHANGELOG.md → ACCEPTANCE.md → TEST_REPORT.md → HANDOFF_R16.md。

手册是按需说明，不是完整交互训练；平台驱动仍为实验，不支持全部旧角色直接进入任意地图。Windows、真实HTTP/ESM、浏览器缓存往返、实体手柄/触屏、音频与自然通关需实机验收。没有填写批准、执行远端CI或发布。SHA用于检查损坏，不是数字签名。
