<!-- RELEASE-POLISH-R16 -->
当前交接先读 docs/release-r16/HANDOFF_R16.md。游戏0.4.2/M06；原第三期物理与媒体不改，平台关卡接口仍实验。任务从docs/TASKS.json生成，不伪造远端验证或人工批准；首次引导为可选速查，不是交互训练。

<!-- PUBLIC-CONTENT-R15 -->
当前内容规范先读 docs/content-r15/HANDOFF_R15.md。游戏仍0.4.1/M05，R15只改资料、任务投影和排序。公开任务编辑工程 docs/TASKS.json，再运行content:sync；旧任务和草稿属于历史，不覆盖。勿把资料发布当成游戏验收。

<!-- TERRA-M05-R14 -->
最新交接先读 docs/terra-m05/HANDOFF_R14.md 与 packages/mario-mix-terra/START_HERE.md。当前源码M05/0.4.1；旧关卡接口仍是实验，真实泰拉角色未通用化。不得覆写稳定游戏或引入城堡。R12小图标、CSS和转场保持；网页只突出当前源码、参与开发、关卡接口三个主要文档，旧资料折叠保留。

<!-- TERRA-M04-R13 -->
最新交接先读 docs/terra-m04/HANDOFF_R13.md 与 packages/mario-mix-terra/START_HERE.md。当前源码M04/0.4.0；旧关卡接口仍是实验，真实泰拉角色未通用化。不得覆写稳定游戏或引入城堡。R12小图标、CSS和转场保持；网页只突出当前源码、参与开发、关卡接口三个主要文档，旧资料折叠保留。

<!-- WORKSHOP-R12 -->
开发目录配图的最新约定：`docs/design-r12/HANDOFF.md`。游戏／网站卡片使用小图标，不恢复 PLAY／BUILD 横幅；游戏工程仍以原 M03 记录为准，R12 不是新游戏版本。

<!-- WORKSHOP-R08 -->
当前续接：`docs/design-r08/START_HERE.md` 和 `HANDOFF_R08.md`。安全优先：safe-path 用 lstat 检查悬空链接，禁止 existsSync 授权路径。游戏为统一横向单列（窄屏卡片内上下排列），项目仍可双列。开发栏目仍多项目，页头和转场不重做；旧任务、游戏与素材权利不重置。R07 双列决定已被本轮取代。Windows 实机待验收，不能称全部平台通过。

<!-- WORKSHOP-R07 -->
最新界面规范与交接：`docs/design-r07/START_HERE.md`、`HANDOFF_R07.md`。普通游戏/项目集合双列，窄屏单列，不按序号改变面积；content/presentation.json 定义素材与背景，site:build 保证静态/动态同源。主站框架和转场、R05 工程、旧任务保持原样。历史文档按时间读取，不能用旧导航决定覆盖新规范。

<!-- WORKSHOP-R06 -->
最新界面规范与交接：`docs/design-r06/START_HERE.md`、`HANDOFF_R06.md`。顶栏使用「开发」，保留 /notes/ 路径；主站框架和转场不另造。R05 游戏工程保持原样。历史文档按时间读取，不能用旧导航决定覆盖新规范。

<!-- JOURNAL-R04: latest handoff -->
先阅读 `docs/development/START_HERE.md` 与 `docs/development/HANDOFF_R04.md`。开发日志是多项目栏目；不得把首页重新写成混合马里奥专页。旧交接记录是历史，不应覆盖本轮已替代的导航决定。

# 混合马里奥协作：每次接手先读

## 必须先核对的事实

1. 读取 `docs/collab/HANDOFF.md`、`collab/project.json`、`docs/collab/BASELINE.md`、`docs/collab/VALIDATION.md`。
2. 若具备仓库读取能力，读取远端当前 `main`；对比本地 HEAD、未提交改动以及 `collab/runtime-baseline.json`。记录的 SHA 是上次起点，不一定仍是最新版本。
3. 本仓库有三期入口：`games/mario-mix/`、`games/mario-mix-2/`、`games/mario-mix-3/`。不能只检查第一期便判断整个项目的进展。
4. 用户采用“本地修改 → 可下载增量包 → 用户审核后手动推送”。**未获本轮明确授权，不直接提交、推送、创建远端 Issue、创建仓库或更改权限。**

## 变更边界

本轮 `collab-r01` 只增加协作基建，原始游戏实现和资源均不改动。下一轮先执行任务 `SRC-001` 对齐最新开发基线。不要把未读取的离线版本、聊天里提过的版本名或旧总结当成仓库当前代码。

不进行全仓格式化；不因整理结构顺带改变物理参数、关卡坐标、音频或碰撞。保留已有网站、笔记、品牌与游戏路径。不要擅自把个人网站迁移到新仓库，或把整个游戏改成 MIT。

只使用自己有权提供的代码和素材。上游许可证、第三方图片、音乐、字体分开记录。不要打包字体、无关下载档案、密钥、个人日志、`.git/` 或备份目录。

## 每轮的最小交付

- 任务来源、验收标准、修改文件、实际测试和限制必须写进文件。
- 共享状态只有 `collab/project.json` 一份。`dev/project-data.js` 和 `collab/TASKS.md` 自动生成，不能只改生成物。
- 更新 `docs/collab/HANDOFF.md`、`docs/collab/VALIDATION.md` 和 `CHANGELOG.md`；设计决策写进 `docs/collab/DECISIONS.md`。
- 执行 `npm run collab:build`、`npm run check`、`npm test`；完整仓库另执行 `npm run doctor`。对没有执行的测试写“未验证”。
- 用明确列出的 `collab/delivery-files.txt` 制作增量包；包含基线 SHA、每个变更文件的前后哈希、检查模式和回退说明。冲突时停止，禁止强制覆盖或自动删除原文件。
- 不以“之后继续后台做”代替当前交付；不把本地成功说成 GitHub 检查或线上部署成功。

## 建议首先做什么

以 `collab/project.json.nextTask` 为准。当前下一步是维护者推送并验收准备版；游戏结构重构必须先完成基线对齐与操作回归记录。

## R02 页面规范（后续必须先读）

开发是主站栏目，不是独立后台。先读 `docs/site/DEVELOPMENT_PAGE_SPEC.md`、`docs/site/HANDOFF_R02.md` 和安装记录，再读原状态源与交接。不得替换全站主题、导航框架或游戏文件。本轮不重置任务 JSON。

## R03 页面与信息层级

先读 `docs/site/HANDOFF_R03.md` 和 `docs/site/INFORMATION_ARCHITECTURE_R03.md`。首页只放概览与主要入口；详情通过主站原生路由进入二级页面，不再追加长页面或新的一级菜单。本轮仍不编辑任务 JSON，记录版本与界面版本分开。

<!-- MARIO-MIX-R05 -->
## 游戏协作工程 R05
先读 `packages/mario-mix/docs/HANDOFF_R05.md` 和 `README.md`。网站视觉继续按 R04；本轮不改主站 CSS、路由、游戏发布文件或旧任务记录。输入源码经构建进入本地候选；不要单改未被加载的 bill-controls.js。运行 game:check / game:test / game:audit / game:build，记录实际验证范围，由维护者手动推送。

<!-- TERRA-M01-R09 -->
新增第三期工程：先读 docs/terra-m01/HANDOFF_R09.md、packages/mario-mix-terra/START_HERE.md、docs/MODULE_MAP.md（位于该工程）。唯一底稿为用户第三期上传，禁止引入城堡关。修改源码后复跑测试、候选和源码下载包；不要把 33 个 compat 片段说成独立模块。原项目状态不重置。

<!-- TERRA-M02-R10 -->
当前第三期工程交接：docs/terra-m02/HANDOFF_R10.md → packages/mario-mix-terra/START_HERE.md → docs/HANDOFF_M02.md（在该工程内）。模块登记 architecture/modules.json，任务 docs/TASKS.json。M02的默认配置导入修复单独记录；15个模块、33个compat，禁止把剩余共享状态说成全解耦。不引入城堡；前两期、线上第三期不覆盖。

<!-- TERRA-M03-R11 -->
当前第三期工程交接：docs/terra-m03/HANDOFF_R11.md → packages/mario-mix-terra/START_HERE.md → docs/HANDOFF_M03.md（在该工程内）。模块登记 architecture/modules.json，任务 docs/TASKS.json。M03关卡SDK仅支持terra-surface-v1；19个模块、33个compat，不称任意Boss/物理已可接入。先读docs/sdk/CAPABILITIES.md；只新增levels目录的接入实验见测试报告。不引入城堡；前两期、线上第三期不覆盖。


<!-- INTERACTION-R17 -->
最新网站交接：docs/interaction-r17/HANDOFF_R17.md。使用共享 SITE_ACTIONS 构建链接，不重加箭头图块；游戏0.4.2/M06、任务、源码下载和主站主题/转场不变。


<!-- EXPERIENCE-R18 -->
最新网站交接：docs/experience-r18/HANDOFF_R18.md。搜索只索引公开内容；筛选保存在URL；原转场视觉规则不变，原路由现负责返回恢复和失败重试。游戏0.4.2/M06、任务、源码下载、主题和小图标不变。


<!-- LAUNCH-R19 -->
最新交接：docs/launch-r19/HANDOFF_R19.md。保留六项导航、小图标、单条游戏列表与原生转场。公开试玩优先、开发源码分开标识；发布前运行launch:audit并提交真实验收证据。此轮不修改游戏。


<!-- LEVELS-R20 -->
先读 docs/levels-r20/HANDOFF_R20.md。关卡制作状态和地图核验必须分开；只编辑 packages/mario-mix-levels/data/campaign.json，再运行 levels:sync。主站主题、小图标、稳定游戏与M06源包保持，不将坐标模板标成完整原版或已完成奥日关。

<!-- CHAPTERS-R20 -->
最新交接：docs/chapters-r20/HANDOFF_R20.md。保留既有视觉和路由，地图模板、正式角色、机关与发布状态分别验证。0.4.2游戏源码不改；后续28关仍待转录。


<!-- WORLDS-R21 -->
最新交接：docs/worlds-r21/HANDOFF_R21.md。保留既有视觉和路由，地图模板、正式角色、机关与发布状态分别验证。0.4.2游戏源码不改；28关新增模板已转录；水下/循环/角色完整接入仍待完成。

<!-- PLAYER-UI-R22 -->
当前第三期候选：0.4.3 / M07；界面交接见 docs/player-ui-r22/HANDOFF_R22.md。WorldKit W02继续使用固定M06运行时，地图模板与稳定试玩不改。


<!-- SITE-UI-R23 -->
网站交互与排版：见 docs/site-ui-r23/HANDOFF_R23.md。运行 npm run site:ui:check、npm run test:site-ui。游戏仍为 M07 / 0.4.3，WorldKit W02 不变。


<!-- SHOWCASE-R25 -->
游戏入口与关于页：docs/showcase-r25/HANDOFF_R25.md。当前关于页源为 content/about-view.json，个人资料仍在 content/site-data.js；修改后运行 site:build。M07、W02、稳定试玩不改；公开发布继续使用 R24 release:prepare。
