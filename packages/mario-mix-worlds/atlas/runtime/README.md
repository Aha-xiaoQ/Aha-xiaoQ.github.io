# 地图试跑运行时来源

这里的三个模块与 character.json 直接来自同仓库 packages/mario-mix-terra：

- src/content/stage-catalog.mjs
- src/simulation/platform-stage.mjs
- src/simulation/platform-motor.mjs
- content/extensions/characters/lab-runner/character.json

用于让地图册独立启动时也能运行同一份平台逻辑。没有改写物理参数，没有引入正式角色或新素材。editor.test.mjs 核对源文件字节一致性；上游更新后须同步并重跑测试，不可单独修改复制件。完整来源工程及权利说明沿用原仓库。
