# Mario Mix · Terraria M01

面向贡献者的第三期开发工程。保留现有玩法与绘制；先建立可独立修改、测试与构建的边界，不迁移到新的游戏引擎。

## 当前已经实现

八个独立 ES 模块：克苏鲁之眼基础行为工厂、平台建造工厂、1-3 地图解码、早期逻辑输入适配、径向摇杆死区、动作默认配置、按键名称和固定时钟。全部通过显式桥接接入候选游戏。

资源源文件按二进制分别存放：195 条内嵌图片/音效记录、46 条基础音频；生成时回填为旧加载器需要的数据 URI。这一阶段优化的是源码管理，不声称包体或网络性能已经下降。

33 个兼容片段保留未迁出的共享状态、补丁链、历史关卡依赖、战斗装配与 UI。它们只允许按 build.config.json 的顺序拼装。不能单独 script src 加载，不能当作完全解耦模块。

## 命令

|命令|作用|
|---|---|
|npm run build|构建模块网页、单 HTML 候选和重建参考|
|npm run check|源码语法、资源完整性和导出契约|
|npm test|纯逻辑、原行为对照、构建、安全、HTTP 与打包测试|
|npm run verify:baseline|检查重建参考与原始上传 SHA-256 一致|
|npm run dev|4193 端口候选，仅监听 127.0.0.1|
|npm run reference|4194 端口对照，参考哈希不一致时拒绝启动|
|npm run pack|生成 .local/MarioMix_Terraria_M01_Source.zip|
|npm run test:browser|已有 Python Playwright/Chromium 时运行离线完整脚本对照|

## 集成到作品网站

网站更新包把工程放到 `packages/mario-mix-terra/`，源码下载放到 `downloads/source/`，页面复用现有多项目开发框架，位于 `/notes/mario-mix/docs/terra-source/`。

本工程单独解压也能运行，不依赖网站 R08 的 JavaScript。网页上的资料与下载不代表已授权复用所有游戏素材。

## 基线与产物

原 ZIP SHA-256：`4b438b814dacac58ea5b9ac547ae8bf44022d1a3e1613a859e730b681142f2d9`。
原 HTML SHA-256：`e134fdee21a6dce43585cda93c582ca2c0bf45f325f14cde81e33b80b758f19c`。
构建报告写入 dist/build-report.json；不要把生成的参考与网页在线版未经比较就称为同一字节文件。

测试日志和限制见 docs/TEST_REPORT.md。本地通过、用户验收、GitHub CI、已部署分别记录。
