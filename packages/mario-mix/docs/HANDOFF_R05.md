# R05 交接：从记录页面走向实际游戏代码协作

交付状态：本地工程增量包，未推送、未部署。网页视觉仍由用户验收，R04 的 CSS、HTML、主路由不在本轮修改范围。

## 已完成的代码

packages/mario-mix 的独立包、无 npm 依赖的命令；真实读取的 Bill 控制片段与纯函数/桥接拆分；严格基线匹配的候选构建；独立本地端口的原始/候选试玩；实际 Node HTTP 安全测试；自动回归；可选真实浏览器对照脚本（未执行）；作用域明确的新 CI 和 PR/Issue 模板。

## 关键事实

第一期 HTML 只加载 classic-mix.js，而旧 bill-controls.js 是片段。今后这处逻辑应修改 packages/mario-mix/src/input/，经构建才生效。第一期其余代码未模块化；II / III 未在这一轮重构。公开 main 的核对日期和 hash 在 baseline.json，不把旧提交称为永远最新。

## 修改范围

新增 packages/mario-mix 与专用 GitHub 模板/工作流；向根 README、AGENTS、CONTRIBUTING、CODEOWNERS、npm scripts 和 gitignore 追加入口；向 R04 mario-mix 描述数据追加工程文档和更新记录。旧状态 JSON、历史交接、游戏运行文件、素材、下载包和主站视觉程序保持。

## 下次按顺序做

1. 用户完整仓库运行 game:audit，保留本地报告；基线有不同不要回退游戏。
2. 在完整第一期资源下运行候选/原始服务和可选浏览器对照，再人工验收键盘、实体手柄、音频及隐藏关返回。
3. 维护者手动推送；核对新 CI 真实成功，按实际情况设置主分支规则。
4. 选择 WORK_ITEMS 的一项与首位外部贡献者走通 Issue → 小 PR → 测试 → 审核。任务在 GitHub 确认认领，不假造已有人参与。
5. 核对 II / III 与维护者手中最新版，决定下一条可测纯逻辑边界。之后才扩展模块、完善统一发布基线。

## 不应承诺的内容

整个游戏已全模块化、三期已经合并、素材都许可明确、已获官方许可、远端 CI/PR 已运行、用户手柄已通过、游戏已发布——本轮都没有这些证据。发布门槛默认不通过是正确状态。

历史：R04 多项目设计与视觉记录继续保留；R05 的工程试点推进了原 ENG-001/ENG-002（或 TEST-001/SRC-001）的一部分，不自动关闭整个任务。新工程局部任务见 WORK_ITEMS.json；它们尚未创建为远端 Issue。

WORK_ITEMS.json 是本轮局部任务单一来源；修改后运行 `npm --prefix packages/mario-mix run docs:build`，校验器会发现 Markdown 落后。安装收据在 docs/development/R05_INSTALLATION.json；仅记录本地文件变更，不写机器绝对路径，不代表上线。
