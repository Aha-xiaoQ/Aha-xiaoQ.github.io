# E04-S01 验证边界

固定输入：仓库提交 `021c831c7d437b0a4a39b2ca67df0c5982866b10` 的 R43 发布 HTML；Git blob `09de29abf704be4c28cd867a4a46f18a826fc87e`。

本次提取后重新编译为 **17,558,386 字节**，SHA-256 为 `01b43a24e102acae3401e625f37d66b327535c1e9e49403c2b76226f531007e2`，与输入逐字节一致。

运行 `npm run verify` 可以复查全部素材摘要、38 个文本源、26 个编译片段、2 个可执行 script 与3个JSON脚本，以及固定基线。`npm run pack` 的 ZIP 使用固定条目顺序与时间戳。

验证环境为 Linux / Node.js 22。真实 Windows 双击、GitHub 登录授权、真实推送、多设备手柄和完整自然通关不属于字节等价检查的证明范围。本次不声明已完成这些验收；具体执行结果见交付包的 VALIDATION.md。
