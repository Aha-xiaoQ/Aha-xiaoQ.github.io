# 访问体验的职责边界

- `assets/launch/journey.js`：纯标记组件，静态构建与原站shell共用。游戏介绍先试玩，再视频/下载；无网络/监听器。
- `assets/launch/runtime.mjs`：图片失败与主动复制链接，幂等挂载。延迟剪贴板结果检查原控件和地址，不能污染新页面。不收集数据，不拦截导航。
- `assets/launch/journey.css`：只限定新增组件，继承共享主题；850px以下优先显示开始面板。
- `scripts/launch/build.mjs`：通过现有nativePage生成帮助/404，迁移已识别游戏介绍，保留后续说明；生成`content/game-support.js`，使动态访问也保留当前说明。未知页面结构直接要求合并。
- `scripts/launch/check.mjs`：结构检查、登记页面直接本地引用审计、证据完整性门槛。不是全依赖图扫描，不执行发布。

资源通过原`wireExperience`统一安装；DOMContentLoaded/原生站内重绘都挂载同一控件。原主站路由仅新增visitorHelp与notFound路由；原动画文本保持字节。帮助纳入现有搜索索引，不索引404。

`content/game-support.js`是可信站点源构建的HTML快照，不是支持不可信第三方代码的插件接口。修改已生成介绍页会触发构建保护，应通过PR更新源与登记，不关闭冲突保护。

实际游戏play.html及源码下载不重建；本轮游戏内容哈希保护与网站功能测试分开记录。
