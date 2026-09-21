# 混合马里奥第四期最终源码 · R43 / E04-S01

这是已发布第四期（索尼克 × 奥日）的源码整理版，不是新玩法版本，也不是第三期 M07 工程的替代品。原始入口为 `games/mario-mix-4/play.html`，来自仓库提交 `021c831c7d437b0a4a39b2ca67df0c5982866b10`。

## 先运行

需要 Node.js 22 或以上。不需要 `npm install`。

```sh
npm run verify
npm run dev
```

浏览器打开 `http://127.0.0.1:4194/play.html`。端口被占用可运行 `npm run dev -- --port 4195`。Windows 可双击 `start-dev.cmd`（需要已安装 Node.js）。更改源码后重启服务。

生成单文件：`npm run build`。产物为 `dist/play.html`，可以作为离线 HTML 打开；部分历史角色资源仍保留原版外部回退地址，因此不能承诺全部历史资源均完全离线可用。构建不会写入网站的 `games/`。

## 从哪里开始修改

| 位置 | 内容 |
| --- | --- |
| `src/app/shell.template.html` | 页面壳、HUD、弹窗及原版素材声明 |
| `src/styles/` | 6 个原有样式层，按原顺序编译 |
| `src/runtime/` | 26 个有序源码片段；包含前三期继承逻辑及第四期实现 |
| `src/runtime/16-ori-two-act-world.part.js` | 奥日两阶段地图、上升与旋转关联逻辑 |
| `src/runtime/17-ori-shared-world.part.js` | 共享世界坐标和旋转后的对象映射 |
| `src/runtime/18-ori-checkpoint-bash.part.js` | 奥日存档、检查点与 Bash 修订 |
| `src/runtime/19-sonic-adapter.part.js`、`20-sonic-classic-route.part.js` | 索尼克输入、动作和独立城堡路线 |
| `src/runtime/23-ginso-audio-lifecycle.part.js`、`25-r43-climax-and-test-hooks.part.js` | 原生音乐通道、暂停/恢复和 R43 高潮循环 |
| `src/data/` | 原有音频清单、内嵌音频引用及拾取配置 |
| `assets/audio/`、`assets/images/` | 从发布 HTML 无损提取的 260 个去重素材 |
| `manifest.json` | 编译顺序、素材路径、校验值与固定发布基线 |

`*.part.js` 是**编译时片段**，不是可逐个引入的 ES 模块。生成器把它们按原字节顺序还原到同一作用域；不要调整顺序或直接给 HTML 添加多个 script 标签。详见 `docs/ARCHITECTURE.md` 和 `docs/MODULE_MAP.md`。

## 精确复现与后续开发

`npm run verify:baseline` 要求构建结果与已发布 R43 的长度和 SHA-256 完全一致。当前源码可精确还原 17,558,386 字节的发布 HTML。

开发新功能时使用 `npm run check` 和 `npm run build`；`verify:baseline` 在有意修改后失败是预期的差异提示，不能修改原基线校验值来掩盖变更。新玩法需另立版本、补充回归测试和实机验收。

`npm run pack` 生成 `.local/MarioMix_Episode4_R43_Source.zip` 与校验元数据；在完整网站仓库中可用 `npm run episode4:pack` 更新公开下载。ZIP 不包含 dist、字体、Git 凭据、工具缓存或个人工作区。

## 保留的游戏内容

保持原版全部实现，包括前三期继承内容、索尼克与奥日路线、原有地图和平台、原生输入与音频生命周期。上升段为 Gareth Coker《Restoring the Light, Facing the Dark》的 48 秒高潮循环片段；素材及录音权利仍归各权利人。

源码整理不等于完成角色向 WorldKit/M07 的迁移，也不代表 Windows、手柄、音频或自然通关重新验收通过。来源与边界见 `NOTICE.md` 和 `docs/VALIDATION.md`。
