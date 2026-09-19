# R23 · 网站阅读、导航与交互精修

接续 R22 / M07 + WorldKit W02 的完整网站副本。仅更新网站组件，不升级游戏，不修改地图，不自动推送或发布。不是整站覆盖包。

## 安装

Node.js 22 或以上，无需 npm install。先提交或备份工作区，把整个 ZIP 解压到仓库之外。Windows 可运行 APPLY_R23.cmd；或在更新包目录运行（换成自己的路径）：

```powershell
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --check
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --apply
```

第一条通过才运行第二条。源码、生成页、同名文件冲突会停止，不提供 force。全部页面先在内存中生成并预检，再备份、写入。保留自定义项目内容和非生成正文，不用测试夹具覆盖实际网站。

## 验证

在原仓库运行：

```powershell
npm run site:ui:check
npm run test:site-ui
npm run journal:build
npm run site:build
npm run experience:check
npm run launch:check
npm run check
npm test
```

保留原 npm start / npm run dev。不需要重新构建游戏即可查看网站变化；如要运行原 release:preflight，其既有游戏产物检查仍要求按 R22 先完成 terra:build。

查看首页页眉、游戏/项目列表、/notes/ 搜索和筛选、/notes/mario-mix/docs/terra-source/、/notes/mario-mix/docs/terra-stages/，以及 /search/。在手机打开“菜单”，测试 Escape、页面返回和语言切换。

## 变化与保留

小屏导航按需展开；项目搜索增加可见标签、结果数和清除入口，输入法组合期间不筛选；文档面包屑显示当前篇名；普通正文保持阅读宽度，地图模板使用宽版；统一内页标题、行距、按钮和焦点。

红黑米白主题、字体资源、小图标、首页艺术与游戏单条布局保留。M07/0.4.3、W02、所有地图、游戏任务和源码下载不改。site-router.js 仅同步一次 experience 模块的资源 URL，路由算法及转场实现不变；不把这描述为路由源码逐字节不变。

## 回退

使用安装器输出的真实备份路径：

```powershell
node apply-update.mjs --target "仓库路径" --rollback "备份绝对路径" --check
node apply-update.mjs --target "仓库路径" --rollback "备份绝对路径" --apply
```

安装后的新编辑会阻止回退；无关新文件保留。不要用 payload 整目录覆盖，不要提交本包 ZIP、备份或测试输出。

## 阅读顺序

START_HERE → AUDIT_AND_RESEARCH → COMPONENT_CONTRACT → TEST_REPORT → ACCEPTANCE → HANDOFF_R23。

本包在本地验证，未部署。完整品牌图片/字体、真实 HTTP/ESM、浏览器往返、Windows、实体触控、读屏和完整英语仍需实机验收。没有 Lighthouse 分数、转化率、无障碍认证或“全站完美”的声明。
