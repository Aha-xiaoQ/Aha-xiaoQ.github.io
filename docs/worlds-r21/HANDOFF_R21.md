# R21 交接

接续最近的 R20 / W01（packages/mario-mix-worlds），不要与旧 K01 分支混装。新增 W02/0.2.0，全 32 关参考模板，现有 M06 继续 0.4.2。

当前目录与状态源：packages/mario-mix-worlds/content/catalog.json。底图 reference/，个人方案 content/adaptations/，编译器 src/，图册 atlas/。生成与下载通过 scripts/build.mjs、scripts/worlds/sync.mjs 与 scripts/pack.mjs 管理。

32 关、63 区域、33 分段；5 水下区域仅参考。世界 2–8 的 M06 接入是独立区域地形检查，不是完整连通关卡。循环分段保留局部坐标与分支，不假造原版长度、时序或通关。

测试与限制见 TEST_REPORT；验收见 ACCEPTANCE。下一步先对源数据差异做独立核验，开发水下/循环路线/平台等实际机制，再迁移真实角色。现有1-4奥日状态维持开发中，不因城堡模板存在而发布。

版本文件：docs/worlds-r21/INSTALLATION.json；旧 docs/chapters-r20 记录保留。安装器不会修改负责人、Issue、个人草稿；遇到冲突先人工合并。没有远端提交、认领或发布批准。
