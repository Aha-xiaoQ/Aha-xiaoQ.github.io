# R10 / M02 网站接入交接

2026-09-16。本轮基于已交付R09/M01，不改主站运行模板/路由/CSS、稳定游戏或旧任务状态。

## 两条入口
- /notes/mario-mix/docs/terra-source/ 更新到M02下载与模块地图；M01 ZIP仍保留。
- /notes/mario-mix/docs/terra-collaboration/ 新增架构边界、实际任务与贡献路线。

工程：packages/mario-mix-terra。登记：architecture/modules.json。任务：docs/TASKS.json。公开源码ZIP对应完整工程快照；除了既有生成物/本地输出，未知新源码需合并后重新打包。

## 实质变化
7个新增模块已经接入原第三期：配置模型、坐骑键分配、键盘路由、按键捕获、生命周期作用域、设置会话、设置表格视图。其余8个保持。33个兼容片段尚未完全迁出，不能当成33个独立模块。

设置内默认pad6上下文共享校验属于明确行为修复。所有权清理和延迟文件导入隔离属于实际边界加强，详见工程BEHAVIOR_CHANGES_M02。

## 协作不是只建目录
模块登记与架构门禁纳入verify；任务有修改路径、前置条件、验收依据和未认领标记。提供小PR路线与发布候选SHA门槛。根工作流仍沿用terra-m01.yml路径避免重复CI，名称与步骤升级到M02；配置不等于已远端执行。CODEOWNERS追加审核规则，不授予贡献者写权限。

## 下一步
先Windows、HTTP/ESM、真实手柄与设置刷新验收，再完成M02-LABELS等首个小PR。M03先库存交换事务，再房间/音频生命周期，不同时更换引擎或加入城堡。未核对的设备/授权任务保持未完成。

阅读工程docs/HANDOFF_M02.md及TEST_REPORT_M02.md。核对R10_INSTALLATION.json与当前源码；未来更新不能单靠旧文件名推测最新状态。用户手动提交和推送；本地成功不是线上部署。
