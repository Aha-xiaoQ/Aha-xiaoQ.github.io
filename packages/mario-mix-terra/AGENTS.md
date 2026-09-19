# 协作工程入口

当前游戏版本：0.4.1 / M05。当前资料：R15。依次读取 START_HERE.md、docs/CHANGELOG_R15.md、docs/KNOWN_LIMITS.md、release.json 和 docs/TASKS.json；历史交接保留，不将历史限制误当作新验证结果。

本轮只维护第三期来源。src/content/assets 与游戏UI在R15保持不变；前两期、城堡、稳定试玩、主站主题和图标不覆盖。

工程任务是可编辑来源；网页任务是生成快照。更新任务时保持真实 owner/issue/PR 和原状态；local-verified 只表示本地验证，不能推断设备或自然通关通过。

修改源后运行verify/prepublish，打包后从真实ZIP解压再验；资源授权和人工发布审批分别核查。safe-path拒绝悬空链接，不用existsSync批准路径遍历。字体、密钥、.env不得进入交付。

当前公开文案面向访问者；署名、工具用途和许可说明保持事实。历史指南位于docs/history/r15-before/。源包名以release.json为准。
