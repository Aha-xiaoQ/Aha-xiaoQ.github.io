# 参考与采用范围

复查日期：2026-09-16。仅借鉴组织方法，本轮没有复制这些项目的实现或额外素材。

- Phaser 官方 Scenes：https://docs.phaser.io/phaser/concepts/scenes 。借鉴独立职责、进入/退出/暂停生命周期；未引入 Phaser，不宣称已有完整场景管理器。
- Godot 官方 Scene organization：https://docs.godotengine.org/en/stable/tutorials/best_practices/scene_organization.html 。借鉴低耦合和显式依赖；未迁移 Godot。
- Super Mario Bros. Crossover：https://github.com/JayPavlina/super-mario-bros-crossover 。结合此前对 Character / SoundManager / LevelData 的研究，参考角色差异和内容分类；README 说明 Flash 3.1.21，图像音频不包含。没有把其 MIT 解释为其他游戏素材许可。
- MDN JavaScript modules：https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules 。使用明确导出与导入；ESM 网页通过服务器运行，单 HTML 另行构建。
- Node.js filesystem：https://nodejs.org/api/fs.html#fslstatsyncpath-options 。lstat 检查链接本身而不是依靠目标是否存在。

更换引擎的取舍见 ADR-001；没有性能采样前不承诺更快。
