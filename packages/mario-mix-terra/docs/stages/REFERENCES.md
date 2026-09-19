# 参考与采用范围（2026-09-17）

- Tiled JSON Map Format：https://doc.mapeditor.org/en/stable/reference/json-map-format/ 。采用“地图层与对象数据分离、稳定对象ID、属性显式”思想。M03格式是自有小schema，未交付Tiled导入器，不复制其实现或地图。
- Phaser Scenes：https://docs.phaser.io/phaser/concepts/scenes 。采用“进入/更新/暂停/退出分别管理”的生命周期思路，不迁移引擎，不直接照搬默认物理。
- Godot Scene organization：https://docs.godotengine.org/en/stable/tutorials/best_practices/scene_organization.html 。参考依赖显式提供和局部职责，不把每个场景做成全局变量集合。
- Super Mario Bros. Crossover：https://github.com/JayPavlina/super-mario-bros-crossover 。沿用之前读取的角色与地图分层思路；此仓库说明不含完整图像/声音。本轮没有导入上游地图/角色脚本/素材，也不把其授权扩大到任天堂素材。
- GitHub Licensing：https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository 。公开可见/Fork不等于任意复用授权；各来源逐项登记。

以上为设计参考，不是本游戏获得授权或原版精确复刻的证据。原上传NOTICE与ADR-001继续保留。
