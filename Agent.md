# Agent.md — 模型库维护手册

> 面向后续接手的 Agent（也给人看）。目标：不依赖思源，直接维护 Markdown；分类是**分面（facet）**结构，每个维度只回答一个问题。

## 1. 文件地图

| 路径 | 作用 |
| --- | --- |
| `source/_posts/*.md` | 文章源文件（Hexo 迁移而来） |
| `.github/ISSUE_TEMPLATE/` | Issue 模板：新增网站（`nav-add`）/ 论文笔记（`paper-note`）/ 新增模型（`model-add`），协作入口（见 §15） |
| `source/about/index.md` | 关于页数据（frontmatter 的 `timeline` / `now`） |
| `src/content.config.ts` | 内容集合 schema |
| `src/content/models/*.md` | 唯一数据源，一条模型一个文件，文件名即 slug |
| `src/data/model-taxonomy.json` | 词表与映射（字段顺序、枚举、旧值别名、HF pipeline 映射） |
| `scripts/refactor-models.mjs` | 旧版 `type + tags` → 分面字段；幂等 |
| `scripts/normalize-models.mjs` | 别名归一（类型/协议/作者/tags/日期），幂等 |
| `scripts/enrich-hf-models.mjs` | 从 Hugging Face API 补全语言/任务/许可/架构/热度 |
| `.cache/hf-models/` | HF API 缓存（已 gitignore） |
| `src/pages/models.astro` | 列表页（Tabulator 交互） |
| `src/pages/models.json.ts` | 列表页数据端点 |
| `src/pages/models/[...slug].astro` | 详情页 |
| `src/content/models/README.txt` | 给人看的快速上手（不含枚举全集） |
| `src/data/friends.ts` | 友链数据（industry / academic） |
| `src/data/aliases.ts` | 页面 H1 诗句 |
| `src/data/nav.yml` | 导航数据（分类 / 子分类 / 链接），唯一数据源（从 Navi 仓库迁移，Navi 不再维护） |
| `src/lib/tags.ts` | 标签 → 拼音 ASCII slug |
| `src/pages/nav.astro` | 导航页（143 条站点） |
| `src/pages/search.json.ts` | 搜索索引（文章 / 模型 / 导航） |
| `src/pages/rss.xml.ts` | RSS 全文输出 |
| `src/layouts/BaseLayout.astro` | 顶栏、搜索模态框、页脚 |
| `src/styles/global.css` / `models.css` | 全站样式 / 模型库样式 |
| `public/favicon.*` | 纸墨风格 favicon（svg / ico / png） |
| `docs/model-audit.md` | 模型数据审计报告 |
| `README.md` | 项目说明（给人看） |

**不要**再从思源导出覆盖这些文件；思源数据已经过时，反向导出会覆盖人工修正。

## 2. 数据模型（frontmatter）

字段顺序以 `model-taxonomy.json` 的 `fieldOrder` 为准。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | string | 展示名，保持官方写法 |
| `category` | single | 粗粒度大类（见 §3） |
| `tasks` | multi | 任务，主任务放第一个 |
| `modalities_in` / `modalities_out` | multi | 输入 / 输出模态 |
| `languages` | multi | 自然语言能力，BCP-47 开放词表：常见语言有中文 label，其余代码直接展示；多语言用 `multilingual` |
| `domains` | multi | 领域/场景，和任务正交 |
| `role` | single | 基座 / 骨干 / 微调版 / 应用 / 智能体 / 奖励模型 |
| `architecture` | single | dense / moe / diffusion / transformer / cnn / rnn / ssm / hybrid |
| `training_stage` | multi | pretrained / sft / rlhf / dpo / distillation / continual |
| `access` | single | open-weights / open-source / api-only / gated |
| `status` | single | preview / stable / deprecated |
| `size_class` | single | 由参数量的上界推导：<1B / 1-10B / 10-100B / 100B-1T / >1T |
| `params` | string | 原始参数量文本，保留 0.2B~2B 这类区间 |
| `context_length` | number | 上下文长度（token），可选 |
| `family` | string | 家族/系列名（品牌词只放这里，不做 tag） |
| `base` | string | 基座模型 |
| `license` / `author` / `updated` | string | 许可、发布方、更新日期（YYYY-MM-DD） |
| `published` / `paper` | string | 发表情况 / 论文链接 |
| `link` | string | 权重或主页 |
| `hf_id` | string | `org/repo`，从 link 解析或 HF 补全 |
| `hf_collection` / `collection_models` | string / multi | HF 集合条目：集合 slug 与集合内全部模型 id（详情页列出） |
| `hf_org` / `org_models` | string / multi | HF 组织页条目：组织名与组织下全部模型 id（详情页列出） |
| `downloads` / `likes` / `hf_last_modified` | number/string | HF 热度与最后修改时间（自动） |
| `note` | string | 一句话备注，列表悬停显示 |
| `tags` | multi | **只放跨切概念**，最多 4 个；语言/任务/模态/领域都不许放这里 |

### 枚举全集

见 `src/data/model-taxonomy.json` 的 `fields`。新增值必须先加进 `canonical/values`，否则脚本会告警。

- **category**: language / vision / speech / multimodal / retrieval / generation / time-series / decision / world-model / data
- **tasks**: chat, text-generation, instruction, reasoning, code, math, translation, summarization, classification, ner, embedding, similarity, rerank, retrieval, qa, fill-mask, detection, segmentation, ocr, document-extraction, captioning, depth-estimation, asr, tts, vad, audio-generation, music, image-generation, video-generation, 3d-generation, forecasting, planning, reward-modeling, moderation, agent, tool-use
- **modalities_in**: text, image, video, audio, 3d, document, tabular, time-series
- **modalities_out**: text, image, video, audio, 3d, embedding, score, action, time-series
- **languages**: zh, en, ja, ko, fr, de, es, ru, ar, pt, it, multilingual, other
- **domains**: code, document, medical, finance, legal, science, education, ecommerce, security, gaming, music, robotics, autonomous-driving, industrial
- **role**: base, instruct, chat, backbone, finetune, application, agent, reward
- **architecture**: dense, moe, diffusion, transformer, cnn, rnn, ssm, hybrid, unknown
- **training_stage**: pretrained, sft, rlhf, dpo, distillation, continual
- **access**: open-weights, open-source, api-only, gated
- **status**: preview, stable, deprecated
- **size_class**: <1B, 1-10B, 10-100B, 100B-1T, >1T

## 3. 旧值映射（自动）

`scripts/refactor-models.mjs` 使用 `taxonomy.legacy`：

- 旧 `type`：LLM→language、CV→vision、Voice→speech、Similarity→retrieval、AIGC→generation、Decision→decision、BasicLM→language+role:base、Time Series Forecasting→time-series、World Model→world-model、DataScience→data
- 旧 `tags`：Vision→modalities:image；Japanese→languages:ja；IDP→domains:document + tasks:document-extraction/ocr；TTS→tasks:tts；Omni→multimodal；ASR→tasks:asr；Guard→tasks:moderation；Video→modalities:video；Code→domains:code；NMT→tasks:translation；Detection→tasks:detection；Backbone→role:backbone；Reward→tasks:reward-modeling；3D→modalities:3d；NER→tasks:ner；VAD→tasks:vad；Provence→family；其余未映射值保留到自由 `tags`

## 4. 标准工作流

### 4.1 新增一个模型

1. 在 `src/content/models/` 新建 `<slug>.md`（slug：小写、连字符、与 name 对应）：
```yaml
---
name: "DeepSeek-V3"
category: language
tasks: [chat, reasoning, code]
modalities_in: [text]
modalities_out: [text]
languages: [zh, en]
domains: [code]
role: chat
architecture: moe
training_stage: [pretrained, sft]
access: open-weights
status: stable
size_class: 100B-1T
params: "671B"
context_length: 128000
family: DeepSeek
base: ""
license: MIT
author: DeepSeek
updated: 2024-12-26
published: 技术报告
paper: https://arxiv.org/abs/2412.19437
link: https://huggingface.co/deepseek-ai/DeepSeek-V3
hf_id: deepseek-ai/DeepSeek-V3
downloads: ""
likes: ""
hf_last_modified: ""
note: "MoE 推理效率"
tags: []
---
备注正文（可选）
```
2. 运行 `npm run models:normalize`（别名与格式校验）
3. 运行 `node scripts/enrich-hf-models.mjs --write --only-missing`（补 HF 数据）
4. `npm run build` 后用 `npm run preview` 检查

### 4.2 批量修改

- 只改数据：编辑 md → `npm run models:normalize` → `npm run build`
- 改字段结构：先改 `model-taxonomy.json` 的 `fieldOrder/fields`，再写迁移脚本或扩展 `refactor-models.mjs`
- 新增枚举值：先加入 `fields.<field>.values`，再批量回填；`normalize` 会对未登记值告警

### 4.3 从 Hugging Face 富化

```bash
node scripts/enrich-hf-models.mjs            # dry-run
node scripts/enrich-hf-models.mjs --write    # 写入
node scripts/enrich-hf-models.mjs --write --only-missing --limit 50
node scripts/enrich-hf-models.mjs --write --refresh   # 忽略缓存
```

映射规则（见 `taxonomy.hf`）：

| HF 字段 | 写入 |
| --- | --- |
| `pipeline_tag` | `tasks` + `modalities_in/out`（映射表） |
| `tags: language:*` / `cardData.language` | `languages` |
| `tags: license:*` / `cardData.license` | `license`（仅空时） |
| `tags: base_model:*` | `base`（仅空时） |
| `tags: arxiv:*` | `paper`（仅空时） |
| `tags: moe/diffusion/...` + `config.architectures` | `architecture`（仅空时） |
| `gated` | `access`（gated / open-weights，仅空时） |
| `downloads` / `likes` / `lastModified` | 对应字段 |
| `collections` / 非 HF 链接 | 跳过并计入报告 |

- 修正规则：许可按 HF 覆盖（"other" 保留人工值）；非 Series 条目用 `safetensors.total` 精确参数量；VLM/音频模型的 category 会按 pipeline 纠正
- 镜像链接 `hf-mirror.com` 会转换为官方 `huggingface.co`；集合/组织页会解析成模型 id 列表（`collection_models` / `org_models`），详情页逐条列出；集合 404 时记为未解析
- 缓存：`.cache/hf-models/<org>__<repo>.json`；`--refresh` 强制重拉
- 限流：默认每个请求间隔 120ms；失败重试 2 次
- 私有/受限仓库：当前不发送 token；需要时加 `HF_TOKEN` 环境变量与 `Authorization` 头

## 5. 校验与 CI

本地/CI 都跑：

```bash
node scripts/refactor-models.mjs --dry-run   # 结构迁移是否还有遗留
npm run models:normalize                     # 别名与格式（幂等，0 改动即通过）
node scripts/enrich-hf-models.mjs --dry-run  # HF 是否还有可补字段
node scripts/audit-models.mjs                # 生成 docs/model-audit.md（HF/集合/组织/未解析与差异）
npm run build
```

注意：

- `refactor-models.mjs` 默认 dry-run，加 `--write` 才写
- `normalize-models.mjs` 会打印每字段改动数和告警；告警必须在合并前清零
- 不提交 `.cache/`、`dist/`、`node_modules/`
- `deploy.yml` 对 `README.md`、`Agent.md`、`docs/**`、`.github/ISSUE_TEMPLATE/**` 的改动不触发部署（paths-ignore）

## 6. UI 约定（给改页面的 Agent）

- 列表页从 `/models.json` 取数，表格用 Tabulator；筛选维度：`category/tasks/modalities_in/languages/domains/role/access`
- 多值字段用 chips 多选，单选字段用下拉；显示名一律取 `taxonomy.fields.*.values` 的中文 label
- URL 参数：`?q=&category=&tasks=&languages=&role=&=&page=`
- 详情页展示：分类、任务、模态、语言、领域、角色、架构、规模、上下文、许可、HF 热度、外链、基础模型
- 颜色按**固定枚举**映射（不要字符串哈希）
- 顶栏品牌固定 `Li Yingping`；导航用英文：`Articles / Archive / Models / Notes / Sites / Friends / About`，当前页斜体
- 页面 H1 用 `src/data/aliases.ts` 里的诗句，不再写页面名；`<title>` 保留「归档 · 李英平」这类原名
- 搜索是全局模态框（`⌘K` / 图标），不占新页面；结果分「文章」「导航」两组
- RSS 是顶栏图标（`/rss.xml`），页脚只留一行版权 + `Keep it simple and stupid.`
- 模型库右上角不再放「编辑数据 / 新增模型」入口

## 7. 常见坑

1. **不要再从思源导出**：会覆盖 type/license/author 修正。
2. **标签混用**：`Vision`/`Japanese`/`TTS` 这类值已经拆进模态/语言/任务；新增自由 tag 前先问“它属于哪个维度”。
3. **品牌词不做 tag**：Series、Provence、GPT-OSS 等放 `family`/`name`。
4. **`series` 条目与单模型条目并存**：用量产系列时 `role` 可留空，但 `family` 必填，便于聚合。
5. **参数量区间**：`params` 保留原文（如 `0.2B~2B`），`size_class` 按上界推导。
6. **未来日期**：脚本只告警不修改；发现即回源确认。
7. **HF collections 链接**：不是模型仓库，脚本会跳过；请改成具体模型链接。
8. **空值允许**：不要为凑字段编造；筛选与统计会按实际覆盖展示。
9. **集合/组织页要解析成模型列表**：`huggingface.co/collections/...` 通过 Collections API 展开为 `collection_models`，组织页通过 `/api/models?author=` 展开为 `org_models`；详情页会全部列出。
10. **作者是品牌名，不是 HF org id**：`Meta/facebook`、`MongoDB/voyageai` 这类差异是正常的，不要机械合并。
11. **Series 条目保留区间参数量**：如 `100B~1T`，不要用单个 repo 的 safetensors 数值覆盖。

## 8. 迁移记录

- 2026-11：从思源 3.8.10 的 `模型库` 数据库（219 行 × 14 字段）导出为 Markdown；随后放弃思源维护。
- 旧 `type + tags` 已由 `refactor-models.mjs` 迁移为分面字段；`tags` 只保留未识别的跨切值。
- 数据来源与口径以本文件和 `model-taxonomy.json` 为准。

## 9. 命令速查

```bash
npm run dev                                      # 本地开发
npm run build                                    # 生产构建
npm run preview                                  # 预览构建结果

npm run models:refactor -- --dry-run             # 检查旧结构残留
npm run models:refactor -- --write               # 执行旧结构迁移
npm run models:normalize                         # 归一化 + 校验（幂等）
npm run models:enrich -- --dry-run               # 预览 HF 补全
npm run models:enrich -- --write                 # 写入 HF 数据
npm run models:audit                             # 生成 docs/model-audit.md
```


## 10. 友链（/friends/）

数据文件：`src/data/friends.ts`，页面：`src/pages/friends.astro`。固定顺序：**产业界在前，学术界在后**；两段都是一行一条的列表。

### 字段

| 字段 | 适用 | 说明 |
| --- | --- | --- |
| `name` | 全部 | 产业界写「XX的博客」；学术界写姓名（如 `李运恒`） |
| `url` | 全部 | 博客或主页地址 |
| `kind` | 全部 | `industry` / `academic` |
| `university` | academic | 机构中文名（可以不是大学），如 `南开大学`、`阿里巴巴` |
| `title` | academic | 职位：博士 / 研究员 / 讲师 / 副教授 / 教授 等 |

### 渲染规范

- **产业界**：只显示名字，例如 `叶老师的博客`、`爱宾的博客`、`炳君的博客`；**不加公司或方向介绍**。
- **学术界**：固定渲染为 `机构·姓名+职位`，例如：
  - `南开大学·李运恒博士`
  - `阿里巴巴·陈建川研究员`
- 姓名与职位之间不加空格、不加「的」，机构和姓名之间用 `·` 连接。

### 判定规则

1. **以论文为主打的学术主页归学术界**，即使作者在工业界（如阿里巴巴的研究员）；
2. 纯个人博客、工程博客、公司主页归产业界；
3. 必须打开对方主页确认机构与职位，不要凭印象填写；
4. 英文主页的 `Ph.D. Candidate` 对应 `博士`，`Researcher` 对应 `研究员`，`Assistant Professor` 对应 `助理教授`；
5. 机构名用中文，职位用中文；不确定时先归产业界，别编造。

### 新增一条

1. 打开主页，判断是「论文型学术主页」还是「博客」，记录机构与职位；
2. 在 `friends.ts` 追加对象（产业界只填 name/url/kind；学术界再填 university/title）；
3. `npm run build` 后访问 `/friends/`，确认两段顺序与格式。


## 11. 搜索与 RSS

### 全局搜索（模态框）

- 入口：顶栏放大镜图标，或 `⌘K` / `Ctrl+K`；不跳转页面
- 数据：`/search.json`（由 `src/pages/search.json.ts` 构建），包含文章、模型与**导航**三类
- 前端：动态加载 FlexSearch，按 token 检索；结果按「文章」「导航」分组，导航条目新标签页打开
- 关闭：`Esc`、点击遮罩或关闭按钮；打开时有焦点圈定
- `/search/` 重定向回首页，避免旧链接 404

### RSS

- `/rss.xml` 由 `@astrojs/rss` 生成，按日期倒序
- 每条包含 `content:encoded` 全文（`marked` 渲染 Markdown），以及标签与作者
- 自带 `lastBuildDate` / `ttl`，每次构建自动更新
- 入口是顶栏 RSS 图标；页脚不再放 RSS


## 12. 页面别名（诗句 H1）

页面 H1 使用与页面气质对应的诗句，源码在 `src/data/aliases.ts`：

| 页面 | H1 | 出处 |
| --- | --- | --- |
| 归档 | 旧书不厌百回读，熟读深思子自知 | 苏轼《送安惇秀才失解西归》 |
| 模型库 | 又如观武库，剑戟靡不有 | 李纲《唐工部员外郎杜甫》 |
| 笔记 | 旧学商量加邃密，新知培养转深沉 | 朱熹《鹅湖寺和陆子寿》 |
| 导航 | 天下有道，津梁通 | 李翱《赵州石桥铭》 |
| 友链 | 嘤其鸣矣，求其友声 | 《诗经·小雅·伐木》 |
| 关于 | 人生到处知何似，应似飞鸿踏雪泥 | 苏轼《和子由渑池怀旧》 |
| 标签 | 奇文共欣赏，疑义相与析 | 陶渊明《移居》 |
| 404 | 迷津欲有问，平海夕漫漫 | 孟浩然《早寒江上有怀》 |

规则：

- H1 只放诗句，不再写「归档」「模型库」这类页面名，也不加「英平的」前缀
- 浏览器标题（`<title>`）仍用「归档 · 李英平」这类原名，便于辨认与 SEO
- 首页 H1 保持「你的指尖，有改变世界的力量。」；文章/模型详情页 H1 保持标题/模型名
- 标签详情页 H1 用诗句，下方用一行「标签：X」说明当前标签
- 新增页面：在 `aliases.ts` 加诗句，并在页面 H1 引用


## 13. 站点约定

| 项 | 约定 |
| --- | --- |
| 品牌 | 顶栏 `Li Yingping`，页脚 `Li Yingping 2018 – 2026` |
| 导航 | 英文 `Articles / Archive / Models / Notes / Sites / Friends / About`；当前页斜体 |
| 图标 | 搜索与 RSS 都是线性 SVG，无文字 |
| 页面 H1 | 诗句别名（见 §12），不写页面名 |
| 标签 URL | 中文标签转拼音 ASCII（`src/lib/tags.ts`）；不要再用 `encodeURIComponent`，否则静态托管会 404 |
| 页脚 | 一行：CC BY 4.0 说明 + 年份 + `Keep it simple and stupid.` |
| favicon | 纸色底、墨色细框、墨色「李」、右上一点朱红 |
| 维护入口 | 不在页面上放入口，统一写进 `Agent.md` 与 `README.md` |


## 14. 导航（/nav/）

数据文件：`src/data/nav.yml`，页面：`src/pages/nav.astro`。数据从 Navi 仓库（Hugo 导航站）迁移而来，沿用其 `webstack.yml` 格式；**Navi 仓库不再维护，`nav.yml` 是唯一数据源**。当前基线：7 个分类 / 18 个子分类 / 143 条网址（改动后若数量变化，顺手更新本节与 §1 的数字）。

### 数据结构

文件以 `---` 开头（YAML 文档起始标记，不要删）。两种形态可混用，但同一分类不要两者都有：

```yaml
# 形态 A：分类 → 子分类(term) → 链接
- taxonomy: AI 相关
  icon: far fa-gem fa-lg
  list:
    - term: AI 产品
      links:
        - title: ChatGPT
          logo: https://chatgpt.com/cdn/assets/favicon-eex17e9e.ico
          url: https://chat.openai.com/chat
          description: ''

# 形态 B：分类 → 直接挂链接（没有子分类）
- taxonomy: 常用推荐
  icon: far fa-star
  links:
    - title: GitHub
      logo: https://github.githubassets.com/favicons/favicon-dark.svg
      url: https://github.com/
      description: ''
```

字段规则：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `taxonomy` | 是 | 一级分类显示名，同时是右侧分类栏的分组名 |
| `icon` | 是 | Font Awesome 5 的 class；页面暂不渲染，保留以兼容 Navi 数据 |
| `list` | 二选一 | 子分类数组；与 `links` 互斥 |
| `links` | 二选一 | 链接数组；形态 B 时直接挂在分类下 |
| `term` | 形态 A 必填 | 子分类显示名 |
| `title` | 是 | 站点名，保持官方写法 |
| `logo` | 否 | **完整外链 URL** 的 favicon；为空或加载失败时卡片自动不显示图标。Navi 的本地 logo（只写文件名）规则不适用于本站 |
| `url` | 是 | `https://` 开头（历史遗留的少数 http 站点保持原样即可） |
| `description` | 否 | 一句话中文说明；同时用于卡片副标题与站内筛选；可为空字符串 |

**锚点规则（与 Navi 不同）**：`nav.astro` 直接用分类名生成锚点——直挂分类的 `id` = `taxonomy`，子分类的 `id` = `taxonomy-term`（明文中文，不是 md5）。**重命名 `taxonomy`/`term` 会改变锚点，旧的 `#hash` 深链全部失效**；除非用户明确要求，不要重命名已有分类。

### 编辑硬规则

1. 缩进 **2 空格，禁止 Tab**；只改目标条目，不要整文件重排、格式化、重排字段顺序（diff 越小越好审）。
2. 同一 URL 不重复收录。新增前先全文搜域名。
3. YAML 字符串里出现 `:`、`#`、`{`、`[`、`&`、`*`、`!` 等符号时加引号；描述里不要出现换行。
4. logo 优先官网 favicon 直链；官网取不到才用 `https://favicon.im/<域名>` 或 `https://a.favicon.im/<域名>`。**不要新增带哈希/版本号的 CDN 图片地址**（会随站点发版失效）。
5. 不要新增 URL 短链、返利/推广参数、需要登录才能判断真假的站点；不确定的域名先核实再收录。
6. `icon` 只用 Font Awesome **5 免费**图标；新分类不要与现有分类重名。

### 新增一个网站

1. 入口通常是 `nav-add` label 的 Issue（模板「新增网站」）：取 issue 里的网址、站点名、建议分类与说明。
2. 在 `nav.yml` 里找到最匹配的子分类（形态 A）或「常用推荐」（形态 B）；找不到合适的子分类就先向用户提案（在 issue 下评论），不要硬塞。
3. 按模板追加到该子分类**末尾**（或用户指定位置），默认不排序、不插队。
4. 字段顺序沿用邻居：`title` → `logo` → `url` → `description`（少数条目字段顺序不同，保持该条目自身风格，不要顺手改）。
5. 描述写一句中文，说明「这是什么/用来做什么」，不重复标题，尽量 ≤ 40 字；拿不准就留空 `''`。
6. `npm run build` 后用 `npm run preview` 检查 `/nav/`：新条目出现在正确分类下，页面顶部计数 +1，筛选能命中。
7. 提交信息示例：`nav: add Hugging Face Papers (close #N)`；提交后在 issue 下评论确认并关闭。

### 新增 / 调整分类

- 新分类追加到 `nav.yml` 末尾并补齐 `icon`；页面与分类栏自动生成，**无需改模板**。
- 需要子分类就用 `list`，扁平展示就用 `links`，不要两种混用。
- 重命名 / 合并 / 删除分类会破坏锚点与深链，**必须先得到用户确认**，并同步更新本节与 §1 的基线数字。
- 分类顺序就是页面与分类栏顺序；调整顺序会产生大 diff，非必要不做。


## 15. 论文笔记生成规范

根据一个 arXiv 链接或 PDF 生成符合本站模板的论文笔记。分析方法改编自 Agentero 项目的 `paper-reader` skill（致谢：poco-ai/Agentero），工具层已替换为本仓库的实现。文风向苏剑林「科学空间」看齐。

### 输入：GitHub Issue

- 协作入口是 GitHub Issue，不使用队列文件。三类模板对应三类维护任务：
  - `nav-add`「新增网站」→ 按 §14 处理
  - `paper-note`「论文笔记」→ 按本节处理
  - `model-add`「新增模型」→ 按 §4.1 处理（处理后同样在 issue 下评论并关闭）
- 论文链接从 `paper-note` issue 正文读取（arXiv abs 页 / arXiv PDF / 其他 PDF 直链），「关注点」字段是用户给的写作侧重，生成时要回应。
- arXiv 论文的元数据（标题 / 作者 / 年份 / 摘要 / 链接）一律调官方 API（`export.arxiv.org/api/query?id_list=`）获取，**不靠模型记忆**。
- 定时任务或值班 Agent 定期扫描 open 的 `paper-note` issue，逐条处理；处理失败在 issue 下评论原因并保持 open。

### Frontmatter 模板

```yaml
---
slug: post-N            # 扫描现有 _posts 里最大的 post-N 编号 +1
title: 《论文英文原名》论文笔记
tags: [领域, 会议]       # 如 [Re-ID, CVPR]
categories: 论文笔记
abstract: '【会议+年份】 一作 et al.'
date: YYYY-MM-DD HH:mm:ss   # 生成当时的时间
---
```

### 正文骨架（固定 + 可选）

| 段落 | 约束 |
| --- | --- |
| `## Introduction` | 固定。背景 → 领域顽疾 → 前人方案的 bottleneck → 本文动机与切入点，配框架图 |
| `## Methodology` | 固定。开头先给 **Overview**（占本节 1/3~1/2 篇幅，建立全局理解），随后按 `###` 逐模块讲解，**论文 Method 章节的每个模块都不许遗漏** |
| `## Experiments` | 可选。论文有实验就写：实验设置、关键数字用表格对比 Baseline、按 Ablation 做归因分析 |
| `## Conclusion` | 可选。局限与展望；论文未明确讨论就写 "Not explicitly discussed in paper" |
| `## Paper Information` | 固定。GB/T 引用 + Paper 链接 + Code 链接（没有 Code 就不写该行） |

### 分析方法（红线）

1. **反幻觉**：论文中未明确说明的细节（训练超参数、硬件型号等），必须写 "Not explicitly specified in text"，严禁编造。
2. **详略与原文成正比**：作者重点呈现的创新点详细阐述，原文简略的部分不灌水；严禁生搬硬套某一类论文的分析模板。
3. **先物理意义，后公式**：遇到数学公式先解释它要表达什么，再给出公式，并逐一解释变量含义。
4. **图文对应**：在论述与论文配图之间建立对应关系，关键图（尤其主图 Figure 1/2 的 pipeline）必须贴出并配合讲解。

### 文风（向科学空间看齐）

- 从问题与直觉出发，不从定义出发；先讲「为什么需要它」，再讲「它是什么」。
- 推导不跳步：原文里「不难发现」「显然」式的省略，要展开成读者能跟着走的步骤。
- 个人评论、类比和吐槽**直接写进正文**（这是本站风格），但要用「笔者认为」这类措辞与论文原作者的观点区分开。
- 中文行文，术语保留英文（简写与论文保持一致）；专业但亲切，像导师讲课，杜绝学术八股。

### Tufte 排版机制

本站是 Tufte 式排版（`global.css` 已实现），生成笔记时必须利用旁注机制：

| 机制 | 语法（Markdown 里直接写 HTML） | 用途 |
| --- | --- | --- |
| 带编号旁注 | `<span class="sidenote-number"></span><span class="sidenote">…</span>` | **概念解释**（术语、背景知识）与**引用来源**（某结论出自论文哪一节/哪篇相关工作） |
| 无编号旁注 | `<span class="marginnote">…</span>` | 简短的补充说明；也可内嵌小图当旁图 |
| 通栏 | `<div class="fullwidth">…</div>` | 宽表格、多图并排 |

使用原则：

- 主线正文保持连贯；概念解释和引用来源放旁注，评论放正文（见文风一节）。
- 旁注的编号 span 与内容 span 必须成对出现、标签闭合。
- 窄屏（<1100px）下旁注退化为行内左边框块，所以每条旁注必须能独立读懂，不依赖「如右栏所示」这类指代。
- 正文图用标准 `![描述](url)`，图片外链到图床（见流水线）。

### 流水线

1. 扫描 open 的 `paper-note` issue，取 issue 里的链接与「关注点」备注；arXiv 链接调官方 API 取元数据。
2. 下载 PDF，提取正文；用 PyMuPDF 抠出框架图与关键实验图。
3. 图片 push 到图床仓库 `Bye-lemon/Pictures`，路径 `papers/<arxiv-id>/fig-N.png`（非 arXiv 论文用 slug 代替 arxiv-id），正文引用 `https://raw.githubusercontent.com/Bye-lemon/Pictures/master/papers/<arxiv-id>/fig-N.png`。
4. 按本节约定的骨架、红线、文风与排版机制生成笔记。
5. 自检清单（全部通过才提交）：
   - [ ] frontmatter 字段齐全，能通过 `src/content.config.ts` 的 posts schema
   - [ ] `slug` 与现有文章不冲突（扫描 `post-N` 最大值 +1）
   - [ ] 公式用 `$...$`（行内）/ `$$...$$`（行间，独占一行且上下空行），KaTeX 可渲染；**不要**用旧文里的 `$$$`（Hexo 遗留）
   - [ ] 所有图片链接可访问
   - [ ] sidenote / marginnote 的 HTML 标签配对闭合
   - [ ] 未明确说明的细节已标注 "Not explicitly specified in text"
6. 直接 commit 到 `src` 分支，提交信息 `post: add <论文名> 论文笔记 (close #N)`；随后在 issue 下评论生成的文章链接并关闭 issue。
7. 汇报：生成了什么、图片几张、哪些地方拿不准（作者单位、会议信息等）。
