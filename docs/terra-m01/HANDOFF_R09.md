# 第三期源码接入交接 · R09 / terra-m01

## 唯一底稿
用户上传 mario-mix-3.zip；HTML SHA256 e134fdee21a6dce43585cda93c582ca2c0bf45f325f14cde81e33b80b758f19c。不要用 R29、城堡关或旧 R21 代替。网站公开 play.html 与用户下载版没有被宣称字节相同。

## 交付组成
packages/mario-mix-terra 为唯一可编辑源码目录；dist 是本地生成产物；downloads/source/MarioMix_Terraria_M01_Source.zip 是独立源码快照。下载包 SHA 与大小见同名 JSON。更改源码后运行 `npm run terra:pack`，检查后更新 downloads 中的源码包和版本信息，避免网页下载仍停留在旧源码。

网站只追加 mario-mix 项目的一个 doc、一个待验收更新记录和一个链接；通用生成器生成资料页。旧任务源、其他项目配置、CSS、router、游戏运行文件均保留。R09_INSTALLATION.json 记录实际修改哈希，不作为 CI 或部署成功证明。

## 下一步
1. 在维护者完整 Windows 仓库运行新增工程测试和原站检查；验证源码下载链接与 ZIP SHA。
2. 对比候选与原游戏，记录自然游玩、真实手柄、音频、网络资源、暂停/库存/设置场景。
3. 从 docs/TASKS.json 选择小任务；先让一个贡献者完成修改→测试→构建→PR 审核，不自动写成已完成。
4. 优先迁出后期输入与菜单焦点，再迁场景/库存；不继续扩大 compat 包装链。

## 安全与回退
路径检查直接 lstat，拒绝悬空链接/junction，保留 Windows CRLF 兼容。未实现对恶意并发本地进程的完整文件系统隔离。备份在仓库旁，不发布到站点。默认只是检查；应用和回退都比对原字节，后续编辑则停止。源目录已有不同内容不能覆盖。
