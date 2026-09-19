# 协作工程入口（M04）

依次读 START_HERE.md、docs/HANDOFF_M04.md、docs/KNOWN_LIMITS.md、release.json。

只处理第三期用户上传底稿。前两期独立发布、城堡关、主站风格、任务历史不覆盖。当前冻结发布范围，新增机制另开任务。

src为可编辑源码，dist/.local为生成物；新增独立模块须登记architecture/modules.json并补测试。物品定义的两个后期旧扩展不能丢弃。桥接保留原提交/音效/持久化顺序。

所有文件路径检查用scripts/lib/safe-path.mjs，不用existsSync批准遍历。禁止字体文件或.env进入交付。人造测试环境不得宣传为自然通关；核对最终ZIP而不是只测工作目录。

网页主资料只能突出一个当前协作源码版本，历史文档与下载保留在历史入口。来源许可不扩大，发布证据不能伪造。
