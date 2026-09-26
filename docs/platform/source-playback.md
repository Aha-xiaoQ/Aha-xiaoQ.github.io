# 制作工程的离线播放契约

中秋特别节目的当前下载为 `experiments/releases/mid-autumn-special/source-r49.zip`；来源登记在 `content/experiments/mid-autumn-special.json`。旧 `source.zip` 作为历史文件保留，但不再是当前作品页的下载目标。

完整解压后打开 `MidAutumn_Final_Source/index.html`，或在 Windows 双击 `PLAY.cmd`。`final.mp4` 和 `poster.jpg` 必须与入口放在一起。观看不需要 Python、FFmpeg、联网或字体安装。

`BUILD.cmd` 与 `finalize.py` 仅用于可选重新合成；需要 Python、FFmpeg、ffprobe，输出到新目录，拒绝覆盖已有成片。重画插画才需要 `drawing/requirements.txt` 中的依赖和本机中文字体。字体文件存在但缺少绘制所需汉字时，同样会报错，不会静默导出方框文字。

`config/lab-source-playback.json` 声明入口、资源与源码成员。`scripts/platform/source-playback.mjs` 在原有源码检查中核对 ZIP CRC、相对资源、入口模板和网站成片的字节身份。ZIP 格式正确但缺视频、缺入口、路径写成站点绝对地址或发生大小写冲突，均不能通过。

视频与音轨仍为已确认的 136 秒《彩云追月》最终版；这次修复不会替换 B 站既有稿件。测试范围和设备限制须按真实执行情况记录。
