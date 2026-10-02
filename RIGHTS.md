# 版权与使用说明 / Rights and reuse

## 中文

本仓库采用逐文件、逐组成部分授权，不是全仓 MIT。根目录 [LICENSE](LICENSE) 适用于 [许可清单](https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/blob/main/docs/oss/FILE_MANIFEST.json) 中明确标为 `original-MIT` 的原创组成部分，以及清单列出的本次原创审计文件，仅在作者有权授权的范围内生效。`LICENSE.collab` 的既有协作范围继续有效。

固定审计基线：`4bc75da9e038a45886a119b1d8c16402990702c9`；审计日期：2026-10-02。清单为每个基线文件保留 Git blob、分类、组成部分范围与来源证据。`inventory-only` 表示仅登记，未完成内容或权利审查；`unknown` / `NOASSERTION` 不是开源许可。新增文件、文件变化和未来版本必须按实际来源重新核验，不能凭目录位置继承授权。

### 已明确的原创 MIT 范围

- 既有网站外层结构、程序和样式，以及本次列明的网站构建、路径安全、UI、路由与测试原创实现
- 地图工坊原生编辑、模型、ZIP 导出、手柄、启动器、界面和测试逻辑中的原创部分；不包括所加载或导出的第三方地图、美术、音频、字体、游戏源代码 fixture 与配套运行时素材；含有未分离复制游戏逻辑的三个 Mario/Bill 适配器保持待核验
- `assets/illustrations/controller.svg`、`web-studio.svg`、`workflow.svg`、`experiment.svg` 四幅自行编写的完整几何 SVG；邻近海报 PNG 不在这一授权中
- `experiments/pelican-bicycle.html` 中保留的完整原创/AI 辅助 HTML、SVG 插图、动画、控制、样式和原创文字；原始文件字节、提示词、模型字段与日期保持不变
- `tools/quina-optics/index.html`、`assembly.html`、`optics/interactive.html` 中的原创 HTML 结构、样式、原生 WebGL、几何、着色器和交互实现；厂商手册、引用、Logo/PNG、GLB、BOM 与 ZIP 不在这一授权中
- 本次新增的审计文档、清单结构、核验程序和测试

上述程序文件的授权是组成部分范围，不意味着文件关联的所有内容都可商用。未明确纳入的文章、介绍文案、译文、形象、Logo、截图、素材、输出包与独立项目仍以各自原有授权为准。MIT 允许在保留版权与许可声明的条件下修改、分发与商用；不授予商标、肖像、代言或第三方权利。

### 保留的上游许可与例外

- Acorn 8.15.0 保留其上游 MIT 及原作者版权；`scripts/platform/vendor/acorn/LICENSE`、`NOTICE.json` 与原文 `AUTHORS` 一并保留。不能把它标为本站原创
- 霞鹜文楷等字体、字体子集和字体许可测试 fixture 保留 SIL OFL 1.1、上游版权和相应条件，见 [字体许可](https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/blob/main/assets/FONT_LICENSES.md)。寒蝉点阵体内嵌模块与 Misaki 字体条款保留各自原文，不能整体改成 MIT
- `umaim/Mario` 社区程序/数据的既有 MIT 声明及 `Copyright (c) 2018 Cloud` 保留；它不替代 Nintendo 或其他原作的角色、美术、地图、音乐、音效权利。转录地图、精灵数据、混合游戏文件与导出包不能整体标成本站原创 MIT
- Thorlabs 厂商手册仍属于第三方资料，本次没有确认其开源或再分发许可。光学工具的 GLB、PNG、BOM 和 ZIP 保持待核验，不由程序许可覆盖
- Q咪页面现有 CC BY-NC 4.0 素材声明保留；本地 `q-mimi.zip` 内完整许可、NOTICE 和站点精灵字节一致性已核验；与 [独立源码仓库](https://github.com/Aha-xiaoQ/q-mimi) 的比较及协调变更仍需另行处理。本次不改变这些素材或独立仓库的许可
- 旧下载 ZIP、单文件游戏内嵌资产、影视/歌曲/同人作品、来源不明资源与未审计文件均不获得新的 MIT 授权；保留已有通知，不将“可访问”“免费试玩”“AI 制作”“署名”视为第三方授权

清单和 [来源说明](https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/blob/main/docs/oss/PROVENANCE.md) 是范围说明，不是全仓权利清理完成证明。本声明不限制法律允许的使用，也不授予作者无权授予的权利。如需使用未明确授权的内容或反馈权利问题，请联系 [hfutqdm@163.com](mailto:hfutqdm@163.com)。

## English

This repository uses exact-file, component-scoped licensing, not repository-wide MIT. The root [LICENSE](LICENSE) applies only to original components expressly marked `original-MIT` in the [manifest](https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/blob/main/docs/oss/FILE_MANIFEST.json) and its listed new original audit files, to the extent the licensors hold the relevant rights. The existing `LICENSE.collab` scope remains valid.

The audit is pinned to commit `4bc75da9e038a45886a119b1d8c16402990702c9`, dated 2026-10-02. Each baseline file has a Git blob, classification, component scope and source evidence. `inventory-only` means inventoried but not fully reviewed; `unknown` / `NOASSERTION` grants no open-source license. New or changed files require source review rather than inheriting a license from a directory name.

MIT-covered original components include the existing site implementation, the listed original website/build/path-safety/UI/test implementations, native map-editor/export/gamepad/launcher/UI/test logic, four exact geometric SVGs, the complete retained original/AI-assisted pelican HTML/SVG, original implementation portions of the three optical-workshop HTML files, and the new audit documentation/verifier/tests. Embedded or referenced third-party content is excluded. Retaining license and copyright notices is required; no trademark, likeness, endorsement or third-party rights are granted.

Acorn retains its original MIT attribution. Font software and captured OFL fixtures retain their original font licenses; ChillBitmap/Misaki embedded font modules are not converted to MIT. Community Mario MIT notices do not clear underlying game characters, maps, artwork or audio. The Thorlabs PDF, optical GLB/PNG/BOM/ZIP, mixed game files and unverified archives receive no new grant. Existing Q咪 CC BY-NC 4.0 material notices remain, with the local archive notice and sprite identity verified; independent-repository comparison and coordinated changes remain separate.

The manifest is an honest scoped provenance review, not a declaration that all repository rights are cleared. Public availability, credit, free play, fan-work descriptions or AI assistance do not themselves establish permission. Uses permitted by law are unaffected. For permissions or rights concerns, contact [hfutqdm@163.com](mailto:hfutqdm@163.com).
