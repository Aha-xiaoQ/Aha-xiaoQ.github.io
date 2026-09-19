# 模块登记（自动生成）

来源：architecture/modules.json。表中 owner 是审阅职责，不表示已有贡献者认领。注入依赖需结合测试核验；这是登记依赖图，不是动态 JavaScript 的完整分析。

| 模块 | 源码 | 层 | 注入依赖 | 测试 |
|---|---|---|---|---|
| 克苏鲁之眼基础状态机 | `src/simulation/eye-boss.mjs` | simulation | 无模块级依赖 | tests/modules.test.mjs |
| 隐藏场景平台建造 | `src/simulation/platform-builder.mjs` | simulation | 无模块级依赖 | tests/modules.test.mjs |
| 早期逻辑输入 | `src/input/logical-input.mjs` | input | 无模块级依赖 | tests/modules.test.mjs |
| 第三期地图解码 | `src/content/level-13.mjs` | content | 无模块级依赖 | tests/modules.test.mjs |
| 摇杆死区 | `src/input/stick.mjs` | input | 无模块级依赖 | tests/modules.test.mjs |
| 默认动作定义 | `src/content/actions.mjs` | content | 无模块级依赖 | tests/modules.test.mjs |
| 按键名称 | `src/ui/key-label.mjs` | ui | 无模块级依赖 | tests/modules.test.mjs |
| 固定步长时钟 | `src/runtime/fixed-step.mjs` | runtime | 无模块级依赖 | tests/modules.test.mjs |
| 坐骑按键事务 | `src/input/mount-binding.mjs` | input | 无模块级依赖 | tests/settings.test.mjs |
| 配置验证、迁移与绑定 | `src/input/bindings-model.mjs` | input | actions, mount-binding | tests/settings.test.mjs |
| 键盘逻辑映射 | `src/input/keyboard-router.mjs` | input | actions | tests/settings.test.mjs |
| 按键捕获与释放屏障 | `src/input/binding-capture.mjs` | input | 无模块级依赖 | tests/settings.test.mjs |
| 计时器与监听器清理 | `src/runtime/lifetime.mjs` | runtime | 无模块级依赖 | tests/settings.test.mjs |
| 设置窗口会话 | `src/ui/settings-session.mjs` | ui | lifetime | tests/settings.test.mjs |
| 改键表格视图 | `src/ui/bindings-view.mjs` | ui | key-label, lifetime | tests/settings.test.mjs |
| 关卡、底图、角色与适配层契约 | `src/content/stage-catalog.mjs` | content | 无模块级依赖 | tests/stages.test.mjs, tests/final-contract.test.mjs |
| 关卡实例生命周期 | `src/runtime/stage-session.mjs` | runtime | stage-catalog, lifetime | tests/stages.test.mjs, tests/final-contract.test.mjs |
| 原型横版角色运动器（非旧物理迁移） | `src/simulation/platform-motor.mjs` | simulation | 无模块级依赖 | tests/stages.test.mjs |
| 数据关卡驱动：房间、检查点与出口 | `src/simulation/platform-stage.mjs` | simulation | platform-motor | tests/stages.test.mjs |
| 读取共享动作配置 | `src/input/stage-actions.mjs` | input | stick, bindings-model | tests/stages.test.mjs |
| 关卡音频事件策略 | `src/runtime/stage-audio.mjs` | runtime | 无模块级依赖 | tests/stages.test.mjs |
| 几何开发预览绘制 | `src/ui/stage-view.mjs` | ui | 无模块级依赖 | tests/stages.test.mjs |
| 物品说明与分类 | `src/content/items.mjs` | content | 无模块级依赖 | tests/loot.test.mjs |
| 武器交换、箱子散落与拾取说明计划 | `src/simulation/loot-rules.mjs` | simulation | item-definitions | tests/loot.test.mjs |
| HUD与拾取提示绘制 | `src/ui/adventure-render.mjs` | ui | 无模块级依赖 | tests/presentation.test.mjs |
| 独立显示偏好 | `src/ui/display-preferences.mjs` | ui | 无模块级依赖 | tests/presentation.test.mjs |
| 冒险界面与显示控制 | `src/ui/adventure-shell.mjs` | ui | display-preferences, lifetime | tests/presentation.test.mjs |
| 只读操作提示与反馈摘要 | `src/ui/quick-guide.mjs` | ui | key-label | tests/release-polish.test.mjs |
| 可选冒险手册 | `src/ui/adventure-help.mjs` | ui | lifetime, quick-guide | tests/release-polish.test.mjs |
| 玩家文案与阅读排版 | `src/ui/player-copy.mjs` | ui | 无模块级依赖 | tests/player-ui.test.mjs |
| 玩家界面、确认与提示 | `src/ui/player-interface.mjs` | ui | 无模块级依赖 | tests/player-ui.test.mjs |
| 高分辨率HUD画布 | `src/ui/hud-surface.mjs` | ui | 无模块级依赖 | tests/player-ui.test.mjs |

33 个 compat 文件仍保留共享闭包；bindings、stages、weapon-exchange、chest-spill、hud-paint、adventure-shell 是六个宿主适配器，不算独立业务模块。M06 platform-v1 仍是接入原型，不是旧泰拉物理的迁移；legacy-terra-v1 仍限制为原第三期组合。
