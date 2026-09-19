# 统一行动组件

## 标记与接口

assets/ui/site-actions.js 是纯标记生成器，不操作 DOM；静态构建 VM 与运行页面共用它。页面的脚本加载顺序：site-actions → 媒体/卡片 → promo/site-shell → site-router。journal/render 也通过同一个模块的幂等入口读取接口。

```js
SITE_ACTIONS.link('开始试玩', '/games/example/play.html', {
  className: 'button', variant: 'primary', ariaLabel: '试玩：示例游戏'
});
SITE_ACTIONS.link('下载源码', '/downloads/source/example.zip', {
  className: 'button button--quiet', variant: 'quiet', download: true
});
SITE_ACTIONS.link('观看视频', 'https://www.bilibili.com/video/example', {
  variant: 'quiet', newTab: true, meta: 'Bilibili'
});
```

支持 primary/secondary/quiet/text/card。图标不承担唯一名称；空白或仅箭头的动作会报错。当前下载格式默认为ZIP，其他格式必须通过meta明确设置。download只允许站点相对路径，跨域下载应使用正常外部链接，不承诺强制保存。

外链允许HTTPS；mailto保留邮箱语义。禁止javascript/data/含凭证地址。不得把此URL校验与文件系统的safe()混淆；构建写入仍走lstat路径防护。

## 模板迁移

scripts/ui-polish/native-html.mjs只处理已存在链接的边缘装饰；script/style/pre/code保持原字节。首页promo仅移除两类已确认的aria-hidden箭头节点。不修改文章过程图、文件内容或所有Unicode箭头。

用wireHTML统一增加一次样式与脚本，重复构建不再叠加。不要手工在所有页面各加一份链接组件代码。不要把生成页面当源码修改。

## 交互规范

主要独立操作区最小44px是本项目设计目标（非声称WCAG AA对所有链接要求44px）。正文内链接按文字行高保留。焦点以3px轮廓表示，深/浅卡片采用不同适配。下载与新标签用格式/上下文文字表达；ARIA补充目标名称，正文不重复塞完整项目标题。

## 验证边界

ui:check是本项目的有限契约检查，不是通用HTML解析器或无障碍认证。需另做浏览器、屏幕阅读器、真实下载、键盘与设备测试；不得靠关键词自动删除文案。
