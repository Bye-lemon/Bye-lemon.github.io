---
name: "OpenOneRec Series"
category: "language"
tasks: ["text-generation", "instruction", "reasoning"]
modalities_in: ["text"]
modalities_out: ["text"]
languages: ["zh", "en"]
domains: ["ecommerce"]
role: ""
architecture: "transformer"
training_stage: ["pretrained", "continual", "sft", "distillation", "rlhf"]
access: "open-weights"
status: "stable"
size_class: "1-10B"
params: "1.7B~8B"
context_length: "32768"
family: "OneRec"
base: "Qwen3"
license: "Apache-2.0"
author: "Kuaishou OneRec"
updated: "2026-01-05"
published: "2026-01-01"
paper: "https://arxiv.org/abs/2512.24762"
link: "https://huggingface.co/collections/OpenOneRec/openonerec"
hf_id: ""
hf_collection: "OpenOneRec/openonerec"
collection_models: ["OpenOneRec/OneRec-8B-pro", "OpenOneRec/OneRec-8B", "OpenOneRec/OneRec-1.7B", "OpenOneRec/OneRec-1.7B-pro", "OpenOneRec/OpenOneRec-General-SFT", "OpenOneRec/OpenOneRec-General-Pretrain", "OpenOneRec/OpenOneRec-RecIF", "OpenOneRec/openonerec_multimodal_embedding"]
downloads: ""
likes: ""
hf_last_modified: ""
note: "快手 OneRec 开源生成式推荐：Qwen3 底座 + Itemic Tokens，RecIF-Bench 全任务 SOTA，Amazon 跨域 Recall@10 平均 +26.8%。"
tags: ["recommendation"]
---

## Overview

OpenOneRec 是快手 OneRec 团队开源的生成式推荐框架（技术报告 arXiv:2512.24762），含三件套：推荐指令遵循基准 RecIF-Bench（100M 交互 / 200K 用户，覆盖短视频、广告、电商三域）、OneRec-Foundation 系列模型（1.7B 与 8B，各分 Standard / Pro 两版）、以及数据处理 → 共预训练 → 后训练的全链路流水线（基于 verl）。模型以 Qwen3 为底座，通过 Itemic Tokens 把 item 的语义 ID 离散化为层次码追加进词表，让自回归 LLM 直接生成推荐。Standard 版用开源数据训练（33B tokens / 41.3M 样本，可复现），Pro 版叠加快手工业语料（130B tokens / 179.1M 样本）。

collection 内四个生成模型之外，还包含通用域 Pretrain/SFT 数据集、RecIF-Bench 评测数据与多模态 embedding 模型。

## 模型特点

- **OneRec-1.7B / OneRec-8B**（Standard）：仅开源数据训练，作为社区可复现基线；1.7B 建议采样参数 top_p=0.95、top_k=20、temperature≈0.75。
- **OneRec-1.7B-Pro / OneRec-8B-Pro**：叠加快手百亿级工业语料，同尺寸下一致优于 Standard 版，验证数据扩展 scaling。
- 能力分层：RecIF-Bench 8 任务按 4 层能力组织——L0 语义对齐（item 理解）→ L1 基础预测（短视频/广告/商品推荐、标签预测）→ L2 指令跟随（交互式推荐、条件推荐）→ L3 推理（推荐理由）。
- 通用能力保留：后训练后 MMLU-Pro、IFEVAL 等接近 Qwen3 底座水平，数学能力几乎无损。

## 训练要点

- **Itemic-Text Alignment**（Stage 1）：向 Qwen3 词表追加 itemic special tokens，其 embedding 从现有 embedding 的均值/协方差初始化；仅 itemic 相关 embedding（8B 以上含输出投影）可训练，主干冻结，建立 item 语义与文本空间的对齐。
- **全参 Co-Pretraining**（Stage 2）：全参继续预训练注入推荐知识，混入通用域数据防灾难性遗忘；AdamW（β1=0.9, β2=0.95, wd=0.1），cosine 衰减 + 10% 线性 warmup，peak lr Stage 1 为 1e-3、Stage 2 为 1e-4；最大上下文 32K 以容纳长行为序列。
- **后训练**：SFT 之后接 on-policy distillation（教师为同尺寸原始 Qwen3，200K 通用域问题；实测 MMLU-Pro 53.07→54.54、IFEVAL 61.74→76.53），最后 Rec-RL（verl 框架）强化推荐任务表现。

## 评测

- RecIF-Bench 全任务 SOTA；数据/模型两个维度均呈 scaling：Pro > Standard 同尺寸，8B > 1.7B 全变体。
- Amazon 10 数据集跨域泛化：对强 baseline 平均 Recall@10 +26.8%。
- 模型自报 vs 第三方：以上为技术报告自测口径。

## 关键技术

- **Itemic Tokens**：用 RQ-Kmeans 把 item 语义嵌入离散化为层次 SID（如 `<s_a_340><s_b_6566><s_c_5603>`），作为特殊 token 并入 Qwen3 词表，实现「商品即 token」的自回归生成式检索。
- **on-policy distillation**：以原始底座为教师蒸馏通用能力，缓解 SFT 带来的指令漂移与通用能力退化。
- **Rec-RL**：面向推荐任务的 RL 后训练，verl 实现。
