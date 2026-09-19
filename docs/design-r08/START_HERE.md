# R08 · 安全修复与作品展示

状态：本地增量交付候选；不是线上已发布，也不是全平台最终验收。

先读本文件 → SECURITY_R08.md → CHANGELOG.md → ACCEPTANCE.md → HANDOFF_R08.md。设计与依据见 DESIGN_SPEC.md / REFERENCES.md；组件和素材约定见 ARCHITECTURE.md。

## 当前约定
游戏集合每个项目占一整行：桌面左图右文，820px 及以下同一张卡片内上下排列。项目集合仍可双列。不要再按首项或筛选结果切换卡片面积。

小Q工作流以“开发工具”作为首要分类；“开源”仍保留为源内容中的属性，不删除或扩大许可证。用任务清单、代码分支与检查的示意替代无语义的方框。开发目录的游戏仍用手柄，网站用可识别的浏览器页面，删除统一英文小标语。

## 代码入口
- scripts/lib/safe-path.mjs：安装器、作品构建、开发构建共用路径检查。
- assets/workshop-cards.js / workshop-components.css：作品集合组件。
- content/presentation.json：按稳定内容 ID 选择素材、展示方式和分类标签。
- assets/illustrations/：本轮自绘 SVG 示意，不依赖外部库或字体。
- assets/journal/render.mjs / journal.css：开发目录组件。路由和原始页头不变。

## 验证入口
运行 npm run test:security、npm run test:r08、npm run test:r07，然后 npm run site:build、npm run journal:build、npm run check、npm test。
Windows 用户复跑上述命令后，再记录 GitHub Actions 的 Windows job 结果；不能把本地 Linux 结果或工作流配置文件视为 Windows 已通过。

正文、任务 JSON、原游戏与 R05 工程不重置。新资料优先于旧版冲突规则；历史报告保持原文，勘误单独附录。
