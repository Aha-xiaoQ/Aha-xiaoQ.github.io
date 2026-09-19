# R05 源码核对记录

日期：2026-09-15。通过 GitHub 只读连接再次核对 main 为 ed76f0b668a9e7c1a8d8f71bed2489cb2b063c9e。没有推送、创建分支或修改权限。

| 文件 | 核对层级 |
|---|---|
| games/mario-mix/play.html | 入口/脚本尾部及部分页面文本；实际加载 pickup-config.js、classic-mix.js |
| games/mario-mix/classic-mix.js | 控制区块、角色调用、测试钩子等行段，未完整下载 |
| games/mario-mix/bill-controls.js | 全部 1643 字节；本地复制的 Git blob 与远端完全一致 |
| games/mario-mix-2/play.html | 本轮目录元数据：11059534 字节，blob 4db128c0395b84f8f395cfe22c2c5b1f7d63ec69 |
| games/mario-mix-3/play.html | 对话中已读取元数据：12022740 字节，blob 06de383f89098912e69c0302b695fcd5433f64f1；未完整下载 |

生产锁写在 baseline.json；Git blob 算法为 sha1("blob "+byteLength+"\0"+bytes)，文本核对允许 Windows CRLF 归一化。

关键发现：bill-controls.js 已嵌入运行闭包，HTML 并不独立加载它。R05 通过已锁定运行文件的唯一块替换，连接真正生效的候选代码，避免改片段不生效。

边界：直接 HTTP 下载/归档未成功（容器 DNS/下载访问失败）。没有完整游戏副本，不能声称真实游戏已运行、全量 AST 已盘点、II/III 已完成抽离，也不能确定用户其他对话的最新 HTML 等于公开 III。用户在完整仓库运行 game:audit 后，会得到实际文件报告；如不同则保留新版，另做适配。

源链接：
- https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/blob/ed76f0b668a9e7c1a8d8f71bed2489cb2b063c9e/games/mario-mix/classic-mix.js#L462-L472
- https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/blob/ed76f0b668a9e7c1a8d8f71bed2489cb2b063c9e/games/mario-mix/play.html#L135-L136
- https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/blob/ed76f0b668a9e7c1a8d8f71bed2489cb2b063c9e/games/mario-mix/bill-controls.js
