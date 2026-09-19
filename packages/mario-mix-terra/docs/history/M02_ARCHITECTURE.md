# M02 架构：模块、适配器与兼容区

## 执行路径

```text
物理键盘/手柄 -> 现有设备接入 -> bindings.bridge.js
                                  |-- bindings-model（配置事务）
                                  |-- keyboard-router（物理键 -> 逻辑键）
                                  |-- binding-capture（一次捕获与释放屏障）
                                  |-- settings-session（暂停所有权/开关/轮询）
                                  |      `-- lifetime（计时器与监听器清理）
                                  `-- bindings-view（表格，不修改游戏状态）
逻辑输入 -> 既有第三期玩法 -> 绘制/音频
```

M01 的 Boss、建造、地图、动作、摇杆、逻辑输入、按键显示、固定时钟共八模块继续使用。M02 新增七模块。具体表由 architecture/modules.json 生成，见 generated/MODULES.md。

## 真实的依赖边界

`src/input/bindings-model.mjs` 接收动作定义和坐骑重排函数；维护自己的数据快照，不拥有存储、DOM 或全局玩家。一次非法绑定不会部分提交。旧存储键和配置 version/controlLayout 不改。

`keyboard-router` 在按下时记录逻辑键，释放时使用原映射；菜单打开/关闭由 adapter 清空记录，避免持键改映射后松不开。`binding-capture` 只处理采样/边缘/等待释放。`settings-session` 只恢复由自己触发的暂停；轮询在关闭时释放，而非等到下一次渲染。

`bindings-view` 可以使用注入的 document，但只显示和发送 onChoose；监听器由 lifetime 管理。UI 外观、操作指南、localStorage、模式变量和旧设备捕获仍位于 bridge。

## 不能夸大的部分

没有通用事件总线、ECS、全新场景引擎或热更新。33 个 compat 文件仍按已知顺序装配；46 文件只剩一个 bridge 标记，bridge 本身不是独立玩法模块。世界/房间生命周期、库存事务和音频所有权尚未全部迁出。

构建器仍只接受 import-free 的命名工厂/函数，由入口组装与显式依赖注入连接；不是任意 ES 模块打包器。未来引入标准 bundler 必须作为独立 ADR，不在同一 PR 悄悄替换。网页使用真实 ESM；单 HTML 由同一源生成。

## 契约门禁

`arch:check` 检查登记一致性、声明依赖循环、层和路径、测试文件、真实 hook 引用、golden 校验和若干旧包装函数的数量上限。该轻量静态扫描不是完整 JS 类型系统或安全沙箱，动态依赖仍靠代码审阅与运行测试。

源内容指纹包含模块、bridge、模板、资源登记、动作数据和构建配置；资源本体另有锁定 SHA。不可把校验值当成代码可信的数字签名。
