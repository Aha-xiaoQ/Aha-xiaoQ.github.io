# 接入 M06 开发副本

## 前提

使用独立解压的 MarioMix_Terraria_M06 源码，版本0.4.2；不要选择网站根目录或已发布HTML。工具会核对五个实际M06驱动模块的哈希，允许文本换行差异，但不接受未知源码修改。

在本地图工具包根目录运行：

```sh
npm run integrate -- --target "D:\Projects\MarioMix_Terraria_M06" --level 1-1 --check
npm run integrate -- --target "D:\Projects\MarioMix_Terraria_M06" --level 1-1 --apply
```

省略 `--level` 会导入当前四关与共用测试角色。先检查没有冲突，再应用。导入只新增 `content/extensions/` 中的 JSON；不修改 `src`、`release.json`、底稿、已发布游戏或现有角色。重复导入相同内容不再写入；同名不同内容会停止。

然后在 M06 副本执行：

```sh
npm run stage:check
npm run build
npm run dev
```

打开 http://127.0.0.1:4193/play.html?dev=1 。在侧栏“关卡开发 · 接入试验场”勾选“显示开发草稿”，选择以 `atlas-` 开头的关卡与测试角色。绿色虚线连接点使用 E 触发，是开发传送，不是原版钻管道动画。

## 导入自己的草稿

```sh
npm run fork -- --id guest-level --from 1-3 --apply
npm run integrate -- --target "M06源码路径" --file content/forks/guest-level.json --check
npm run integrate -- --target "M06源码路径" --file content/forks/guest-level.json --apply
```

新角色配置需要同时加入 `characters` 数组以及关卡允许角色列表；只填一个名字不会生成角色实现。输入与场景接口仍遵守原M06契约。

## 撤回

命令成功会打印 `.local/atlas-import-….json` 记录路径。先检查，再撤回：

```sh
npm run integrate -- --target "M06源码路径" --undo .local/atlas-import-实际编号.json --check
npm run integrate -- --target "M06源码路径" --undo .local/atlas-import-实际编号.json --apply
```

导入后已编辑的文件会阻止撤回；先保存并合并自己的工作。`.local` 导入记录用于本地管理，不提交到仓库。
