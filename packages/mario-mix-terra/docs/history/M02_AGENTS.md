# 开发接手约定 · Terra M02

## 开始前
读 START_HERE.md → docs/HANDOFF_M02.md → baseline.json → architecture/modules.json → docs/TASKS.json → docs/TEST_REPORT_M02.md。用户最近明确的范围优先。

只使用用户上传第三期底稿。前两期独立文件、城堡开发分支、网站外观和线上稳定版不改。M02 与网站 R10 是工程/安装编号，不是关卡编号。

## 修改边界
1. 实际模块登记在 architecture/modules.json，兼容片段不能冒称独立模块。
2. 输入/玩法/内容/时钟模块不得读取 DOM、存储、网络或具体引擎对象；由 bridge 显式注入。
3. 新模块必须在 build.config.json 接入且登记测试。不得扩大现有 wrapper 预算来绕过设计。
4. 等价重构与有意改变行为单独说明。golden 和 baseline SHA 不得为通过测试而改写。
5. 测试未运行/失败/环境阻止必须如实记录。Linux 不能代表 Windows，离线组件不能代表 HTTP/ESM 端到端，虚拟手柄不能代表实体设备。
6. 变更后运行 verify。更改登记后生成 docs；修改工程后重打 source ZIP 与校验元数据。
7. 交付仅本地包，由用户推送；不得自动发布、创建 Issue、合并 PR 或改变许可。

## 结束前
更新 TASKS（真实状态、证据）、CHANGELOG、HANDOFF 和测试报告；保留旧报告。每个包放 START_HERE、清单、安装与回退指南。不要分享任何字体文件，不上传凭据或用户私人存档。
