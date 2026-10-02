# 本轮本地验证 / Local validation

状态：独立来源复核、完整源码检查及本地公开产物检查已完成。

- 固定 Git 基线：`4bc75da9e038a45886a119b1d8c16402990702c9`
- 本地环境：Node.js v24.19.0；源码要求 Node.js 22+
- 先取得稀疏源码后补齐全部基线资产，未变更既有作品、地图、美术、字体、录音或下载 ZIP 的字节
- 精确清单检查与新增回归测试：已执行，7/7 通过
- 路径安全、编辑模型/交互、手柄、房间选择、协作状态：48/48 通过
- `npm run collab:build`：已更新 `dev/project-data.js` 与 `collab/TASKS.md`，最终 `--check` 同步
- `npm run journal:build` 与 `npm run site:build`：通过，生成器报告 0 变更
- 初始稀疏 checkout 的 `npm run check` 因缺少被主动排除的字体而停止；补齐后重新检查，不能把这个初始环境缺失误报为功能回归
- `npm run check`：完整 aggregate 检查通过；包含本次许可检查
- `npm test`：27 组 Node 测试，共 1975/1975 通过，0 失败/跳过；包含本次 7 项许可回归
- `npm run release:test`：145/145 通过
- `node --check scripts/oss/check.mjs` 与 `node --check tests/oss/license.test.mjs`：通过
- `npm run release:prepare` / `npm run release:check`：最终本地公开产物生成与检查通过；初次 prepare 因源文件 LICENSE 在检查期间更新而正确拒绝写入，最终重跑已通过。没有推送或部署
- 独立只读审查扫描全部最初 351 个候选源码的来源/通知/内嵌数据及身份，并对编辑器与既有 Terra/第一期/runtime 源码做 clone 比对；排除三个混合适配器后，348 个原创组成部分范围保留。HUD 位图字体表另行明确排除。这是有限来源审查，不是全仓法律清理证明

远端基线 CI 的三个成功运行仅适用于历史基线，见 [MAINTAINER_AND_CI.md](MAINTAINER_AND_CI.md)。本地补丁尚未提交或推送，尚无该补丁的远端 CI。

本轮不包含浏览器视觉/全部设备/实体手柄/自然通关验收、第三方素材法律清理、厂商 GLB/PDF/ZIP 来源证明、独立 Q咪仓库和历史下载包的重新授权，也不提交申请。
