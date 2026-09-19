# 第一条可协作源码通道

## 已实现的路径

```text
原仓库 games/mario-mix/classic-mix.js（锁定基线）
                        +
packages/mario-mix/src/input/*.mjs（纯逻辑，可独立测试）
packages/mario-mix/src/legacy/bill-controls.bridge.js（闭包适配）
                        ↓ game:build
packages/mario-mix/.local/build/classic-mix.js（候选，不提交）
                        ↓ game:dev 仅在本地 HTTP 响应中替换
http://127.0.0.1:4180/games/mario-mix/play.html
```

这不是独立完整游戏引擎，而是渐进迁移的第一个切片。旧运行文件暂时是其余未迁移逻辑的基线，不假装 800 多行都已经模块化。
不要把 packages/mario-mix 文件夹单独移动到新仓库就声称可运行：当前构建依赖原仓库 games/ 路径及素材。后续整仓拆分须另定资源来源与发布契约。

## 为什么不先换引擎

现有地图、坐标、定时、画面和音频在这一轮保持。以行为对照建立小模块，再逐个迁移；不同时更换渲染引擎、状态模型或物理单位。

## 边界

resolveBillAim(input, player) 返回 {x,y}；x 向右为正、y 向下为正。地面单按下仍向前瞄准；上下同按时保持既有优先级。
billDescentIntent(input, previousHeld, player, room) 返回 {held,attempt}；在空中按住组合键会消费边沿，落地不会自动下穿。
isBillPassablePlatform(tile) 保留 hidden、砖/问号块、row<13 规则。
桥接仍负责读取支撑砖、设置 vy=.7、清零 jumpBuffer、只对当前比尔玩家暂时排除碰撞，以及 finally 清理。

## 不是这样做的

不使用外部 script 去覆盖闭包内部函数，不用 eval 注入线上网页，不复制游戏素材，不修改键盘/手柄映射，不改第二/三期。
本地构建只匹配一个已核对的完整区块；原运行 JS 与入口 HTML 必须符合基线。模块被编译进同一个同步闭包，不增加异步初始化顺序。

## 进一步迁移

第一期试点实机验证后，再选键盘语义映射或音频选择的一个纯边界。第二/三期先按 game:audit 取得真实文件报告，并结合维护者最新版，不能拿一期适配器盲目套用。
