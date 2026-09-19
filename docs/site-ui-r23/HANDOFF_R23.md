# R23 交接

## 当前状态

网站UI更新包；不修改游戏、地图和项目数据。输入为R22/M07 + W02。主要源码见 COMPONENT_CONTRACT。

## 继续工作

先查看安装记录 docs/site-ui-r23/INSTALLATION.json，确认包已应用，再读 TEST_REPORT 的边界。检查完整品牌资源和真实设备，记录实际问题后小范围修复；不要把历史外层测试夹具当成完整仓库。

源码修改在 assets/ui/site-refinement.*、assets/journal/ 和 assets/experience/。不要手改生成的 notes HTML；不要另加点击代理；资源版本升级时同时检查 scripts/experience/wire.mjs 与 site-router.js 的懒加载URL。

游戏仍 M07/0.4.3，WorldKit W02 内固定 M06 仍保持。不要在网站修饰任务中偷偷迁移游戏版本或改变地图认领信息。历史 R20/K01、R21/K02 不与当前 W01/W02 包混装。

## 交付复验

独立解压更新包，核对manifest，再在副本 --check / --apply。运行本包tests/update.test.mjs需设置R22_SITE到完整已安装R22的网站测试副本，测试仅克隆，不直接修改输入。原网站测试和新的29项组件测试分组记录。完整根npm test还包含旧游戏等测试，不以子集通过声称全套通过。

当前包的截图、日志和最终哈希分别提供。没有自动Git操作、远端CI、Pages部署或发布批准。
