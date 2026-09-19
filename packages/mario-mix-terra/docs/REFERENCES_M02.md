# M02 结构参考

以下只用于设计原则与工具行为核验，没有复制框架实现、图像、字体或素材。

- Phaser Scenes / lifecycle：https://docs.phaser.io/phaser/concepts/scenes —— 区分暂停、恢复、关闭和销毁；本轮只借鉴设置窗口所有权与清理，不宣称迁移了所有关卡场景。
- MDN removeEventListener：https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener —— 显式移除同一监听器，lifetime 维护清理回调。
- Node 22 fs：https://nodejs.org/docs/latest-v22.x/api/fs.html —— 使用 lstat 检查链接项本身，继续保留 R08/M01 的安全路径工具和悬空链接测试。
- GitHub Secure use：https://docs.github.com/en/actions/reference/security/secure-use —— 外部PR低权限、不自动发布、Action固定commit。
- GitHub CODEOWNERS：https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners —— 审阅职责，不是目录权限隔离。

核验日期：2026-09-16。这些官方资料不为本游戏第三方素材提供授权。
