# R12 · 开发项目卡片小图标修复

本包修复开发目录的游戏／网站两类图标，不是新的游戏版本。
左侧恢复小型倾斜手柄，右侧改为同尺寸的浏览器小图标。去掉这两张卡片里的 PLAY／BUILD 横幅与微小标语；卡片文字、状态和跳转目标不改。

适用：已安装 R08、R09、R10 或 R11、且开发目录源码仍匹配这些已交付版本的网站副本。实际安装测试以四种 R11 文本输入为基础。发布者自行修改过相关代码时停止，需要保留改动并合并，不要倒退文件通过检查。

## 应用
Node.js 22+；无第三方 npm 依赖，不需 npm install。先备份或提交工作区，把本包解压到原仓库之外，双击 APPLY_R12.cmd。也可以在本包目录执行（替换路径）：

```powershell
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --check
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --apply
```

第一条成功后才应用。工具先检查、再备份；不会推送、部署或改远端权限。备份存放在仓库旁边，命令会打印准确位置。

应用后在原仓库运行：

```powershell
npm run test:r12
npm run journal:build
npm run site:check
npm run check
npm test
```

沿用原 npm start 或 npm run dev，打开 /notes/。从首页进入开发页、筛选项目、进入后返回，都应保持小图标。仍看见旧横幅时关闭旧标签并 Ctrl+F5；已为动态模块与样式更新资源版本号。

本包不覆盖主站路由逻辑、主题 CSS、游戏工程、任务 JSON、旧下载包或历史交接。其他外层 HTML 的必要修改仅为 site-router.js 资源查询版本，避免从旧入口读到缓存。生成资料页会更新样式查询版本，不改其正文。

## 回退
```powershell
node apply-update.mjs --target "仓库路径" --rollback "打印的备份路径" --check
node apply-update.mjs --target "仓库路径" --rollback "打印的备份路径" --apply
```
后续文件又有编辑会停止。源码清单、图标规则和交接见 payload/docs/design-r12/。完整性清单不是数字签名。预览是局部组件核验，不代表线上部署或 Windows 端到端验收。
