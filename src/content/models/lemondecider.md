---
name: "LemonDecider"
category: "decision"
tasks: []
modalities_in: ["image", "text"]
modalities_out: ["text"]
languages: ["en"]
domains: []
role: "application"
architecture: "dense"
training_stage: ["sft"]
access: "open-weights"
status: "stable"
size_class: "1-10B"
params: "4.5B"
context_length: "8192"
family: "Lemon"
base: "Qwen3.5-4B"
license: "MIT"
author: "InclusionAI"
updated: "2026-11-24"
published: ""
paper: ""
link: "https://huggingface.co/inclusionAI/LemonDecider"
hf_id: "inclusionAI/LemonDecider"
hf_collection: ""
collection_models: []
downloads: 1119
likes: 57
hf_last_modified: "2026-11-24T08:47:13.000Z"
note: "多模态决策模型：Choice/Noul/Score 三类类型化决策，8K serving 上限，超限时递归二分问题列表。"
tags: ["decision", "multimodal"]
---

## Overview

LemonDecider 4B 是 InclusionAI 基于 Qwen3.5-4B 的多模态决策模型，回答命名问题（named questions），支持文本/JSON + 最多 4 张图像。请求编码为单一联合 prompt：共享状态 + 每个问题及其选项 + 决策 marker，模型在每个 marker 处输出概率分布。Public Decision Index 0.3：Text 64.25（140,178 请求）、Vision 72.349（12,210 请求）。

## 模型特点

- 三类类型化决策：Choice（选候选，输出各候选概率）、Noul（是/否命题为真的概率）、Score（2–10 有序等级打分，输出各级概率与期望等级）。
- 联合 inline 读出版本（joint-question-inline-readout-v1）：一次前向处理多问题。
- serving 上限 8,192 token（checkpoint 262K 上下文的 serving 截断）；超限递归二分问题列表，绝不截断。

## 训练要点

- 基于 Qwen3.5-4B 微调，训练细节未披露。未证实。
- 评测协议值得注意：rereading disabled、temperature 0.835655、BF16/SDPA、单图 1,638,400 像素上限。

## 关键技术

- 决策 marker 机制：联合 prompt 内嵌多个 marker，每处输出分布，天然支持批量决策。
- 递归二分：超长请求按问题列表二分拆分而非截断，保证决策完整性。
