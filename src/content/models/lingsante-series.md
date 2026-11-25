---
name: "LingSante Series"
category: "language"
tasks: ["chat", "reasoning"]
modalities_in: ["text"]
modalities_out: ["text"]
languages: ["zh", "en"]
domains: ["medical"]
role: ""
architecture: "moe"
training_stage: ["pretrained", "continual", "sft", "distillation"]
access: "open-weights"
status: "stable"
size_class: "100B-1T"
params: "124B~560B"
context_length: "1048576"
family: "Ling"
base: "Ling-3.0-flash / Ling-3.1-flash"
license: "MIT"
author: "InclusionAI"
updated: "2026-11-25"
published: ""
paper: ""
link: "https://huggingface.co/collections/inclusionAI/lingsante"
hf_id: ""
hf_collection: "inclusionAI/lingsante"
collection_models: ["inclusionAI/Ling-3.0-flash-Sante", "inclusionAI/Ling-3.0-flash-Sante-fp8", "inclusionAI/LingSante-3.1-air-VL-MXFP4", "inclusionAI/LingSante-3.1-air-VL", "inclusionAI/LingSante-3.1-flash", "inclusionAI/LingSante-3.1-flash-MXFP4"]
downloads: ""
likes: ""
hf_last_modified: ""
note: "InclusionAI 医疗系列：3.0-flash-Sante 为首个医疗版；3.1-flash 560B/25B 1M 上下文；3.1-air-VL 为多模态版。"
tags: ["medical", "healthcare"]
---

## Overview

LingSante 系列是 InclusionAI 的医疗健康模型线（Sante 取自法语"健康"），三个成员：

- **Ling-3.0-flash-Sante**：基于 Ling-3.0-flash，124B 总参 / 5.1B 激活，hybrid-linear MoE（KDA + gated MLA + 稀疏 MoE），256K 训练上下文。定位医疗推理、医疗研究、deep research 与工具辅助工作流。
- **LingSante-3.1-flash**：基于 Ling-3.1-flash，560B / 25B 激活，1M 上下文。医疗混合预训练 + 医疗推理/工具/搜索/职业行为 RL + 多教师 on-policy 蒸馏。InclusionMed 医疗榜 45.064 分排第 5（23 个配置），性能-成本 Pareto 前沿。
- **LingSante-3.1-air-VL**：多模态版（另有单条目 lingsante-3-1-air-vl.md）。

## 模型特点

- 架构沿 Ling 主线：63 KDA + 9 Gated MLA（7:1）层、512 路由专家 + 1 共享、每 token 激活 8 专家、hidden 4096、词表 157,184。
- 3.1-flash 的专业行为对齐榜仅次于 GPT-6 Astra（第 2）。
- 医疗数据贯穿预训练/中训练/SFT 全程，通用数据保持推理、代码、搜索、工具能力。

## 训练要点

- 医疗证据-推理对齐框架：高质量数据合成 + 系统训练。
- 长程医疗任务框架：真实交互环境 + 多样工具设置 + 结构化验证。
- 多教师 on-policy 蒸馏聚合互补能力。
- 后训练 RL 覆盖医疗推理、工具使用、搜索、职业行为四类。

## 关键技术

- Hybrid-linear MoE：KDA（Kimi Delta Attention）线性注意力与 Gated MLA 混合。
- 63:9 的 KDA:MLA 比例与 512 专家稀疏路由是 Ling 系标志性配置。
