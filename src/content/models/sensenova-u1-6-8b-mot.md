---
name: "SenseNova-U1.6-8B-MoT"
category: "multimodal"
tasks: ["image-generation", "captioning"]
modalities_in: ["text", "image"]
modalities_out: ["text", "image"]
languages: ["en", "zh"]
domains: []
role: "chat"
architecture: "moe"
training_stage: ["continual"]
access: "open-weights"
status: "stable"
size_class: "10-100B"
params: "17.5B total（官方命名 8B-MoT）"
context_length: ""
family: "SenseNova-U"
base: ""
license: "Apache-2.0"
author: "商汤"
updated: "2026-11-26"
published: "2026-11-16"
paper: "https://arxiv.org/abs/2609.11929"
link: "https://huggingface.co/sensenova/SenseNova-U1.6-8B-MoT"
hf_id: "sensenova/SenseNova-U1.6-8B-MoT"
downloads: 297
likes: 58
hf_last_modified: "2026-11-25T20:50:24.000Z"
note: "SenseNova-U 系列 1.6 版原生多模态模型：理解、生成、编辑一体，主打美学质量与交错图文的原生自我纠错。"
tags: ["sensenova", "neo-unify", "mot", "native-multimodal"]
---

## Overview

SenseNova-U1.6-8B-MoT 是商汤 SenseNova-U 系列的原生多模态模型，基于 NEO-unify 架构的 8B-MoT（Mixture-of-Transformers）实现。同一模型可以看懂图像、生成或编辑图像，并输出图文交错的回复。U1 奠定架构，U1.5 引入 encoder-free、VAE-free 视觉路径与空间连贯的图像重建，U1.6 在此之上聚焦美学表现、创意表达，以及通过交错图文生成实现的原生自我纠错（native self-correction）。

## 模型特点

- 美学强化：面向人像、海报、插画，构图、创意多样性与现代感提升；官方主观评测整体美学质量较 U1.5 提升 10%。
- 原生自我纠错：生成信息图后对照 prompt 自审，在保持排版与表现力的同时修正文字错误；UltraTextBench 密集文字任务上自纠错相对单次生成平均提升 7%。
- 一套权重覆盖理解、生成、编辑与图文交错输出；视觉路径无独立 encoder/VAE。
- 权重矩阵完整：BF16 分片基座、4/8 步 LoRA、Native 版（BF16 / FP8 W8A8 / INT8 ConvRot W8A8）、GGUF（Q4_0 / Q6_K / Q8_0）。
- 推理走官方 OpenSenseNova/SenseNova-U 代码（custom code，trust_remote_code），平衡模式约需 24 GB 显存、35 GB 磁盘。

## 训练要点

- U1.6 是 U1.5 的能力迭代版，具体训练流程与数据配比未单独披露（未证实）；技术细节参考 U1 论文（arXiv:2605.12500）与 U1.5 论文（arXiv:2609.11929）。
- 能力方向通过训练偏向美学与自纠错：人像/海报/插画的风格化表达，以及交错生成中"生成—审阅—修正"的闭环行为。

## 关键技术

- NEO-unify 架构 + MoT：理解与生成分通路混合，共享语言底座，支持图文交错输出。
- Encoder-free / VAE-free 视觉路径，直接回归空间连贯的图像表示（自 U1.5 起）。
- 原生自我纠错：利用同一模型的多模态理解能力回读生成结果并迭代修正，无需外部 OCR 或裁判模型。
- Apache-2.0 协议，代码同协议开源。

## 局限

短 prompt 结果偏常规，需描述风格、构图、光照或纹理；复杂排版、密集文字、细小人物特征与多参考图编辑欠稳（密集文字可用自纠错缓解）；人像偶见肢体比例不自然。
