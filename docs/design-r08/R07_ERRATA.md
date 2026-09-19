# R07 报告勘误与升级门槛

用户在 Windows 实测 R07 新增测试为 41 通过 / 1 失败；失败与 safe() 使用 existsSync 导致悬空链接漏检相关。这个结果应作为发布阻塞问题，不是外观问题。

本轮已在 Linux 构造悬空目录链接，确认 `existsSync(link) === false` 且 `lstatSync(link).isSymbolicLink() === true`，旧 safe() 没有拒绝。原始重现 JSON 随包 validation/r07-defect-reproduction.json 提供。

保留 docs/design-r07/TEST_REPORT.md 的历史原文，不改写当时的测试记录。在此明确撤销“R07 最终 ZIP 已验证即可等同全平台可发布”的推论。Windows 原生测试与完整站点验收未被此前离线夹具覆盖。

R08 修复后仍需要维护者在 Windows 复跑，记录真实日志。未经复跑，不应写“Windows 通过”或“全平台最终版”；如果新结果失败，应保留工作区、报告日志，不删除测试或倒退源码绕过检查。
