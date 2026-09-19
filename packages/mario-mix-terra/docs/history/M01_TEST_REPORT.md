# M01 实际验证记录

日期：2026-09-16；制作环境 Linux / Node 22.16.0 / Chromium / Python Playwright。以用户上传的第三期 ZIP 为实际输入，不再使用缺失完整游戏的合成宿主代替本次底稿。

## 已执行

- 原 HTML 重建 SHA-256 与上传字节一致：e134fdee21a6dce43585cda93c582ca2c0bf45f325f14cde81e33b80b758f19c。
- Node 逻辑/构建/文件安全/HTTP/ZIP 测试：36 项通过。具体清单在 tests/；不是 36 次通关。
- 对照涵盖 2400 次 Boss 固定更新、480 个建造目标格、256 个逻辑输入组合、507 个摇杆输入、300 个时钟采样；这些是用例内部数据量，不额外累加为测试数量。
- 原完整脚本与候选完整脚本在离线浏览器 fixture 对照 13 个阶段状态，差异 0、未捕获脚本错误 0。包括移动、跳跃、攻击、暂停、恢复、真实管道过程到隐藏场、一次建造尝试、召唤、战斗、测试伤害击败及返回。进入/召唤/击败/返回均有前置结果断言，避免空操作通过。
- 候选改键对话框打开、显示动作行、关闭；390/768 CSS px 文档未横向溢出。截图包含本上传内嵌素材，不是重绘游戏。
- 构建输出再次生成 changed=0；源码输出哈希在 dist/build-report.json。

## 浏览器测试的准确边界

当前环境访问 file URL 返回 ERR_BLOCKED_BY_ADMINISTRATOR，未改或绕过策略。因此使用 about:blank 的 set_content 执行完整 HTML，保留原 CSP，添加测试标记和固定随机种子，所有远程请求被显式阻止。执行的是单 HTML 候选，不是 HTTP ESM 网页端到端。localStorage/IndexedDB 受该来源环境限制，不以此验证持久性。

测试使用已有 test 钩子把人物放到管道口、注入召唤条件并给 Boss 测试伤害，不是自然游玩完整流程。建造的成功/失败和库存验证主要在纯模块测试；浏览器记录一次真实建造路径的结果。截图缺少未下载的可选远程素材和音频，不宣称完整离线版。

## 没有完成

Windows 原生 CLI、真正 HTTP/ESM/CSP 链路、实体手柄/触屏、音频听感、网络素材齐全后的效果、原生下载/持久在线配置、自然完整通关、CI/Pages 远端执行、外部贡献者首次 PR。没有全游戏性能采样或全量安全审计。

## 交付复核

最终更新器和源码 ZIP 会在解压目录分别复跑，结果单独放在外层 validation/FINAL_VERIFICATION.json。不要只引用本文件声称外层安装已经通过。原代码/素材 NOTICE 与注释保留，没有新增字体文件。

## 复跑

npm run check → npm test → npm run build → node scripts/build.mjs --check。未修改源码的基线可执行 npm run verify:baseline；浏览器环境已安装时 npm run test:browser。所有不通过和未运行都单独记录。
