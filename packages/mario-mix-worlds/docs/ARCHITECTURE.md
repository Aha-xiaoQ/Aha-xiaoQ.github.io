# W02 架构

数据入口：`reference/first-world.json` 与 `reference/worlds/world-2.json` 至 `world-8.json`。`scripts/reference.mjs` 检查世界数量、关卡顺序和固定来源提交。

第一世界继续使用 `src/compiler.mjs` 既有分支；新增世界委托给 `src/remaining-compiler.mjs`。两者输出相同的地图对象，后者另带 `topology`、`inspectionStages`、`rooms[].origin`。未知 macro/thing 或非法坐标必须失败，不以普通平台代替未知对象。

`topology` 保存源 locations、exit、sections、transport 与条件宏。`rooms` 中的 before/stretch/after 保持分段局部坐标；伸展长度与路线决策由未来驱动实现，不在编译器内猜测。

`extensionFiles` 只导出 M06 现有契约能检查的场景。水下区域有完整模板但不注册到 platform-v1。世界 2–8 是独立分区，不生成假的传送门来让可达性测试变绿。

`src/tiled.mjs` 输出对象层；`src/map-svg.mjs` 输出矢量地形预览。`atlas/` 是只读地图册，按需读取当前关卡，使用有限缓存与请求序号防止快速切换显示旧结果。

`prepare()` 在 `.local/` 创建独立运行副本，保留原 M06；只在该副本改两处预览标识和注册内容数据。构建、分发 ZIP 和生成清单均确定性输出。
