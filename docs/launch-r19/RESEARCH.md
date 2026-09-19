# 三轮对照研究与落地取舍

记录：2026-09-18。阅读的是作者或标准机构的一手页面。没有复制对方源码、美术或文案。以下链接是设计依据，不证明本网站已经达标。

## 1. 信息与个人风格

- Brittany Chiang，https://brittanychiang.com/ 。项目呈现先说明用途与结果，再给作品入口与细节。采用“一个场景一个明确主动作”；不复制其配色或版式。
- Anthony Fu，https://antfu.me/ 。个人身份、项目与阅读内容有清楚分区。保留小Q已有身份和美术；首次访客与开发者分别有简单路径，而不是一页堆满版本号。

## 2. 交互与可达性

- W3C APG Modal Dialog，https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ 。关注命名、焦点、键盘与恢复。R19不添加无必要模态窗；已有游戏弹窗仍由M06负责。
- WCAG 2.2，https://www.w3.org/TR/WCAG22/ 。最低目标尺寸与焦点可见性是底线；本轮主要可操作控件设计为至少44 CSS像素，使用真实链接与原生details/form。局部测试不等于WCAG认证。
- Game Accessibility Guidelines，https://gameaccessibilityguidelines.com/include-interactive-tutorials/ 。首次使用应有行动中的引导。M06速查是帮助，不假装已经实现练习关。下一阶段观察真实玩家再决定提示出现时机。

## 3. 可靠性与性能

- Google Web Vitals，https://web.dev/articles/vitals 。建议以第75百分位并区分移动/桌面评估LCP≤2.5s、INP≤200ms、CLS≤0.1。实验室测量不替代现场数据。
- 本轮图片占位避免布局跳动、不给不存在的媒体编造预览；失效链接和剪贴板失败有下一步。没有真实网络性能结果，因此没有Lighthouse成绩、转化率或提升比例。

## 实施边界

主站主题、六项导航、R12小图标、单条游戏列表和原转场样式保留。R18对原路由的滚动/焦点恢复继续保留，R19只登记帮助和404地址；不添加第二路由。保留法律声明和来源；视觉修改不改变许可范围。
