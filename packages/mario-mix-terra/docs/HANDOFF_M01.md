# 交接 · terra-m01

## 当前结论

独立模块、兼容区、资源源文件和构建输出已经分开。真实底稿回填能匹配上传 HTML 的 SHA；候选单 HTML 可由源码构建。八模块不是整个游戏解耦完成；三十三个兼容片段仍依赖共享闭包。

本地候选、原始参考、网站稳定版是不同入口。不得以 M01 覆盖现有 games/mario-mix-3/play.html。城堡关和前两期独立文件继续排除。

## 下轮开始

先看 baseline.json、TEST_REPORT.md 和 TASKS.json，再运行 check/test/build。从绑定配置/菜单焦点一处继续拆，保留原 UI 行为，再推进库存事务或场景生命周期。每次先测试后迁移，不整包换引擎、不叠更多 wrapper。

## 网站接入

项目包在 packages/mario-mix-terra。公开源码下载在 downloads/source/MarioMix_Terraria_M01_Source.zip。介绍页由现有项目 docs 数组生成到 /notes/mario-mix/docs/terra-source/。新增 source 链接与现有任务数据分开，所有旧状态与资料保留。

更新网站源码归档时执行工程 pack 后检查 ZIP，将对应归档放到 downloads/source，并同步元数据 SHA。不能改工程后忘记更新下载包。R09 更新器记录修改前后哈希，未知本地冲突停止。

## 尚未验收

实际浏览器 HTTP ESM 加载、Windows 原生运行、真实手柄/触屏、音频、远程资源、用户持久配置、自然完整通关、远端 Actions 和 Pages。已有离线回放不能替代这些验收。

## 文档优先级

用户最新明确要求 → 本交接与架构决策 → 模块图/任务 → 历史说明。发生新问题先记录真实证据，禁止把失败或没执行记为通过。
