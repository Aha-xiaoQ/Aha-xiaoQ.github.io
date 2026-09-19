# 维护者设置清单

本文件是待办与操作指引，不是已经生效的 GitHub 配置。R01 制作时没有执行远端写入；只读基线返回 main 未受保护。上传 `.github` 文件不会自动替你设置保护规则。

## 先把文件推上去，再检查功能

维护者先在本地完成更新包检查、应用和浏览器验收，手动提交推送。确认 Actions 中出现 `Collaboration checks`，其中 job 为 `collab-checks`。该流程验证协作工具与入口文件，不代表游戏通关验收。当前包没有任何部署工作流，不更改已有 Pages 发布源。

在 GitHub 手动检查：

- Issues 功能是否开启，点击 New issue 是否显示问题、任务、素材三个表单。卡片编号不是远端 Issue；首次需要手动创建并把最终 URL 回填状态文件。
- 打开一个小型测试 PR，确认贡献指南、PR 模板与 CODEOWNERS 请求的审核者符合预期。
- 仓库 Actions 设置允许这两项固定 SHA 的官方 Actions；第一次外部贡献运行可能需要维护者批准。
- 成功运行一次 `collab-checks` 后，再选择它作为必需检查。不要选择不存在的检查名。

## 保护 main

在 Settings 的 Rules / Rulesets，或 Branches / branch protection 中，针对 main 设置。界面会随 GitHub 更新，以当前官方页面为准。

建议需要 PR 合并、要求 `collab-checks` 通过、解决对话、禁止强制推送与删除。外部网友通过 Fork 提交，不需要获得仓库写权限。初期只有一位维护者时，先确认自己的文档维护/紧急修复路径：PR 作者不能批准自己的 PR，不要在没有第二位审核者时把所有写入方式锁死。必要例外只给明确的维护者，并记录其适用条件；不能把例外扩大给所有人。

CODEOWNERS 只是请求审核的归属规则。要强制其审核，需配合分支规则；它不是文件夹写权限隔离。根目录默认归 Aha-xiaoQ 维护，后续只有在实际确认维护者身份和职责后再添加用户名。

## 外部 PR 的安全边界

现有 workflow 使用公开托管的 runner、`pull_request`、只读 contents 权限、不保留 checkout 凭据。没有生产 secrets、自托管 runner、自动部署或高权限 `pull_request_target` 执行外部代码。无论检查是否通过，仍应审阅源码、依赖变化和 CI 改动。不要通过高权限后续流程执行未经审核的产物。

本轮不搭建 PR 在线预览。后续若搭建，使用与个人主站隔离的域/环境；不能仅靠不同路径当作安全隔离。

## 验收后更新状态

`OPS-001` 记录推送的实际提交和线上验收结果；`COL-004` 记录实际 Actions/表单/CODEOWNERS 验证链接。需要保护规则生效的事项，记录核实方式。不要把“文件已上传”写成“所有权限已设置”。然后调整 `nextTask` 指向 `SRC-001`。

参考 GitHub 官方说明：[贡献指南](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors)、[分支保护](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)、[CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)、[Actions 安全](https://docs.github.com/en/actions/reference/security/secure-use)。
