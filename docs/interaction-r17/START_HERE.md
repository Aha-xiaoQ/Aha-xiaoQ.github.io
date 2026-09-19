# R17 · 链接与交互细节

网站专用增量，接续 R16。游戏仍为 0.4.2 / M06，没有重打包或替换游戏。当前是本地交付，维护者审阅后手动推送。

## 阅读顺序

1. CHANGELOG.md：哪些界面发生变化，哪些保持不变。
2. DESIGN_DECISIONS.md 与 ACTION_CONTRACT.md：后续页面复用规则。
3. RESEARCH.md：三轮研究、采用与不采用的做法。
4. ACCEPTANCE.md 与 TEST_REPORT.md：实际检查与发布前实机清单。
5. HANDOFF_R17.md：下一次维护从哪里接手。

## 本地检查

```sh
npm run ui:check
npm run test:ui
npm run journal:build
npm run site:build
npm run release:preflight
npm run check
npm test
```

继续用现有 npm start 或 npm run dev 启动网站，查看 /notes/、/projects/、/games/、/tools/ 和首页。不要把单页双击预览当作真实路由验收。构建产物包含样式与脚本版本号；初次检查可以强制刷新。

本包只减少导航装饰与重复点击目标。文章中的流程箭头、代码示例、历史记录、游戏箭头和折叠状态提示不属于替换范围。
