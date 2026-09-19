# R11 网站接入交接

基线：已交付R10/M02；新工程M03。发布者自行修改核心文件时必须合并，不能绕过指纹检查。独立源码ZIP为可复建快照，M02下载保持不变。

更新范围：packages/mario-mix-terra 的已核对差异、新M03源码下载与元数据、源码指南替换、新增terra-chapters指南、根命令/README/AGENTS/审核规则。主站CSS/router、旧任务状态、已发布游戏不改。

新路径：/notes/mario-mix/docs/terra-chapters/；源码页仍/notes/mario-mix/docs/terra-source/。同一通用模板，无新一级导航。

M03明确只提供terra-surface-v1，不把示例当正式1-4。先读游戏docs/sdk/CAPABILITIES.md。未来任务源为工程docs/TASKS.json；旧库存/原场景清理任务未关闭。没有自动创建Issue/PR、没有推送。

安装前指纹、生成页保护、包manifest、源ZIP快照匹配、悬空链接和CRLF处理沿用并测试。记录路径 docs/terra-m03/R11_INSTALLATION.json 保存前后SHA；备份旁置。CRC/SHA仅完整性和冲突检查，不是签名、安全沙箱或权限认证。

首次实际贡献者仍需在自己电脑按ADD_LEVEL完成关卡PR。模拟独立作者新增目录实验不能写成已经有网友协作完成。
