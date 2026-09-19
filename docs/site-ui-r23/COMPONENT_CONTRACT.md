# 组件职责与接入约定

## 文件归属

- assets/ui/site-refinement.css：共享尺度、阅读、地图宽版、小屏导航外观。不声明 @font-face，不改变主题色定义。
- assets/ui/site-refinement.mjs：只管理既有导航的展开状态、焦点、断点和监听器清理，不拦截页面路由、不联网、不写存储。
- assets/experience/runtime.mjs：沿用唯一体验层入口，统一调用新组件；MutationObserver 仅用于页眉插入与语言变化。
- assets/journal/render.mjs：纯项目选择函数、标签、计数区、当前文档面包屑；静态和动态渲染共用。
- assets/journal/runtime.mjs：输入法、清除、分页和结果状态；不改项目进度源。
- scripts/experience/wire.mjs：静态资源版本。site-router.js 内唯一懒加载URL必须与它一致。

## 导航

作用范围为 #app 内已有 .site-header .bar 或 .topbar 的直接 nav，必须包含 a[data-nav-key]。使用既有 .q-header-tools；不凭空增加导航项目。720px及以下开启 disclosure，桌面原导航常显。无 JavaScript 时原链接常显。没有 aria role=menu，没有背景 inert，没有锁滚动。

普通链接仍由原生浏览器与原路由处理；Ctrl/Command、下载和新标签行为不重新实现。切到桌面时从被隐藏按钮移出焦点。移除页眉或显式卸载时，释放 document/media 监听器并恢复原 nav 属性。

## 搜索与内容

selectProjects 统一 q/category/page 的结果，6项一页沿用旧规则。结果状态是独立 polite live 区；不让整个卡片网格每次重读。清除后回到稳定输入框，避免焦点留在隐藏按钮。只有确认后的输入法内容进入过滤。

当前增加的菜单控件有中英文；未全面改写历史词典。文案使用“显示 N 个项目”“清除筛选”等访问者语言，不加入维护者聊天过程。

## 页面宽度

普通文章46rem，地图图册可用整列宽度。代码和长图在自身区域滚动；不使用隐藏 overflow 截掉整页来掩盖布局问题。主站色彩/美术仍由既有主题控制。控件44px是本轮设计目标，不宣称整站所有控件通过WCAG。

## 维护检查

运行 npm run site:ui:check、npm run test:site-ui；修改渲染源后运行 journal:build、site:build。检查实际静态与动态页面使用同一模块URL；不要重新追加全局点击代理或一套页眉渲染器。
