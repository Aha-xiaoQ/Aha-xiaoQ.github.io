# 外部规范与核验来源

R01 使用的公开技术说明。资料不是项目实际完成情况；实际结果以 VALIDATION 为准。

- [GitHub 创建 Fork PR](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork)
- [GitHub 贡献说明](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors)
- [GitHub Issue 表单结构](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms)
- [GitHub CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [GitHub Actions 安全](https://docs.github.com/en/actions/reference/security/secure-use)
- [GitHub Pages 发布源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub 许可说明](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)

CI 依赖固定在官方仓库提交，而不是可移动标签。记录：checkout v7.0.1 对应 `3d3c42e5aac5ba805825da76410c181273ba90b1`；setup-node v7.0.0 对应 `820762786026740c76f36085b0efc47a31fe5020`。后续升级要重新读取官方版本、核实完整提交并单独审阅，不能只改注释。
