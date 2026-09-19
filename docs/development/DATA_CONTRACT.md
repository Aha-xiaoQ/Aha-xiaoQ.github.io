# 数据契约 · schemaVersion 1

## 注册表

`catalog.json` 包含 title、intro、projects（id/file）、aliases（旧 from/projectId/view/可选 doc）。ID 只用小写字母、数字和连字符；不能使用 updates、contribute 等保留名称。项目 descriptor 路径必须与 ID 对应，ID 不重复。

## 项目 descriptor

必填：schemaVersion、id、title、summary、intro、category、visibility、stage、updatedAt、links、highlights、docs、updates、participation、state。

category：game/web/tool/experiment/other。visibility：draft/public/archived。highlights 至多三条。title 48 字以内、summary 160 字以内、intro 360 字以内。这是信息预算，不是自动截断用户输入。

links：label/href。只接受本站绝对路径与 HTTPS；拒绝 javascript/data、外部协议相对地址、用户名密码和路径穿越。原始正文先转义，不把 JSON 当任意 HTML 执行。

docs：id/title/summary/sections；section 包含 title、paragraphs、可选 code。可选 sources 提供可核对来源。文档数可增长，但概览不复制正文。

updates：id/date/title/summary/status，status 为 released/local-review/planned。只有证据表明线上发布时才改 released；不能仅凭“生成 ZIP 成功”更改。

participation：mode（open/preparing/closed）、summary、可选 issueUrl。open 也不等于自动授予仓库权限。任务仅在无负责人、前置任务完成时才显示“留言认领”；否则是讨论。

state：adapter（legacy-a/legacy-b/project-v1）及 path。旧适配还需 runtime（native/clarity），由安装器识别，不手工猜测。不要把另一项目指向同一旧状态以省事。

## project-v1 状态

schemaVersion、projectId、revision 正整数、updatedAt、tasks。任务字段：id/title/area/summary/status/priority/owner/evidence/notes/acceptance[]/dependsOn[]。编号在项目内唯一；引用必须存在、不能循环或自依赖；done 必须提供非空 evidence。

状态：planned/ready/active/review/blocked/done。priority：P0/P1/P2。不用任务百分比推导产品完成率。修改共享记录后递增 revision，并同步更新日期；导出草稿来自旧 revision 时先比较合并，不覆盖新版。

## 可见不等于保密

draft 只控制导航和 HTML 构建，不改变公开仓库/静态服务器能读取 JSON 的事实。不要放账号、密钥、私人评审或未获允许的个人信息。noindex 不是鉴权。本轮无服务器端权限系统。

## 状态同步

旧游戏：原工具导出 → 放回原状态文件 → 执行原 A/B 构建命令 → `npm run journal:build` → 校验 → 人工提交。

新项目：编辑独立 JSON → 递增 revision → `npm run journal:build` → 校验 → 人工提交。浏览器任务列表显示共享快照，不自动合并旧工具的本地草稿。
