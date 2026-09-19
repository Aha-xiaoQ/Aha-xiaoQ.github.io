<!-- RELEASE-POLISH-R16 -->
当前第三期开发源码：**0.4.2 · 待验收**。

[下载与运行](notes/mario-mix/docs/terra-source/index.html) · [当前任务](notes/mario-mix/tasks/index.html) · [发布前检查](docs/release-r16/START_HERE.md)。历史记录在下方。

<!-- PUBLIC-CONTENT-R15 -->
当前第三期开发源码：**0.4.1 · 待验收**。

[下载与运行](notes/mario-mix/docs/terra-source/index.html) · [当前任务](notes/mario-mix/tasks/index.html) · [维护说明](docs/content-r15/START_HERE.md)。R15 为资料修订，历史交付说明保留在下方。

<!-- TERRA-M05-R14 -->
## 当前第三期协作源码：M05 / 0.4.1

[当前源码与快速开始](notes/mario-mix/docs/terra-source/index.html) · [参与开发](notes/mario-mix/docs/terra-collaboration/index.html)。游戏工程位于 packages/mario-mix-terra。验证命令 npm run terra:verify；这是发布候选，未自动上线。下面保留历史记录。

<!-- TERRA-M04-R13 -->
## 当前第三期协作源码：M04 / 0.4.0

[当前源码与快速开始](notes/mario-mix/docs/terra-source/index.html) · [参与开发](notes/mario-mix/docs/terra-collaboration/index.html)。游戏工程位于 packages/mario-mix-terra。验证命令 npm run terra:verify；这是发布候选，未自动上线。下面保留历史记录。

# 在下_小Q · Aha_xiaoQ · Pixel Workshop

做项目，也做工具，偶尔做点游戏。

[访问网站](https://aha-xiaoq.github.io/) · [游戏](https://aha-xiaoq.github.io/games/) · [工具与实验](https://aha-xiaoq.github.io/tools/)

网站默认中文，可切换 English 并记住选择。

## 混合马里奥 · 社区协作准备版 collab-r01

**先运行现有三期，再逐步整理结构。当前没有合并为一个新游戏，也没有给整个游戏重新授权。**

[开发中心](dev/index.html) · [贡献指南](CONTRIBUTING.md) · [启动与路径](docs/collab/GETTING_STARTED.md) · [当前结构](docs/collab/ARCHITECTURE.md) · [任务状态源](collab/project.json) · [断点续接](docs/collab/HANDOFF.md)

本地需要 Node.js 22 或更新版本。本轮工具无第三方 npm 依赖；从仓库根目录运行：

```sh
npm run dev
```

浏览器访问终端显示的 `http://127.0.0.1:4173/dev/`。**不要只启动 games 子目录**，网站与游戏使用仓库根目录下的共享资源。

```sh
npm run check          # 数据、路径约束、脚本语法与生成文件检查
npm test              # Node 内置测试，不代表游戏手感已验收
npm run collab:build   # 修改 collab/project.json 后重新生成网页状态与任务摘要
npm run handoff       # 输出可复制到新对话的当前续接信息
npm run doctor        # 检查三个游戏入口和本地仓库状态；缺失时明确报告
```

三期入口分别是 `games/mario-mix/play.html`、`games/mario-mix-2/play.html`、`games/mario-mix-3/play.html`。它们保留各自实现，尚未合并为统一引擎。

开发中心是 Git 管理的状态快照，**不是实时连接 GitHub 的项目后台**。网页编辑只产生本地草稿；导出、校验并由维护者提交后才成为共享状态。

更新包只覆盖列出的文件，不包含旧游戏本体、下载档案或字体。不要用增量包替换整个仓库。详见 [手动交付与发布](docs/collab/RELEASE_WORKFLOW.md)。

## 许可与使用

指定范围的网站原创代码采用 [MIT](LICENSE)，可在保留声明的条件下修改、分发及商用。头像、Logo、文章、美术、游戏素材和下载包不包含在此授权中；完整范围见 [中英文版权与使用说明](RIGHTS.md)。

字体：霞鹜文楷，见 [字体许可](assets/FONT_LICENSES.md)。游戏为非官方同人作品，相关素材权利归各权利人所有；作品说明与权利反馈方式见各游戏页面。

## English

Projects, tools, and occasional games. [Visit the website](https://aha-xiaoq.github.io/?lang=en).

Chinese is the default language; your explicit language choice is remembered.

The specified original website code is [MIT-licensed](LICENSE). Avatars, logos, articles, artwork, game assets and downloads are excluded from that grant. See [Rights and reuse](RIGHTS.md) for the exact scope and third-party terms.

Font: LXGW WenKai; see the [font licenses](assets/FONT_LICENSES.md). The games are unofficial fan works; their assets belong to their respective rights holders. Each game page provides details and a contact for rights concerns.

## 开发日志与持续交接 · R04

栏目入口：`notes/index.html`。各项目独立登记，混合马里奥只是其中一个项目。阅读 [交接索引](docs/development/START_HERE.md)，新增项目使用 `npm run journal:add`，生成页面使用 `npm run journal:build`。本地交付与远端发布分开，原游戏和素材许可不变。

<!-- MARIO-MIX-R05 -->
## 参与混合马里奥开发

从 [游戏工程入口](packages/mario-mix/README.md) 开始。先运行 `npm run game:test`，再使用 `npm run game:dev` 启动本地候选。原站启动方式和发布版游戏保持不变。

<!-- WORKSHOP-R06 -->
## 界面与内容组件 · R06

阅读 [本轮入口](docs/design-r06/START_HERE.md)。栏目对外名为「开发」，内部路径保持 `/notes/`。项目、游戏、工具和多项目开发记录使用同一套作品组件；本地应用后仍由维护者验收、提交。

<!-- WORKSHOP-R07 -->
## 作品集合与素材契约 · R07

阅读 [本轮入口](docs/design-r07/START_HERE.md)。栏目对外名为「开发」，内部路径保持 `/notes/`。列表静态 HTML 与动态渲染共用组件；表现配置在 content/presentation.json，编辑后执行 npm run site:build。六种背景预设按用途选择，游戏列表不再首项跨列。本地验收后手动提交。

<!-- WORKSHOP-R08 -->
## R08 · 安全修复与作品展示

阅读 [本轮入口](docs/design-r08/START_HERE.md)。修复构建与更新路径的悬空符号链接漏检，游戏统一单条展示，工作流分类与项目插画按用途区分。npm run test:security 是发布前必跑项；Windows/完整站点尚需实测。不修改历史许可与游戏逻辑。

<!-- TERRA-M01-R09 -->
## 第三期源码开发

[源码与开发指南](notes/mario-mix/docs/terra-source/index.html) · [工程说明](packages/mario-mix-terra/START_HERE.md)。独立源码位于 packages/mario-mix-terra，运行 npm run terra:dev。现有游戏版本不覆盖。

<!-- TERRA-M02-R10 -->
## 第三期 M02：架构与协作

[源码与开发指南](notes/mario-mix/docs/terra-source/index.html) · [架构与协作](notes/mario-mix/docs/terra-collaboration/index.html)。运行 npm run terra:verify、terra:tasks；源码位于 packages/mario-mix-terra。稳定游戏不覆盖。

<!-- TERRA-M03-R11 -->
## 第三期 M03：关卡接入

[源码与开发指南](notes/mario-mix/docs/terra-source/index.html) · [新关卡接入](notes/mario-mix/docs/terra-chapters/index.html)。运行 npm run terra:verify、terra:tasks；源码位于 packages/mario-mix-terra。稳定游戏不覆盖。


<!-- INTERACTION-R17 -->
网站交互细节：R17。游戏开发版仍为 0.4.2 / M06。
[交互规范与验收](docs/interaction-r17/START_HERE.md)。


<!-- EXPERIENCE-R18 -->
网站体验：R18。当前游戏仍为 0.4.2 / M06。
[搜索、返回与资料导航](docs/experience-r18/START_HERE.md)。


<!-- LAUNCH-R19 -->
网站体验收尾：R19。游戏仍为0.4.2/M06。
[试玩引导、审阅报告与验收](docs/launch-r19/START_HERE.md)。


<!-- LEVELS-R20 -->
关卡进度与模板：第一世界4份底图，8个房间，32关管理登记。原版复验与正式角色接入仍待完成。
[开发与验收](docs/levels-r20/START_HERE.md)。

<!-- CHAPTERS-R20 -->
关卡进度与第一世界模板：R20 / W01。游戏仍为0.4.2/M06。
[地图开发与协作](packages/mario-mix-worlds/START_HERE.md)。


<!-- WORLDS-R21 -->
关卡地图册：R21 / W02，八世界32关参考模板。游戏仍为0.4.2/M06。
[地图开发与协作](packages/mario-mix-worlds/START_HERE.md)。

<!-- PLAYER-UI-R22 -->
当前第三期候选：0.4.3 / M07；界面交接见 docs/player-ui-r22/HANDOFF_R22.md。WorldKit W02继续使用固定M06运行时，地图模板与稳定试玩不改。


<!-- SITE-UI-R23 -->
网站交互与排版：见 docs/site-ui-r23/HANDOFF_R23.md。运行 npm run site:ui:check、npm run test:site-ui。游戏仍为 M07 / 0.4.3，WorldKit W02 不变。


<!-- SHOWCASE-R25 -->
游戏入口与关于页：docs/showcase-r25/HANDOFF_R25.md。当前关于页源为 content/about-view.json，个人资料仍在 content/site-data.js；修改后运行 site:build。M07、W02、稳定试玩不改；公开发布继续使用 R24 release:prepare。
