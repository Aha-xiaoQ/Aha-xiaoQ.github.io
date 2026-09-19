# 安装与回退

需要Node.js22+，不需要npm install。最终合集解压在原仓库之外。先提交或备份本地工作。

```powershell
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --check
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --apply
```

第一条通过后再第二条。最终合集自动判断R17或R18；R17会先在内存中规划R18再规划R19，所有冲突通过后才写盘。没有直接覆盖payload的安装方式。

备份在原仓库旁，打印真实路径。回退先检查再应用：

```powershell
node apply-update.mjs --target "仓库路径" --rollback "实际备份路径" --check
node apply-update.mjs --target "仓库路径" --rollback "实际备份路径" --apply
```

回退保护后续修改，保留无关新文件。原R18若此前单独应用，本合集备份只覆盖本次R19；从R17直接应用则一份备份恢复R17。

未知当前版本、手改生成页、自定义404、同名新文件和符号链接都会要求核对，不能倒退源码强行安装。本工具没有force、Git写操作或发布授权。SHA清单用于损坏检查，不是签名。
