# 发布目录与部署边界

## 先核对，再部署

```sh
npm run check
npm test
npm run release:test
npm run game:build
npm run release:prepare
npm run release:check
npm run release:serve
```

开发服务器默认是 `http://127.0.0.1:4173/`；检查最终公开产物应使用 `http://127.0.0.1:4197/`。`release:prepare` 内部从实际源数据生成公开页面，不需要手工编辑公开目录。`release:check` 绑定源码与产物，源文件变化后需重建。

公开目录是 `.local/publish`，包含网站、稳定游戏、必要素材、明确公开的下载和地图册；不会复制松散的测试、交接、备份和管理工具。保留版权与来源说明，源码 ZIP 内的测试和文档属于正常开发资料。

## Pages 配置

发布前检查仓库的 Pages Source。根目录部署不会自动使用 `.local/publish`；构建检查通过也不等于部署完成。

维护者应在仓库 Settings / Pages 将 Build and deployment 的 Source 改为 **GitHub Actions**，随后审阅 `docs/release-r24/pages-workflow.example.yml`。示例通过 actions/upload-pages-artifact 指定 `.local/publish`，并用手动触发与版本绑定的审批控制部署。

先在完整浏览器验收公开目录，再运行 `npm run release:review` 生成待填写记录。记录不能自动批准；确实验收通过后，按现有 PUBLISH 指南将该版本记录放到 `.github/publication-approval.json`，并配置工作流。自动检查只验证产物；部署应使用真实、与当前版本对应的审阅记录。

参考：
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
