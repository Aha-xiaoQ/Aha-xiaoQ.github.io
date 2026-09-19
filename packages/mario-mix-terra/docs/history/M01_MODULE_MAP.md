# 源码地图与接入点

|源码|独立程度|真实接入|
|---|---|---|
|src/simulation/eye-boss.mjs|独立工厂|R05Eye 创建、基础伤害和状态行为；后续装备修正仍经兼容层|
|src/simulation/platform-builder.mjs|独立工厂|隐藏场景 r05Builder 建造、存档与下穿规则|
|src/content/level-13.mjs|独立工厂|SandboxTrioLevel13.compile 生成关卡初始数据|
|src/input/logical-input.mjs|独立工厂|早期 SandboxTrioControls 逻辑输入；后期设备捕获未全部迁出|
|src/input/stick.mjs|纯函数|t17Stick 显式转发摇杆死区计算|
|src/content/actions.mjs|配置工厂|T21_ACTIONS 的键鼠/手柄默认动作配置|
|src/ui/key-label.mjs|纯显示函数|t21KeyLabel 的按键名称格式化|
|src/runtime/fixed-step.mjs|依赖注入|最终 RAF 循环调用 update/draw/isManual|
|src/ui/console.css|样式源|原游戏 CSS 提取，未全面重做 HUD|
|src/app/index.template.html|模板源|保留原注释/权利声明/布局，候选修正画面 aria 标签与缩放限制|
|src/compat/*.js.part|共享闭包片段|按 build.config.json 排序装配；不是独立模块|

## 兼容区主分组

00：启动/基础循环/音频及早期角色。
10–21：底稿继承的早期关卡与渲染适配。
30–37：第三期主线、隐藏场、战斗、装备/坐骑、角色展示和物资。
38–45：地下、挖掘、HUD、生态、输入所有权、库存事务。
46–48：改键界面、原始素材补充、隐藏重战。
90：最终循环和测试入口。

精确排序以 build.config.json 为准；编号是稳定片段 ID，不是运行阶段优先级的自动推断。
