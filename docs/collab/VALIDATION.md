# R01 验证记录

记录日期：2026-09-14。适用范围：本地 `collab-r01` 增量交付；不是线上部署报告，也不是混合马里奥完整版验收。

## 已实际执行

| 项目 | 结果 | 覆盖范围 |
|---|---|---|
| 两个旧文件基线重建 | Git blob SHA 完全一致 | README 与 assets/site-shell.js，不是全仓库 |
| Node 内置测试 | 35 项通过，0 失败、0 跳过 | 模型、生成一致性、HTTP 只读服务、更新/冲突/备份/回退、ZIP 基础校验 |
| 协作源文件校验 | 53 个文本文件通过 | JS 语法、JSON、生成状态同步、39 个本地文档链接；13 个链接指向未随增量包交付的原文件 |
| YAML 配置解析 | 通过 | 三个 Issue 表单与工作流语法/固定 SHA/只读权限的本地检查，非 GitHub 运行 |
| 增量 ZIP 实际应用回退 | 通过 | 53 个包内哈希、ZIP CRC、默认只检查、应用、重复应用、回退、保留无关文件；目标使用两个真实基线文件的临时测试目录 |
| Chromium 页面脚本测试 | 28 项检查通过，0 页面脚本错误 | 本地文本注入的 DOM fixture，不含网络/CSP/原站字体 |
| 桌面/手机布局 | 已检查 1440px 与 390px | 手机文档宽度未超出视口；截图使用字体回退 |
| 原站 shell 接入 | 预渲染笔记保留；重复 notes/games/detail 渲染入口唯一、相对路径正确 | 实际修改后的 shell + 合成页面数据，不是线上整站路由全链路 |
| 草稿流程 | 编辑、必填依据、导出、导入、错基线拒绝、同源草稿恢复、旧草稿拒绝自动合并、复制降级 | localStorage 在 fixture 中使用内存替身；不是用户磁盘上的持久性验收 |

35 项 Node 测试可在正常 Node 环境运行 `npm test`。可选 `python tests/browser_fixture.py` 需要已经安装的 Python Playwright 和 Chromium；它不会自动下载依赖，未纳入本轮 CI 的必需项。该脚本明确移除 CSP 和资源加载标签，再注入本地源码，不能借其通过声称真实来源/字体/CSP 已验证。

制作环境 Node 22.16.0、Linux、系统 Chromium。Windows CRLF 内容比较有自动测试；Windows 双击 cmd、桌面浏览器与真实文件权限仍需用户实机验证。

## 制作环境限制

完整 git clone 因网络域名解析不可用而失败，仓库归档下载亦未成功。通过 GitHub 只读连接读取相关文本和树元数据，不虚构完整副本。第二、三期巨大 HTML 只核实存在、大小和 blob，没有在本轮下载解析或运行。

受浏览器运行环境策略限制，访问本地 HTTP 和 file URL 返回 `ERR_BLOCKED_BY_ADMINISTRATOR`。未更改该策略；改用 Chromium DOM fixture 检查新增界面和脚本，同时通过 Node HTTP 请求单独测试真正的只读静态服务。两项分开记录，不能视为浏览器端到端测试。

## 用户应用之后仍要验证

- 完整仓库的 `npm run doctor`，`/dev/` 页面资源加载、CSP、原站字体；已有站点缓存与语言切换。
- 原首页/笔记/游戏列表/三期介绍之间的真实跳转及其开发入口；旧游戏和下载是否正常。
- 真实浏览器 localStorage、下载/导入、复制权限和 Windows cmd 启动。
- 远端 Actions 首次运行、Issue 表单和 CODEOWNERS；分支规则按单维护者条件单独设置。
- 真实游戏通关、手柄、音频、触屏、坐骑、箱子、存档和素材许可，不在本轮完成范围。

相关待办保存在 `collab/project.json` 的 OPS-001、COL-004、SRC-001、TEST-001、LIC-001。本文件中的“通过”不能自动把这些事项全部标为完成。


## 2026-09-19 网站链接修复

用户授权检查现有网页并修复推送。以 337af95 为基线，修正 terra-chapters 的四个旧 SDK 文档链接，改为现行 stages 指南、契约与验收清单。修正 launch 审计将 noscript 备用页面误算为重复主内容的问题；真实重复仍拦截。39 个页面、268 个引用文件审计无错误。未改变公开文字、字体或游戏玩法；当前工作状态文案保留。

## 2026-09-19 全面检查补充

修复 README 目录链接被误判为网页入口的问题，英文 README 纳入检查；全量检查与 756 项自动测试通过。完整结果与未通过项见 [全面检查记录](WEBSITE_AUDIT_2026-09-19.md)。浏览器连接失败，实际交互未复验；独立发布包检查和第一期候选构建仍有阻塞，未放宽校验。用户本轮延续授权修复推送。

## 2026-09-19 地图工坊本地候选

最新任务是先规划、参考成熟编辑器，再完成下一关可用的可视化地图编辑。已实现基础编辑、保存、三视图、现有驱动试跑和开发包导出；原游戏与下载包未覆盖。详见 [实施与验收](MAP_EDITOR_VALIDATION.md) 和 [方案](MAP_EDITOR_PLAN.md)。浏览器连接与 Windows URL 校验阻断了真实界面验收；待补操作与截图后再发布。预览源在 D:/Code/xiaoq-homepage-push-r25，运行镜像 D:/Code/xiaoq-homepage-github-main-r08-review，端口 4183。

## 2026-09-19 地图编辑与试玩补齐

本地候选增加：起点/终点移动式放置、保留管道引用的旧重复起点清理、金币/敌人矩形批量及间距、跨区域管道目标配置、新区域、PNG 地块素材导入、共享编辑/试玩绘制、自包含 HTML 离线试玩。开发包改用当前区域可达的房间集合。原游戏发布文件和地图模板未修改，未推送线上。

验证：相关单元/事务测试 17 项通过；npm run check、npm test 全套、collab:build、doctor 通过。浏览器实际打开现有 1-1 草稿并进入试玩，截图确认画面加载。离线文件通过 interaction-runtime capture 与独立 validator（均 exit 0）：金币单次计数、键盘管道、触屏管道、重开四条路径；900×420 原始截图已检查。证据目录 C:/Users/Bright/AppData/Local/Temp/map-workshop-play-review，包含 acceptance.json、adapter.mjs、play.html、report.json、captures/；该临时测试文件不是用户关卡。

未完成：原版素材尚未配齐，工坊像素外观不可称原版最终效果；参考层奖励/敌人不自动转换为可玩实体；水下与复杂机关仍受现有驱动限制。工具页未加入入口，当前主入口仍在地图册。本轮不发布。后续优先完成原版素材映射及完整对象机制，再决定公开入口。


## 2026-09-19 · 地图工坊像素材与预览同步（当前）

用户要求复用现有 1-1 素材，并同步旧预览、显示马里奥起点及区分敌人。本轮 atlas/editor/classic-art.mjs 的调色板和像素编码与 games/mario-mix/classic-mix.js 相同；原稳定游戏文件未改。编辑器、试玩与生成 SVG 共用素材来源，32 关的 96 份区域/分段预览及网站 assets/chapters/maps 和下载模板已同步。地形坐标和碰撞不变，第一世界模板补充来源语义以区分砖块、问号块、管道。

起点直接显示马里奥，标签位于人物上方。栗宝宝和乌龟根据原记录分别显示，不把所有敌人替换成同一图形；现有素材集中缺少的其他敌人保留具名参考标记。外观同步不代表乌龟壳、道具、复杂机关或全部原版行为已经实现。编辑器 1-1 新建副本使用现有实机布局，用户已保存工程不会被覆盖。

试玩使用单跳与踩敌适配，512×480 原生画布；使用既有 1-1 的九项音频资源，离线 HTML 内嵌这些媒体和运行模块。未新增其他角色能力。参考 Nintendo Mario Maker 的选素材→放置→试玩流程，沿用本站配色；工程菜单点击后关闭，手机素材栏可折叠。

验证：地图包此前 92 项测试通过；本轮新增敌人坐标/贴图回归测试，章节同步 18 项与素材相关 3 项测试通过。离线运行五场景（金币、键盘管道、触屏管道、重开、BGM）报告和证据完整性均通过；桌面/手机编辑器及旧地图册实际浏览器截图无脚本错误。证据在 C:/Users/Bright/AppData/Local/Temp/map-workshop-play-review。完整检查曾发现网站地图生成物未同步，已运行 worlds:sync 修正并通过相关回归。

当前：D:/Code/xiaoq-homepage-push-r25 本地修改，同步预览 D:/Code/xiaoq-homepage-github-main-r08-review，http://127.0.0.1:4183/。未提交或推送。下一步：用户验收显示效果；不在此轮重做稳定游戏。


## 2026-09-19 · 修正全关卡素材覆盖与编辑器试玩链路

用户指出 1-3 树顶被砖块替代，并发现旧草稿试玩管道变砖、敌人缺失。本轮从原有 umaim/Mario 固定提交的 Source/settings/sprites.js 静态解析完整素材库（所有地形、角色、装饰、文本状态和配色），未执行上游脚本。来源路径、完整组清单及哈希记录在 packages/mario-mix-worlds/reference/SPRITE_SOURCE.json；权利声明沿用原站并补入 CLASSIC_ART_NOTICE.txt。

此前“用 1-1 素材可以覆盖所有地图”的判断不成立。本轮树顶/树干、蘑菇平台、平台、珊瑚、炮台、城堡/水下配色、火棒和全部现有敌人类型按语义匹配。地图册与编辑器共用 terrainParts/markerParts，不再把未知地形静默当作砖块。扫描 32 关 96 视图：3677 个地形绘制片段与 516 条敌人记录均有素材，零未知匹配。碰撞坐标不变，复杂机制仍是参考展示。

旧草稿读取时只从对应模板补缺失语义，不覆盖地形编辑。敌人导入对象层后可移动、删除、批量放置；运行时不重复生成已删除的对象。地图编辑器新增具体地形和敌人素材选择。试玩延迟激活远处敌人，补足基础移动/接触表现；不是完整原版敌人 AI、龟壳、火棒或城堡机制实现。水下试玩仍需游泳驱动，不伪称已完成。

本地浏览器实查 1-3、1-4、2-2、4-3、8-3。旧无语义 1-1 工程试玩实际读取到 17 个敌人，截图 old-draft-pipe.png 中同时显示正确绿色管道与栗宝宝。截图与 coverage.json 位于 C:/Users/Bright/AppData/Local/Temp/map-workshop-sprite-source。22 项针对性测试通过；完整库所有 Character/Solid/Scenery 默认帧可解析，全部关卡几何与敌人有贴图、树顶端帽/树干一致、删除敌人不复生均有回归检查。离线五场景与证据完整性再验通过（既有 map-workshop-play-review 目录）。

编辑仓库 D:/Code/xiaoq-homepage-push-r25；预览镜像 D:/Code/xiaoq-homepage-github-main-r08-review（4183）。本轮只在本地更新，未提交推送。下一步：用户查看 1-3 和旧草稿试玩；如新增机制，应另列行为验收，不能用贴图覆盖冒充玩法完成。

## 2026-09-19 · 编辑器 1-1 行为基准与视图修正

用户最新要求：先以既有 games/mario-mix/classic-mix.js 的马里奥 1-1 为基准，修复试玩与编辑体验，再扩展其他关卡。只更新本地候选与 4183 预览；未提交、未推送，稳定游戏文件未改。

已改：独立 Mario motor 采用既有 60 Hz 加速、长短跳与跑跳参数；按格处理顶砖、已用砖、碎砖与隐藏加命；蘑菇/花/星星、火球与龟壳；管道保留强化状态；原像素 HUD；旗杆单处绘制、降旗、落地走向城堡与时间计分。朱盖木投刺球、锤子兄弟投锤/跳跃等已加入编辑器专用驱动，未声称其他关卡和全部敌人已逐帧对齐。

效果视图隐藏开发参考框；秘密视图标注奖励、隐藏块和管道去向，并避让文字、剔除屏外标签。画布增加左右按钮及中键、空格拖动、Shift+滚轮提示。用户天空错图的数据实际为 64×48 单向平台：改为只绘制平台顶面，并新增独立云素材；不擅自改写用户草稿的地块类型。

验收：新增 8 项行为测试，含实际 1-1 输入回归；浏览器连续输入重放 1531 帧完成、lives=3、y=194、无页面错误。未移动角色/关闭敌人来伪造通关。路线输入保存在 tests/fixtures/mario-1-1-route.json。此前整仓 check/test/doctor 通过；本轮收尾再跑编辑器测试、构建检查及离线交互重放。截图和浏览器记录在 C:/Users/Bright/AppData/Local/Temp/map-workshop-play-review/。

范围限制：这是已有网页 1-1 的规则基准，不是 NES 仿真器。尚未完成全部关卡、水下游泳、全部机关与敌人组合的实机验收；实体手柄未验证。下一步按同一通关、素材和行为检查规则扩展关卡，不能以这一条路线替代全部交互验证。

## 2026-09-19：试玩奖励、踩怪与火球修复

本轮按用户反馈修正地图编辑器共用试玩运行时：星星改用已有 1-1 的闪色贴图；同帧相邻敌人的踩踏统一使用接触前位置与下降状态，防止大马里奥踩怪后被误伤变小；补充金币弹出旋转、四块碎砖飞散、火球旋转和撞墙消失。火焰形态可用 Shift / J / X 发射（先吃蘑菇，再吃火焰花）。原稳定游戏未修改，所有使用同一运行时的地图与新导出试玩包共享这些修复；旧下载文件需重新导出。

验证：30 项编辑器测试通过；隔离浏览器用实际按键完成吃蘑菇、吃花、左右发射、顶金币、星星与碎砖 7 项场景，构建绑定的交互证据完整性校验通过。重新录制并在浏览器回放 1-1 路线，终点 completed=true、lives=3、pageerror=[]。未声称全关卡与原版逐项一致。

预览：原 4183 端口启动返回 EACCES；同一预览目录改在 http://127.0.0.1:4184/packages/mario-mix-worlds/atlas/editor.html 启动并完成上述通关。源码在 D:/Code/xiaoq-homepage-push-r25，预览在 D:/Code/xiaoq-homepage-github-main-r08-review。本轮未提交或推送。浏览器证据保存在本机临时目录 map-workshop-play-review（actions-report.json、full-1-1-browser.json）；不能当作远端发布证据。

最终仓库检查：collab:build、check、完整 npm test、doctor 均退出 0；预览共用运行时文件 SHA256 与编辑仓库一致。


## 2026-09-19：出砖遮挡、食人花与蘑菇接触修正

用户反馈：蘑菇压在隐藏砖上，管内敌人可见，隐藏蘑菇音效及碰撞不正确。根因：奖励与管道敌人在地形后绘制；隐藏地块未从道具碰撞中过滤；加命道具复用 powerup 音效。

修改共用编辑器试玩：道具在砖内按 32 帧升出，升出期间不能拾取；道具与管道敌人采用地形后方绘制和出入口裁剪。食人花锚定匹配管口，仅露出部分参与玩家/火球碰撞。蘑菇采用已有 1-1 的 14×14 接触范围，横向碰撞贴墙后反向，未揭示砖块不参与道具碰撞；红绿蘑菇及花统一原有道具原生尺寸、颜色和底部锚点。绿蘑菇拾取用 oneup.mp3，出砖仍用 appear.mp3。

验证：新增出砖、撞墙、单次加命音效、隐藏砖穿过、食人花管内不伤人和远处伸出测试。5 项隔离浏览器实际输入场景与完整性校验通过，审阅了出砖和食人花截图。证据：本机临时 map-workshop-play-review/occlusion-report.json、occlusion-captures。离线页面由当前 offlineFile 真实导出，完整内嵌代码和音频接受构建哈希检查。稳定游戏和用户保存的地图不变。最新预览仍为 4184；本轮无提交或推送。所有共用运行时关卡生效，旧离线下载须重新导出。尚未宣称所有敌人机制均与原版一致。

本轮收尾：collab:build、check、完整 npm test、doctor 全部通过；浏览器 1-1 再次 completed=true、lives=3、errors=[]。共用试玩源码已同步本地 4184 预览，未推送。


## 2026-09-19：钢盔龟专用壳与踩踢区分

用户指出钢盔龟复用了乌龟壳。共用渲染映射新增 BeetleShell，保留钢盔龟的类型与火球免疫。修复静止壳上方踩踏被侧踢分支提前吞掉的问题：先处理踩踏，静止壳踩后弹起并发射，滑行壳踩停，侧碰静止壳踢出；踩踢音效互斥。库巴仍按初代不可直接踩死，新增从上方接触伤害测试；未擅自改成其他作品的可踩伤规则，已向用户澄清。

新增素材差异和库巴接触回归测试；当前 17 项 Mario 测试通过，隔离浏览器验证钢盔龟缩壳、再次踩后左向滑行和撞墙反弹 3 个场景，构建绑定 gate 通过。截图已检查为专用深色壳。证据在本机临时 map-workshop-play-review/beetle-report.json、beetle-captures。最新代码同步 4184 预览，未提交推送。尚不代表所有敌人全生命周期与初代逐项一致。

## 2026-09-19：完整平台与管道组件

按用户纠正，树顶、蘑菇平台、管道采用完整组件放置。树/蘑菇横拖定宽（至少 32），顶面 16 高，管道纵拖定高（至少 32）、固定 32 宽。右侧选中组件宽/整体高表单可直接改尺寸；平台高 0 自动接地，显式高度只影响支撑视觉，碰撞仍为顶面。越界与交叠拒绝，普通涂画不能把组件切成碎片，橡皮删除整体。旧草稿同高相邻树/蘑菇顶按连续左右端与中段渲染，只生成一组支撑，不重写用户草稿。管道穿行仍由对象层入口和落地点连接决定，外观放置不自动创建传送。

参考 Tiled 自动拼接与对象编辑：https://doc.mapeditor.org/en/latest/manual/terrain/ 和 https://doc.mapeditor.org/en/latest/manual/automapping/ 。保持原生像素，端部不拉伸，顶面和支撑分开。测试覆盖连续顶面端部、旧单格组、支撑高度、管道固定宽、越界、元数据剥离。实际浏览器鼠标完成树平台拖放、尺寸修改、蘑菇和管道放置、撤销重做并进入试玩，页面错误为空；截图 components-editor.png / components-play.png，结果 components-ui.json（本机临时 map-workshop-play-review）。修复实测发现的 stemHeight 泄露到严格运行时 map schema 的问题：仅保留在工程视觉数据，运行时导出剥离。同步重绘受影响的地图预览（worlds:build）。未提交推送。

最终收尾：组件修改后的 collab:build、worlds:build/sync、check、完整 npm test、doctor 均通过。此前钢盔龟检查期间的预览同步失败已通过重建预览解决；不沿用失败结果。源码、编辑器页面与受影响 SVG 已同步到本地 4184，未提交推送。


## 2026-09-19：试玩移动、飞鱼与受击生命周期

用户要求对照原版 1-1 补齐加速/惯性、下蹲、飞鱼、死亡过程、顶砖弹起蘑菇及电梯贴图。修改仅在地图工坊共用 motor/stage/art/play 与 source-art；稳定 games/mario-mix/classic-mix.js 只作参考，未改。现有加速、摩擦、反向制动与跳跃数值保留；步行动画改按移动距离推进，加入刹车姿势，下蹲保留脚底位置并检查站起净空，新增 S 与触屏下蹲。

马里奥死亡先停顿 24 帧，再上抛下落，105 帧后重生/结束，期间停止背景音乐、输入与重复伤害。板栗仔踩扁短暂保留；火球、龟壳、无敌和顶砖击杀用翻转抛落效果，死亡效果不参与碰撞。已出砖的蘑菇被脚下砖顶中后 vy=-3、横速 .8，加入上方碰撞，落回平台。飞鱼执行 CheepsStart/Stop 区域，每 21 帧生成，从屏幕下升至顶部阈值后受重力下落；有数量上限与清理，水中游鱼保持分开。参照 umaim/Mario 的 FullScreenMario.ts 与 objects.js，原生像素按两像素/逻辑单位换算。Platform 源数据的行宽从误写 16 修为 8，恢复 8×8 原生贴图；重建并同步 45 个相关生成文件。

验证：24 项 Mario 单元/回放测试通过，覆盖原 1-1 无损通关、加速/滑行/反向、下蹲净空、死亡与重生、蘑菇弹起再落地、飞鱼起止区及升降、踩扁/火球击杀、电梯原生尺寸。独立浏览器通过真实按键执行加速、下蹲、顶砖弹菇、死亡上抛、飞鱼、电梯 6 个场景，绑定离线导出产物的验收 gate 与完整性检查通过，无页面/控制台错误；已逐张检查截图。另外实际 4184 编辑器 1-1 回放到终点、3 命、tick 1513；2-3 实际进入飞鱼区域，tick 141 仍 3 命且有 3 条飞鱼。板栗仔踩扁截图单独检查通过。证据目录为本机临时 map-workshop-play-review：mechanics-acceptance.json、mechanics-report.json、mechanics-captures、stomp-native.png、2-3-fish-native.json/png、full-1-1-browser.json。

本地预览源已同步到 D:/Code/xiaoq-homepage-github-main-r08-review 的 4184 服务；用户草稿未清除。源码位于 D:/Code/xiaoq-homepage-push-r25，未提交/推送。远端只读核对 main=30db4b68edb2a4c8a93074ca414e0c957d4dd9a2。范围限制：未证明全部 32 关与原版逐帧一致；本轮只验证列出的共享行为及 1-1/2-3 实机路径。

收尾验证：collab:build、worlds:build/sync、完整 check、完整 npm test、doctor 均通过；HTTP 4184 返回的五个共用模块逐字节匹配本轮源码，相关地图预览、地图 ZIP 与生成清单已同步。未改用户 localStorage，未提交推送。

## 2026-09-19：城堡机关与完整底图

本轮修复 8-4、4-4、7-4 默认只展示入口/局部分段的问题，按 256 像素视口展开一次通过路线，原始分段保留。审计 32 关/63 区域/33 分段；补齐火棍旋转伤害、撤桥后库巴落下、岩浆遮挡与逻辑三角、桥重复贴图、Toad/Peach 终点。J/X/左右 Shift 分别通过实际键盘回放。详细来源、文件范围、验证和限制见 MAP_COMPLETENESS_2026-09-19.md。

6 项新增回归、8 场景构建绑定浏览器验收、实际 8-4 导入和 1-1 无损通关通过；worlds/journal/collab 构建、check、完整 npm test、doctor 通过。源码 D:/Code/xiaoq-homepage-push-r25，预览 D:/Code/xiaoq-homepage-github-main-r08-review:4184 已同步。用户本地草稿保留，重新从底图创建才获得新完整图。循环失败重置与水下试玩仍未完整模拟；不得称整个 8-4 完整可通关。未提交推送。


## 2026-09-19 — Editor transitions and offline replay

User scope: repair shrink/flicker/star audio, 1-1 secret pipe entry/drop/exit, replay after game over, narrow-gap dash, and branded offline HTML. No commit or push authorized this round.

- Shared editor/offline runtime: 24-tick foot-anchored big/small shrink, then 120-tick damage protection with alternating visibility; star immunity also guards hazard contact. Star recording is embedded offline and background music resumes on expiry.
- Pipes: timed downward/rightward entry and upward exit with aperture clipping; shared room transfer preserves form and collectibles. The 1-1 editable template has an upper-left ceiling opening/drop spawn and a horizontal outlet connected to its surface return pipe.
- Replay: visible game-over/clear overlay, Enter shortcut, restart restores input focus and clears pause. Offline shell uses the site's dark/red/cream identity with homepage, games, tools and editor links, mobile controls and retained attribution.
- Full-speed dash skims only same-height gaps up to 16 px; walking or a 32 px gap falls. This is intentional Mario behavior, not a missing-collision fix.

Validation: 27 editor-Mario tests pass. Native browser four-scenario replay gate (pipe round trip, shrink protection, star music + expiry, game-over Enter restart) passes, including evidence-integrity validation. The actual preview editor's 1-1 native keyboard route still clears at tick 1513 with three lives and no page errors. Offline file desktop/mobile open/play/return/reopen and static HTML checks pass. Visual review of secret-room drop and desktop/mobile offline screenshots completed.

Source: D:/Code/xiaoq-homepage-push-r25. Active preview mirror: D:/Code/xiaoq-homepage-github-main-r08-review, port 4184. Evidence: C:/Users/Bright/AppData/Local/Temp/map-workshop-play-review/transitions-report.json, transitions-browser.json, full-1-1-browser.json, offline-ui-review.md. Existing saved editor drafts are deliberately retained; load a new 1-1 template copy to use the corrected geometry, first export any draft to preserve it. Old downloaded HTML must be exported again. No claim of exact NES timing, all-map playthrough, water mechanics or publication.

Final verification: collab:build, complete npm run check, complete npm test, and npm run doctor finished successfully. All seven changed preview runtime/template files return HTTP 200 and match the source bytes on port 4184.


## 2026-09-19 — Platform contacts, castles, pipe depth and growth

Latest corrections: smart Koopa edge decisions must follow actual feet/support, not a fixed platform bounding range; retain green Koopa falling behavior. User confirmed star music works after refresh; the open tab had older loaded modules (no workshopRead), and reloading restored the current runtime without replacing the saved draft.

Changes: smart, non-shell Koopas probe their leading foot across adjacent visible support pieces; hidden blocks do not count as support. Narrow tree trunks are centered within their cap. All 27 existing exterior-castle references across the 32-level atlas now assemble native small/large castle scenery in Canvas and generated SVG previews. Pipe rendering is sorted short-to-tall independently of insertion order; old tall-pipe return portals also recognize horizontal entry. Holding down at a pipe now works without requiring a fresh key press on the landing tick. Mushroom collection plays a 24-tick small/large transition while freezing movement and preserving the foot anchor.

Validation: 31 targeted tests pass (29 Mario + 2 castle/render order). Native seven-scenario gate passes evidence-integrity checks: pipe round trip, star track/expiry, damage protection, game-over restart, mushroom growth, tree and mushroom-platform enemy movement. Growth captured every four ticks: bottom remains 208 and x remains 72.9296875 through all 24 transition ticks; screenshots visibly alternate size. Green falls while red patrols; tests cover joined and one-cell platforms. All castle sprite parts decode at native scale and stay within source-map widths. Actual editor 1-1 keyboard route still clears at tick 1513 with three lives. Preview runtime, generated SVGs and map downloads synchronized to port 4184.

Evidence: C:/Users/Bright/AppData/Local/Temp/map-workshop-play-review/edges-report.json, edges-acceptance.json, edge-native.json, growth-frames.json, edge-castle.png, edge-large-castle.png, edge-tree.png, edge-shroom.png. This is local only; no commit or push. Existing drafts are preserved; no claim that all 32 maps are fully playable or every NES timing matches.

Final pass: worlds:build, collab:build, full check, full test and doctor completed. No failed test records. Updated runtime modules are byte-equal over HTTP 4184. Pipe-depth screenshot reviewed: short horizontal mouth behind tall vertical shaft; native round trip preserved three lives.

## 2026-09-19 场景音频与离线下载

修正地图工坊将 Castle 误配为 Underworld、Underwater 未独立选择的问题；加入对应低时间曲目，星星优先且结束恢复当前场景。大小跳跃、拉旗、城堡通关、库巴喷火/坠落、游戏结束使用独立音效。新增录音来源和校验值见 packages/mario-mix-worlds/reference/AUDIO_ADDITIONS.json。

底图创建移至常驻工具栏并按世界筛选关卡；离线导出显示进度，完成后明确点击保存，失败可重试。源代码与音频已同步 4184 本地预览；未提交或推送。浏览器已验证全部音频解码、六种主题实际播放状态及桌面/手机真实下载后离线启动；这不等于逐关人工听审或原版逐帧音频时序验收。

待办保留：旗杆底座及拉旗位置对齐、1-2 电梯真实运动尚未在本次修改，不能标作已修复。下一步从原版 1-1 拉旗坐标与 1-2 PlatformGenerator 双平台循环规则实施并实测。用户草稿不得覆盖。证据位于 C:/Users/Bright/AppData/Local/Temp/map-workshop-play-review，audio-audit.mjs 与 editor-download-check.mjs 可复跑。

本轮最终检查：collab:build、check、npm test、doctor 均完成通过；音频专项 2 项通过。浏览器音频结果 audio-browser-results.txt，下载复测覆盖当前 4184 服务。

## 2026-09-19 全屏与试玩品牌
共享试玩增加全屏/退出全屏按钮，维持画面比例并保留操作栏；退出试玩同时退出全屏。在线和离线共用实现。离线封面按用户标注把 Q logo 放左上品牌区、头像放右侧；小屏上下排列，图像内嵌无需联网。4184 已同步；浏览器实测在线/保存后的离线文件进入、退出、关闭全屏均通过，桌面/手机下载并启动通过，品牌图像加载成功。未推送。证据：temp/map-workshop-play-review/fullscreen-check.mjs、brand-cover.png。

## 2026-09-19 触屏手柄
试玩改为左方向键、右 A 跳跃/B 加速火球的手柄布局；↑ 进管道、↓ 下蹲/进管道。独立 pointerId 记录支持多点触控，松手/取消/失焦/重开释放状态，保留键盘与全屏。在线、离线共用模块；4184 已同步。手机视口下使用浏览器原生双触点验证右移+跳跃同时生效及释放，桌面/手机实际离线导出和启动通过。证据 gamepad-check.mjs、gamepad-mobile.png 位于既有 temp/map-workshop-play-review；未做实体手机实测。未推送。

## 2026-09-19 单向镜头
试玩镜头改为运行时维护的单向滚动状态；人物后退不能越过当前视窗左边界，绘制读取同一个 cam，飞鱼出场范围同步镜头。进入区域/复活按出生点重新定位，重新开始重建状态。在线和离线共享实现，4184 已同步。Mario 专项 30 测试通过（含完整 1-1 路线及单向镜头回退边界）；真实下载的离线文件以原生键盘验证前进后退。未推送。

## 2026-09-19 经典手柄与全屏收起
按用户要求移除“小Q手柄”，改为左十字键、中 SELECT 声音/START 暂停、右 XYAB 菱形布局。B 跳跃、Y 加速、A 火球、X 管道。全屏增加隐藏/显示手柄开关，隐藏清除触点并释放画面空间，退出全屏恢复手柄。在线与离线实际下载后验证全屏隐藏/显示/退出；手机双触点移动跳跃通过。4184 已同步，未推送。

## 2026-09-19 试玩标题简化
按用户截图修正：试玩标题栏仅保留 Q logo 与试玩地图标题，用 flex 垂直居中；移除小头像及重复署名。离线封面大头像保留。在线与离线共用模块，4184 同步，未推送。

## 2026-09-19 手柄映射及默认全屏
四键映射调整为 A/B 跳跃、X/Y 加速与火球，取消独立火球及管道动作键；方向控制管道，保留旧键盘兼容。中央功能键横排，暂停及恢复播放 pause.mp3。原生浏览器验证暂停冻结、音效事件、恢复以及双触点通过。最新用户要求：每次进入全屏默认隐藏手柄，可点击显示；退出全屏恢复。在线/离线同源，4184 已同步。官方控制参考 https://csassets.nintendo.com/noaext/image/private/t_KA_PDF/manual-wii_supermarioallstars 。未推送。

## 2026-09-19 拉旗锚点与管道出口
拉旗人物锚点从出口左沿改为旗杆中心减人物宽度，使用已有大小形态 climb 帧；旗杆标记与底座中心对齐，滑落以底座顶为界，放手后移动至杆右侧。出口管道选择兼容出生点偏移，短暂停顿后以每帧 0.5px 升出，转场使用 idle 帧且不附加出管闪烁。30 项 Mario 回归通过；浏览器实际 1-1 管道来回、出管站定与完整关卡通关均通过，3 命未损失，无页面错误。4184 已同步；离线导出共用运行时，旧文件需重下。未推送。证据：temp/map-workshop-play-review/flag-pipe-tests.log、transitions-browser.json、full-1-1-browser.json。

## 2026-09-19 紧凑手柄与横屏布局
普通手柄最大宽度收至 440px，中央 SELECT/START 上方加入内嵌来源 Q logo。手机横屏全屏显示手柄时使用两侧方向/动作区域，中间游戏画面独立，功能键在中央下方，保留默认隐藏。844x390 浏览器模拟检查主要触控目标 44–48px，截图 pad-landscape.png；在线/离线全屏切换、手机双触点、下载启动验证通过。实体握持人体工学未验证，不承诺所有机型。4184 已同步，未推送。

## 2026-09-19 横屏画面优先
根据最新反馈，取消横屏全屏的上下标题/功能栏占高；canvas 等比例使用整个屏幕高度，方向键与功能键放两侧留白。844x390 下实际游戏从约248x232扩大至416x390，不拉伸。Q logo保留，默认隐藏手柄不变。实际离线下载启动与全屏切换通过；pad-landscape.png 已更新，4184 同步，未推送。

## 2026-09-19 1-2 双组循环电梯
修复 platform-generator 仅静态图形：按已固定上游 macroPlatformGenerator 源码生成每组两个平台，1-2 共两组四个，原生坐标速度±0.84px/frame，间隔96px，出屏循环。平台为单向碰撞，可承载玩家；循环时解除支撑避免带人瞬移。试玩隐藏原静态标记避免重复，地图预览显示两平台初始位置；所有同类生成器共用逻辑。31 项 Mario 回归通过；实际 1-2 数据导出的浏览器离线试玩验证四个平台及上行承载（74.44→59.32），elevator-browser.mjs/elevator-riding.png 为证据。4184 已同步；未验证完整 1-2 通关，未推送。

## 2026-09-19 敌人接触
核对固定上游 upstream-engine.ts collideEnemy/collideShell/collideShellShell。普通地面 walker/goomba/koopa/beetle/spiny 每对每帧只处理一次，分离并转向；静止壳阻挡普通敌人，滑动壳击倒地面敌人并连击计分，双滑动壳交换方向，滑动壳击中静止壳计500分，带 kick 音效。脚本飞行体及投射物不参与地面分离。32 项 Mario 测试通过，含接触后20帧不抖动及原有1-1通关。尚未证明所有敌种与原版完全一致；空中/首领特殊接触不在本次通过范围。4184同步，离线同源，未推送。

## 2026-09-19 · 连续闯关验证
- 实际点击编辑器下载按钮生成离线 HTML，在本地 file 页面逐一选择并启动全部 32 关；均可启动。
- 原生按键通关 1-1，自动进入 1-2 并保留生命和分数。
- 专用短关夹具验证通关后的制作滚屏和返回选关（非真实 8-4 通关证据）。
- 单元检查覆盖关卡顺序、主区域选择、跨关状态传递和基础游泳。
- npm run collab:build、npm run worlds:build、npm run check、npm run doctor 已通过。
- 证据目录 C:/Users/Bright/AppData/Local/Temp/map-workshop-play-review，campaign-menu.png、campaign-next.png、campaign-credits.png。
- 未完成完整 32 关逐关通关，水下手感、城堡循环及部分特殊机制仍需实际核验。

- 最终 npm test 全套通过（campaign-all-tests-final.log）。最终离线包：C:/Users/Bright/Downloads/xiaoq-mario-32-levels-20260919.html，12,910,942 字节。更新后的构建再次通过 32 关启动及 1-1→1-2 原生按键通关检查。

## 2026-09-19 · 全屏画面上下贴边
将横屏全屏布局扩展到桌面尺寸：画布保持比例占满屏幕高度，说明放左侧、工具按钮放右侧，手柄显示不占画布高度。1920×1080 与 844×390 浏览器真实全屏下，分别验证手柄隐藏/显示，画布上下贴边；截图 fullscreen-1920-true.png、fullscreen-844-true.png 位于临时 map-workshop-play-review。源与 4184 预览及下载目录连续版 HTML 已同步；未推送。

## 2026-09-19 · 跨关保持全屏
用户要求下一关保留全屏。editor-play 返回可加载下一关的会话，campaign-ui 复用原对话框与全屏元素，转场及结尾滚屏在同一容器内显示；避免关闭/重建窗口触发浏览器退出全屏。手柄显示状态随窗口保留。实际按键通关 1-1→1-2 验证原 fullscreenElement 身份不变、退出全屏事件为零、手柄仍显示、生命与分数保留；8 项相关测试通过；短关夹具验证结尾滚屏及返回选关。源、4184 预览与 Downloads/xiaoq-mario-32-levels-20260919.html 已同步，未推送。证据 campaign-fullscreen-route.mjs 位于 C:/Users/Bright/AppData/Local/Temp/map-workshop-play-review。

## 2026-09-19 · 通关提示重叠
短关实际运行复现 drawHud 的 COURSE CLEAR 与 editor-play 中文完成提示重复绘制。移除 HUD 内的完成/失败面板，由试玩运行器统一绘制结果与下一步提示。重新生成离线短关截图确认只剩一层提示，连续版重新下载并同步 Downloads；预览已同步，未推送。

## 2026-09-19 · 一格空隙加速条件
按用户反馈取消 2.25 速度门槛，改为地面向当前移动方向按住加速即可掠过同高度、最多 16px 的空隙；水下不应用。新增双向从缺口边缘静止起步、普通行走、32px 缺口的对照回归，34 项 Mario 测试通过（含既有 1-1 路线）。未声明 NES 原版参数完全一致。源与 4184 预览同步，连续版重新生成至 Downloads，未推送。

## 2026-09-19 · 8-4 回管出口食人花
出口过渡开始时将该管道关联的食人花缩回并重置周期，避免房间缓存保存的伸出状态杀死刚出管人物。保留离开管口后的正常行为。新增使用真实 8-4 area-0 数据、等待出口花伸出后经回管返回的回归，验证出管时隐藏、原地 300 帧安全；35 项 Mario 测试通过。源、4184 预览与连续离线版同步，未推送。

## 2026-09-19 · 单关离线通关滚屏
单关/手绘地图离线导出共用 showCredits 制作滚屏，展示关卡名、在下_小Q、GPT-6 Astra 及素材来源；增加再玩一次和返回封面。完成提示改为即将显示制作信息。短关浏览器实测通关→滚屏→重玩→再次滚屏→封面通过，离线导出 5 项测试通过。共享运行器和预览已同步，旧单关 HTML 需重新导出。未推送。

## 2026-09-19 · 外接手柄
接入 Gamepad API 轮询，标准映射左摇杆/十字键移动，下/右面键跳跃，左/上面键加速及火球，START 暂停，SELECT 声音。摇杆死区、暂停边沿触发、断连释放，显示连接与非标准布局提示。离线内嵌模块同步。6 项针对测试通过；1920×1080、844×390 浏览器模拟标准手柄验证移动跳跃及断连，未用实体蓝牙手柄验证。源、4184 预览和 Downloads 连续版同步；未推送。

## 2026-09-19 · 管道对齐与全屏面板
进入键改为持续输入，竖管须接近中心且站在管口、横管须贴近入口高度与侧边，避免空中误入。原35测试及新增持键落到管口回归通过。全屏默认收起说明与工具按钮，点击左上角在下_小Q试玩地图切换展开；Q 保留。桌面1920×1080和横屏844×390实测默认隐藏、展开及画面贴边通过。源、预览与连续版下载同步，未推送。

## 2026-09-19 · A/B 原版分工
依据任天堂 SMB 说明书 https://www.nintendo.co.jp/clv/manuals/en/pdf/CLV-P-NAAAE.pdf，屏幕 A 跳跃，B 加速/火球，X/Y 保留加速别名。外接标准手柄默认 A 下方，Nintendo 名称识别为 A 右方，提供显式布局选择以处理无法识别的设备。新增两类布局 A/B 独立功能回归，7 项相关测试通过。预览与离线同步；实体手柄仍待用户验证。

## 2026-09-19 · 试玩标题空格
将试玩标题统一为“在下_小Q 试玩地图”，在试玩窗口标题和全屏可展开入口中间加入空格。源、4184 预览及连续离线包同步，editor-playable 5 项测试通过。

## 2026-09-19 · 死亡后当前位置继续
试玩死亡时新增“从当前位置继续”按钮。死亡动画期间或耗尽生命的游戏结束画面均可使用；运行器调用 stage.continueFromCurrent，回到最近一次死亡坐标，恢复可操作状态并保留未耗尽的生命，游戏结束时给测试继续 1 条命；地图收集状态保留，正常自动复活、重新开始和连续闯关不变。新增两项运行时回归，43 项相关测试通过。预览与连续离线包同步；手动地图需重新导出离线文件，未推送。

## 2026-09-19 · 死亡等待测试继续
修复反馈：死亡后原运行器在 105 帧自动回检查点，用户来不及点击按钮。试玩运行使用 manualDeath=true：死亡动画结束后停在死亡位置，直到点击“从当前位置继续”；若用户不点击，不会跳回出生点。常规引擎默认自动复活逻辑保留。新增手动死亡等待回归，44 项相关测试通过。预览与连续离线版已重新生成，未推送。

## 2026-09-19 · 虚拟手柄布局同步
修复布局选择只改外接手柄、不改屏幕按钮的问题。虚拟手柄按物理位置动态显示并切换逻辑：Xbox/A 在下方、B 在右方、X 左方、Y 上方；Nintendo/A 在右方、B 下方、Y 左方、X 上方。auto 会根据已连接手柄名称选择，手动选择立即清除触控状态并重绑。浏览器实测两种选择字母与动作均切换正确，7 项输入/离线测试通过。预览与连续离线包同步，未推送。

## 2026-09-19 · 8-4 回程管口判定
复现用户截图后确认：右侧最高白管对应原始数据中的 r020，它没有 transport 目标，是城堡障碍管；前一根 r018 才是可进入的传送管。原试玩的食人花在玩家跳回 r018 时仍按上升计时，先于管道输入造成死亡。调整共用试玩驱动：玩家接近管口时让食人花按原版行为回缩并重新计算裁剪/碰撞，避免回程被错误击杀；竖管入口改为身体实际压住管口即可，不再要求过严的中心线；不把 r020 误改成传送点。新增真实 8-4 从 r020 回到 r018 及边缘站位回归，41 项 Mario 测试通过。源、4184 预览与连续离线版已同步，未推送。
<!-- CONTINUE-SAFE-LANDING-20260919 -->
岩浆或坠落死亡后的“从当前位置继续”改为在当前房间选择附近安全的静态支撑面，检查人物完整高度、岩浆与危险区、实心障碍；找不到安全落点时保持死亡状态。普通受伤死亡继续保留原位置。新增岩浆/坑洞回归，复活后静置240帧仍存活；Mario与离线导出相关48项测试通过。已同步4184预览；已有离线HTML需重新导出。未推送。
<!-- PLAY-PRESENTATION-20260919 -->
本轮修复重开后的面板与音频：死亡临时展开面板前保存隐藏状态，重开/继续恢复；用户点击重开时解锁并启动对应BGM，忽略已停止音轨的异步失败，保留主动静音。接入水下划水帧、独立上浮气泡与水面素材。城堡自动行走更新镜头，8-4公主可见并停留180帧后结算。制作名单采用独立全屏字号、头像、分段滚动、静态名单及网站入口，解决通用全屏12px样式覆盖。51项针对性测试通过；Edge浏览器夹具验证全屏死亡→重开后面板隐藏、underwater音轨playing，桌面/横屏结尾截图无脚本错误。真实8-4数据斧头到公主镜头回归通过，不是全关人工通关证据。已同步4184及重新生成连续离线HTML，未推送。
<!-- SAFE-LAND-CORRECTION-20260919 -->
用户纠正：岩浆继续落在顶部，要求最近陆地。安全候选改为与房间底部相连的静态实体地面，排除顶部禁区、悬空块和管道；距离改为二维实际距离，保留危险区和头部空间检查。新增宽天花板/悬空砖夹具，确认落在最近右岸且240帧存活、可继续向右行走。46项Mario测试通过；同步4184并重新导出连续离线版，未推送。
<!-- COUPLED-SCALE-20260919 -->
3-3截图中的Scale此前为静态地形。本轮共用运行器接入双端承重反向运动、松开减速、极限脱落；绳索从实时平台位置绘制。修正移动平台已携带人物后落地判定再次扣除位移的问题，避免下降速度超过1px/帧时失去支撑。真实3-3左右端回归和48项Mario测试通过；Edge浏览器夹具证实平台下降且人物保持支撑、无脚本错误。同步4184及重新导出连续离线版；未推送。

## 2026-09-19 城堡结尾、旗杆和持续喷火修复

- 运行时为只有旗杆/城堡标记、缺少出口对象的旧地图补充通关触发，覆盖编辑器及离线导出；修复 3-3 假旗杆。
- 库巴喷火计时与近距离移动激活分离，画面外火焰持续前进；避免远处库巴停止喷火。
- 所有城堡结尾沿用行走跟镜、获救角色会面再结算；直接出口也进入行走流程。
- 验证：editor-mario + editor-playable 共 62 项通过，包含 1-4 至 8-4 实际底图结尾回放（非全关人工通关）。Edge 实际试玩 3-4 会面时镜头 2304，Toad 2448 可见，未提前结算，无页面错误；截图位于临时 map-workshop-play-review/castle-3-4-ending.png。
- 已同步 D:/Code/xiaoq-homepage-github-main-r08-review 的 4184 预览；重新生成并验证离线选关，交付 C:/Users/Bright/Downloads/xiaoq-mario-32-levels-20260919.html。未提交、未推送。下一步：用户刷新预览或打开新离线文件验证实际操作。

## 2026-09-19 全旗杆回归及连续踩壳奖励
- 24 处原地图旗杆逐一回放均进入拉旗并通关；最新 3-1 在 Edge 浏览器键盘右移触发 slide，无页面错误。未复现用户旧运行状态的假旗杆，不能断言其原因是缓存。
- 修复同房间另有出口时整批跳过旗杆触发补全的问题，按每个标记匹配出口。加入旧/自制地图回归。
- 连续空中踩踏累积分数至 1UP，落地重置；龟壳连续击敌奖励递增至 1UP；发出 life 音效事件并显示分数/1UP。音效现有映射 oneup.mp3，未替换 BGM。规则参考 https://themushroomkingdom.net/smb_breakdown.shtml 。
- 90 项检查通过。连续奖励使用受控接触回放测试，未声称原版 3-1 楼梯刷命全过程实机完成。
- 已同步 4184 预览及 Downloads/xiaoq-mario-32-levels-20260919.html 离线包；未推送。下一步用户强制刷新后复查原 3-1 编辑工程，如仍异常需对该保存工程复现。

## 2026-09-19 食人花突然回缩
- 原靠近管口逻辑倒退 age，造成下降反向及阶段跳变。改为按当前高度以正常退回速度连续下移，隐藏后暂停；离开继续周期。保留进出管道时植物隐藏保护。
- 67 项测试通过，新增上升/露头/下降/周期边界靠近并离开的逐帧位移回归，每帧不超过 0.8 像素。8-4 返回路径及出管道保护通过。
- 已同步 4184 预览，重新生成并下载验证离线全量版并复制至 Downloads/xiaoq-mario-32-levels-20260919.html。此次位移验证为引擎回放，未进行人工全关试玩；未推送。

## 2026-09-19 弹簧运行逻辑
- Springboard 源几何及自制 spring 材质接入压缩/回弹/弹射；底座固定，玩家跟随压缩顶面。按住跳跃获得高弹，离开弹簧取消绑定；共用引擎覆盖所有地图与离线包。
- 六处实际底图弹簧回放通过；2-1 成功落在高于弹簧顶面 131px 的墙上；8-2 上方真实砖块仍阻挡上升。73 项检查通过，Edge 2-1 试玩捕获高弹速度，无页面异常。并非逐关全程人工通关或逐帧原版参数复刻。
- 4184 预览与 Downloads/xiaoq-mario-32-levels-20260919.html 已同步；未推送。

## 2026-09-19 朱盖木重生
- 击败 Lakitu 后保存房间级重生计时，960 个正常逻辑帧后从镜头右侧返回，已有存活个体时不重复生成；再次投刺球。等待计时在死亡/转场/结算等非正常逻辑阶段冻结。
- 接入 spawn-zone-LakituStop：跨过后取消重生，现存个体停止投掷并飞离。模板 4-1、6-1、8-2 含该标记。
- 69 项检查通过，包含受控接触击败、延迟重生、投掷恢复、停止区取消。节奏参考 TMK 自编地图观察 https://themushroomkingdom.net/maps/smb/6-1 约40游戏秒；当前计时24帧/游戏秒，非逐帧原版验证。
- 已同步 4184 及重新生成、下载验证的 Downloads/xiaoq-mario-32-levels-20260919.html。重生行为为引擎回放验证，未完成人工整关试玩。未推送。

## 2026-09-19 开发者试玩选项
- 保留原地继续与危险地形安全落点逻辑。网页默认启用；单关及32关离线封面增加默认未勾选的“开发者试玩（原地复活）”。选项传入每次重开/下一关，普通模式不显示原地继续且正常自动重生。
- 8 项导出/连续关卡检查通过；Edge 浏览器验证默认/关闭/开启三种模式死亡后等待与继续按钮状态，离线复选框默认关闭且可勾选。已更新4184及Downloads/xiaoq-mario-32-levels-20260919.html；未推送。

## 2026-09-19 旗子触发首帧跳位
- 静态旗子使用 marker.y-142，动画初始化使用出口y（通常marker.y-168），差26px。统一 flagRestY，静态旗子位于杆顶圆球下方，拉旗从相同高度开始。
- 24处旗杆加入静态渲染与触发首帧坐标相等断言，连同引擎共89项通过；Edge 3-1 拉旗预览无页面错误。同步4184与重新生成的Downloads/xiaoq-mario-32-levels-20260919.html，未推送。

## 2026-09-19 4-4 中层死路
- 截图对应 section1 中层：SectionFail 标记未被运行时处理，成功路线展开图的收口墙将错误路线封死，单向镜头使玩家不能回头。
- 接入 pass/fail 标记：命中正确路径锁存本段通过；失败路径返回当前段开头安全地面并重置镜头，保留时间、分数和生命。已越过传感器但仍在失败走廊的测试出生也可恢复。当前是返回段首的可用循环，不声称复刻原版无缝地图滚动。
- 4-4 中层返回与下层通过回放、引擎回归共66项通过；未完成人工全关路线通关。已更新4184与重新下载验证的全量离线包Downloads/xiaoq-mario-32-levels-20260919.html。未推送。

## 2026-09-19 炮台发射
- 源Cannon及手工cannon材质接入房间级发射时钟，屏幕内朝玩家发射Bullet Bill，近距离32px停火，数量上限3，离屏清理；使用已有炮弹碰撞与踩踏逻辑。不是原版逐帧节奏复刻。
- 72项检查通过，新增左右发射/贴身抑制/移动方向测试。Edge实际5-1炮台发射验证通过，无页面错误。已同步4184及重新生成的Downloads/xiaoq-mario-32-levels-20260919.html，未推送。

## 2026-09-19 开发者自动原地复活
- 最新用户要求覆盖此前死亡等待按钮：网页默认及离线勾选开发者模式后，死亡动画105帧结束自动调用安全原地继续；普通模式仍回出生点。开发者死亡不展开全屏详细菜单，不显示继续按钮。最后一条命也可继续测试。
- 73项检查通过；Edge默认/关闭/开启模式逐项验证自动复活位置及按钮隐藏。复用岩浆/深坑安全落点函数。已同步4184及Downloads/xiaoq-mario-32-levels-20260919.html，未推送。

## 2026-09-19 弹簧跑动落地修复
- 用户再次反馈未触发。重现跑速2.5落在16px弹簧上，12帧压缩尚未完成已滑出，取消弹射。旧静止落点测试漏检。
- 压缩期间固定水平接触，弹出时恢复方向输入与入射速度；保留按住跳跃高弹。新增跑速着陆与持续方向输入回归，由失败转通过；含六处真实底图共76项通过。Edge 2-1压缩中持续右键仍高弹验证通过。
- 同步4184及重新生成Downloads/xiaoq-mario-32-levels-20260919.html，未推送。尚未证明所有用户编辑旧地图均无其他弹簧问题。

## 2026-09-19 5-2 顶面静止反馈
- 用户明确站到顶面仍不弹。当前原底图回放与新Edge会话可以弹起，用户既有会话具体原因尚未复现，不可宣布其根因已证实。
- 添加motor之前的静止顶面接触获取，不依赖support id；回升阶段记录跳跃增强输入，压缩期间人物使用站立姿态。参考Nintendo SMB说明书Jumping board说明，不声称逐帧高度参数完全一致。
- 新增5-2地面跳上弹簧的普通/高弹路径，高弹抵达右侧平台；78项通过。Edge5-2上方落下高弹速度-9通过。已同步4184及离线包Downloads/xiaoq-mario-32-levels-20260919.html。下一步应在用户重开5-2后复核其原反馈，未推送。

## 2026-09-19 静止龟壳恢复
- 缩壳后静止计时：480逻辑帧露脚预告，600帧恢复行走；保持脚底坐标与原碰撞高度。滑动清零计时、踩停重新计时；头顶空间不足延迟恢复。原飞行属性不恢复，保留红龟地面属性。当前时长为实现参数，未声称精确原版帧数。
- 71项引擎回归通过，新增真实踩踏后静止、预告、恢复、脚底不漂移验证。已同步4184及重新生成、下载验证的Downloads/xiaoq-mario-32-levels-20260919.html；未进行人工整关等待观察，未推送。

## 2026-09-19 平台关开发者复活
- 用户要求最近陆地或平台，不能只选连接地图底部的地面。扩展安全候选至TreeTop/ShroomTop/Platform及oneway平台，使用当前运行时坐标；仍排除隐藏、断绳坠落平台、管道和越界顶部，保留碰撞/危险区域检查。
- 树顶、蘑菇、单向平台旁坠落自动复活回归通过，落在近平台而非远处开头；旧城堡天花板/熔岩回归仍通过，共74项。未进行人工整关试玩。
- 已同步4184及重新生成Downloads/xiaoq-mario-32-levels-20260919.html；未推送。

## 2026-09-19 炮弹朝向与发射音效
- BulletBill源贴图默认朝右，不同于多数敌人。单独按vx<0翻转，避免飞向左却朝右。发射时新增cannon事件，映射现有bowser_fire.mp3噪声发射音；没有新导入未知音源，未声称已精确匹配原版炮声。
- 76项检查通过，含左右炮台实际发射事件一次、贴身抑制时无炮声、音频文件存在验证。此次未进行人工听感验收。已同步4184及重新生成Downloads/xiaoq-mario-32-levels-20260919.html，未推送。

## 2026-09-19 7-2 水下出口
- 源转录PipeHorizontal缺失transport，造成area-1没有portal。2-2同源问题一起按明确level标识补至area-2 entrance2。新建模板及旧工程projectPack克隆修复，不覆盖已有自定义portal或修改旧文件。
- 2-2/7-2实际底图按右入横管、切换地面、竖管出场回放通过，3命不变；9项路径/导出检查通过。未完成人工整关游泳通关。
- 已同步4184及重新生成Downloads/xiaoq-mario-32-levels-20260919.html，未推送。

## 2026-09-19 7-4 迷宫途中回退
- 多分段迷宫错误传感器原先立即传送，改为记录通过区域、出口统一检查所需分段。第二循环回退标记之前出口已完成，避免重复触发。失败回到组起点安全支撑面，保留屏幕横向锚点；仍为重试传送而非原版无缝动态拼接。
- 真实底图错误传感器、两个出口重试可移动、正确顺序传感器受控回放通过；4-4及水下出口回归通过。正确顺序测试使用受控位置，不代表人工整关通关。
- 已同步4184、生成下载并打开验证离线包，Downloads/xiaoq-mario-32-levels-20260919.html。未推送。


## 2026-09-19 小马里奥吃花
- 修正花拾取无条件power=2：小形态仅变大(power1)，大/火形态吃花为power2。保留growth24和脚底锚点。奖励砖生成条件仍按顶砖时形态选择。
- 三形态受控接触回归，修复前小形态2!=1失败、修复后77项通过。非人工实机拾取验收；未完成独立interaction capture gate，不声称视觉验收。
- 同步4184及重新导出、下载打开离线包，Downloads/xiaoq-mario-32-levels-20260919.html；未推送。


## 2026-09-19 火焰变身停顿
- 新增fireGrowth24：power1吃花才触发，人物尺寸不变，普通/火焰调色交替；复用全局变身暂停入口，结束恢复。小形态保留growth，已火焰不重复停顿，复活清零。
- 77项通过，新增24帧位置/倒计时/不能射击断言。未完成人工视觉复核及独立interaction capture gate，不声称与原版逐帧一致。已同步4184及生成验证离线包，未推送。


## 2026-09-19 多金币砖
- Brick+Coin源数据接入已有multi计数逻辑；Block+Coin仍一次。semantic查找使用sourceId，支持拆分地形。当前沿用固定10枚，不宣称原版计时窗口完全还原。
- 79项回归通过，新增重复碰撞/耗尽和单金币对照。未完成人工视觉复核或interaction capture gate。同步4184及重新导出离线包，未推送。


## 2026-09-20 寒蝉点阵字体与Q尺寸
- Q恢复16px，署名用真实ChillBitmap7x v2.500 WOFF2，通关/结束/过关等待及积分浮字和制作页使用ChillBitmap。chill-font.mjs内嵌原始字体，CHILL_FONT_LICENSE.txt保留发布包原许可与来源，离线许可面板收录。
- Edge加载字体check通过，chill-hud.png已目视检查；5项离线/交互检查通过；导出下载打开验证通过。4184已同步，最新离线Downloads/xiaoq-mario-32-levels-20260920.html。未推送。

## 2026-09-20 推送前检查
- 排除魂斗罗试验模块、入口、攻击及声音路由；本地备份保留。
- collab:build、check、doctor 通过。完整测试发现缺少 visualRooms 时炮台扫描读取空地图；已改为使用运行地图，原失败用例 3/3 通过。合并远端 main 后再跑完整检查。
- 4-4 编译产物已同步，不再仅修改 template。字体许可原文中的尾随空格保留。

合并 origin/main 后：collab:build、完整 check、npm test（1098 项通过）、doctor 通过。魂斗罗 module / playHero / bill_theme 的暂存区扫描为空。仅保留第三方字体许可原文尾随空格；未声称整关人工验收或线上激活完成。

## 2026-09-20 文档与工具入口补齐
工具页直接打开、首页客户端导航至工具页均通过 Edge 验证，无 pageerror。截图为当前编辑器真实 1-1 副本。独立发布包工具入口 -> 创建 1-1 -> 试玩通过，无本地 404 或脚本异常。地图源码 ZIP 与当前源码重新校验，保留原 M06 运行器。release:test 106/106 通过；发布包审计零错误。历史交接状态已加当前状态索引，不抹去当时记录。

最终完整 npm test：1098 项通过；npm run check 通过。工具页 390px 无横向溢出，桌面英文切换可见 Mario Map Workshop。最终 release:prepare / release:check 零错误。源码发布与网站线上部署状态分开记录。
