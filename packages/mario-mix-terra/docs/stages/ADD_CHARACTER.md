# 增加原型角色方案

当前脚手架创建的是参数化几何角色。完整泰拉角色、帧动画、武器和坐骑尚不支持直接跨地图复用。

## 创建与进入

```sh
npm run stage:new -- --kind character --id helper-rover --title "测试角色"
npm run stage:new -- --kind character --id helper-rover --title "测试角色" --apply
npm run stage:check
npm run dev
```

在角色 JSON 中设置 motion、capabilities 与 appearance。将 helper-rover 加入目标 stage 的 characters 数组，再校验并重启服务。

访问 `http://127.0.0.1:4193/play.html?dev=1`，打开侧栏关卡试验场并显示开发草稿，从目标关卡中选择角色。额外路线写入 overlays.helper-rover，不覆盖底图。

## 能力范围

已支持的移动参数可以通过配置扩展。攀墙、冲刺、投射物、坐骑和俯视移动需要相应机制模块；先明确状态、碰撞、输入、资源锚点和测试，再接入驱动。二段跳参数只提供二段跳，不包含特定原作角色的全部行为。

legacy-terra-v1 保留第三期固定组合，不能指定任意地图。音效引用必须来自已登记清单。

[新增关卡](ADD_LEVEL.md) · [能力范围](READINESS.md) · [数据契约](CONTRACT.md)
