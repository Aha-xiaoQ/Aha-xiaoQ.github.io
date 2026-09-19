# R06 改动清单

替换：共享 `assets/site-shell.js` 的项目、游戏、工具条目渲染；journal 的 render/runtime/CSS；journal 页面生成器；一个旧整合测试中的栏目名称断言。

新增：`assets/workshop-components.css`、`tests/workshop-r06.test.mjs`、本目录完整文档。

有限变换：`assets/site-router.js` 仅调整导航名，保留动画定义；首页 promo.js 仅改 notes 导航与快捷入口文字；词典仅增加“开发 → Dev”。外层 HTML 加入组件样式、刷新受影响脚本的缓存标记。开发页按原登记与状态重生成，记录生成哈希。

追加：根 package.json 的 `test:r06` 和原 test 链；README 与 AGENTS 的续接入口。安装回执包含每个修改文件的前后校验值。

保护：任务 JSON、共享项目配置、生成状态脚本、历史交接、游戏运行文件、素材、下载包、字体、主站四份共享 CSS、R05 工程源码及其命令。

本包应用于已知 R04/R05，不接受未知核心源码。发现手动修改生成页或核心冲突时停止；不能倒退游戏或删除 .git 来通过检测。
