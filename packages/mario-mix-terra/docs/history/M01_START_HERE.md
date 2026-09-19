# 第三期泰拉瑞亚 · M01 开发工程

以本次上传的 mario-mix-3.zip 为迁移基线。这是可构建的第一批模块化工程，不是第四期，也不是城堡关版本。前两期独立文件与线上试玩不替换。

## 十分钟内开始

需要 Node.js 22+。本工程无第三方 npm 依赖，不需要 npm install。在本目录运行：

```sh
npm run build
npm test
npm run dev
```

候选网页：`http://127.0.0.1:4193/`。原始对照另开终端运行 `npm run reference`，地址为 `http://127.0.0.1:4194/`。修改 src 后重启 dev 并刷新，不承诺热更新。

无需本地服务的候选位于 `dist/MarioMix_Terraria_M01.html`，构建后可单独打开。部分远程补充图片和音乐仍沿用底稿，不能宣称全部资源离线完备。`dist/play.html` 是 ESM 网页入口，要通过本地服务打开。

## 先改哪里

想研究 Boss：`src/simulation/eye-boss.mjs`。建造规则：`src/simulation/platform-builder.mjs`。地图解码：`src/content/level-13.mjs`。摇杆：`src/input/stick.mjs`。按键文案：`src/ui/key-label.mjs`。

这些模块已经在候选运行中被调用，不是只给演示用的空框架。旧依赖仍在 `src/compat/`，这里是按职责切开的共享闭包片段，不是 33 个已经独立的模块。

## 阅读顺序

1. README.md：范围与命令。
2. docs/ARCHITECTURE.md、docs/MODULE_MAP.md：现状与真实接入点。
3. CONTRIBUTING.md：如何完成小 PR。
4. docs/TEST_REPORT.md、docs/ACCEPTANCE.md：验证边界。
5. docs/HANDOFF_M01.md、docs/TASKS.json：接着做什么。

源码包不包含 dist 和 .local，也不包含任何字体文件。不要编辑生成结果后再覆盖源码。媒体与上游部分遵循 upstream/NOTICE.txt，未获得的许可不能从公开下载链接推定。
