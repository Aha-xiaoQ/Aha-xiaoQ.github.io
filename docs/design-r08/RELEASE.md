# 应用、复验与回退

解压本包到原仓库之外。在已安装 R07 的完整仓库副本上使用，不把 payload 当成整站。使用 Node.js 22+，无需 npm install。

```powershell
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --check
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --apply
```

更新器先核对已知源码、生成文件哈希和素材配置，遇到未知编辑停止。工作流条目若有自定义配图，要求合并而非重置；其他表现记录保留。写前重新检查目录项并记录备份，备份位于仓库旁边。

```powershell
node apply-update.mjs --target "你的仓库" --rollback "打印出的实际备份路径" --check
node apply-update.mjs --target "你的仓库" --rollback "打印出的实际备份路径" --apply
```

后续编辑会阻止回退。不要为了安装通过，删除新文件、倒退源码或用旧清单覆盖新清单。不会执行 git、推送、创建 Issue 或发布 Release。不要提交本更新 ZIP、测试夹具或仓库旁的备份；只提交原仓库里经过审阅的改动。

Windows 下 CMD 的交互流程和文件权限需在真实机器验收；如路径有空格用引号传递命令行参数。脚本测试中的 hash 用于发现损坏和冲突，不是数字签名。
