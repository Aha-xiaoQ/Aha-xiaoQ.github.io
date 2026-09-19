# R06 · 作品组件与开发栏目

本轮是 **R04 / R05 之后的界面增量**，不是整站替换或游戏玩法版本。对外栏目名由“开发日志”收敛为“开发”，既有 `/notes/` 地址、项目 ID、任务来源和草稿键不变。

## 阅读顺序
1. `HANDOFF_R06.md`：已做什么，没做什么，下一步。
2. `DESIGN_SPEC.md`、`COPY_GUIDE.md`：视觉与文案的持续约束。
3. `CHANGELOG.md`：实际修改范围。
4. `ACCEPTANCE.md`、`TEST_REPORT.md`：复验步骤、已测和未测的边界。
5. `REFERENCES.md`：参考来源及采用点。

先保留好本地工作区，运行更新包的 `--check`；没有冲突再 `--apply`。应用后在原仓库运行 `npm run check`、`npm test`，沿用 `npm start` 或 `npm run dev`。更新包没有 npm 依赖，不联网、不执行 Git、不自动发布。

重要旧记录仍在 `docs/development/`、原状态源和 `packages/mario-mix/docs/`。R06 只替代它们关于当前显示名称和作品卡片视觉的旧决定，不否定历史测试，不将未完成任务标成完成。
