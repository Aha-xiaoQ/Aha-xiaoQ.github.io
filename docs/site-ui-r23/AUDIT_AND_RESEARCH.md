# 网站界面审阅与设计取舍 · R23

## 输入与范围

2026-09-19。基于已交付 R22 网站组件和数据，以及 W02。GitHub 接口返回 main 仍为 ed76f0b668a9e7c1a8d8f71bed2489cb2b063c9e，不把线上旧文件冒充已安装的 R22。

完整网站媒体未取回。测试站点由实际 R19–R22 生成器/项目数据和明确标识的外围文本夹具组成，游戏 M07 与地图 W02 是实际文件。首页真实 promo.js、site-data.js 和语言 CSS 的公开片段用于核对接入形状，不替换最新本地内容。截图缺少完整品牌图片，不能代表整站上线效果。

## 发现及落地

|问题|位置|修正|
|---|---|---|
|小屏主导航和语言/搜索占多行，压缩首屏|共享 header / topbar|原六项导航由普通 disclosure 控制，不变成模态弹窗或 menubar。|
|项目搜索只靠 placeholder，筛选结果变化不明确|journal/render 与 runtime|可见标签、独立 live 状态、清除入口；结果与翻页用同一个纯过滤函数。|
|拼音组字会触发中间结果/定时搜索|项目、任务、全站搜索事件|composition 期间不提交；compositionstart 取消旧全站 debounce。|
|资料面包屑只显示笼统“资料”|renderBreadcrumb|保留父级“资料”链接，末项显示真实文章名称。|
|模板 wide-reading 意图被旧 .journal .j-reading 限宽覆盖|CSS specificity|针对包含 q-atlas 的阅读容器完整宽度；普通正文仍46rem，不把全部文章拉长。|
|内页标题、正文、按钮在窄屏层级分散|共享样式|统一标题clamp、行距、控制高度和深浅卡片焦点，缩短内页头部。|
|开发首页重复介绍挤占作品位置|index section|从重复的“正在打磨的作品”改为“项目进展”，删除冗余二次引言。|
|header MutationObserver 对所有内容变化都重新扫描|experience/runtime|只响应页眉/语言控件插入与页眉子树变化；幂等 mount，移除的页眉清理监听器。|
|静态升级后旧路由仍懒加载 experience-r18，可能产生两套监听器|site-router.js|只改一处动态 import URL，使静态与懒加载同为 site-r23；不改路由执行逻辑。|

## 三层参考研究

### 作品展示与视觉层级

Brittany Chiang 的个人作品页：先给作品用途和可识别入口，技术内容跟在后面。借鉴作品优先和有节制的信息层级，不复制其配色、字体或布局。
https://brittanychiang.com/

Linear 的产品网站：分块介绍功能和用例，主要入口与补充信息区分。借鉴层级与分段阅读，不把营销站的动画、满屏渐变或看板概念套进本站。
https://linear.app/

Carbon Typography：阅读密集区域与表达性标题有不同字体尺度和用途。本站保留现有字体，只集中控制标题、正文和操作文字；无需为了“高级”改用另一套字体。
https://carbondesignsystem.com/elements/typography/type-sets/
https://carbondesignsystem.com/elements/typography/style-strategies/

### 交互与语义

W3C APG Disclosure Navigation：普通站点导航仍用原生链接；展开按钮表示控制关系和展开状态；不滥用 menu/menubar；Escape、焦点离开与无脚本回退要可预测。规范示例不是直接生产认证，仍需设备和辅助技术测试。本包是独立实现，不直接复制规范的完整代码。
https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/
https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/

### 页面稳定与工程

web.dev CLS 与响应式图片：资源尺寸、字体交换及非预期位移要在真实条件下测量。此轮不贸然改品牌字体、图像和路由动画；不报告没有测量的性能提升。
https://web.dev/articles/optimize-cls
https://web.dev/learn/design/responsive-images

## 本轮没有做的事

没有新加一级栏目、轮播、滚动劫持、自动播放、统计服务、后端或第三方依赖。没有改已发布试玩、M07 UI、W02 runtime、角色或关卡。没有制作新品牌图。首页构图、卡片数量、六项导航名称保持原定义；搜索是工具入口，不算新栏目。

## 仍需观察的体验

完整首页带Logo/头像/场景图时的小屏空间；不同页眉插入顺序；软跳转后焦点和菜单状态；中英文长标题；真实字体加载和照片裁剪；404网络状态；触屏和读屏。后续改动以实际访客卡点为依据，不继续无目标地增加装饰。
