# R22 网站交接

更新当前第三期源码到0.4.3/M07，独立候选仅供验收。WorldKit W02与其M06固定运行时、所有32关下载、负责人和地图状态不改。主要源码页改为当前版本，M06进入历史；站点样式、路由和稳定试玩不覆盖。

入口：packages/mario-mix-terra/START_HERE.md。先运行terra:verify、terra:prepublish:check，再journal:build、site:build、release:preflight。Windows、HTTP/ESM、全屏、设备输入和自然通关按ACCEPTANCE_M07补验。

安装器只应用最近W02/R21且M06源码匹配的副本。完整源树核对，拒绝未知源码、链接和手改生成页。只在验证LF等价时规范工程文本到源码包字节，备份保留原CRLF。旧源树索引排除.local/dist/.git/node_modules等明确生成目录。
