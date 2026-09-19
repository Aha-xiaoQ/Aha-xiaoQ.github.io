# R25 · 作品入口与关于页

这是接续 **R24 + M07/0.4.3 + WorldKit W02/0.2.0** 的增量更新包，不是完整网站。游戏、地图、历史下载、主站主题与路由保持原样。不适用于旧 K01/K02 分支。

## 安装

需要 Node.js 22 或以上，无需 npm install。先提交或备份工作区。将本包解压到原仓库之外，双击 `APPLY_R25.cmd`，输入仓库目录。预检通过后输入 `YES` 才写入；其他输入取消。也可在更新包目录执行：

```powershell
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --check
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --apply
```

先检查，确认通过再应用。所有更改先规划，再备份写入。本地源码、生成页面或联系方式不同会停止，请保留并合并，不要退回旧文件强行套用。更新器不运行 Git、不联网、不推送，也不填写发布批准。

## 应用后

在原仓库按顺序执行，失败时停止处理：

```powershell
npm run test:showcase
npm run showcase:check
npm run journal:build
npm run site:build
npm run site:ui:check
npm run ui:check
npm run check
npm test
```

沿用原来的启动命令，查看 `/games/`、`/about/`、工具列表及游戏介绍页。静态直开与站内跳转均使用同一份关于页视图。

## 发布仍走 R24 流程

`npm run release:plan` 核对完整站点，`npm run release:prepare` 仅在无阻断项时生成 `.local/publish/`。然后运行 `release:check`、`release:serve`，在 `http://127.0.0.1:4197/` 验收实际公开产物。不要将本包 payload、整个开发仓库或 screenshots 直接上传为网站。R25 不取消任何 R24 缺资源、内部文案和待验收检查。

## 修改位置

个人姓名、介绍与联系方式仍编辑 `content/site-data.js`。关于页头像、留言地址、额外段落编辑 `content/about-view.json`（安装时从当前页面迁移生成），随后 `npm run site:build`。不要编辑生成的 `content/about-support.js` 或 `about/index.html`。

原简介/头像/联系方式被手工定制时，安装器会停止要求明确合并。标准联系块前后的静态补充段落会保留；含活动脚本的自定义段落需要人工审阅。

## 回退

使用安装器打印的真实备份路径：

```powershell
node apply-update.mjs --target "仓库路径" --rollback "真实备份路径" --check
node apply-update.mjs --target "仓库路径" --rollback "真实备份路径" --apply
```

回退会保护安装后的新编辑，且不删除无关新工作。需要恢复生成内容时，按回退后的源码重新构建。不要提交备份和 .local。校验和只用于完整性检查，不是数字签名或安全认证。

先阅读本文件，再看 CHANGELOG、ACCEPTANCE、TEST_REPORT。组件维护与续接见 HANDOFF_R25。完整网站实机上线验收不由本包自动代替。
