---
name: "Hy-MT3 Series"
category: "language"
tasks: ["translation"]
modalities_in: ["text"]
modalities_out: ["text"]
languages: ["zh", "en", "multilingual"]
domains: []
role: "application"
architecture: "moe"
training_stage: ["pretrained", "sft"]
access: "open-weights"
status: "stable"
size_class: "10-100B"
params: "1.8B~30B-A3B"
context_length: ""
family: "Hy-MT"
base: ""
license: "Apache-2.0"
author: "Tencent"
updated: "2026-11-24"
published: "2026-11-24"
paper: "https://arxiv.org/abs/2611.27673"
link: "https://huggingface.co/collections/tencent/hy-mt3"
hf_id: ""
hf_collection: "tencent/hy-mt3"
collection_models: ["tencent/Hy-MT3-30B-A3B", "tencent/Hy-MT3-30B-A3B-FP8", "tencent/Hy-MT3-30B-A3B-GGUF", "tencent/Hy-MT3-7B", "tencent/Hy-MT3-7B-FP8", "tencent/Hy-MT3-7B-GGUF", "tencent/Hy-MT3-1.8B", "tencent/Hy-MT3-1.8B-FP8", "tencent/Hy-MT3-1.8B-GGUF"]
downloads: ""
likes: ""
hf_last_modified: ""
note: "腾讯 Hy 多语翻译第三代，替换 HY-MT2：102 语言（MT2 为 38），误译 -43%、漏增译 -74%、指令错误 -40%。"
tags: ["translation", "multilingual"]
---

## Overview

Hy-MT3 是腾讯 Hy 多语翻译模型家族第三代，三个尺寸：1.8B、7B、30B-A3B（MoE），语言覆盖从 Hy-MT2 的 38 种扩到 **102 种**。本条目替换 HY-MT2 Series（无代际保留价值：尺寸线一致，新代全面更优）。

## 系列成员

| 模型 | 规模 | 格式 |
| --- | --- | --- |
| Hy-MT3-30B-A3B | 30B total / 3B active | BF16 + FP8 + GGUF |
| Hy-MT3-7B | 7B | BF16 + FP8 + GGUF |
| Hy-MT3-1.8B | 1.8B | BF16 + FP8 + GGUF |

## 模型特点

- 仅 3B 激活参数的 30B-A3B 在非思考模式下为所有参评模型最佳，超 Qwen3.8-Max、Kimi-K3.1-Pro、DeepSeek-V4.1-Flash，逼近 GPT-6.1-Sol / Gemini-4-Argon，且超越推理算力消耗 30 倍以上的模型；1.8B 小杯超讯飞、微软、Qwen-MT-Flash 等商用翻译 API。
- 真实场景错误率大降：误译样本占比 -43%、漏译增译 -74%、指令遵从错误 -40%（对 Hy-MT2）。
- 两个工业场景专精：游戏本地化（王者荣耀团队评测体系，核心指标匹配或超 Gemini 3.1 Pro，配开源工具链 TiMiHOKGameTranslator）；图像翻译（OCR 级联容错，VISTA-Bench 同尺寸最佳）。
- 随模型开源 TransRubric：基于评分细则的翻译自动评测套件，WMT26 metrics shared task 测试集上超其他方案，比人工评测更稳定。

## 训练要点

- 训练细节未公开。未证实。模型卡强调游戏域高质量数据与专业评测体系构建。

## 关键技术

- MoE 稀疏激活：30B-A3B 以 3B 激活达到旗舰级翻译质量。
- OCR 级联容错：针对图像翻译中 OCR 错误的上下文理解与纠错增强。
