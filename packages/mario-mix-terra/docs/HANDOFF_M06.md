# M06 / 0.4.2 · 当前交接

唯一原始底稿仍为第三期发行包（baseline.json）。M06在R15/M05源码继续，只修界面引导和生命周期。

阅读顺序：START_HERE → CHANGELOG_M06 → generated/MODULES → TEST_REPORT_M06 → ACCEPTANCE_M06。

新增29模块中的quick-guide与adventure-help；6个桥接、33兼容片段、41处已登记旧函数包装没有增加。原模拟、地图和媒体字节保留。手册是可选说明，不是完整交互教程。平台关卡驱动仍为实验，不支持真实泰拉角色全能力任意跨图。

关键修复：持久偏好状态；BFCache条件pagehide；输入优先级；有名设置dialog；候选第三期说明链接；过期生成文件保护清理。三种存储键（游戏、改键、引导）不互相覆盖。

公开任务维护docs/TASKS.json；M06项local-verified只投影为待验收。源码ZIP由npm run pack生成，必须与网站currentRelease的版本、文件和SHA一致。

后续优先：实机验证、真实外部小PR、完整角色跨两张数据地图。暂不扩大内容。RELEASE_REVIEW保持未批准；主仓库、线上稳定试玩、网站主题图标和关卡不自动改动。
