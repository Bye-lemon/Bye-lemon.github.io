模型库维护说明（src/content/models/README.txt）
==================================================

唯一数据源：本目录每个 .md = 一个模型条目（219 个）。
完整字段、枚举、工作流见仓库根目录 Agent.md；这里只留最短上手说明。

【重要】不要再从思源笔记导出。
历史条目来自思源一次性导出，之后只维护 Markdown；反向导出会覆盖人工修正。

为什么是 .txt：content collection 的 glob 是 *.md，README.md 会被当成模型条目导致构建失败。

一、命名
- 文件名就是 slug：/models/<文件名去掉 .md>
- 只用小写字母、数字、连字符

二、字段（详见 Agent.md §2）
- 分类：category / tasks / modalities_in / modalities_out / languages / domains
- 属性：role / architecture / training_stage / access / status / size_class
- 基础：name / family / base / params / context_length / license / author / updated
- 链接：published / paper / link / hf_id
- 热度：downloads / likes / hf_last_modified（HF 脚本自动填）
- 其他：note / tags（自由标签，最多 4 个，不要放语言/任务/模态）

三、常用命令
  npm run models:normalize                     # 归一化 + 枚举校验（幂等）
  node scripts/refactor-models.mjs --dry-run   # 检查旧结构残留
  node scripts/enrich-hf-models.mjs --write --only-missing  # 从 HF 补语言/任务/热度
  npm run build && npm run preview             # 构建与本地预览

四、新增一条
复制一个结构相近的 md，改 name 与字段，再跑一次 normalize 和 HF 补全即可。
