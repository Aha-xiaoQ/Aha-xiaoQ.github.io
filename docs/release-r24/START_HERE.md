# R24 · 上线目录清理与发布核验

用于已经安装 R23 的完整网站副本，当前游戏源码 M07 / 0.4.3、地图工具 W02 / 0.2.0。不是整站备份，不更换已发布游戏，也不执行 Git 或部署操作。

**本包已经完成代码与安装测试；完整网站的上线验收尚未通过。** 当前可用的外层网站输入缺少完整品牌媒体及部分原有作品文件，包含明确的旧布局测试数据。发布检查会阻止这些输入成为上线目录，不能用本包附带的局部截图代替完整验收。

## 安装

Node.js 22 或以上，无需 npm install。先提交或备份工作区；将整个更新包解压到仓库之外，双击 APPLY_R24.cmd，或在更新包目录运行（替换实际路径）：

```powershell
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --check
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --apply
```

前一条通过后再应用。源码、命令、同名文件或版本冲突时停止，保留修改后合并；没有强制覆盖。更新前在仓库旁备份，工具打印回退路径。

## 检查完整网站并生成发布目录

安装后在原仓库执行：

```powershell
npm run release:test
npm run journal:build
npm run site:build
npm run check
npm test
npm run release:plan
npm run release:prepare
npm run release:check
npm run release:serve
```

顺序执行，遇到失败停止处理。`release:plan` 只规划并输出审计报告，不写发布目录；`release:prepare` 只有零阻断项才生成 **.local/publish/**。报告位于 `.local/release-r24/report.json`。缺少图片、页面、下载或含有测试文案时，请补入真实文件或修改源内容，不用空文件或关闭检查代替修复。

最终预览地址 **http://127.0.0.1:4197/**。这里查看的是发布目录；原 npm start/dev 仍是开发工作区，其中管理与交接资料保留，不代表这些资料会被发布。

## 验收与部署

完成真实浏览器和设备检查后，运行 `npm run release:review` 生成待填写记录，再按 ACCEPTANCE.md 记录证据并执行 `npm run release:gate`。默认不批准。代码或发布内容变化会使旧批准失效。

**只发布 .local/publish 的内容，不能继续把整个仓库根目录作为网站上传。** 本包不修改 Pages 设置，也不激活工作流。可选 GitHub Actions 示例和手动设置说明见 PUBLISH.md。

当前 M07 是开发候选；前三期既有试玩保持原文件。W02 的固定 M06 运行时与当前游戏源码不是同一个发布版本。地图参考、实验能力及奥日 1-4 的未完成状态仍如实显示。

## 回退

使用安装器输出的真实备份路径：

```powershell
node apply-update.mjs --target "仓库路径" --rollback "备份绝对路径" --check
node apply-update.mjs --target "仓库路径" --rollback "备份绝对路径" --apply
```

回退保护安装后的新编辑，无关工作保留。`.local/` 是本地生成目录，回退源码不会自动将其作为新版发布；需按相应源码重新构建。不要提交更新 ZIP、安装备份、本地审阅记录或测试输出。

阅读顺序：本文件 → PUBLISH.md → ACCEPTANCE.md → TEST_REPORT.md。持续开发与实现位置见 HANDOFF_R24.md。
