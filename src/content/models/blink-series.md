---
name: "Blink Series"
category: "retrieval"
tasks: ["embedding", "similarity"]
modalities_in: ["text"]
modalities_out: ["embedding"]
languages: ["en", "multilingual", "code"]
domains: []
role: "base"
architecture: ""
training_stage: ["distillation"]
access: "open-weights"
status: "stable"
size_class: "<1B"
params: "7.7M~64M"
context_length: ""
family: "Blink"
base: ""
license: "MIT"
author: "MinishLab"
updated: "2026-11-25"
published: ""
paper: ""
link: "https://huggingface.co/collections/minishlab/blink"
hf_id: ""
hf_collection: "minishlab/blink"
collection_models: ["minishlab/blink-8M", "minishlab/blink-multilingual-64M", "minishlab/blink-code-16M"]
downloads: ""
likes: ""
hf_last_modified: ""
note: "Minish 静态 embedding 系列：无 transformer 纯词表，比同尺寸 transformer 快几个数量级，全面超越 potion 系列。"
tags: ["embeddings", "static-embeddings"]
---

## Overview

Blink 是 MinishLab 的静态 embedding 系列，三个成员，纯词表 + mean pooling、无活跃参数，比 transformer 快几个数量级：

- **blink-8M**：30,000×256 词表（7.7M 参数，float32 31MB），英文。MTEB(eng, v2) 41 任务均值 55.35，超 lattice-retrieval（55.24）与全部同尺寸静态模型；全面取代 potion-base-8M。
- **blink-multilingual-64M**：多语言版，覆盖 100+ 语言。
- **blink-code-16M**：代码检索版，62,500×256（16M 参数）。CoIR 从 potion-code-16M-v2 的 40.67 提升到 46.82。

## 模型特点

- 静态模型：所有参数即 embedding 参数，推理无计算图，CPU 上即可高吞吐。
- 同尺寸静态模型中 SOTA，且经常超更大尺寸的模型。
- 训练数据源自蒸馏语料（tokenlearn 系列数据集 + CoIR/cornstack 难负例）。

## 训练要点

- 蒸馏自 sentence-transformers 系教师模型（blink-8M 数据含 bge-base-en-v1.5 蒸馏语料；code 版用 CodeRankEmbed 教师）。
- 以 MTEB / CoIR 为优化目标做词表级知识迁移。

## 关键技术

- model2vec 静态表示框架：哈希词表 + mean pooling，O(1) 级推理。
- 与同族前代 potion 相比同尺寸全指标提升，直接替代。
