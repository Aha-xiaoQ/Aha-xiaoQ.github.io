# Pixel Workshop · 当前维护约定

## 先对齐真实代码

先读取远端默认分支与本地改动，再阅读 README 和对应工程入口。
历史更新包不能覆盖更新的代码；旧维护约定可从 Git 历史查阅。

历史定位：`TERRA-M04-R13` 的交接见 `docs/terra-m04/HANDOFF_R13.md`（不是当前版本）。

## 当前产品与源码

- 个人站保留六项导航：**首页、项目、游戏、工具、开发、关于**；开发路径仍为 `/notes/`。
- 1-1：魂斗罗、洛克人；1-2：忍者龙剑传、坦克大战；1-3：泰拉瑞亚；1-4：索尼克与奥日。四期独立试玩已上线，入口为 `games/mario-mix[-2|-3|-4]/play.html`。第四期上线不代表通用框架角色迁移或全设备验收已完成。
- 第三期开发候选为 **M07 / 0.4.3**，主入口 `packages/mario-mix-terra/START_HERE.md`。不得把候选等同于已发布试玩。
- 当前地图目录使用 **WorldKit W02 / 0.2.0**，源为 `packages/mario-mix-worlds/content/catalog.json`。32 关参考模板不等于 32 关成品；水下、循环与真实角色接入分别验收。
- W02 内置 M06 运行时；历史 K01 工具保留用于追溯，不再作为公开版本指针。

## 修改边界

不全仓格式化，不改已经确认的主题、图标和游戏单条布局。优先修复可复现缺陷。
源码、发布候选、线上试玩必须分别记录。修改真实游戏规则、发布游戏、写入 GitHub、改部署方式或权限，均以本次用户授权为准；不从旧交接推定授权。
使用 lstat 检查符号链接，不能用 existsSync 为写入路径授权。不添加凭据，不打包字体、备份、私有日志或测试工作区。

## 构建与验证

网站内容由生成器维护；先改源再运行 `npm run journal:build` 与 `npm run site:build`。
运行 `npm run check`、`npm test`、`npm run release:test`、`npm run release:prepare`、`npm run release:check`。
第一期协作候选另外运行 `npm run game:build`。完整 UI、设备与自然通关证据须单独记录，不以单元测试数代替。
发布对象是 **`.local/publish`**，不是整个仓库；管理页、源码工具、测试与交接文件不作为松散网站文件发布。明确提供的源码 ZIP 仍含协作文档与测试。

每轮交接记录基线提交、变更、实际测试、剩余边界。只有工具返回成功才称推送或部署成功。不要强制推送或覆盖别人的新提交。

## 视频与公开状态

第四期与地图工坊视频 URL 唯一来源为 `content/site-data.js` 中各自的 `videoUrl`；
`videoSlot: true` 只声明展示位置，没有 URL 时必须显示“视频待发布”，不能生成空播放器或假链接。
运行 `npm run video:sync` 同步开发页说明；README 保留稳定入口，不再生成视频列表，再运行原有生成链。
玩法进度改 `packages/mario-mix-worlds/content/catalog.json` 与历史 K01 进度登记；
不要手工改生成的 chapterPlan/levelPlan、HTML 或测试记录。视频链接已填写不等于远端视频已通过播放验收。

## 第四期源码工程

第四期已发布 R43 的独立整理工程位于 `packages/mario-mix-episode4/`，入口 `START_HERE.md`，公开说明 `/notes/mario-mix/docs/episode-4-source/`。E04-S01 是源码整理编号，不是新游戏版本；保留第三期 M07 的 currentRelease 身份。运行 `npm run episode4:verify` 核对原版字节，`npm run episode4:pack` 更新源码下载。

`src/runtime/*.part.js` 按 manifest 指定顺序编译到原共享作用域，不得当成独立 ES 模块打乱顺序；构建只写入本工程 dist，不覆盖 `games/mario-mix-4/play.html`。源包与在线玩法分别验收。

## “更新网站”的交付范围

用户说“更新网站”时，按 `docs/platform/site-update-workflow.md` 执行。它是整站关联内容更新，不能只新增详情页：核对最新远端基线，更新作品登记、首页状态、所属项目与全站更新记录、日期、相关入口、中英文及搜索；在实际 `.local/publish` 中逐页验证。现有本地预览约定继续有效，发布范围按当前授权判断。不要把视频已发布、网站已生成、网站已部署混为一谈。
运行 `npm run site:status:check` 检查首页引用与更新记录；预览必须包含首页、全站更新、所属项目更新、作品目录和详情。该检查不能代替浏览器查看实际文案。维护流程变更要验证漏更新和草稿等反例。

## 固定双端发布约定

站主已明确：拉取 GitHub 最新版 → 严格沿用最新模板放置素材 → 取得并核实 BV、更新视频链接 → GitHub 与现有 GPT 网站双端发布和验证。按 `docs/platform/site-update-workflow.md` 完成全流程，不逐次等待提醒。用户明确仅本地、暂停或撤销发布时，以最新指令为准。视频展示使用现有封面链接跳转 B 站；不要自行加入原生播放器或 MP4 下载按钮。
