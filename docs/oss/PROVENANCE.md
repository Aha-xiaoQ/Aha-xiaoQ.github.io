# 来源、许可组成部分与待核验项

**简体中文** | [English](PROVENANCE.en.md)

审计日期：2026-10-02。源码基线：`4bc75da9e038a45886a119b1d8c16402990702c9`。最初许可文档修订的原始代码和作品文件保持字节不变；授权由根许可和逐文件清单声明。身份由该提交的 Git blob 固定，已纳入原创范围的现有源码另记 SHA-256。清单是可核对的组成部分范围，不是承诺所有文件原创、所有许可证兼容或所有资源已授权。

## 原创证据

### 网站、协作与路径安全

既有 `RIGHTS.md` 的十四个程序/样式文件与外层页面结构继续保留原 MIT 范围。`LICENSE.collab` 已声明新协作工具、样式、配置、测试和说明的原创范围。本次增加当前网站的原创构建、内容/路由/界面实现与测试逻辑，明确排除解析器 vendor、文章快照、引用、媒体和外部服务。

`AGENTS.md`、`docs/platform/README.md`、`docs/platform/source-playback.md` 记录本地原生实现、内容来源和构建边界。`scripts/lib/safe-path.mjs` 是仓库的 lstat 路径边界与原子写入实现；`tests/security/safe-path.test.mjs` 使用合成目录/链接测试。它不是对能竞态替换目录的进程提供的完整安全沙箱。

源文件审查与既有许可说明能支持对原创组成部分的授权，但不能仅凭一次维护者提交证明整份文件不包含他人内容；因此清单逐项使用组成部分排除范围，不给依赖或嵌入素材新的授权。

### 四幅几何 SVG

`docs/design-r08/ASSET_SOURCES.md` 明确记录 `assets/illustrations/controller.svg`、`web-studio.svg`、`workflow.svg`、`experiment.svg` 为自行编写的几何 SVG，无复制参考网站图片/标识、远程资源、脚本或外部字体。本次将这四个完整文件纳入 MIT。相邻地图海报 PNG、截图裁片、诊断猫精灵不在这个证据范围内。

### 原生地图编辑器

`docs/collab/MAP_EDITOR_PLAN.md` 记录借鉴 Tiled/LDtk 交互和数据组织，但不复制其品牌、代码或未经核验素材。对应原创编辑器来源提交为 `6cc3bf8ca7d3494fa1baf9f9ea00aaeee44a7789` 与 `309f6c23fd66c586d72e635f3af2421cba29a16e`。清单列出原生编辑模型、编辑界面、ZIP 导出、手柄输入、离线构造程序、启动器、服务和原创测试逻辑。实现中的参考地图读取、外部资源路径与导出功能不代表资源已获得重新分发许可。

`editor-art.mjs` 仅授权原创渲染/界面编排；其中 `HUD_GLYPHS` 内联位图字形表（基线第 63–84 行）与 `games/mario-mix/classic-mix.js` 基线约第 311 行起的字形表存在完整 token 对应，来源游戏仍为混合待核验文件，明确排除。

三个混合适配器 `editor-mario-stage.mjs`、`editor-mario-motor.mjs`、`editor-bill.mjs` 分别含有复用的平台/运动/武器来源逻辑，Bill 适配器还内嵌 PNG。未把新编辑器适配和复用内容隔离为有充分来源证据的函数范围前，这三个完整文件保持 `NOASSERTION`，不整体纳入新 MIT。

保留的例外包括 `source-sprite-data.mjs`、`classic-art.mjs`、`source-art.mjs` 的上游数据/混合范围，`chill-font.mjs` 的内嵌字体，`classic-1-1.json`、地图生成与参考文件、`tests/fixtures/classic-mix.js` 和参考路线 fixture。配套 M06 运行时、地图模板和导出单文件游戏也没有被整体改为原创 MIT。使用原创编辑器代码的许可与发布含有第三方资源的关卡/ZIP 的权利不同。

### 第四期源码整理工具

既有 `packages/mario-mix-episode4/LICENSE-TOOLS.txt` 授权新增整理工具、测试与说明，来源提交为 `22e84a7321b77acfb289a51496c6ff36abf3da31`。清单只纳入整理工具与测试；复用的 safe-path/ZIP 保留 `LICENSE.collab` 归属。提取的 runtime、地图、美术和音频不由此获得新的许可。

### 鹈鹕骑行

`content/experiments/pelican-bicycle.json` 记录原始提示词、历史模型字段 `GPT-6 Astra Pro`、日期 `2026-09-24`、40441 字节与 SHA-256 `ff9bd59b4ab3dbd7ac0af37bc2661c707a73b6111d941325e5db4d64cd40907c`。源文件保留完整内联 HTML/CSS/SVG/JavaScript，没有外部媒体或库导入；所引用的系统字体名称不等于附带字体文件。本次按维护者原创授权将该完整作品纳入 MIT，保持其字节不变。

这仍是一个 AI 辅助创作实例。AI 辅助不自动证明所有输出具有排他版权或没有相似来源；具体方法限制见 [REPRODUCIBILITY.md](REPRODUCIBILITY.md)。其他鹈鹕/音乐视频文件没有仅因题材相似而继承这个范围。

### 启娜的光之工坊

`tools/quina-optics/README.txt` 记录小Q策划与出品、GPT-6 Astra 制作协作，自主机械结构示意和模拟光源/样本。`references/来源.md` 明确说明厂商手册版权属于 Thorlabs，按公开 Czerny–Turner 原理建立近似模型，而非厂商 CAD 复制。

三个 HTML 文件中的原生 WebGL、几何、着色器、UI 程序和样式属于本次原创实现范围。涉及的数学/物理原理与参考资料不是可据此重新授权的厂商作品。`precision-assembly.glb`、`precision-assembly-bom.json`、PNG、Logo 和 `Quina_Interactive_v009.zip` 的具体来源、导出链和许可未在本轮得到足够证据，保持待核验；厂商 PDF明确排除。没有修改原 `manifest.json` 的文件哈希或声称离线包已重新授权。

## 保留上游通知

- Acorn 8.15.0：原 `LICENSE`、版权和 parser 字节保持不变。增加上游 8.15.0 提交 `6dc537416ad628b3959b3ff963fbdcfdb380e0a3` 的原文 `AUTHORS`，Git blob `dc64dabef022eea06a9824f87b34feaa7634dede`；[上游来源](https://github.com/acornjs/acorn/blob/6dc537416ad628b3959b3ff963fbdcfdb380e0a3/AUTHORS)
- 霞鹜文楷：保留 SIL OFL 1.1、LXGW/Klee 作者、保留名称和子集条件。字体本体与 `tests/platform/fixtures/wenkai-ofl-source.json` 的原文通知不能标成 MIT；测试程序与合成几何字体生成器的原创代码另外按清单范围授权
- 寒蝉点阵体/Misaki：`chill-font.mjs` 内嵌 7px v2.500 和 16px v2.502 两种字体；保留 `CHILL_FONT_LICENSE.txt` 的完整 7px/Misaki 通知与 16px GPLv2-or-later 源码、编译字体 OFL 1.1 / GPL embedding-exception 条款，不在本轮简化或解释这些条款的相互适用，也不将整个模块改为本站 MIT
- 社区 Mario：保留 `umaim/Mario` 的固定提交、source blob 与 MIT/Cloud 作者通知。没有以它为 Nintendo/Contra 等原作地图、精灵、录音、角色或其他素材做权利担保

## 仍然开放的审计问题

1. Q咪：当前站点素材声明为 CC BY-NC 4.0；本地 ZIP 内完整 LICENSE/NOTICE.md 已核验，署名 Aha_xiaoQ；包内精灵与站点精灵字节相同，SHA-256 为 `f79daf1a56b6dfabddf72de689e722876d53567350615d5b8af3c0e59e4348f4`。仍需比较独立源码仓库，并协调任何未来许可变更。本站展示程序的原创范围不能代替素材/独立仓库的许可变更
2. 混合游戏与历史源码/离线 ZIP：需要对嵌入资产和上游代码分别追溯。保留已知通知，不假称资源授权完成，不为未知内容创造许可证
3. 光学工具：追溯 GLB、BOM、PNG、Logo 和 ZIP 的制作/导出来源；独立查明厂商手册是否允许当前再分发
4. 全仓其余非代码作品、视频、音乐、同人形象、截图、文案及媒体：仅完成路径/blob 库存时保持 `inventory-only` / `NOASSERTION`，不得据此宣称全仓可商用

本次来源审计没有改变独立仓库或重新打包旧下载。许可文档随后已普通推送并部署，精确记录见 [维护者与 CI](MAINTAINER_AND_CI.md)；没有提交任何项目申请。

## 双语维护修订

2026-10-02 后续双语维护修改原创语言入口和文档，并由既有生成器同步版本别名与公开页面。清单的 `reviewedRevisions` 保存明确路径的当前 SHA-256/Git blob，同时保留原 `files` 中的基线身份与分类。该记录只覆盖原有原创组成部分；不为 unknown、上游代码或被排除素材新增授权。英文审计文档的原创文字列入 `newFiles`，引用的许可、提示词和第三方作品继续排除。
