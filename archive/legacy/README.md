# 旧版资料

这里保存目录整理前仍在项目中的旧实现，不参与 `scripts/build.js` 的正式构建。

- `styles/`：旧 `about.css`、`page.css` 和 `archive.css`。布局预览仍引用这里的 `page.css`，请保留。
- `templates/`：旧关于页、归档页、通用正文、页脚及导航信号等 HTML 片段。
- `content/`：旧归档数据 `archive.js` 与渲染器 `render-archive.js`，保留二者原有模块依赖。

当前页面内容在 `src/content/`，页面模板在 `src/templates/`，运行时样式与交互在 `assets/css/`、`assets/js/`。项目根目录的 `archive.html` 是转向联系页的兼容地址，与本目录中的旧归档资料用途不同。
