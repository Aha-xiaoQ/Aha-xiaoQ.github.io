# 本轮基线与读取范围

仓库：`Aha-xiaoQ/Aha-xiaoQ.github.io`。
只读核对日期：2026-09-14。
当时 `main`：`ed76f0b668a9e7c1a8d8f71bed2489cb2b063c9e`；提交信息为 `fix(site): complete WenKai coverage for game UI`。

## 可复核的原文件

| 文件 | 原始 Git blob SHA | 核对方式 |
|---|---|---|
| README.md | 168799c39cbe15ec154934e84acd7f217fe6a298 | 完整文本读取，本地 Git blob 哈希一致 |
| assets/site-shell.js | 4c58089ede125b1810c6e8efde5571e39361879b | 分段读取完整文本，本地 Git blob 哈希一致 |
| games/mario-mix-2/play.html | 4db128c0395b84f8f395cfe22c2c5b1f7d63ec69 | 树元数据读取，大小 11,059,534 字节 |
| games/mario-mix-3/play.html | 06de383f89098912e69c0302b695fcd5433f64f1 | 树元数据读取，大小 12,022,740 字节 |

另读取了整站内容数据、路由、更新守卫、权利说明及相关目录，用于判断接入点与保持范围。未下载全仓全部二进制资产，未检查全部游戏内部实现。

本轮仅修改两个原文件并新增协作文件；不修改第三期 HTML，不把聊天中的 R28 / R31 等名称当成经过核对的完整源码版本映射。

基础 SHA 不会自动跟随用户推送而更新。下一轮先重新读取远端，记录新的读取时间与起点，再生成增量包。`collab/runtime-baseline.json` 是本轮历史快照，若建立新快照需保留原证据或写入新版本记录。
