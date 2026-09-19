# 0.4.2 · 测试记录

状态：本地候选，未发布。测试原始日志由R16更新包validation保存；最终解压核对另见包旁FinalVerification.json。

新增测试涉及只读提示/反馈允许字段、存储读写失败、生命周期所有权、缓存页清理分支、生成文件过期保护。原底稿重建要求SHA e134fdee21a6dce43585cda93c582ca2c0bf45f325f14cde81e33b80b758f19c。

完整游戏原版与候选执行13阶段离线回放；部分场景使用既有测试接口设置条件，远程请求全部阻止，不是自然完整通关。操作速查使用真实DOM/键盘事件，pagehide是合成事件，不是浏览器真实BFCache往返。

制作环境：Linux、Node22.16.0、Chromium/Python Playwright。真实HTTP浏览器导航得到ERR_BLOCKED_BY_ADMINISTRATOR；未更改或绕过策略。浏览器验证改用set_content执行完整候选与原内嵌媒体。独立Node HTTP测试不等于浏览器HTTP/ESM/CSP网络验收。

待实机：Windows/junction、实体手柄/触屏/热插拔、刷新存储、原生全屏、音频听感、自然关卡与隐藏挑战、真实网页/源码下载/Pages。历史测试和授权说明保留，不把本地通过当发布批准。

## 本轮执行记录

- 源码 Node：171 项通过（153 项原有＋15 项引导/生命周期＋3 项过期构建保护）。
- 完整原脚本和候选：13 阶段离线状态一致；自然完整通关未执行。
- 操作速查：44 项离线 DOM / 键盘 / 页面缓存事件分支检查通过，零未捕获脚本错误。
- 原显示 UI 35 项、设置 25 项、实验关卡 21 项、普通入口 6 项 DOM 回归通过。
- 实际修正：首次提示条 hidden 被 display:flex 覆盖；新增显式隐藏规则。按键示例测试改为先选未被占用的键，仍保留冲突保护。
- 生成过期文件删除仅作用于已登记未手改的文件；悬空链接路径测试没有删除或放宽。

这些数量是本地用例，不是品质评分、设备覆盖率或通关率。最终归档另行解压复跑源码/网页/安装器，以包旁FinalVerification为准。

复跑：npm run verify；npm run prepublish:check；npm run test:polish-browser；npm run test:browser。依赖浏览器的测试需要预先具备Playwright和Chromium，不自动下载依赖或变更浏览器策略。
