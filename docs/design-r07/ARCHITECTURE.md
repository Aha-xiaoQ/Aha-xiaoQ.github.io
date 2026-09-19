# R07 实现结构

`SITE_DATA` 是事实内容，`SITE_PRESENTATION` 是已构建的表现登记。`SITE_MEDIA` 是无 DOM 的验证与素材 HTML 函数，`SITE_WORKSHOP` 是无 DOM 的卡片及集合渲染器。`workshop-media-runtime.js` 只处理图片成功/失败状态；一个 MutationObserver 处理路由带来的新增节点，不建立路由。

浏览器：公共脚本在 site-shell.js 之前加载，site-shell 仅委托三类集合的 main 渲染并绑定已有筛选。静态构建：Node VM 运行同样的纯脚本与本地内容源，不提供 require/process/network，再把相同 main 写入既有外层模板。此 VM 是数据构建方式，不声称能安全执行敌对程序；外部 PR 仍在低权限环境审核。

原生 router 不改动。开发页构建器仅复用 wireHTML 安装公共依赖。构建记录分开：docs/development/generated-pages.json 管开发页；docs/design-r07/generated-pages.json 管三类集合和 presentation.js。初次安装保存备份，之后构建只覆盖当前仍匹配已登记哈希的文件。

新项目无需在组件中增加名称判断。登记稳定 ID 的素材，或使用通用缺省：有封面→完整海报；工具截图→界面画框；无封面→工程线稿。图像不存在时仍保留文字和真实入口。不按列表序号选择角色背景或卡片类型。

静态 HTML 保持可读，禁用脚本时筛选按钮隐藏。脚本恢复后使用同一结构，无需先显示旧版列表再替换。
