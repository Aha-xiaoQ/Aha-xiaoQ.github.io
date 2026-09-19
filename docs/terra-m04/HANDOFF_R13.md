# R13 交接：第三期 M04 / 0.4.0

日期2026-09-17。本地发布候选；源头仍为第三期用户上传包。不存在“因为叫最终包就已经上线”的含义。

## 当前入口
当前网站资料：/notes/mario-mix/docs/terra-source/；协作：terra-collaboration/；实验关卡：terra-stages/。
当前工程packages/mario-mix-terra；公开快照downloads/source/MarioMix_Terraria_M04_Source.zip。

## 已交付
24模块、4桥接、33compat；新迁出物品定义/掉落计划，收紧场景事件与退出清理。legacy驱动仅服务已有封闭第三期，不接受配置上看似成功、实际忽略的自定义地图。geometry平台驱动保持实验。

## 页面组织
资料页三个主要入口；旧版本/过程资料使用archived字段，原生details默认折叠。doc.action描述主要源码动作，不为某个项目写死模板。原项目配置全文保存在history/project-before-r13.json，游戏源码内M01–M03文档和旧站点下载不动。保留R12小手柄/浏览器、6项导航、现有CSS和转场。新版模块使用r13缓存号，其余视觉资源仍r12。

## 验收与责任
自动结果见测试报告，Windows/真实网络/设备/自然通关/素材许可/外部PR另验。发布审批绑定候选SHA；版本升级不替别人签字。用户手动push。未完成的真实actor跨地图接入不是这一版已具备能力，继续保留READINESS说明。

## 后续规则
本次冻结新增范围；当前只处理阻断发布的回归。下一功能周期再迁出真实actor、库存会话、存档接口及原版城堡机关，不在发布收尾中暗加场景或换引擎。先读工程docs/HANDOFF_M04.md，再选docs/TASKS.json中的小任务。
