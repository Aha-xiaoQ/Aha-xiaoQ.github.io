# R08 安全修复说明

## 已确认的问题
用户报告 R07 在 Windows 下有 1 个符号链接测试失败。旧 safe() 先调用 existsSync，再有条件调用 lstatSync。悬空链接的目标不存在，existsSync 返回 false，导致该目录项未被检查。这是跨平台的逻辑缺陷，不是 Windows 的错误；本轮在 Linux 用一个真实的悬空目录链接也复现了漏检。

R07 原测试把 `/tmp` 当成全平台已有目录，且没有显式指定目录链接类型。Windows 的路径解析可能使它成为悬空链接。R08 测试改用临时目录下的绝对目标，并在 Windows 显式用 junction；另有必跑的悬空链接回归，不是把失败测试跳过。

## 修复
`scripts/lib/safe-path.mjs` 直接 lstat 工作区根、其祖先和路径的每个已有目录项。只有 ENOENT 视为缺失；符号链接（含悬空链接及 junction）、非目录父级、权限错误和其他 I/O 错误均拒绝或继续抛出。

读文件在可用时附加 O_NOFOLLOW，并检查文件描述符的类型。写文件用独占临时文件、写前路径复检、rename；内容覆盖授权仍由调用方的前后哈希负责。

同一套实现由增量安装器、scripts/workshop/build.mjs、scripts/journal/build.mjs 复用。journal:add 与 handoff 通过原 build 导出使用新的检查。新输出允许父目录尚未创建，但不允许经过已存在的链接。

## 威胁边界
这是本地、单维护者工作区的误写与路径越界防护，不是操作系统沙箱。它不保证抵御拥有本地目录修改权的恶意进程在每次检查之间反复替换父目录；也不覆盖所有平台的 reparse point 类型、硬链接、恶意挂载或网络文件系统。构建时不要同时运行不可信程序，审阅后在独立工作区使用。哈希清单不是数字签名。

旧 R07 报告的“42 通过”只描述当时 Linux 测试，不应外推为 Windows 通过。R08 的 Windows 原生结果在交付时仍待外部验收。

## 复跑
`npm run test:security`。18 项专门检查覆盖悬空目录/叶节点/根/根祖先、普通链接、缺失输出、非目录父级、Windows 特殊路径及安全读写。

Windows 若不具备创建“文件符号链接”的权限，两项文件链接测试会显式 skip 并附原因，不能算 pass；目录 junction 与悬空目录测试仍必须执行。新增 GitHub Actions 的 ubuntu/windows 矩阵用于实际系统验证，工作流没有在本轮执行。

来源：Node.js 官方 fs 文档 https://nodejs.org/api/fs.html#fslstatsyncpath-options （核对 2026-09-16）。lstat 检查链接本身；exists/stat 会追随链接目标，不能承担链接授权边界。

## 文本换行与所有权记录

生成页面的比较只允许 UTF-8 文本的 LF/CRLF 换行等价，不忽略空格、内容或其他编辑。用于完整性检查的生成结果保持统一 LF；安装备份、收据与回退仍记录原始字节。已测试 R07 生成文件转换为 CRLF 后应用，以及 R08 生成文件再转换 CRLF 后两套构建器的 --check。此测试不是 Windows 原生执行，不能替代操作系统矩阵。
