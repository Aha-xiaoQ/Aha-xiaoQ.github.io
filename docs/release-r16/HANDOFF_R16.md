# R16 / M06 交接

基线R15 + 第三期0.4.1；当前候选0.4.2。新的两个模块quick-guide、adventure-help通过现有adventure-shell桥接接入，总计29模块、6桥接、33compat。包装预算41保持；原游戏数据、物理和资源未修改。

任务唯一来源packages/mario-mix-terra/docs/TASKS.json，新增M06-EXPERIENCE，本地验证投影待验收。srczip由工程pack生成，网站manifest与实际ZIP一致。currentRelease允许新的游戏版本省略仅用于文档修订的documentationRevision，但有值时仍严格校验。

网页只改内容/复制功能/版本查询缓存，不动CSS或转场。第三期主入口仍三个：源码、代码贡献、实验关卡。历史内容和下载保留。只复制命令，不执行命令；所有数据复制在明确点击后执行。

原有测试的版本常量改为元数据驱动断言，功能/权限/转义/安全测试不删除。新源码构建会保护性清理过期且自身登记的文件；未登记/手改文件不删除。

未完成：Windows、真实网络/ESM、实际BFCache、实体设备、持久存储刷新、声音和自然通关、外部PR、CI/Pages及授权核验。仅本地交付，无推送。下一步实机验收，不再扩张内容或重换视觉。
