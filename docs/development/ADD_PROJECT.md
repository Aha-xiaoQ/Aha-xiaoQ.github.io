# 新增一个项目

在已应用 R04 的原仓库根目录执行（仅创建本地文件，不会公开或推送）：

```sh
npm run journal:add -- --id my-tool --title "我的工具" --category tool
```

生成项目 descriptor 与独立状态 JSON，并登记到 catalog。ID 不应随展示名称改动；命令默认 visibility=draft，所以不在栏目首页展示。

## 发布前补齐

认真填写面向观众的 summary/intro、当前阶段、最多三个重点、真实的体验或源码链接、参与范围。没有链接可先留空，不做死按钮。文档和任务依据实际进度填写，不能复制混合马里奥的内容冒充新项目。

修改 `content/development/projects/my-tool.json` 为 `visibility: "public"` 后执行：

```sh
npm run journal:build
npm run test:journal
```

会生成 `/notes/my-tool/` 及任务/资料/更新/参与/交接页面。无需修改 `site-shell.js`、`site-router.js` 或复制 renderer。项目内容仍应人工检查；构建成功不代替编辑审核。

## 归档与撤回

完成维护后可设为 archived：首页活跃列表不再显示，归档过滤及原项目直达保留历史。draft 为暂不公开展示，构建器撤回自己生成且未编辑的页面；不会删除源码任务和历史内容。

## 常见冲突

同名 ID、同名 descriptor/state、未知状态、循环依赖、完成无依据会停止。生成文件已被手改也会停止；应把更改转回 JSON，不要删除新编辑强行构建。脚手架不会自动合并重名项目。

模板创建后再次登记相同 ID 会报错，不是“更新项目”命令。已公开页面的旧地址迁移需显式设计，不能只改 ID 造成旧链接失效。
