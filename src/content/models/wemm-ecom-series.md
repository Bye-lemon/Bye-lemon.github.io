---
name: "WeMM-Ecom Series"
category: "multimodal"
tasks: ["captioning", "qa", "ocr", "moderation"]
modalities_in: ["image", "video", "text"]
modalities_out: ["text"]
languages: ["zh", "en"]
domains: ["ecommerce"]
role: "application"
architecture: "moe"
training_stage: ["pretrained", "sft"]
access: "open-weights"
status: "stable"
size_class: "10-100B"
params: "0.8B~35B"
context_length: "262144"
family: "WeMM"
base: "Qwen3.5 MoE"
license: "Apache-2.0"
author: "Tencent WeChat Vision"
updated: "2026-11-25"
published: "技术报告"
paper: "https://arxiv.org/abs/2611.30662"
link: "https://huggingface.co/collections/tencent/wemm-ecom"
hf_id: ""
hf_collection: "tencent/wemm-ecom"
collection_models: ["tencent/WeMM-Ecom-35B-A3B", "tencent/WeMM-Ecom-9B", "tencent/WeMM-Ecom-4B", "tencent/WeMM-Ecom-2B", "tencent/WeMM-Ecom-0.8B", "tencent/WeMM-Ecom-35B-A3B-FP8", "tencent/WeMM-Ecom-35B-A3B-GPTQ", "tencent/WeMM-Ecom-35B-A3B-GGUF", "tencent/WeMM-Ecom-9B-GGUF", "tencent/WeMM-Ecom-4B-GGUF", "tencent/WeMM-Ecom-2B-GGUF", "tencent/WeMM-Ecom-0.8B-GGUF", "tencent/WeMM-Ecom-4B-GPTQ", "tencent/WeMM-Ecom-2B-GPTQ"]
downloads: ""
likes: ""
hf_last_modified: ""
note: "微信 WeMM 团队的电商多模态系列：5 个尺寸 MoE，电商理解 28 基准 + 通用 64 基准双榜，hybrid thinking。"
tags: ["ecommerce", "vlm"]
---

## Overview

WeMM-Ecom 是腾讯微信视觉团队的电商多模态模型系列，5 个尺寸：0.8B / 2B / 4B / 9B / 35B-A3B（MoE，基座 Qwen3.5 MoE）。支持文本、图像、多图、视频输入，hybrid thinking 模式。35B-A3B 在电商理解上超 Qwen3.5-35B-A3B 3.92 分、Qwen3.6-35B-A3B 3.36 分、MiniCPM-V-4.7-35B-A3B 8.22 分；通用能力超 Qwen3.5-35B-A3B 0.17 分、Valley3-32B 9.13 分。

## 系列成员

| 模型 | 规模 | 备注 |
| --- | --- | --- |
| WeMM-Ecom-35B-A3B | 35B total / ~3B active | 旗舰 MoE，BF16/FP8/GPTQ/GGUF |
| WeMM-Ecom-9B | 9B | GGUF |
| WeMM-Ecom-4B | 4B | GGUF/GPTQ |
| WeMM-Ecom-2B | 2B | GGUF/GPTQ |
| WeMM-Ecom-0.8B | 0.8B | GGUF |

## 模型特点

- 电商专精 + 通用能力双优：28 个电商基准（属性、审核、OCR、检索、grounding、推理、商品知识）+ 64 个通用基准（VQA、文档、图表、STEM、空间、多图、指令跟随）。
- 全尺寸覆盖 0.8B~35B，量化格式齐全（BF16/FP8/GPTQ/GGUF）。
- 与基座 Qwen3.5 MoE 保持兼容生态（qwen3_5_moe 架构 tag）。

## 训练要点

- 预训练：大规模电商图文对 + 通用图文数据混合。
- 后训练：hybrid thinking 训练，instruct / thinking 两种模式分别评测调优。

## 关键技术

- 混合思考（hybrid thinking）：思考/非思考双模式按需切换，serving 侧提供多套采样配置。
- MoE 稀疏激活：35B 仅激活 ~3B，推理成本低。
