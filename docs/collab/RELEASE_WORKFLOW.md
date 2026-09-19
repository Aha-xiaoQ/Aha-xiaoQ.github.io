# 每一轮的本地更新、交付和手动推送

这是唯一建议的发布流程。工具不会提交、推送、创建远端 Issue 或更改权限。

## 1. 准备原仓库和增量包

增量包不是整个网站。必须保留你本地完整的 `Aha-xiaoQ.github.io` 文件夹、其中的 `.git`、游戏和素材。把 ZIP 解压到**仓库外**的单独目录。不要把 `repo/` 文件夹整体改名后当作新网站推上去，也不要删除不在更新包中的旧文件。

Node.js 22 或更高版本是必需的；本轮无 npm 第三方依赖，无需运行 npm install。先在终端执行 `node --version` 确认。

Windows 示例：原仓库位于 `D:\Projects\Aha-xiaoQ.github.io`，更新包解压在 `D:\Updates\MarioMix-Collab-R01`。根据实际位置修改命令。正在编辑的文件请先保存；应用过程中不要同时改动目标文件。

## 2. 先检查，再应用

在解压后的更新包目录打开终端：

```powershell
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --check
```

工具逐项核验 manifest 中的文件路径、包内新文件 SHA-256 和目标文件基线 SHA-256。基线来自记录的远端源文件；Windows CRLF/LF 换行差异会被兼容。源 SHA 只是记录起点，真正防止覆盖的是每个文件的预检查。

如果提示 `CONFLICT`，**不会写入任何包内更新文件**。保留现有新代码，交给下一轮做三方/逐项合并；不要删除冲突文件后强行套用。此工具不自动解决冲突，也不会强制重置 Git。

无冲突后执行：

```powershell
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --apply
```

应用前把原字节保存在目标目录 `.update-backups/`。重复应用相同版本会跳过已一致的文件。应用中遇到 I/O 错误会尝试回滚，并提示备份目录；这不是防突然断电的完整事务系统。目标路径/文件符号链接会被拒绝，避免误写到其他目录。

## 3. 在完整仓库中检查并试玩

```powershell
cd "D:\Projects\Aha-xiaoQ.github.io"
npm run check
npm test
npm run doctor
npm run dev
```

打开 `http://127.0.0.1:4173/dev/`。再从原站的笔记页、游戏列表和三期介绍页进入开发中心，测试来回跳转。R01 没有全面更换原站缓存版本；旧标签页看不到新入口时按 Ctrl+F5，或直接打开 `/dev/`。

`doctor` 只确认旧入口/字体/许可文件是否存在，不代表游戏行为通过。如果你正在只含增量文件的目录，它缺少原站文件是正常现象；可用 `npm run doctor -- --delta` 明确查看这一限制，不能用这个参数绕过完整仓库验收。

额外浏览器验收应覆盖三个旧试玩入口仍能启动、菜单可用、下载链接没变。完整通关、真实手柄、音频和本地存档是后续 TEST-001 的独立回归任务。不要仅凭工具测试通过就宣布游戏升级完成。

## 4. 审阅并手动推送

使用 GitHub Desktop 的 Changes 视图，或 `git status` 和 `git diff` 查看改动。本轮只有两个旧文件需要改变：`README.md`、`assets/site-shell.js`；其余为新增协作文件。

对提交内容逐项确认：不带 `.update-backups`、临时截图、个人密钥、素材重复副本或整个 ZIP；包含以点开头的 `.github`、`.gitignore` 和 `.editorconfig`。建议提交信息 `feat(collab): add developer center and resumable local workflow`。由你点击提交、推送，或使用自己熟悉的命令；本工具不代替你操作。

推送后按 [维护者设置清单](MAINTAINER_SETUP.md) 核查 Actions 和 GitHub 配置。仓库若由 main 发布 Pages，提交可能触发你既有的 Pages 流程；本轮没有改变其来源或加入另一套发布流程。

## 5. 保存网页状态修改

开发中心的编辑器保存的是本地草稿。导出 `project.json` 后，检查其内容再放回 `collab/project.json`。确认 task 状态、验收依据、日期、`deliveryStatus`、`nextTask` 与实际一致。随后：

```powershell
npm run collab:build
npm run check
npm test
```

同时提交 `collab/project.json`、生成的 `collab/TASKS.md` 与 `dev/project-data.js`。不要直接编辑后两项；不要只提交浏览器 localStorage。

## 6. 下一轮生成可恢复更新包

下一轮从最新完整 Git checkout 开始，记录**修改前**的 40 位提交 SHA。读取 AGENTS、HANDOFF、状态、验证记录。每次只选一个明确目标，修改后更新记录、生成、校验。

`collab/delivery-files.txt` 是显式交付白名单。新增文本文件需要加进去；不自动收集所有未跟踪文件。工具拒绝字体、二进制、下载归档和私密/危险路径，不会通过扩大白名单绕过素材审计。

```powershell
npm run collab:pack -- --base <修改前的40位提交SHA> --out ../MarioMix_Collab_R02_Update.zip
```

尖括号是说明，请用实际 SHA 替换，不能原样执行。输出必须在源码仓库之外，且不能覆盖已有 ZIP。打包只在本机读取 Git 的基线内容，不联网、不提交、不推送；产出包包含新旧文件哈希、安装器、说明和 repo/ 更新文件。它处理新增/修改文件，**不自动交付删除或重命名**。后续确需删除/迁移，应另写明确迁移方案，不伪装成普通覆盖包。

R01 制作环境没有完整 clone，故使用已核验 Git blob 的两个原文件构建首次包；这不改变以后应优先使用最新完整 checkout 的原则。

## 7. 回退

在原更新包目录运行，备份位置替换为应用成功时输出的真实路径：

```powershell
node apply-update.mjs --target "D:\Projects\Aha-xiaoQ.github.io" --restore "D:\Projects\Aha-xiaoQ.github.io\.update-backups\实际备份目录" --check
```

确认后把 `--check` 改为 `--apply`。回退只恢复本包改动、删除本包新增的文件，保留无关文件；检测到应用后的新修改会停止，让你先保护这些修改。无需删除整个项目或重建 `.git`。备份是本机工作文件，不应该推送。

若已推送到 GitHub，先通过你自己的 Git 流程创建可审阅的恢复提交；本地恢复不会自动撤销远端历史。
