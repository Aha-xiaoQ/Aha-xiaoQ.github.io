# M02 / R10 交接

## 范围
继续用户上传第三期泰拉瑞亚；前两期、未完成城堡、主站视觉和稳定试玩不动。M01 原始 SHA 和所有内嵌媒体保持。

## 本轮
七个新模块接入，总共15个。重点是配置、键盘路由、捕获、设置生命周期与监听器清理；其余兼容区依然有共享状态。架构门禁与任务工具已实现。菜单外观没有重新设计；有意修复见 BEHAVIOR_CHANGES_M02。

## 继续前先做
1. verify、arch:check、tasks，阅读 TEST_REPORT_M02 的真实边界。
2. 核对用户本地是否已修改工程；未知文件不能直接用更新包覆盖。
3. Windows、真实手柄、HTTP/ESM、配置刷新先复验；没有结果就维持 ready。
4. 选择 M02-LABELS 等小任务完成第一份外部 PR，再进入 M03 库存事务。世界/房间和音频所有权另开任务，不同时重写。

## 源与发布
模块登记：architecture/modules.json；任务：docs/TASKS.json。生成表：docs/generated/MODULES.md。更新源码后 pack，网站同时更新 M02 ZIP/JSON 与 terra-source 子页。新文档页集中到 /notes/mario-mix/docs/terra-collaboration/。不新建导航或页面壳。

本轮未推送、未启用远端分支保护、未创建外部 Issue/PR。docs/history 保留 M01 文档，不抹掉曾经未验收的边界。
