# 接手本工程

先读 START_HERE.md、docs/HANDOFF_M01.md、docs/ARCHITECTURE.md、docs/TEST_REPORT.md、baseline.json、docs/TASKS.json。

只以本次第三期上传底稿为基础，不引入 R29/奥日城堡、不改前两期独立发布文件、不自动修改线上试玩。复用现有固定循环和手感，结构迁移与功能修改分开。

M01 是八个独立模块加三十三个共享闭包兼容片段，不是整个游戏完成了模块化。不能用目录数量计算“完成率”。新代码优先进入独立模块，禁止继续扩大函数覆盖链。

源码变更后运行 check/test/build。引用测试报告时区分 Node 单元、离线完整游戏脚本对照、真实 HTTP、实际浏览器地址访问、设备和远端部署。没有执行过的项目不写通过。

文件安全使用 scripts/lib/safe-path.mjs。不要使用 existsSync 授权路径遍历；悬空链接也要拒绝。未知本地改动要保留。

产物由用户审阅后手动推送。每轮交付更新 HANDOFF、CHANGELOG、任务与验证记录，并确认下载包中的内容与运行源码一致。
