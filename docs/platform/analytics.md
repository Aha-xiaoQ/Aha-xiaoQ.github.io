# 访问统计维护

[English](analytics.en.md)

公开页脚的本人排除开关、说明和使用指南已于 2026-10-03 撤回。审阅基线：`0c771ad1c4458f3b7c1e5585fc410db8a4395283`。实现为 `assets/site-analytics.js`，回归为 `tests/analytics/privacy.test.mjs`。

## 已保存偏好与管理边界

既有同源 `localStorage` 中的 `xiaoq-stats-owner-excluded=1` 继续排除该浏览器的访问；本次撤回不删除或改写用户偏好。它是布尔设置，不是账号或身份验证。公开页面不显示管理控件，也没有仅维护者可见的已认证入口。本仓库的维护文档仍是公开源码，不能当作私人管理页面。

`SITE_ANALYTICS.getState()` 供维护检查状态；`setOwnerExcluded(boolean)` 保留既有兼容接口，只设置偏好，不生成 PV、不刷新或插入控件。该接口不能识别使用者身份。保存失败时仅当前文档保留选择，不承诺持久生效。已经载入的独立 Cloudflare beacon 需重新加载文档才能遵守初始加载排除，已经上报的访问无法撤回。其他同源标签页读取偏好变化，后续聚合访问遵守新状态，不自动刷新。

## QA 参数与计数语义

- `?stats=off` 保留原来的标签页 QA 排除。`sessionStorage` 可用时跨路由和刷新生效；不可用时当前文档仍排除，重开链接需保留参数。
- `?stats=on` 只撤销 QA 排除，不覆盖已保存的本人偏好或 `__XIAOQ_ANALYTICS_DISABLED__`。关闭本人排除也不撤销 QA 排除。
- 聚合 POST 仅在正式 HTTPS 域名、顶层页面且没有排除时发送，负载仍只有规范化 `path` 和 `visitStart`；不发送查询、锚点、来源或访客 ID，保留 `credentials: omit` 和 `referrerPolicy: no-referrer`。
- **PV** 是页面访问次数。同一文档连续同路径事件、语言/查询/锚点切换、`/index.html` 别名和重复初始化不重复计入；A → B → A 分别计入，真正刷新可以新增 PV。
- **visits** 使用标签页最近一次计入 PV 的时间：空会话或至少 30 分钟间隔时 `visitStart=true`，近期为 false。重复事件不续期，排除期间不更新时间；存储不可用为 null。复制标签页或 opener 复制会话存储可能继承时间。

visits 不能称为 UV、独立人数或确认真人；没有新增机器人识别或停留时间过滤。unknown、未归类 404 和历史计数规则保持原样。

## 验收边界

本次只撤回公开入口，不修改后端数据库、schema、secret、旧统计、审核或权限，不增加 IP/UA 持久记录，也不承诺既有服务没有日志。前端去重不能保证后端并发去重或确认真人。后续私人管理页面必须有实际身份验证，不能靠查询参数、隐藏地址或本地布尔值冒充权限。

`npm run test:analytics` 验证排除和计数兼容；`npm run analytics:browser` 在隔离临时浏览器的本地发布产物中核对公开控件消失、既有偏好保留及存储不可用场景，不制造正式统计流量。
