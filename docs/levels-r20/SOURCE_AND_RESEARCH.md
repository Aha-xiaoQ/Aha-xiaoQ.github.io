# 来源与设计依据

## 底图来源

FullScreenMario / umaim/Mario 固定提交 `980c275358704a49f868567aeec5bdfb347c4781`。

- 地图： https://github.com/umaim/Mario/blob/980c275358704a49f868567aeec5bdfb347c4781/Source/settings/maps.js
- 宏展开： https://github.com/umaim/Mario/blob/980c275358704a49f868567aeec5bdfb347c4781/Source/FullScreenMario.ts
- 许可： https://github.com/umaim/Mario/blob/980c275358704a49f868567aeec5bdfb347c4781/LICENSE

读取并转录第一世界玩法坐标及对象声明；不取原作人物图片或声音。Git blob与转换方法保存在每份源数据和NOTICE中。引用项目MIT声明不等于获得原作所有内容授权。逐格原版核验单独进行。

## 架构参考

Tiled JSON格式将对象、层和自定义属性分别组织。本次借鉴这种分离，导出三个对象层：collision、gameplay、reference-markers。没有宣称完整Tiled导入或tileset图形素材。
https://doc.mapeditor.org/en/stable/reference/json-map-format/

Godot场景组织文档强调单一职责、低耦合和显式依赖。本次仍保留现有Canvas/M06驱动，将底图编译、制作记录、场景测试与显示分别维护，不因此迁移引擎。
https://docs.godotengine.org/en/stable/tutorials/best_practices/scene_organization.html

## 展示取舍

主概览只展示四关角色、制作状态和试玩入口；模板细节下沉第三资料页。未来世界用原生details收起，不占据首屏。沿用主站颜色、字号和链接组件，地图作为结构信息而不是重新设计一套主题。已有小图标、游戏列表和转场不重新改画。
