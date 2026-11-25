---
name: "WePocketModel Series"
category: "multimodal"
tasks: ["captioning", "qa", "ocr", "embedding"]
modalities_in: ["image", "text"]
modalities_out: ["text", "embedding"]
languages: ["zh", "en"]
domains: []
role: "application"
architecture: "dense"
training_stage: ["pretrained", "sft"]
access: "open-weights"
status: "stable"
size_class: "1-10B"
params: "2B~4B"
context_length: ""
family: "WePocketModel"
base: ""
license: "Apache-2.0"
author: "Tencent WeChat AI"
updated: "2026-11-25"
published: "技术报告"
paper: "https://arxiv.org/abs/2611.27365"
link: "https://huggingface.co/collections/tencent/wepocketmodel"
hf_id: ""
hf_collection: "tencent/wepocketmodel"
collection_models: ["tencent/WePocketModel1.0-4B", "tencent/WePocketModel1.0-2B", "tencent/WePocketModel1.0-4B-GGUF", "tencent/WePocketModel1.0-2B-GGUF"]
downloads: ""
likes: ""
hf_last_modified: ""
note: "微信 AI 端侧多模态统一模型：单一主干同时做生成、多模态 embedding（MRL）与结构化决策。"
tags: ["on-device", "embedding", "vlm"]
---

## Overview

WePocketModel（WePM）是腾讯微信 AI 的端侧（on-device）视觉语言模型系列，两个尺寸：1.0-2B 与 1.0-4B（含 GGUF）。单一共享主干 + 视觉编码器同时承载三种能力：生成（OCR、图像描述、VQA）、embedding（文本/图像 L2 归一化向量，4B 版全维 2048，支持 MRL 截断 64/128/256/512/1024/2048）、决策（应用状态+问题 → 结构化选择/有序打分/二元判断）。各规模在生成与 embedding 任务上领先同等规模模型。

## 模型特点

- 三合一端侧模型：生成、检索 embedding、决策共用一套权重，一个模型顶三个小模型。
- 目标冲突调和：多任务目标在统一主干内显式调和（GitHub 有专章 Reconciling Conflicts）。
- 决策能力为显式一等公民，不是 chat 的副产品：支持 choice / score / yes-no 类型化输出。

## 训练要点

- 生成与 embedding 联合训练，MRL 训练使单一投影支持任意维度截断。
- 决策与 embedding 使用独立学习 slot（separate learned slots），降低任务间干扰。
- 训练细节（数据配比、算力）未公开。未证实。

## 关键技术

- MGVB（Multi-Granularity Visual Budgeting）：按全局/区域/细粒度三视角分配视觉 token 预算，缓解端侧视觉 token 紧张。
- MRL 多模态 embedding：单投影前缀截断即得任意维度向量。
- 结构化决策输出契约：应用状态与问题联合编码，概率分布读出在 marker 处。
