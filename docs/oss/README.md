# 原创开源范围 / Audited original scope

本次只把有来源依据的原创组成部分纳入 MIT；不是全仓改标。固定基线为 `4bc75da9e038a45886a119b1d8c16402990702c9`，2026-10-02 核验。

- [逐文件清单](FILE_MANIFEST.json)：完整基线库存与每个文件的范围、Git blob、分类和证据；可按 `classification` 筛选
- [来源与例外](PROVENANCE.md)：原创、上游许可、未知来源、混合权利与待核验问题
- [复现与方法限制](REPRODUCIBILITY.md)：本地启动、单次创作记录与模型评测边界
- [维护者与 CI](MAINTAINER_AND_CI.md)：角色证据、精确提交与真实运行链接
- [本轮验证](VALIDATION.md)：执行过的命令、结果和未覆盖范围
- [根许可](../../LICENSE) 与 [权利说明](../../RIGHTS.md)：实际授权文本

## 使用清单

`original-MIT` 只授权该条目的 `scope` 所列原创部分，不能忽略排除项。`third-party-original-license` 表示保留原有上游通知；`existing-project-license` 表示保留项目此前已声明的许可（如 Q咪 CC BY-NC），不表示本站获得或授予原作的全部权利。`unknown` / `NOASSERTION` 表示本次不授予许可。`review: inventory-only` 只有路径与来源 blob 登记，不是逐字完成法律审查。

所有范围使用明确文件路径，不以目录通配符授权。混合文件仍可能含有被排除的第三方组成部分。新增文件及修改后的原文件不能只靠这一历史快照自动获得许可；应先重新审查来源和排除项。

## 本地检查

Node.js 22+，不需要 npm 安装：

```sh
npm run oss:verify
```

核验程序不访问网络、不上传、不推送。它检查清单结构、精确基线库存（本地 Git 对象可用时）、关键排除项、来源字节、原创 SVG 外部依赖、鹈鹕原始字节和保留许可。它不能判定版权归属，不能替代第三方授权、完整游戏/设备验收或远端 CI。

English: MIT covers only expressly reviewed original components. Unknown inventory entries receive no grant. Preserve original upstream notices, font terms and mixed game-rights exclusions. The checker is a consistency test, not legal clearance or a performance benchmark.
