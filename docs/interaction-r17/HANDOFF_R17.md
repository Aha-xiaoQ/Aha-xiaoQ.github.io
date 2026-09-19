# R17 交接

范围：R16网站界面细节。游戏仍0.4.2/M06，最后游戏交接仍读packages/mario-mix-terra对应记录。此次没有新游戏版本。

关键源码：assets/ui/site-actions.js与.css；assets/workshop-cards.js；assets/journal/render.mjs/runtime.mjs；scripts/ui-polish/native-html.mjs/check.mjs。static与dynamic共用契约；主站路由源码保持不变，HTML里的路由脚本查询号更新以继承新的加载链。

应用器保留维护者实际promo.js，只精确删除已知箭头标签；不把测试夹具的首页替换进网站。核心卡片/生成器有手改时先合并；静态页面同步生成，记录安装前后哈希。

资料页仍3个入口；小手柄/浏览器保持96×72；游戏依旧单条列表。文件/状态/源码下载不变，未填写发布批准。下一轮不要恢复红色箭头按钮或增加新的装饰性图标来填空白。

在完整仓库上验收真实路由、品牌资源、语言和下载；模型环境的离线浏览器结果不等于线上发布。测试报告是实际执行范围的唯一依据。已知限制必须保留，历史源码与原始测试记录不改写。
