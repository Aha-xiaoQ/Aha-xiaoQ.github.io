# 本轮参考与使用范围

- 本项目 Bill 控制片段与运行入口：见 SOURCE_AUDIT.md。只对已读取并哈希核对的内容做等价拆分。
- GitHub Secure use reference：https://docs.github.com/en/actions/reference/security/secure-use 。用于低权限 PR 工作流和不持久保存凭证的原则。
- GitHub 防止 pwn requests：https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/ 。未受信任 PR 与生成产物不进入有发布密钥的环境。
- Node.js v22 test runner：https://nodejs.org/download/release/v22.17.0/docs/api/test.html 。使用内置 node:test / assert / vm，不引入第三方测试依赖。
- SMBC 的此前架构研究仍在原项目参考资料中；本轮没有移植其 ActionScript 或素材。

读取日期：2026-09-15。在线文档和 Action 版本可能改变，后续升级须重新审查并固定提交；不要把此记录视作自动更新。
