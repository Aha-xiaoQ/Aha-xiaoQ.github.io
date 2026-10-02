# 维护者、项目范围与 CI 证据

**简体中文** | [English](MAINTAINER_AND_CI.en.md)

核验日期：2026-10-02。源码基线：`4bc75da9e038a45886a119b1d8c16402990702c9`。

## 维护角色

仓库 `Aha-xiaoQ/Aha-xiaoQ.github.io` 是公开个人作品站。`.github/CODEOWNERS` 默认审阅归属为 `@Aha-xiaoQ`，对应网站、协作工具与游戏工程。仓库元数据核验为公开且由 Aha-xiaoQ 所有；这里只记录维护角色，未改变权限。

CODEOWNERS 是审阅路由，不是目录访问隔离；没有据此声称分支保护或强制审阅已生效。新增维护者必须确认真实责任与访问权限。贡献入口见根 `CONTRIBUTING.md` 和 `.github` 模板。

项目包含静态网站、原生创作工具、独立实验与混合游戏来源。地图工具的 32 关是社区参考模板，不等于 32 关均完成独立原创、全部角色接入或自然通关。第三期开发候选、四期已发布试玩与第四期源码整理编号分别维护；本次许可补丁不改变游戏版本或玩法。

## 精确基线的真实远端运行

通过 GitHub Actions 只读接口，按该精确 `head_sha` 查询，得到以下三个已完成且 `conclusion: success` 的 **push** 运行：

| 工作流 | 运行 | 更新时间（UTC） |
| --- | --- | --- |
| Collaboration checks | [36907920805](https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/actions/runs/36907920805) | 2026-10-01 18:38:57 |
| Website platform regression | [36907920894](https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/actions/runs/36907920894) | 2026-10-01 18:41:09 |
| Mario Mix collaboration | [36907920959](https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/actions/runs/36907920959) | 2026-10-01 18:37:03 |

核验接口：`GET /repos/Aha-xiaoQ/Aha-xiaoQ.github.io/actions/runs?head_sha=4bc75da9e038a45886a119b1d8c16402990702c9&per_page=100`。这是历史基线的实跑证据，不能标成当前未提交本地补丁的 CI，也不能称为首次 PR 检查、模板展示、CODEOWNERS 请求或规则生效的验证。

工作流使用只读 contents、固定 SHA 官方 Actions、不保留 checkout 凭据。配置里的边界不保证所有第三方内容安全或已授权。CI 不是素材权利、科学准确性、真实设备、自然通关或部署的证明。

## 状态修正与保留事项

`collab/project.json` 不再写“GitHub Actions 未运行”，改为精确基线 push 运行已成功，并保留 `COL-004` 的待验收状态：首次 PR、表单显示、审阅请求和分支规则仍未在本次核实。`LIC-001` 标为进行中：本次完成部分原创组成部分和上游通知登记，但没有完成全部游戏素材权利审计。

`OPS-001` 没有因源代码在 main 存在而自动标成全部上线验收完成；未核验的设备、下载和线上操作仍保持待验证。旧协作/游戏记录的历史状态不作为新结论。

## 已发布的许可文档修订

2026-10-02 已普通推送源码 [`12e4afacbe4e24e1514bc80f5054e5c61bb7acae`](https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/commit/12e4afacbe4e24e1514bc80f5054e5c61bb7acae) 和 Pages 产物 [`70fe435adbc21306f6276bda0d759f371d079701`](https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/commit/70fe435adbc21306f6276bda0d759f371d079701)。源码精确提交的 [Website platform regression](https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/actions/runs/37026675085) 与 [Collaboration checks](https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/actions/runs/37026675494) 成功；精确部署的 [Pages 运行](https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/actions/runs/37027034009)成功。该文档修订未触发仅针对游戏工程路径的 Mario Mix 工作流。

上述是已发布许可文档修订的证据。后续双语维护提交必须按自己的新 SHA 再核验，不能继承这些运行结果。没有更改仓库权限或提交申请。
