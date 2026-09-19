# R24 上线验收清单

**当前状态：尚未取得完整网站与实际设备的上线批准。** 不要因为更新包测试通过而填入“已验收”。

生成零阻断发布目录后运行：

```powershell
npm run release:check
npm run release:serve
```

在 http://127.0.0.1:4197/ 验收实际发布目录，而不是旧工作区的管理页面。

|记录键|需要实际验证的内容|本次人工结果|
|---|---|---|
|desktop-and-mobile|完整首页/Logo/海报/字体；320、390、768、1440px；横屏、200%文字放大；无截断遮挡|待验收|
|keyboard-and-navigation|菜单开关、Tab/Enter/Escape、焦点返回、输入法、搜索、清除、前进后退、刷新深链接与原转场|待验收|
|real-network-and-resources|完整图片/字体/模块、慢网、缓存更新、远程游戏资源、无404/混合内容、真实服务器不存在路径404|待验收|
|public-copy-and-versions|最新介绍、第一世界角色/状态、M07候选与已发布试玩区分、W02固定M06、无交接/占位/虚假完成状态|待验收|
|downloads|真实下载按钮；M07源码、W02、32关/8世界与旧有效文件；下载后解压运行|待验收|
|released-games|已发布游戏自然启动/游玩/声音/输入/失败恢复；不把几何测试当原作通关；确认没有误替换稳定版|待验收|
|rights-and-credits|权利声明、署名、素材来源、分发范围与反馈入口；历史来源不因精简而遗失|待验收|

执行 `npm run release:review` 生成 `.local/release-r24/acceptance.json`。逐项填写设备、浏览器、结果和足够的复现或证据路径，再由实际审阅者填写 reviewer/reviewedAt/status；所有提醒都审阅后才勾选 warningsReviewed。没有证据就保留 pending。

```powershell
npm run release:gate
```

此命令核对记录是否完整、是否与当前源文件和产物匹配，不替代事实审查，不上传任何信息。如果源码或产物变化，不要沿用旧批准；归档旧记录后重新生成、验收。

完整资料所需输入：当前已经合并 R23 的完整仓库，包含实际 assets、content、作品详情、已发布 games、downloads 和相关部署配置。本次缺少的外层媒体与布局夹具不能充当该输入。
