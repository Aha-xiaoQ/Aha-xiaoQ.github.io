# R08 改动清单

## 安全
新增共享 safe-path；修复 works 构建和安装器 existsSync 漏检；journal 构建根与祖先检查统一。新增 18 项专门安全测试。修正 R07 测试写死 /tmp 的平台假设，保留该测试并增强悬空目标覆盖。

## 展示
游戏统一横向单列；820px 以下卡片内部上下排列，完整封面与按钮保留。工作流首标签变为开发工具，开源属性仍在下方。网站图改为浏览器页面，工作流图改为任务/代码/检查，手柄保留且删除微小标语。原猫素材不重新生成或色键处理。

## 工程
增加 Linux / Windows 的低权限 CI 矩阵配置，不自动部署。缓存按 R08 更新，旧状态来源、生成记录路径与开发多项目模型不变。

## 保护
不修改原始 site-data.js、项目状态 JSON、content/development 资料正文、site-router.js、主站共享 CSS、R05 游戏工程、game play 文件、下载包与 LICENSE / RIGHTS.md。仅在生成列表及开发页、必要外层 HTML 缓存链接做受保护更新。

实际修改清单以应用器输出和 docs/design-r08/INSTALLATION.json 为准；没有执行远端推送。
