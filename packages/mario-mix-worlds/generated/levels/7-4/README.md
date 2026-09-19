# 7-4 参考地图模板 · W02

1 个原始区域，19 个查看视图。完整转录保存在 reference.json，地形、对象定位和机制缺口分别保存在 template.json / coverage.json。不是原版保真认证或已完成的同人关卡。

## 使用
下载完整 Worlds W02 Starter，运行 npm run atlas 查看地图册；npm run dev 打开 M06 试验场。小地图 ZIP 不包含运行时。

世界 2–8 导出为独立分区地形检查。水下区域只提供地图与环境声明，不使用平台物理冒充游泳。循环城堡默认展示一次通过路线的完整展开图（伸展段按 256 像素视口），另保留 before/stretch/after 和原条件图；展开图不等于循环判定与水下机制已完整可玩。

Tiled 为对象层导出，仅供编辑参考；编辑结果不会自动回写游戏。

## 待实现 / 核验
bridge-axe-finish、castle-finish、conditional-section、conditional-section-runtime、conditional-sectiondecider、conditional-sectionfail、conditional-sectionpass、enemy-bowser、enemy-podoboo、falling-platform、lava-volume、marker-CastleChain、rotating-firebar、source-transport-not-simulated。
