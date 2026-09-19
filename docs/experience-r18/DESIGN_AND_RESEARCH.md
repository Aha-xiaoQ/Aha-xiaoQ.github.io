# 设计取舍与研究记录

日期：2026-09-18。目的不是重做视觉，而是减少“找不到、返回丢位置、资料太长、失败只能刷新”的摩擦。

## 1. 查找

参考 [USWDS Search](https://designsystem.digital.gov/components/search/) 与 [Scottish Government Site search](https://designsystem.gov.scot/components/site-search)：标签、提交按钮、保留原查询、从结果回到其他内容入口。

采用：独立搜索页、明确的输入标签、真实 GET 表单、类型筛选、八项分页、失败后重试、空结果后清除筛选。没有复制组件源码。没有强制采用弹窗式命令面板，因为原站六项导航与小图标已经确定；“搜索”作为页眉辅助操作，而不是新增主栏目。没有给小型静态索引引入后台服务。

搜索只在进入搜索页时读取索引；新搜索模块不向第三方发送查询，也不存储单独的本地搜索历史。查询仍存在 URL、浏览器历史、分享链接中，托管日志或原站已有统计可能看到该 URL。本轮不改变原有统计脚本，因此不能宣称全站没有搜索记录。

## 2. 阅读

参考 [Starlight Authoring Content](https://starlight.astro.build/guides/authoring-content/) 的标题层级、目录与锚点模式：长文目录来自相同章节数据，保持一个 h1，内容从 h2 起步。

采用：三节及以上的项目资料生成可折叠目录；目录默认收起，正文和主要下载先保持可见；锚点可定位及获得键盘焦点。按章节顺序生成 ID，重排章节后旧锚点的语义可能变化，应重新核对分享链接。没有迁移至 Astro、复制主题、新增侧栏或无限滚动。

## 3. 导航与恢复

参考 [MDN History.scrollRestoration](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration) 以及 [web.dev bfcache](https://web.dev/articles/bfcache)。

采用：原 site-router 仍是唯一导航所有者，原有转场样式字符串原样保留。history.state 中的 qView 保存本页滚动和内容焦点描述；URL 管理查询状态。新请求优先，不提交迟到的旧请求。只在真正返回同一历史条目时恢复，不把每次新访问都跳到上次位置。章节锚点优先于保存滚动。下载、外链、新标签与修改键点击保持浏览器原行为。

页面缓存恢复使用 pageshow；没有 unload 监听器。新模块不缓存游戏状态。pagehide/历史测试不代表完整浏览器 BFCache 已验收。

## 4. 故障提示

参考 [GOV.UK Writing for user interfaces](https://www.gov.uk/service-manual/design/writing-for-user-interfaces)：用具体操作帮助恢复，不展示内部实现辩解。采用“搜索暂时不可用”“重试搜索”“直接打开页面”。不自动清空旧文章、不循环刷新、不在公开错误中输出本地文件路径。

## 5. 约束

红、黑、米白与原字体来源不变；游戏列表保持一条一款，小手柄/小浏览器不变。新控件常用高度不小于44px，原生键盘焦点保留；不把这些局部断言等同 WCAG 认证。没有性能评分、转化率或访客喜好测量结果。
