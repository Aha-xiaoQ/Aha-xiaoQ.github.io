# 协作与发布职责

维护者负责玩法方向、整体审美、合并和发布；贡献者负责小范围源码、测试和资料；审阅者检查范围、接口、回归和资源权利。架构登记中的 reviewerRole 是职责分类，不表示人员任命。

推荐启用主分支保护和必要 CI 检查，但本更新只交付文件，不修改远端设置。CODEOWNERS 只是审阅入口，不是文件夹写权限。单维护者场景不要配置一个自己无法满足的双人审阅硬门槛。

状态顺序：planned → ready → in-progress → local-verified → reviewed → released；blocked 单独说明前置条件。代码测试通过不代表真实设备通过；源码包交付不代表已发布。docs/TASKS.json 保留 nullable 的实际 Issue、PR 与负责人。

外部 PR 用低权限、无发布密钥的 pull_request 工作流；不使用 pull_request_target 执行不可信分支。现有 Actions SHA 继续固定，不自动更新依赖。远端工作流状态只能在真的运行后记录。

发布流程：确认原始底稿不变 → verify → 必要人工验收 → pack → 解压源码复测 → 更新网站源码 ZIP/JSON/资料页 → 审阅 diff → 由维护者审阅并推送。任何新编辑后旧候选 SHA 的验收必须重新评估。

## 候选发布门禁

`npm run release:check` 只校验 docs/RELEASE_REVIEW.json 与当前候选 SHA、各项证据及审阅字段。默认全部 pending，失败是预期状态，不纳入普通 PR 的 verify。维护者完成真实 HTTP、设备、通关、音频、资源权利等验收后才填 pass；脚本不能鉴定证据真假或授予许可，也不部署。候选改动后旧记录不再匹配。
