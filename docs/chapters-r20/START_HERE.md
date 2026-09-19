# R20 · 关卡现状与第一世界地图模板

**应用到已安装R19的完整网站副本。不是整站替换包。** 游戏继续使用0.4.2/M06，前三期稳定文件、未完成奥日分支、主站主题、小图标和路由不覆盖。WorldKit W01是独立地图工具0.1.0，不是新的游戏关卡发布。

## 这一包有什么

关卡总览：1-1魂斗罗·比尔/洛克人，1-2忍者龙剑传/坦克大战，1-3泰拉瑞亚，前三期可试玩；1-4奥日开发中。每关基础地形、正式角色、机关和发布状态分别记录。

4份第一世界底图、8区域，来自社区参考坐标转录；不是官方地图导出或完整原版复刻。1-2循环平台与1-4火焰棒/Boss/桥斧尚未执行，详见coverage。后续28关先登记计划。无新增官方音频、美术、ROM或字体。

## 应用到网站

Node.js22+，不需要npm install。把更新包解压到原仓库之外，运行APPLY_R20.cmd，或先检查再应用：

```powershell
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --check
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --apply
```

前一步通过才写入。当前项目简介/关卡教程、源码或生成页面已有编辑会停止，保留后人工合并，不倒退内容。无Git或远端操作。写入前在仓库旁备份。

应用后在原仓库：

```sh
npm run worlds:check
npm run test:worlds
npm run journal:build
npm run site:build
npm run release:preflight
npm run check
npm test
```

网站：**开发 / 混合马里奥**先显示4关现状；**资料 / 关卡与地图模板（实验）**查看地图、下载和开发清单。路径 `/notes/mario-mix/docs/terra-stages/`；总览 `/notes/mario-mix/`。原有三个主要资料入口保留，不新增导航。

## 直接开发地图

解压随包 `payload/downloads/source/MarioMix_World1_W01_Starter.zip`，进入MarioMix_World1_W01：

```sh
npm run check
npm test
npm run dev
```

访问 `http://127.0.0.1:4195/play.html?dev=1`，打开“开发工具 · 关卡试验场”，勾选“显示开发草稿”。完整Starter已带M06运行时；小地图ZIP只有数据，不是双击可玩的完整游戏。

创建一个适配：

```sh
npm run new -- --base 1-4 --id my-stage --title "我的关卡" --apply
npm run dev
```

只新增 `content/adaptations/my-stage.json`；参考底图不变，额外路线用overlays。当前仅有实验单跳/二段跳角色；真实泰拉、忍者或奥日角色需要后续驱动，不是填个名字就自动接入。框架不支持的机制请先开发模块。

## 进度管理

唯一目录源：`packages/mario-mix-worlds/content/catalog.json`。可维护角色、状态、负责人和真实Issue地址；修改后执行 `npm run worlds:sync` 再 `npm run journal:build`。网页是只读投影，不是多人在线编辑后台。

## 回退

用安装时打印的真实备份路径：

```sh
node apply-update.mjs --target "仓库路径" --rollback "备份绝对路径" --check
node apply-update.mjs --target "仓库路径" --rollback "备份绝对路径" --apply
```

回退保护安装后的修改；不属于本轮的文件保留。不要提交更新ZIP、测试副本、备份或.local。新增普通空目录不影响恢复后源码。

包内从本文件 / TEST_REPORT.md / payload/docs/chapters-r20/HANDOFF_R20.md阅读。Windows、真实HTTP、自然通关、原版保真与外部PR仍待验收。没有自动发布。
