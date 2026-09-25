# 在下_小Q · Pixel Workshop

**简体中文** | [English](README.en.md)

小Q的个人作品网站：浏览器游戏、实用工具、制作记录与交互实验。

[访问网站](https://aha-xiaoq.github.io/?lang=zh) · [项目](https://aha-xiaoq.github.io/projects/?lang=zh) · [游戏](https://aha-xiaoq.github.io/games/?lang=zh) · [工具](https://aha-xiaoq.github.io/tools/?lang=zh) · [开发](https://aha-xiaoq.github.io/notes/?lang=zh) · [实验室](https://aha-xiaoq.github.io/notes/lab/?lang=zh)

## 从这里开始

| 想做什么 | 入口 |
| --- | --- |
| 体验游戏与工具 | [作品目录](https://aha-xiaoq.github.io/projects/?lang=zh) |
| 了解混合马里奥 | [项目介绍与关卡进展](https://aha-xiaoq.github.io/notes/mario-mix/?lang=zh) |
| 下载第三期开发源码 | [M07 候选版源码与运行说明](https://aha-xiaoq.github.io/notes/mario-mix/docs/terra-source/?lang=zh) |
| 下载第四期源码 | [R43 源码与运行说明](https://aha-xiaoq.github.io/notes/mario-mix/docs/episode-4-source/?lang=zh) · [下载 R43 源码包](https://aha-xiaoq.github.io/downloads/source/MarioMix_Episode4_R43_Source.zip) |
| 制作关卡 | [地图工坊](https://aha-xiaoq.github.io/packages/mario-mix-worlds/atlas/editor.html) |
| 查看提示词与实际效果 | [鹈鹕骑行实验](https://aha-xiaoq.github.io/notes/lab/docs/pelican-bicycle/?lang=zh) |
| 修改这个网站 | [网站开发指南](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/?lang=zh) |

混合马里奥各期试玩与开发源码独立维护；具体版本、可用范围与限制以对应项目资料为准。地图工坊提供参考底图、编辑与导出功能，不代表所有原作关卡均已完整复刻。

<!-- XIAOQ:VIDEOS:START -->
## 当前视频入口

| 内容 | 网站入口 | 视频状态 |
| --- | --- | --- |
| 第四期 · 索尼克 × 奥日 | [打开](https://aha-xiaoq.github.io/games/mario-mix-4/?lang=zh) | [观看视频](https://www.bilibili.com/video/BV1JBhh6iEXS/) |
| 马里奥地图工坊 | [打开](https://aha-xiaoq.github.io/packages/mario-mix-worlds/atlas/editor.html) | [观看视频](https://www.bilibili.com/video/BV1kLha63EyV/) |
<!-- XIAOQ:VIDEOS:END -->

## 本地运行

需要 Node.js 22 或更新版本。网站脚本没有第三方 npm 依赖，无需先运行 `npm install`。

```sh
git clone https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io.git
cd Aha-xiaoQ.github.io
npm run dev
```

打开 <http://127.0.0.1:4173/?lang=zh>。端口被占用时使用 `npm run dev -- --port 4174`；Windows 也可双击 `start-dev.cmd`。从完整仓库根目录启动，避免共享资源缺失。

## 内容与开发

| 位置 | 职责 |
| --- | --- |
| `content/` · `config/` | 作品、视频、项目状态与资料登记 |
| `assets/` | 共享界面、路由、样式与素材 |
| `notes/` | 生成的开发概览、资料和更新页面 |
| `experiments/` | 可独立运行的实验作品 |
| `games/` · `packages/` | 游戏入口与独立开发工程 |
| `scripts/` · `tests/` | 构建和自动检查 |
| `docs/` | 维护指南与历史记录 |

编辑内容来源后，依次运行：

```sh
npm run journal:build
npm run site:build
npm run check
npm test
```

[网站结构](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/architecture/?lang=zh) · [内容编辑](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/content/?lang=zh) · [构建与发布](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/publishing/?lang=zh) · [维护资料索引](docs/README.md)

## 参与

发现问题请附上页面地址、设备与复现步骤。代码或设计贡献请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，较大的调整先在 Issue 中讨论。项目范围与任务以各项目记录为准。

## 许可与素材

授权范围见 [LICENSE](LICENSE)、[LICENSE.collab](LICENSE.collab) 与 [RIGHTS.md](RIGHTS.md)。游戏、美术、字体和下载包的第三方条款以各自说明为准；请勿将代码许可套用于全部素材。

[字体许可](assets/FONT_LICENSES.md) · [变更记录](CHANGELOG.md)

## 网站维护

日常修改运行 `npm run platform:verify`，统一生成页面并检查源码与发布产物。模块分工、内容登记、英文与字体维护及增量更新包说明见 [网站架构与维护](docs/platform/README.md)。原有命令仍然可用。
