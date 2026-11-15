# 小六与巨大旧钥匙 · M82

《只狼：影逝二度》PC 版非官方角色与武器外观 MOD。将主角外观替换为小六，将楔丸外观替换为巨大旧钥匙，并包含配套动作适配。需要自行拥有并安装游戏；不含游戏本体、存档或加载器。

## 安装（Windows / Steam）

1. 正常退出游戏。首次使用 MOD 前，建议自行备份 `%APPDATA%\Sekiro` 中的存档，并记下原有 Steam 启动选项。
2. 从官方页面下载并解压 ME3 v0.13.0 Windows 版：https://github.com/garyttierney/me3/releases/tag/v0.13.0 。找到实际的 `bin\me3.exe`。
3. 将本包解压到一个固定目录。确认其中有 `six-key\parts` 与 `six-key\chr`，不要只解压其中一个文件夹。
4. Steam → 库 → 只狼 → 属性 → 通用 → 启动选项。按下面格式填写，将两处路径换成你自己的实际绝对路径，保留引号和 `%command%`：

```text
"<ME3目录>\bin\me3.exe" launch -g sekiro --skip-steam-init --no-mem-patch --package "<本包解压目录>\six-key" -e %command%
```

5. 从 Steam 启动游戏。进入存档后应看到黄色雨衣的小六；取得楔丸后武器外观为巨大旧钥匙。序章未拿刀时不会显示钥匙。

无需覆盖游戏原文件，也无需导入别人的存档。请先单独启用本包；其他角色、武器、义手或动作 MOD 若覆盖相同文件，可能产生冲突。若仍显示狼，检查 Steam 启动选项、ME3 可执行文件路径及 `six-key` 目录层级；不要把示例尖括号原样填入。

## 停用与卸载

退出游戏，将 Steam 启动选项恢复为安装前的内容（此前为空则清空），再启动即可恢复原版。之后可以移除本包的解压目录。不要删除 Sekiro 存档目录。

## 版本与使用范围

M82 包含小六、巨大旧钥匙、握环与衣摆的动作适配。部分大幅动作仍可能出现轻微衣物接触或折痕；不能保证所有忍具、服装变体与其他 MOD 组合都兼容。手里剑义手轮体经过缩小适配，使用时外观也会较小。不死斩与忍具伞不是本版的完整适配目标。

MOD 制作：GPT-6 Astra / Codex；模型：Tripo；策划、试玩：在下_小Q。小六源自《小小梦魇》，游戏及用于适配的原有骨架、材质和动作数据源自《只狼：影逝二度》。相关角色、游戏和素材权利归各自权利人；本包是非官方同人 MOD，不代表官方授权或可自由商业再分发。ME3 由其原作者独立提供，遵循其自身许可，本包不捆绑加载器。

视频：https://www.bilibili.com/video/BV1C4sG6zE9X/
网站：https://aha-xiaoq.github.io/
反馈：https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/issues

## English quick start

Unofficial Six + giant key appearance mod for Sekiro (Windows / Steam). Own the game and download ME3 v0.13.0 from the official link above. Exit Sekiro, extract this ZIP, and set the Steam launch options using the command above, replacing both placeholder paths. Keep both `six-key/chr` and `six-key/parts`. Start through Steam. The key appears after obtaining Kusabimaru. To disable, restore your previous Steam launch options. Do not delete saves. Avoid combining with mods that replace the same assets or animations. Minor clipping can remain during extreme motions; full prosthetic compatibility is not guaranteed. Original character, game and asset rights remain with their owners. No game, saves or loader executables are included.
