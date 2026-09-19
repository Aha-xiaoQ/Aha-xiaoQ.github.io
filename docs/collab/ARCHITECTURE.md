# 当前结构与目标结构

## 已经存在并由本轮读取确认的结构

```text
README.md                     整站说明，新增协作入口
assets/site-shell.js          原站共享渲染器，本轮只增加开发中心入口
content/site-data.js           原有整站内容数据，包含三期游戏；本轮不改
notes/index.html              保留笔记页面，不替换其内容存储

games/mario-mix/              第一期的 HTML、脚本和 assets
  play.html
  classic-mix.js
  crossover-extension.js
  bill-controls.js / bill-weapons.js / bill-base-room.js
  enemies-r9.js

games/mario-mix-2/play.html    第二期现有约 11 MB HTML
games/mario-mix-3/play.html    第三期现有约 12 MB HTML
```

一期扩展脚本存在保存旧函数并覆盖行为的结构；二、三期本轮只核对了树元数据与入口，并未下载完整 HTML 进行内部审计。不能据此断言其全部代码结构与一期相同。源文件元数据见 `collab/runtime-baseline.json`。

## 本轮实际新增

```text
dev/                 独立开发中心（不经原 SPA 路由渲染）
  index.html         看板与续接入口
  guide.html         HTML 参与指南
  model.js           浏览器/Node 共享的状态校验与操作模型
  app.js             DOM 交互；草稿仅保存在本地
  project-data.js    从 collab/project.json 生成
collab/
  project.json       唯一共享状态源
  TASKS.md           自动生成的任务摘要
  runtime-baseline.json  只读基线证据
  assets-register.json  素材许可登记表（当前为空，未完成审计）
tools/               零第三方依赖的启动、检查、交付工具
tests/               协作工具逻辑测试
docs/collab/         运行、结构、玩法、验证、交接与发布记录
.github/             模板、CODEOWNERS 与低权限 CI 配置
```

原站通过 `assets/site-shell.js` 在渲染/复用页面时，增加“开发”导航和笔记、游戏列表、三期介绍页的入口卡片。没有更改 `site-router.js`；`/dev/` 不在旧路由白名单中，因此正常执行完整页面导航。返回原站仍使用其既有入口。

## 尚未实施的目标结构

后续可能形成 `src/core`、`src/input`、`src/audio`、`src/characters`、`src/scenes`、`content/levels`、`content/biomes` 等模块。**这些目前只是方案，不是已经存在的源码模块。**

先完成 SRC-001 与 TEST-001，选定唯一游戏开发基线，再选一个纯输入模型做等价拆分试点。保留原版物理常量、地图坐标与行为；任何手感改动单独评审。坦克的俯视移动与横版平台移动可共享基础服务，但不得强行共享同一套角色运动规则。

角色应通过明确接口接入，场景切换和背景音乐由单一系统管理；这两件事均未在 collab-r01 中实现。网站仓库与游戏仓库也没有分离，后续是否新建源码仓库需另行确认迁移与发布方案。
