# R18 · 网站查找、阅读与导航

这是 R17 之后的网站体验更新。游戏仍为 0.4.2 / M06，游戏源码、下载、任务数据、主站主题和小图标保持不变。源码仅在本地修改，发布与部署由维护者完成。

## 访问者入口

页眉“搜索”进入 `/search/`，可查找已公开的游戏、项目、工具、当前开发资料以及有真实链接的笔记。查询词、类型和页码写入地址，可分享给其他人。只索引标题、摘要、标签和资料章节标题；不是全站任意文件全文检索，不包含历史交接、管理页面、草稿、任务负责人信息或游戏源码正文。

“开发”目录的关键词、类别和页码同样保留在地址中。较长资料有可折叠目录和章节锚点。返回页面时恢复列表位置与内容区焦点；数据未能读取时保留可读的静态内容，提供重试。

## 开发命令

Node.js 22+，不需要安装新的 npm 依赖。

```sh
npm run journal:build
npm run site:build
npm run experience:check
npm run test:experience
npm run check
npm test
```

安装后 `journal:build` 和 `site:build` 都会顺带更新搜索索引。直接调用底层脚本时，另运行 `npm run experience:build`。

## 本轮文件

- `assets/experience/model.mjs`：公开索引契约、排序、查询状态与无副作用模板。
- `assets/experience/runtime.mjs`：搜索表单、延迟输入、重试、过期请求保护、页眉工具。
- `assets/experience/site-experience.css`：局部样式；沿用主题变量。
- `assets/site-router.js`：唯一的导航与转场入口，增加历史状态与失败恢复。
- `assets/journal/runtime.mjs`：开发目录筛选及页内重试。
- `scripts/experience/`：生成搜索页面、索引与校验。
- `content/search-index.json`、`search/index.html`：生成结果，不能直接编辑。

继续阅读 `DESIGN_AND_RESEARCH.md`、`ACCEPTANCE.md`、`TEST_REPORT.md`、`HANDOFF_R18.md`。
