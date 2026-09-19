# 在下_小Q · Pixel Workshop

**简体中文** | [English](README.en.md)

个人网站与项目工作台，收录浏览器游戏、桌面宠物、开发工具，以及项目开发记录和源码资料。当前地图工坊文档与本地试玩候选同步维护，远端发布前会单独复核离线导出和角色适配。

[访问网站](https://aha-xiaoq.github.io/) · [项目](https://aha-xiaoq.github.io/projects/) · [游戏](https://aha-xiaoq.github.io/games/) · [工具](https://aha-xiaoq.github.io/tools/) · [开发记录](https://aha-xiaoq.github.io/notes/)

## 仓库内容

- **个人网站**：作品展示、游戏入口、工具、开发记录、关于页与留言墙，支持中英文切换。
- **混合马里奥**：三期独立试玩，以及第三期开发源码、贡献指南与任务记录。
- **关卡地图册**：八个世界、32 关的参考模板，可用于查看地形与制作独立方案。
- **Q咪与其他作品**：桌面宠物素材、作品介绍和相关下载入口。

## 混合马里奥当前状态

| 内容 | 版本与范围 |
| --- | --- |
| 在线试玩 | [第一期](https://aha-xiaoq.github.io/games/mario-mix/) · [第二期](https://aha-xiaoq.github.io/games/mario-mix-2/) · [第三期](https://aha-xiaoq.github.io/games/mario-mix-3/)；各自保留独立实现 |
| 第三期开发源码 | **M07 / 0.4.3**，待验收候选，与在线试玩分别维护 |
| 地图与工坊 | **W02 / 0.2.0**，32 关参考模板、63 个区域；地图工坊支持编辑、马里奥或魂斗罗·比尔试玩，以及单关/连续版离线导出；其他已有角色先在本地验证 |

[源码与运行指南](https://aha-xiaoq.github.io/notes/mario-mix/docs/terra-source/) · [地图册与接入指南](https://aha-xiaoq.github.io/notes/mario-mix/docs/terra-stages/) · [当前任务](https://aha-xiaoq.github.io/notes/mario-mix/tasks/)

### 地图工坊

[打开在线地图工坊](https://aha-xiaoq.github.io/packages/mario-mix-worlds/atlas/editor.html) 可以从 32 关参考底图创建副本，也可以新建空白地图。工程支持保存、导出和继续编辑；试玩时可选择马里奥或魂斗罗·比尔。比尔会复用已有的动作、武器、奖励、音乐和音效，现有敌人、管道与隐藏区域保持在原地图中，不加入魂斗罗专属敌人或隐藏地图。

工坊还能导出独立离线 HTML 和按顺序推进、支持自由选关的连续版。W02 仍是参考底图与通用试玩运行器，复杂路线、设备兼容性和完整自然通关仍在逐关核验，不能当作原版八世界的完整复刻。地图工坊右上角的 GitHub Star 入口会打开仓库主页，方便查看更新与反馈。

## 本地运行

需要 **Node.js 22 或更新版本**。网站工具没有第三方 npm 依赖，无需先运行 `npm install`。

```sh
git clone https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io.git
cd Aha-xiaoQ.github.io
npm run dev
```

打开 <http://127.0.0.1:4173/> 查看首页，或 <http://127.0.0.1:4173/notes/> 查看开发记录。请从仓库根目录启动，共享资源依赖完整目录结构。

端口被占用时运行 `npm run dev -- --port 4174`。Windows 也可双击 `start-dev.cmd`。

## 开发与检查

| 命令 | 用途 |
| --- | --- |
| `npm run check` | 检查数据、路径、脚本语法与生成文件一致性 |
| `npm test` | 运行自动测试 |
| `npm run site:build` | 重新生成网站展示页 |
| `npm run journal:build` | 重新生成开发记录与资料页 |
| `npm run terra:dev` | 启动第三期开发候选，入口以终端输出为准 |
| `npm run doctor` | 检查网站与三期游戏入口文件 |

自动测试不能替代游戏通关、真实手柄、音频和浏览器交互验收。

## 目录导航

| 目录 | 内容 |
| --- | --- |
| [content/](content/) | 网站内容、展示配置与项目状态源 |
| [assets/](assets/) | 共享样式、页面脚本和素材 |
| [games/](games/) | 已发布游戏的介绍与试玩页面 |
| [packages/](packages/) | 游戏开发工程与地图模板工具 |
| [notes/](notes/) | 生成的开发记录和项目资料页面 |
| [scripts/](scripts/) · [tests/](tests/) | 构建、校验与自动测试 |
| [downloads/](downloads/) | 面向访客的下载文件 |
| [docs/](docs/) | 维护文档、设计记录与验收说明 |

## 参与与维护

从[贡献指南](CONTRIBUTING.md)开始。游戏开发者可阅读[第三期工程入口](packages/mario-mix-terra/START_HERE.md)和[地图工程入口](packages/mario-mix-worlds/START_HERE.md)。

开发页面展示仓库中的状态快照；网页编辑只生成本地草稿，需导出、校验并提交后才会成为共享记录。地图工坊的使用步骤和角色能力见 [地图工坊使用说明](packages/mario-mix-worlds/docs/MAP_EDITOR_GUIDE.md)。

[网站发布流程](docs/remote-audit/PUBLISH.md) · [R25 历史说明](docs/showcase-r25/HANDOFF_R25.md) · [变更记录](CHANGELOG.md) · [旧 README 历史快照](docs/history/README-before-reorganization.md)

增量更新包只覆盖其清单中的文件，不能代替完整仓库。历史版本与安装记录保留在 docs 中。

## 许可与素材

指定范围的网站原创代码采用 [MIT 许可](LICENSE)。头像、Logo、文章、美术、游戏素材和下载包不包含在该授权中；具体范围与第三方条款见[版权与使用说明](RIGHTS.md)。新增协作工具的许可见 [LICENSE.collab](LICENSE.collab)。

网站字体使用霞鹜文楷，见[字体许可](assets/FONT_LICENSES.md)。混合马里奥为非官方同人作品，相关素材权利归各权利人所有；作品说明与权利反馈方式见各游戏页面。
