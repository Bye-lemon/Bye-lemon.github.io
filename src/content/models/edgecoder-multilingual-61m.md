---
name: "EdgeCoder-Multilingual-61M"
category: "retrieval"
tasks: ["embedding", "classification", "similarity", "fill-mask"]
modalities_in: ["text"]
modalities_out: ["embedding", "score"]
languages: ["multilingual"]
domains: []
role: "base"
architecture: "transformer"
training_stage: ["pretrained"]
access: "open-weights"
status: "stable"
size_class: "<1B"
params: "61M"
context_length: ""
family: "EdgeCoder"
base: ""
license: "Apache-2.0"
author: "Knowledgator"
updated: "2026-11-25"
published: "2026-10-26"
paper: "https://arxiv.org/abs/2611.31495"
link: "https://huggingface.co/knowledgator/EdgeCoder-Multilingual-61M"
hf_id: "knowledgator/EdgeCoder-Multilingual-61M"
hf_collection: ""
collection_models: []
downloads: "3362"
likes: "31"
hf_last_modified: "2026-11-25T11:47:17.000Z"
note: "Knowledgator 多语言 ELECTRA 式 encoder：46 语言、FlashDeBERTa attention、长上下文；ModernELECTRA 论文发布的双语种权重之一。"
tags: ["encoder", "electra"]
---

## Overview

EdgeCoder-Multilingual-61M 是 Knowledgator 随 ModernELECTRA 论文（arXiv:2611.31495）发布的轻量多语言 encoder，同系列另有英语版 EdgeCoder-31M。模型采用 ELECTRA 式 replaced-token-detection 判别预训练，基于 DeBERTa v2 家族架构（HF 注册架构名 `FlashDebertaV2ForWindowElectraTraining`），预训练覆盖 46 种语言，面向embedding、分类与语义匹配等任务。兼容 text-embeddings-inference（TEI）与 HF Endpoints。

## 模型特点

- 判别式预训练范式：与 MLM 不同，ELECTRA 训练判别器区分真实 token 与生成器替换的 token，小参数下样本效率更高。
- 多语言覆盖：46 种语言（含中、英、俄、西、德、法、日等），单个 checkpoint 支持跨语言迁移。
- FlashDeBERTa attention：面向长上下文的高效 attention 实现，模型卡标注 long-context；具体最大序列长度未在模型卡明确给出。
- 规模定位：61M 参数（官方命名），BF16 单文件 safetensors，适合端侧与低延迟推理场景。英语版 EdgeCoder-31M 报告 GLUE dev 86.0、MTEB English v2 51.1（arXiv:2611.31495）；多语言版各语种 benchmark 分数模型卡未逐一列出。

## 训练要点

- ModernELECTRA 方法：在 ELECTRA 判别框架上引入 boundary-window reconstruction 辅助任务（论文细节见 arXiv:2611.31495）。
- 训练语料与配比、硬件与超参：模型卡未明确说明，见论文。
- 权重发布：英语 EdgeCoder-31M 与多语言 EdgeCoder-Multilingual-61M 同时开源（Apache-2.0）。

## 关键技术

- FlashDeBERTa：DeBERTa v2 的高效 attention 变体，降低长序列计算开销。
- Window ELECTRA 训练目标：判别被替换 token 的轻量预训练范式，小模型友好。
- TEI 兼容：可直接部署于 Hugging Face text-embeddings-inference 推理服务。
