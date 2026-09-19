# 新增关卡草稿

关卡接口为实验功能。新草稿基于原创测试场景，不会生成原版 1-4。完整泰拉角色、武器和坐骑暂不能直接用于任意地图。

## 创建并启动

在源码根目录运行：

```sh
npm run verify
npm run stage:new -- --id my-stage --title "我的关卡"
npm run stage:new -- --id my-stage --title "我的关卡" --apply
npm run stage:check
npm run dev
```

第一条 stage:new 只列出将创建的文件，加入 --apply 才写入。

访问 **`http://127.0.0.1:4193/play.html?dev=1`** → “关卡开发 · 接入试验场” → 勾选“显示开发草稿” → 选择 `my-stage` → 进入。

普通 `play.html` 不显示实验入口。试验场创建 main 地图、bonus 地图与 stage 清单三个 JSON，不需要修改主循环或 Canvas。

## 编辑内容

地图、角色配置、角色适配层分别放在 `content/extensions/` 下。先填写底图与对象，再在 overlay 中添加角色路线。适配层不能覆盖底图；当前驱动只接受已实现的能力与已登记音效。

地形、机关时序、敌人行为、触发条件与相机边界分别验证。参考资料记录版本、来源与访问日期；素材许可另行核验。

## 提交前

运行 `npm run stage:check` 和 `npm run verify`。在两种支持角色下检查移动、死亡、检查点、奖励房往返、单次拾取、暂停、退出与重新进入。记录候选 SHA、实际操作与未测设备。

新增不受支持的机制，先提出接口与测试方案；跨关背包和存档需要先实现相应协议。

[角色接入](ADD_CHARACTER.md) · [能力范围](READINESS.md) · [数据契约](CONTRACT.md)
