# 复现步骤与方法限制 / Reproduction and limitations

**简体中文** | [English](REPRODUCIBILITY.en.md)

## 固定源码与本地启动

基线：`4bc75da9e038a45886a119b1d8c16402990702c9`。使用 Node.js 22+，原网站脚本无第三方 npm 依赖，不需要 `npm install`。

```sh
git clone https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io.git
cd Aha-xiaoQ.github.io
git checkout 4bc75da9e038a45886a119b1d8c16402990702c9
# 复现已发布的许可文档修订时，改用下方精确提交
# git checkout 12e4afacbe4e24e1514bc80f5054e5c61bb7acae
npm run dev
```

打开 `http://127.0.0.1:4173/`。鹈鹕作品可直接打开 `experiments/pelican-bicycle.html`，也可通过服务器访问 `/experiments/pelican-bicycle.html`。地图工具从 `/packages/mario-mix-worlds/atlas/editor.html` 启动；其中预置地图和试玩资源有独立权利边界。光学工具入口 `/tools/quina-optics/index.html` 需要支持 WebGL 2 的浏览器与图形加速；完整体验引用的本地资产需存在。

## 单次创作记录：鹈鹕骑行

原始登记来源：`content/experiments/pelican-bicycle.json`。以下信息照录历史登记，不是独立核实的产品规格或运行环境：

| 字段 | 记录 |
| --- | --- |
| 提示词 | 生成一个鹈鹕骑自行车的SVG动画，用html实现，不用做任何测试 |
| 模型字段 | GPT-6 Astra Pro |
| 日期 | 2026-09-24 |
| 推理强度 | 未记录；原字段为 `null` |
| 输出格式 | 自包含 HTML + 内联 SVG/CSS/JavaScript |
| 字节数 | 40441 |
| SHA-256 | ff9bd59b4ab3dbd7ac0af37bc2661c707a73b6111d941325e5db4d64cd40907c |

准确模型快照/API ID、运行平台、采样参数、随机种子、温度、token 限额、耗时、费用、尝试次数、候选筛选过程、全部前置对话和生成前后人工修改记录未完整保存。本次不补造这些参数，不推断 `null` 为默认或最高推理设置。提示词里的“不用做任何测试”是原始创作指令；本次仓库一致性检查不证明生成阶段是否测试过。

### 可重复核验的结果

同一份 HTML 的字节身份可以精确核验；在浏览器打开后可以检查速度选择、暂停/继续、空格控制与减少动态效果偏好。显示效果会受浏览器、设备、视口、系统字体和图形性能影响。本轮自动检查验证原始字节与代码结构，不等于完成所有设备的视觉/交互验收。

原始模型生成过程不能仅凭提示词精确重现。即便后来使用相同模型名称，模型版本或服务设置也可能已变化；不承诺输出相同。

## 这不是标准化性能基准

鹈鹕作品是一个已保留的创作输出。它不是多模型对照、随机采样测试集、盲评或可复现的标准化性能 benchmark。不能用这个例子推导模型成功率、排行榜、普遍代码质量、性能提升或对其他模型的优越性。

没有统一测试集、独立评分准则、预登记实验设计、重复次数、对照组、失败样本、置信区间或评审一致性数据。文档可展示“提示词与实际成品”，但不应说“已证明模型能力/优于某模型”。代码/许可测试只能支持各自检查的有限结论。

## 光学工具的教育模型边界

工具依据公开光学原理构建近似光路和自主机械结构示意，光源/样本使用模拟数据，颜色为波长近似示意；不是厂商 CAD、校准仪器、实验测量数据或商用工程验收。没有借由显示光谱或原生 WebGL 代码证明科学准确性、制造公差或仪器性能。引用手册的版权和再分发许可另行处理。

## 开源与可复现的边界

原创源代码的 MIT 范围与第三方素材分发许可独立。一个程序能运行不说明其地图、美术、字体、音乐、参考 PDF 或导出 ZIP 可以按 MIT 商用。CI 成功也不证明素材授权、自然通关、设备兼容、浏览器视觉结果或线上部署成功。

English: this is a retained creative output with limited historical metadata, not a standardized model benchmark. Unrecorded settings remain unknown. Reproduce the artifact bytes and local behavior separately from the original generative process. Optical views are educational approximations; licensing, measurement accuracy and runtime testing are separate concerns.
