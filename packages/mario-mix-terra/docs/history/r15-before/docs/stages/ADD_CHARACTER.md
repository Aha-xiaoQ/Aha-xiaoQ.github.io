# 外部开发者：基于已有能力增加角色方案

```sh
npm run stage:new -- --kind character --id helper-rover --title "新角色接入验证"
npm run stage:new -- --kind character --id helper-rover --title "新角色接入验证" --apply
```

编辑 character.json 的motion、capabilities与appearance。再把helper-rover加入目标stage.json的characters数组，然后stage:check、重启dev、从选择器进入。只新增配置，不必修改角色名称分支；必要路线写在overlays.helper-rover中。

该脚手架代表原型参数角色，并非拥有某个原作全部动作。爬墙、冲刺、投射物武器、坐骑、俯视坦克属于新能力/驱动工作；先明确状态接口、碰撞规格、输入命令、资源锚点和测试，再增加模块。用double-jump参数不能冒充忍龙等角色的完整原作行为。

正式图片/骨骼/帧动画仍需新资源协议与驱动接入，当前appearance只有几何占位。旧第三期地图/角色封闭入口保持原手感，但尚无跨地图的通用actor接口。原则是“能力已有时配置扩展，能力没有时可控开发”，不是无条件零代码扩展。


## M04补充
使用 `play.html?dev=1` 打开实验入口。legacy-terra-v1只允许原第三期固定组合，不能自定义地图；音效键需存在于游戏音频清单。当前协议仍是实验接口，不把几何角色当作真实泰拉actor。
