# M07 / R22 交接

当前游戏候选0.4.3，UI范围更新。首先阅读START_HERE、UI_CONTRACT、UI_AUDIT_M07和TEST_REPORT_M07。模块登记32项、兼容片段33项。三类新增模块已接入实际候选，不是替代玩法的展示页。

原始底稿SHA见baseline.json，当前release.json与build.config统一。构建目录不直接编辑；旧模板保留以还原底稿。扩展模板WorldKit W02仍固定M06，未自动改写其下载与运行时，升级它需独立协议与回归。

执行npm run build、verify、prepublish:check；浏览器用test:player-browser与test:browser。test:ui-browser运行综合检查与正常动画时钟模式；也可单独test:player-normal；旧浏览器脚本保留作历史测试资料，不宣称每个旧专用脚本均已适配新布局。任务认领表不改写；当前新增人工检查在ACCEPTANCE_M07。

下一步先用真实设备核对六角色、刷新后的改键、全屏、音频及自然地下往返；再按独立任务迁移其余世界内文字。不要把UI工程升级与角色跨图/关卡机关补齐混成一次改动。发布审阅仍pending。
