# 当前版本与公开任务的数据约定

## 项目版本

项目配置仍在 `content/development/projects/<id>.json`。currentRelease 包含 version、status、documentationRevision、updateId、documentId、sourceHref、manifestHref。界面版本和源码主按钮使用该对象；相应文档 action 和更新状态需一致。状态可为 local-review、released、planned；当前 0.4.1 保留 local-review。

更新列表按 date 降序，再按显式正整数 revision 降序，最后按项目 ID 和更新 ID 排序。修订号不推导真实发布时间；旧记录未填时按0处理，以 ID 确定性兜底。同一项目的显式修订号重复会报错。新更新必须配套核对 currentRelease，不能以数组反转作为长期方案。

## 源码下载

源码 release.json 保留游戏版本0.4.1，documentationRevision15，sourceArchive 指向新 ZIP 名。ZIP 的元数据 JSON 记录版本、修订号、状态、bytes 和 SHA-256；content:check 核对文件实际字节。新素材、源码或文档变更后需要重新打包，不能把旧下载继续标成新源码。

## 当前任务

`state.generatedFrom` 为工程 TASKS.json；当前只支持 packages/<package>/docs/TASKS.json。每项显式写 audience，不能靠 ID 前缀判断公开范围。生成器保留源 ID、责任人、Issue、前置条件和证据，并保存 origin 追溯。

ready→待处理，in-progress→进行中，local-verified→待验收，blocked→待确认，planned→计划中。reviewed/released 需有证据方可映射完成；脚本不核验人工证据真假。当前没有自动完成任何尚未审批的任务。

`content:sync` 维护生成快照与哈希记录，手改快照会停止。`journal:build` 先同步任务再生成页面，避免项目展示落后。新项目可以继续使用原 project-v1 手工数据，不要求引入游戏工程。

## 历史

archivedState 保存原 A/B 布局和 runtime。公开任务不再读旧 R01 草稿，但管理页保留旧工具；浏览器存储键不变。旧任务负责人不会被擅自迁移到不同语义的新任务，应由维护者逐项核对后明确编辑当前 TASKS.json。
