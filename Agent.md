# Agent.md — 模型库维护手册

> 面向后续接手的 Agent（也给人看）。目标：不依赖思源，直接维护 Markdown；分类是**分面（facet）**结构，每个维度只回答一个问题。

## 1. 文件地图

| 路径 | 作用 |
| --- | --- |
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

## 6. UI 约定（给改页面的 Agent）

- 列表页从 `/models.json` 取数，表格用 Tabulator；筛选维度：`category/tasks/modalities_in/languages/domains/role/access`
- 多值字段用 chips 多选，单选字段用下拉；显示名一律取 `taxonomy.fields.*.values` 的中文 label
- URL 参数：`?q=&category=&tasks=&languages=&role=&=&page=`
- 详情页展示：分类、任务、模态、语言、领域、角色、架构、规模、上下文、许可、HF 热度、外链、基础模型
- 颜色按**固定枚举**映射（不要字符串哈希）

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
npm run models:normalize                         # 归一化 + 校验
node scripts/refactor-models.mjs --dry-run       # 检查旧结构残留
node scripts/refactor-models.mjs --write         # 执行迁移
node scripts/enrich-hf-models.mjs --dry-run      # 预览 HF 补全
node scripts/enrich-hf-models.mjs --write        # 写入 HF 数据
npm run build && npm run preview                 # 本地构建与预览
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

- 入口：顶栏「搜索」按钮，或 `⌘K` / `Ctrl+K`；不跳转页面
- 数据：`/search.json`（由 `src/pages/search.json.ts` 构建），包含文章、模型与**导航**三类
- 前端：动态加载 FlexSearch，按 token 检索；结果按「文章」「导航」分组，导航条目新标签页打开
- 关闭：`Esc`、点击遮罩或关闭按钮
- `/search/` 现在重定向回首页，避免旧链接 404

### RSS

- `/rss.xml` 由 `@astrojs/rss` 生成，按日期倒序
- 每条包含 `content:encoded` 全文（`marked` 渲染 Markdown），以及标签与作者
- 自带 `lastBuildDate` / `ttl`，每次构建自动更新
- 页脚只保留 RSS 入口


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
