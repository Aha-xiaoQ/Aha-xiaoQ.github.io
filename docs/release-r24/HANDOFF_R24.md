# R24 交接记录

## 基线与范围

正确基线为 R23 + M07/0.4.3 + WorldKit W02/0.2.0，不是旧 K01/K02 分支。当前远端 main 读取到 ed76f0b668a9e7c1a8d8f71bed2489cb2b063c9e；它不是本地 R23 完整发布证据。

本包只有网站公开构建和发布检查，保留游戏、地图、源码下载与原有源数据。三处既有源码增加 publicMode 分支，其余功能独立放在 scripts/publication 与 assets/release。默认 journal/site 构建仍可用于维护，不把作者的交接、任务、负责人记录删除。

## 文件职责

|位置|职责|
|---|---|
|assets/release/public-content.mjs|公开项目/任务/简介的纯投影；精简过程语言，修复旧版本表述|
|assets/journal/model.mjs、render.mjs|publicMode 隐去管理入口/路由，默认模式保持旧行为|
|scripts/journal/build.mjs|公开规划不生成管理页|
|config/publication.json|主域名、必须入口、版本、公开额外文件|
|scripts/publication/build.mjs|规划、引用闭包、统一缓存、源/产物身份、分离目录与原子替换|
|audit/archives/identity/syntax.mjs|资源与文案、ZIP实际内容、源码下载一致、JS纯语法检查|
|runtime.mjs|公开构建中移除旧管理懒加载与管理渲染分支，不改源文件|
|paths.mjs|路径大小写、符号链接/硬链接与工程文件规则|
|gate.mjs、serve.mjs|真实证据登记、固定发布目录HTTP预览|
|tests/publication/audit.test.mjs|69个发布与投影测试|

## 修正记录

公开页末的“交接与管理”和旧管理加载不再发布；地图册不再链接工程 START_HERE/MAP_CONTRACT；现有源码页准确区分0.4.3候选、发布试玩和W02固定M06；旧0.4.1验收任务标题、1-4待转录说明已在公开投影修正。作者任务源、状态和历史证据原封不动，不能据此把原作核验标为完成。主页“最近作品”来自实际公开可试玩记录，而不是人为将开发候选标成正式发布。

下载与源码逐字节核对：M07工作区498文件，W02工作区722文件，合计1220。W02归档固定M06运行时另核对已有聚合身份。不是1220项独立测试。

## 当前限制与禁止误判

完整外层站点未取得。实际工程规划只覆盖当前可读取文件；旧外围夹具含 test-game、example.invalid、缺品牌资源。审计阻断并不给出上线目录是正确结果，不应为了“全绿”把它们替换成空媒体或取消检查。

离线浏览器 set_content 用真实组件/数据/SVG，显式替换URL、history和fetch，仅验证组件行为；普通本地HTTP浏览器访问仍被环境策略阻断，未绕过。Node真实HTTP验证是单独的协议测试。M07完整196项验证未在调用时限结束，不报告全组本轮通过；本轮有成功构建、原始底稿重建单项以及独立HTML完全一致。

后续只需对真实完整仓库执行本包检查、补齐真实缺失资源并验收，不继续增加装饰或更换框架。只发布 .local/publish。不要把局部预览输出当最终站点，也不要直接把更新payload覆盖全站。
