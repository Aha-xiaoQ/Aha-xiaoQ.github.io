# R14 网站接入 / M05 UI 精修交接

基线R13/M04。当前游戏0.4.1 / M05仍待人工验收。本轮只变更packages/mario-mix-terra中的UI、构建/测试和版本文档，并增加新的完整源码下载；数据页通过现有R13生成器渲染。主站CSS、图标、外壳/路由及已发布games/downloads不改。

修改后先读源码START_HERE.md、docs/HANDOFF_M05.md与UI_CONTRACT.md。核心显示规范/参考与实际测试均在源码中。主站继续保留3个重点资料入口，当前源码指向M05，M04及以前保持历史下载。不要把未改过的底稿/旧关卡/城堡加入此次发布。

安装器使用R13已核对的生成器副本，未知生成器版本会停止；源码快照有改动必须显式合并并重新pack，不把网站下载ZIP与实际代码分开维护。根目录新增terra:test:ui、terra:test:ui-browser；后者需要已有Python Playwright及Chromium，不会自动下载安装。

日志和备份：本目录R14_INSTALLATION.json记录写入前后哈希；history/project-before-r14.json保存目标仓库实际原项目配置。外层包的tests/fixtures只为安装器回归，不是线上网站备份；游戏源码、内嵌资源和M05ZIP为真实数据。

下一步只做发布前实机和视觉验收，暂不扩充架构。审批仍为空，不执行远端发布。历史README/AGENTS原文保留，新阅读入口置顶，避免新旧文档混用。
