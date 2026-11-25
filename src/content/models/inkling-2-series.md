---
name: "Inkling 2 Series"
category: "multimodal"
tasks: ["chat", "reasoning", "code", "agent"]
modalities_in: ["image", "text"]
modalities_out: ["text"]
languages: ["en", "multilingual"]
domains: []
role: ""
architecture: "moe"
training_stage: ["pretrained", "sft"]
access: "open-weights"
status: "stable"
size_class: "100B-1T"
params: "26.4B~594B"
context_length: "1048576"
family: "Inkling"
base: ""
license: "Apache-2.0"
author: "Thinking Machines Lab"
updated: "2026-11-19"
published: "2026-11-19"
paper: ""
link: "https://huggingface.co/collections/thinkingmachines/inkling-2"
hf_id: ""
hf_collection: "thinkingmachines/inkling-2"
collection_models: ["thinkingmachines/Inkling-2-Small", "thinkingmachines/Inkling-2-Mini", "thinkingmachines/Inkling-2-Small-MXFP8"]
downloads: ""
likes: ""
hf_last_modified: ""
note: "Thinking Machines 第二代多模态 MoE：Small 594B/17B，Mini 用 looped layers 26.4B 仅 5.4B 有效激活；1M 上下文。"
tags: ["moe", "vlm"]
---

## Overview

Inkling 2 是 Thinking Machines Lab 的第二代开源多模态模型系列，文本+图像输入、文本输出，1M 上下文。本条目替换 Inkling Series（第一代）。

## 系列成员

| 模型 | 规模 | 精度 |
| --- | --- | --- |
| Inkling-2-Small | 594B total / 17B active | NVFP4 主发布（≥500GB 显存，2×B300 或 4×H200）；MXFP8 备选（≥800GB） |
| Inkling-2-Small-MXFP8 | 同上 | MXFP8 量化版 |
| Inkling-2-Mini | 26.4B total / 5.4B effective active | NVFP4 |

## 模型特点

- Inkling-2-Small：48 层 decoder-only，稀疏 MoE 前馈（每层 384 选 8 专家），局部+全局混合注意力，原生多模态（ViT 编码图像投到共享隐空间联合处理）。
- Inkling-2-Mini：24 层权重、中间 12 层循环 3 次（每 token 48 次层应用），每层 128 选 8 专家；每多一次循环约 +1.0B 有效激活，3 次共 5.4B。推理 effort 调到最低也不会完全关闭思考——循环层使每 token 算力高于激活参数量级。
- 定位：通用多模态模型，面向 agent/工具系统、编码助手、聊天、RAG；开放权重支持微调与第三方集成（Tinker Playground / Cookbook）。

## 训练要点

- 训练数据混合：公开网络与仓库、第三方采购、内部生成、合成/增强四类；经过去重、清洗、质量过滤与安全处理。
- 具体配比、算力未公开。未证实。

## 关键技术

- Looped layers：Mini 以 24 层权重循环 3 次获得 48 次层应用的深度，参数/算力比远低于直接堆层。
- 局部+全局混合注意力 + 稀疏 MoE 的组合在 594B 规模保持 17B 激活。
- 主发布采用 NVFP4 量化（2×B300 可跑），对量化精度工程投入大。
