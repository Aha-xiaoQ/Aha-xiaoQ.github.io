# R08 实现与扩展

源事实 content/site-data.js → 表现 content/presentation.json → workshop-media/workshop-cards → 静态集合构建与运行时同源组件。
开发项目资料 content/development/ → journal/model → journal/render → 原站 shell/router。
本轮没有迁移到 React、Next.js 或 Astro。借鉴成熟项目的内容契约和组件边界，但不为一个展示层变化引入第二套框架。

## 可复用部分
`scripts/lib/safe-path.mjs` 是所有本轮构建/安装入口的共同文件系统边界，不再每个安装包各写一份 existsSync 检查。
`assets/illustrations/*.svg` 共用风格与尺寸，用途命名；workflow.svg 被项目卡和开发工具类别复用。通用组件不按具体项目 ID 硬编码配图分支。
`categoryLabel` 为素材记录可选字段，1–24 字；渲染时转义。它是表现分类，不替代内容 tags 与许可声明。旧记录无此字段仍兼容。

## 新项目
新增项目仍使用 journal:add，默认草稿；选择 game/web/tool/experiment/other 类别即可获得适合的基础图形。作品页自定义图可在 presentation.json 指定 image+interface 或既有六种预设，不需要新增路由。

## 构建与缓存
site:build 与 journal:build 继续生成受哈希保护的文本页面。模块 URL 和外层页面缓存标识更新为 workshop-r08；site-router.js 的源文与动画不修改。R07 的 generated-pages.json 路径继续沿用，record.version 记录 R08，避免遗失旧生成所有权。

## 未做
没有素材压缩、真正 srcset、全站框架替换、后端协作或在线自动发布。没有把源数据改成美术专用副本。原静态构建会执行可信工作区的 JS 数据；运行未知 PR 的构建必须处于低权限无密钥环境。

## 文本换行与所有权记录

生成页面的比较只允许 UTF-8 文本的 LF/CRLF 换行等价，不忽略空格、内容或其他编辑。用于完整性检查的生成结果保持统一 LF；安装备份、收据与回退仍记录原始字节。已测试 R07 生成文件转换为 CRLF 后应用，以及 R08 生成文件再转换 CRLF 后两套构建器的 --check。此测试不是 Windows 原生执行，不能替代操作系统矩阵。
