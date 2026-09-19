# 素材契约

## 内容与表现分离
内容事实和真实链接继续保存在 content/site-data.js。只在 content/presentation.json 中用相同的稳定 ID 登记表现；不要复制标题与摘要。presentation.js 由工具生成，禁止手改。无需新路由或项目名称分支。

```json
{"schemaVersion":1,"entries":{"project-new-character":{"kind":"image","preset":"character-paper","src":"projects/new-character/preview.webp","fit":"contain","rendering":"auto","alt":"原创角色预览"}}}
```

## 选择表
|预设|允许素材|裁切|使用原则|
|---|---|---|---|
|character-paper|image / sprite|禁止 cover|柔和主体、透明底角色与白底剪影；整块安静暖纸展台|
|character-night|image / sprite|禁止 cover|明亮透明主体与暗色作品；轻地面阴影|
|poster|image|禁止 cover|自带标题、背景和角色的完整海报|
|interface|image|禁止 cover|工具、图表、应用截图；细节不可截掉|
|blueprint|diagram|不适用|无封面的工程项目，以步骤结构表达用途|
|pixel-window|image|可选 cover|只对已确认安全裁切的像素场景使用；默认 contain|

src 仅允许安全本站图片路径或 HTTPS 图片，禁止 data/javascript/带凭证 URL 和路径穿越。焦点 position 使用 0–100% 的两个百分数。schema 不允许任意 CSS，未知字段应在构建时失败，不静默忽略。

精灵表需写 frame width/height、columns/rows、frames、durationMs。当前只支持第一行水平帧序列；不要把不满足布局的表登记成支持。Q咪参数沿用 R06 原站 CSS：96×104、8列11行、6帧、1560ms；实际源图需在完整仓库验证。若是独立 PNG/WebP，使用 image 而非 sprite。浏览器不做抠图、色键或去白底。

## 媒体行为
优先显示首行两张图片，其余使用原生 lazy loading。固定窗口提前占位，避免图片加载后挤动正文；object-fit 默认 contain。图像失败时显示中文提示并保留卡片链接。图像尺寸提示表示 16:9 展示槽，不宣称原图都是 1600×900。

`npm run site:audit` 在本地读取素材是否存在并列出体积；600KiB 是审阅提示，不是硬性质量阈值。不自动压缩、转码或复制图片，避免未知许可和画质损失。尚未提供真正 srcset 派生文件，不以复制同一图片的不同 URL 冒充响应式图片。
