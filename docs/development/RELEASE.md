# 安装、发布与回退

适用于已安装已核验 R03 的完整原仓库副本，不是整站替代品。包外有 `START_HERE.md`、`apply-update.mjs` 与 Windows CMD。Node.js 22+；不需要 npm install。

先备份/提交自己的工作区，将 ZIP 解压到原仓库之外。检查命令：

```powershell
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --check
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --apply
```

先检查成功再应用。未知 core 指纹、同名新增文件、两套状态、符号链接或检查后变化会停止；没有 force。不会调用 git 或网络写入。备份放在原仓库旁边，完成时打印准确路径。

## 应用后

```sh
npm run journal:build
npm run test:journal
npm run check
npm test
```

沿用 A 的 `npm run dev` 或 B 的 `npm start`；打开 `http://127.0.0.1:4173/notes/`。旧 `test:native` / `test:site` 的界面断言由新的 R04 集成断言替代，原状态/更新器测试保留。相关源码修改会列在安装清单。

检查原网站、游戏、下载、语言、动画及草稿；看 Git diff 后由用户提交。原站缓存可用 Ctrl+F5 辅助排查，但不能把强刷当作资源路径正确的证明。推送后检查实际 Pages 结果，再登记线上状态。

## 回退

使用应用时打印的备份路径：

```powershell
node apply-update.mjs --target "你的仓库路径" --rollback "实际备份路径" --check
node apply-update.mjs --target "你的仓库路径" --rollback "实际备份路径" --apply
```

安装后又编辑的文件会受到保护，不能强制用旧包覆盖。回退不清理 .git、不修改任务 JSON、不删除后来新增的独立文件。恢复操作中发生磁盘异常时保留备份，逐项核对结果。

## 兼容范围

本包检测 native R03 与 clarity R03，分别支持 A/B 状态源。此前两包都叫 R03，不应凭名称猜版本。核心原文指纹必须匹配经过核对的版本；任何人工二次修改需重新合并，而不是倒退源码。

`R04_INSTALLATION.json` 记录实际文件前后哈希和未改变的状态/样式来源。`package-manifest.json` 是损坏检查，不是数字签名，也不能代替审阅来源。

原启动器的控制台入口已改为 `/notes/`；HTTP 服务逻辑不改。原笔记 HTML 同时保留纯文本快照，生成列表依然以 SITE_DATA.notes 为准。仅写在旧 HTML、未进入数据源的笔记应人工整理回源数据，不会自动推测转换。
