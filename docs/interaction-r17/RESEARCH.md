# R17 研究与取舍

核对日期：2026-09-17。目的是在已有个人站视觉内改进细节，不克隆他人页面，不新增依赖。下列资料只借鉴组织原则，未复制其主题或源代码。

## 第一轮：链接含义与视觉负担

Carbon Link Usage（https://carbondesignsystem.com/components/link/usage/）明确区分导航和改变状态，强调有意义的链接名与谨慎使用过多链接。采用：真实a、具体目标、删去重复标题/CTA；不采用：为所有内部链接配右箭头，因为本项目已明确要求减少这一装饰。

USWDS Link（https://designsystem.digital.gov/components/link/）讨论外部链接提示与使用者对提示的理解。采用：用GitHub/Bilibili及新标签提示说明目标；不强迫所有外链新开，也不移植政府站专用政策。

## 第二轮：卡片层级与个性

Carbon Tile Usage（https://carbondesignsystem.com/components/tile/usage/）区分可点击单目标卡片和包含多个操作的内容卡片。采用：资料单锚点，游戏多操作分开；不照搬其全部视觉规定，保留本网站红色错位底板和原图标。

Anthony Fu Projects（https://antfu.me/projects）与 Brittany Chiang（https://brittanychiang.com/）作为个人作品信息层次参考，查看了项目名称、说明和资源入口的组织；未复制图像/文字/主题，也未将网页文本读取说成测量了其动效或转化率。本站保留自己的六项导航、像素/红黑语言，不改造成它们的极简主题。

## 第三轮：交互验收而非只看截图

MDN anchor（https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a）：保留href、download与target语义，避免点击代理。

W3C target size minimum（https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html）：AA基本阈值24CSSpx及其例外；enhanced（https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html）44CSSpx是增强要求。本站对独立主要操作选择44，不把正文内联链接强行撑成按钮。

W3C focus appearance（https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html）与 animation from interactions（https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html）：核对键盘焦点和减少动效。新增控件保留可见状态，不以hover为唯一入口线索；未声称全面符合或认证。

GOV.UK UI writing（https://www.gov.uk/service-manual/design/writing-for-user-interfaces）：具体动作与可理解的名称，不使用大段“已为你完成”式说明。

## 不采用

不把箭头换成满屏另一种图标；不把每个文本链接做成大按钮；不让单卡片同时有整卡跳转和多个子按钮；不增加自动移动、鼠标追随和自定义光标；不删去实验/待验收等真实限制。宣传效果需要实际访问数据和可用性反馈，当前没有量化结论。
