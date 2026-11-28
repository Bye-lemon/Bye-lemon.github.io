# 李英平 · Li Yingping

> 你的指尖，有改变世界的力量。

个人站点：自动驾驶、嵌入式、AI 与系统工具的开发笔记，另有一个持续维护的模型库和导航页。

线上地址：<https://bye-lemon.github.io>

## 技术栈

- **Astro 5**：静态站点生成，内容集合（posts / models / about）
- **Tufte 风格**：纸面与墨色、衬线正文、边注（sidenote）
- **自托管字体**：ET Book / EB Garamond / 霞鹜新致宋
- **FlexSearch + jieba**：构建期分词，前端轻量检索
- **Tabulator**：模型库表格（分页、排序、列显隐、分面筛选）
- **@astrojs/rss**：全文 RSS
- **Pagefind 已移除**，改用自建搜索索引

## 快速开始

要求 Node.js 版本见 `.nvmrc`（当前 24）。

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # 输出到 dist/
npm run preview    # 预览构建结果
```

## 目录

```text
source/
  _posts/              文章 Markdown
  about/index.md       关于页数据（经历 / 现在在做）
src/
  content/models/      模型库条目（一条模型一个 md）
  content.config.ts    内容集合 schema
  pages/               路由（文章、归档、模型库、笔记、导航、友链、关于、标签、RSS）
  layouts/             BaseLayout：顶栏、搜索模态框、页脚
  components/          Redirect 等小组件
  data/                词表、友链、页面诗句别名
  lib/                 文章 / 标签 / 搜索辅助
  styles/              全站与模型库样式
scripts/               模型库迁移、归一化、HF 补全、审计
public/                favicon、字体、CSS、robots.txt
docs/model-audit.md    模型数据审计报告
Agent.md               维护手册（改数据/改页面前先读）
```

## 写文章

在 `source/_posts/` 新建 `.md`，文件名即 URL slug。frontmatter 至少包含标题、日期、摘要与标签；具体字段以 `src/content.config.ts` 为准。

文章页支持侧边注、数学公式（KaTeX）、代码高亮（Shiki）与自动目录。

## 模型库

- 数据：`src/content/models/*.md`（唯一数据源）
- 词表：`src/data/model-taxonomy.json`
- 页面：`/models/` 列表，`/models/<slug>/` 详情
- 维护脚本：

```bash
npm run models:refactor -- --dry-run   # 旧结构残留检查
npm run models:normalize               # 别名 / 许可 / 日期归一，幂等
npm run models:enrich -- --dry-run     # HF 补全预览
npm run models:audit                   # 生成 docs/model-audit.md
```

字段、枚举、HF 映射与排错流程都写在 **`Agent.md`**，改模型数据前先读。

## 栏目

| 路径 | 内容 |
| --- | --- |
| `/` | 首页：一句题词 + 最近文章 |
| `/archive/` | 归档 |
| `/models/` | 模型库（219 条） |
| `/notes/` | 论文笔记 |
| `/nav/` | 导航（133 个站点） |
| `/friends/` | 友链：产业界博客 / 学术界主页 |
| `/about/` | 关于：经历与现在在做 |
| `/tags/` | 标签（拼音 slug） |

页面 H1 使用诗句别名，映射在 `src/data/aliases.ts`；`<title>` 仍保留「归档 · 李英平」这类原名。

## 搜索与 RSS

- 搜索：顶栏放大镜或 `⌘K` / `Ctrl+K` 打开模态框，结果分「文章」与「导航」；索引为 `/search.json`
- RSS：顶栏 RSS 图标，地址 `/rss.xml`，含全文 `content:encoded`，按日期倒序

## 部署

推送到 `src` 分支即触发 GitHub Actions（`.github/workflows/deploy.yml`）：

1. `npm ci --no-audit --no-fund`
2. `npm run build`
3. 上传 `dist/` 并用 `actions/deploy-pages` 发布到 GitHub Pages（构建与发布在同一个 job 内完成，省掉两个 job 之间的调度空档）

PR 走 `.github/workflows/ci.yml`：只构建、不发布；只改文档的 PR 会跳过构建，但检查本身仍会报告结果，不会把 PR 卡在「等待状态」。

只改 `README.md`、`Agent.md`、`docs/**`、`.github/ISSUE_TEMPLATE/**` 时不触发部署；同一 PR 连续推送会取消旧运行，只保留最新一次。

本地预览与线上构建一致；`dist/`、`.cache/`、`node_modules/` 不提交。

## 设计约定

- 单栏 Tufte 版面，宽度随断点递增（44rem → 66rem）；模型库 / 导航使用右侧边栏
- 纸色底 `#fffff8`、墨色文字、朱红强调；无深色模式
- 正文衬线，导航与元信息按场景使用无衬线 / 等宽
- 不做「收藏 / 星标」功能；模型库不放入口链接，维护统一走文档

## 许可

除特别说明和引用内容外，本站文字以 **CC BY 4.0** 许可。代码部分如无额外声明，随仓库提供。

---

维护细节、数据规范与常见坑见 [`Agent.md`](Agent.md)。
