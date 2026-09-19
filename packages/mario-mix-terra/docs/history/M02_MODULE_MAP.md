# M02 源码地图

[完整模块登记表](generated/MODULES.md) 由 `architecture/modules.json` 自动生成，运行 `npm run docs:build` 更新，`arch:check` 检查是否滞后。

| 想改什么 | 先看哪里 | 不应顺手修改 |
|---|---|---|
| 配置导入、绑定冲突 | src/input/bindings-model.mjs | DOM、物理、存储键 |
| 坐骑手柄重分配 | src/input/mount-binding.mjs | 坐骑物理与掉落 |
| 持键与键盘映射 | src/input/keyboard-router.mjs | 全局设备监听 |
| 手柄/键盘捕获 | src/input/binding-capture.mjs | 世界状态 |
| 设置关闭与暂停 | src/ui/settings-session.mjs | 关卡重启、结算 |
| 设置行与可读性 | src/ui/bindings-view.mjs | 配置提交逻辑 |
| 定时器/监听释放 | src/runtime/lifetime.mjs | 隐式全局事件总线 |
| 游戏桥接 | src/bridges/bindings.bridge.js | 增加旧 wrapper |

当前 compat/00–45、47–48 和90仍是旧闭包片段；46 为模块接入标记。原始片段保留在 tests/golden/ 用于重建，不是可编辑的功能来源。
