# M05 / R14 交接

当前0.4.1，M04架构上的UI精修；候选源码本地交付，未推送/部署。唯一底稿仍是上传的第三期mario-mix-3.zip，原HTML SHA-256 e134fdee21a6dce43585cda93c582ca2c0bf45f325f14cde81e33b80b758f19c。

先读START_HERE.md → release.json → CHANGELOG_M05.md → UI_CONTRACT.md → TEST_REPORT_M05.md。模块登记已生成，27独立模块/6桥接/33兼容片段；不能宣布全部解耦或完整1-4。

## 继续修改的位置
- DOM/CSS界面：src/ui/adventure-shell.mjs 与 adventure.css。
- HUD/拾取：src/ui/adventure-render.mjs；桥接hud-paint读取旧状态，坐标不迁移。
- 偏好：src/ui/display-preferences.mjs，新存储键不混用旧存档。
- 挂载：src/bridges/adventure-shell.bridge.js位于48-terra-rematch片段内层闭包末尾。不能搬到90-END-SANDBOX外部，那里拿不到绑定模块的闭包状态。
- 模板与原console.css保留，build仅候选附加样式，verify:baseline必须持续与上传字节相同。

## 交付与验收
verify / prepublish:check / pack。下载包与packages源码应一致，M04历史保留。网页仍只有当前源码、参与开发、关卡实验三个重点入口；只更新当前版到M05，详细UI资料从源码页链接进入，不新建顶栏入口或独立后台。

手动审批仍为空，真实HTTP、Windows、实体手柄、音频和自然通关未完成。下一步优先发布前验收，不再扩大架构/玩法范围。UI反馈按一个小改动+实际截图处理。
