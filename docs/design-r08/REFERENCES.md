# R08 参考研究与采用范围

核对日期：2026-09-16。参考信息架构和工程方法，不复制作者的个人标识、文案、图片或整套视觉。下面“采用”是本项目的设计决定，不表示来源作者使用了我们的具体实现。

| 第一方来源 | 观察与采用 | 没有照搬 |
|---|---|---|
| Anthony Fu： https://antfu.me/ 与 https://antfu.me/projects （源码入口 https://github.com/antfu/antfu.me） | 项目按领域和关注重点组织，每个项目用名称和简短用途说明；本轮把用途分类与开源属性分开 | 不复制其手写风格、个人文案与资源，代码许可不外推到图片 |
| Brittany Chiang： https://brittanychiang.com/ （另参考公开 v4 仓库 https://github.com/bchiang7/v4） | 项目条目以可读摘要、截图和少量技术信息为主；用于确定游戏一条一行的阅读节奏 | 当前站与 v4 不是同一版；不声称移植代码，不复制深蓝配色和个人品牌 |
| Paco Coursey： https://paco.me/ | Building / Projects / Writing 分区，条目一句话说明；借鉴减少无效装饰文字和明确内容职责 | 没有因首页介绍推断其仓库全部开源，没有搬用源码或配图 |
| Astro 内容集合官方文档： https://docs.astro.build/en/guides/content-collections/ | 用一致的数据结构与校验组织内容；继续维护事实、表现、渲染和构建的分离 | 这是架构参考，未安装 Astro，也不夸称已具备其完整能力 |
| Node.js 官方 fs： https://nodejs.org/api/fs.html | lstat 对链接本身取状态，只有明确 ENOENT 才是缺失；本轮修复路径授权与跨平台测试 | 不把检查/写入两步当作绝对无竞态沙箱 |

本轮新增 SVG 是自行编写的几何示意组件。现有游戏封面和 Q咪仍保留各自来源与权利声明；参考资料不构成重新授权。
