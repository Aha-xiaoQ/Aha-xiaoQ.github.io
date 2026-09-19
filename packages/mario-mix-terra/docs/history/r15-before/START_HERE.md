# 第三期协作版 M05 · 从这里开始

**0.4.1 / M05，UI 精修发布候选。** 在 M04 架构与第三期底稿上更新界面，保留关卡、数值、键位和物品规则。不是新关卡，不替换线上游戏，不引入城堡。

## 三条命令开始
Node.js 22+，无需 npm install。
```sh
npm run verify
npm run prepublish:check
npm run dev
```
浏览器打开 `http://127.0.0.1:4193/play.html`。另开终端运行 `npm run reference`，在4194查看原始第三期对照。修改 src/ 或 content/ 后重启服务并刷新；dist/ 是生成产物。

## 玩家可见变化
深色森林与暖金色的统一菜单、可阅读的快捷栏与生命/魔力底板、拾取提示、按键设置。右上“专注画面”收起侧栏；“显示偏好”提供大号菜单文字、高对比和减少界面动效。偏好与存档、改键配置分开；专注模式不跨刷新记忆。

大号文字目前影响菜单与说明，不改变固定坐标的像素 HUD。减少界面动效不等于关闭游戏世界震动/闪光；竖屏 HUD 仍偏小，建议横屏或桌面。

## 开发与交接
[贡献流程](CONTRIBUTING.md) · [当前模块](docs/generated/MODULES.md) · [UI 规范](docs/UI_CONTRACT.md) · [M05交接](docs/HANDOFF_M05.md)。

27个实际接入模块、6个桥接文件、33个兼容片段。UI 读取状态，不负责战斗、掉落和计时。关卡试验场仅以 `?dev=1` 开启；真实泰拉角色仍不能任意套用新地图。

## 发布者
`npm run pack` 输出 `.local/MarioMix_Terraria_M05_Source.zip`。`prepublish:check` 检查版本与产物一致性，不代替人工审核；`release:check` 默认拒绝未批准的候选。先读 [UI验收](docs/ACCEPTANCE_UI_M05.md) 与 [测试报告](docs/TEST_REPORT_M05.md)，记录实际候选SHA和设备结果再发布。

M04及以前文档为历史；本轮读 release.json、CHANGELOG_M05.md、HANDOFF_M05.md。原 NOTICE 与素材声明保留，本包没有扩大第三方授权，也不包含字体文件。
