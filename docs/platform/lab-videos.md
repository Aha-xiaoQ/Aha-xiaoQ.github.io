# 实验室视频维护

[English](lab-videos.en.md) · [返回架构与维护](README.md)

## 同一目录，两种作品

实验室入口保持 `/notes/lab/`。`content/experiments/catalog.json` 决定作品顺序，每项对应 `content/experiments/<id>.json`。默认记录（或 `kind: "html"`）继续保存原始提示词、模型信息、HTML 字节数和 SHA-256；`kind: "video"` 表示托管在哔哩哔哩的视频，不需要伪造 HTML 文件、提示词或模型设置。

本次视频对应如下。BV 号保持大小写，不加入跟踪参数，也不与原始 SVG 动画混用。

| 作品 | 记录 ID | BV 号 |
| --- | --- | --- |
| 琵琶曲 \| 鹈鹕骑车 | `pipa-pelican` | `BV1TvhU6aEci` |
| 中秋特别节目 | `mid-autumn-special` | `BV1rHh16CE3T` |

## 添加下一部视频

在登记表增加唯一 ID 与对应文件。视频记录包含 `schemaVersion: 1`、`kind: "video"`、`id`、`title`、`subtitle`、`visibility`、`createdAt`、`video`、`provenance` 和 `verification`；`format` 可写作品形式。`createdAt` 是收录日期，不是推断的视频发布日期。

`video` 只接受 `provider: "bilibili"` 和合法的 `bvid`；观看地址由统一函数生成。正文由标题、简介、作品说明与观看提示组成。描述只填写已知信息，不填写未经确认的时长、模型强度、评分或素材授权结论。

`relatedExperimentId` 可连接已登记的关联实验。公开记录不能指向隐藏草稿；移动或撤下关联记录时需要同步调整引用。`visibility: "draft"` 不进入公开目录，`archived` 保留历史详情但不进入当前作品列表与搜索结果。

## 构建与检查

```sh
npm run journal:build
npm run site:build
npm run platform:verify
```

原始登记通过共享校验转换为实验目录、详情文档与搜索条目。不要手工编辑 `assets/journal/data/`、`notes/` 或 `content/search-index.json`。视频区使用原生链接，不加载播放器、远程缩略图或视频字节；单个视频不能引入外部脚本。新增文案同步加入 `content/locales/en.json`。

`tests/platform/lab-video.test.mjs` 检查链接对应、类型边界、语言、搜索和原始 HTML 保留。浏览器组件测试使用同一份渲染代码并验证新视频；完整发布页面检查仍保留。视频可用性和实际播放由外部站点决定，本地通过不代表已观看、获准再分发或已部署。

## 已归档的最终制作文件

视频记录可通过 `resources` 保存最多三个同站点发布资源：`html`、`video`、`source`。各角色唯一，路径必须在 `/experiments/releases/<作品ID>/` 下，分别为 HTML、MP4 和 ZIP；登记字节数与 SHA-256。媒体不会在目录加载时请求，`platform:check` 校验本地文件身份，发布审计继续检查链接与 ZIP。文件错误会停止推送，不通过修改 BV 号替代实际资源。

本次鹈鹕 HTML 是原生 WebGL 程序；中秋 HTML 是精确保留最终画面的影片播放器，绘制 Python、字幕、时间轴与新配乐合成步骤在源码 ZIP 中。两个作品保留原 B 站观看入口；改变本站配乐不等于替换 B 站稿件。

鹈鹕的站点发布副本 `animation.html` 仅补充语义标题与内置图标，不改动画 JavaScript、音频或布局。原离线 HTML 仍在原始源码 ZIP 中逐字节保留。
