# 本轮参考与采用范围

- Node.js官方fs文档：https://nodejs.org/api/fs.html 。用lstat判断链接本身；沿用已有安全路径实现，不用existsSync授权写入。
- Phaser官方Scenes：https://docs.phaser.io/phaser/concepts/scenes 。参考停止/重启时资源清理、暂停与销毁区分；本项目未引入Phaser或复制其代码。
- Godot官方最佳实践：https://docs.godotengine.org/en/stable/tutorials/best_practices/index.html 。参考明确职责与场景组织；无引擎迁移。

复核日期：2026-09-17。游戏物品与行为来自用户指定底稿，新增代码为本轮实现。引用资料不构成对第三方游戏素材的授权。更早SMBC参考见REFERENCES.md。
