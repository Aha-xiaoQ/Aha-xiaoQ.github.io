# 代码与素材许可核验

本轮只建立流程，未完成历史资源审计。`collab/assets-register.json` 的 entries 为空是“尚未登记”，不是“全仓无第三方材料”。

网站的限定 MIT、原游戏内许可证与各素材权利分别适用。新增协作工具许可见 `LICENSE.collab`，不扩大原 `RIGHTS.md` 的范围。

## 新条目结构（示例，不是实际授权）

```json
{
  "id": "unique-resource-id",
  "path": "assets/example.png",
  "kind": "image",
  "sourceUrl": "https://example.org/original-source",
  "author": "作者或权利人",
  "license": "待核验",
  "permissionEvidence": "许可正文/授权记录位置",
  "redistribution": "unverified",
  "modified": false,
  "attribution": "所需署名",
  "notes": "替代计划、使用范围和限制"
}
```

`redistribution` 只使用 `allowed`、`restricted`、`unverified`。标为 allowed 时必须给出允许本项目实际分发方式的证据，而不只是下载地址。上游代码的许可证与其中图片、音乐的许可证可能不同。

不得使用 ROM、来源不明的音频包或整站下载包来“补齐资源”。素材在另一个仓库、外链托管、免费试玩、署名或标注同人，都不能自动解决授权问题。无法确认时先用已明确授权的替代资源保持测试流程可运行。

本更新包不再分发字体。原仓库字体和既有声明保持原状，本地网页使用其原路径；环境没有字体时允许系统字体回退。
