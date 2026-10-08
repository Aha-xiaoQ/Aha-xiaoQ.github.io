# 在下_小Q · Pixel Workshop

**简体中文** | [English](README.en.md)

小Q的个人作品网站：浏览器游戏、实用工具、制作记录与交互实验。

[访问网站](https://aha-xiaoq.github.io/?lang=zh) · [项目](https://aha-xiaoq.github.io/projects/?lang=zh) · [游戏](https://aha-xiaoq.github.io/games/?lang=zh) · [工具](https://aha-xiaoq.github.io/tools/?lang=zh) · [开发](https://aha-xiaoq.github.io/notes/?lang=zh) · [实验室](https://aha-xiaoq.github.io/notes/lab/?lang=zh)

## 从这里开始

| 想做什么 | 入口 |
| --- | --- |
| 体验游戏与工具 | [作品目录](https://aha-xiaoq.github.io/projects/?lang=zh) |
| 了解混合马里奥 | [项目介绍与关卡进展](https://aha-xiaoq.github.io/notes/mario-mix/?lang=zh) |
| 查找混合马里奥源码与运行说明 | [项目资料索引](https://aha-xiaoq.github.io/notes/mario-mix/docs/?lang=zh) |
| 制作关卡 | [地图工坊](https://aha-xiaoq.github.io/tools/?lang=zh) |
| 观看动画、视频与交互实验 | [实验室](https://aha-xiaoq.github.io/notes/lab/?lang=zh) |
| 修改这个网站 | [网站开发指南](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/?lang=zh) |

工具目录收录仿真示波器音乐播放器等作品，支持导入音乐与视频、XY 声音实验及画面导出。各工具的使用说明和下载见对应资料页。

混合马里奥各期试玩与开发源码独立维护；具体版本、可用范围与限制以对应项目资料为准。地图工坊提供参考底图、编辑与导出功能，不代表所有原作关卡均已完整复刻。

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

编辑内容来源后，运行统一的构建与完整检查：

```sh
npm run platform:verify
```

[网站结构](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/architecture/?lang=zh) · [内容编辑](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/content/?lang=zh) · [构建与发布](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/publishing/?lang=zh) · [维护资料索引](docs/README.md)

仅为本地预览重新生成页面时，使用 `npm run platform:build`；它不代替完整检查。原有单项构建与测试命令继续可用。模块分工、语言维护和更新打包见[网站架构与维护](docs/platform/README.md)。

## 参与

发现问题请附上页面地址、设备与复现步骤。代码或设计贡献请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，较大的调整先在 Issue 中讨论。项目范围与任务以各项目记录为准。

## 许可与素材

已核验的原创部分采用 MIT，包括网站与构建工具的原创实现、地图编辑器的原创程序、四幅几何 SVG、鹈鹕骑行 HTML/SVG，以及光之工坊的原创程序部分。逐文件范围、固定基线和来源证据见 [许可审计](docs/oss/README.md)、[文件清单](docs/oss/FILE_MANIFEST.json) 与 [RIGHTS.md](RIGHTS.md)。

这不是全仓 MIT。Acorn 保留上游 MIT，字体保留原许可；第三方游戏地图、美术、音频、厂商手册和未核验下载包不因此获得授权。Q咪现有 CC BY-NC 4.0 素材声明保留，本地 ZIP 的许可声明与精灵字节已核验；独立源码仓库与协调变更仍需另行核验。[LICENSE](LICENSE) 是本次原创范围许可，[LICENSE.collab](LICENSE.collab) 保留既有协作范围。

[复现步骤与方法限制](docs/oss/REPRODUCIBILITY.md) · [维护者与 CI 证据](docs/oss/MAINTAINER_AND_CI.md) · 本地许可校验：`npm run oss:verify`

[字体许可](assets/FONT_LICENSES.md) · [变更记录](CHANGELOG.md)
