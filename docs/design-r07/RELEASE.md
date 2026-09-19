# 安装、发布与回退

Node.js 22+，无需第三方 npm 安装。先提交/备份工作区，把升级包解压到仓库外。

```powershell
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --check
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --apply
```

第一条通过再执行第二条。拒绝未知 R06 核心源码、同名新文件、手改生成页、符号链接。没有 force 参数，不调用 Git。备份写在仓库旁边并打印位置。

在原仓库执行 `npm run site:build`、`npm run site:check`、`npm run site:audit`，以及原 check/test。沿用原启动命令。发布前审阅 diff；不要提交整个升级 ZIP、测试工作区或旁边备份。

回退先检查，再应用：
```powershell
node apply-update.mjs --target "你的仓库" --rollback "实际备份路径" --check
node apply-update.mjs --target "你的仓库" --rollback "实际备份路径" --apply
```

回退只涉及本包记录文件；安装后新增编辑会被拦截，保护你后续工作。哈希检测损坏和冲突，不是数字签名或完整安全认证。
