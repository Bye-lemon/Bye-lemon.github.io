---
name: "Ling-3.2-air"
category: "multimodal"
tasks: ["chat", "reasoning", "captioning", "qa"]
modalities_in: ["image", "video", "text"]
modalities_out: ["text"]
languages: ["zh", "en"]
domains: []
role: "chat"
architecture: "moe"
training_stage: ["pretrained", "continual", "sft"]
access: "open-weights"
status: "stable"
size_class: "100B-1T"
params: "124B total, 5.5B active"
context_length: "262144"
family: "Ling"
base: "Ling-3.0-flash-VL"
license: "MIT"
author: "InclusionAI"
updated: "2026-11-24"
published: "2026-11-24"
paper: ""
link: "https://huggingface.co/inclusionAI/Ling-3.2-air"
hf_id: "inclusionAI/Ling-3.2-air"
hf_collection: ""
collection_models: []
downloads: 733
likes: 182
hf_last_modified: "2026-11-24T08:31:31.000Z"
note: "Ling-3.0-flash-VL 后继：hybrid-linear MoE VLM，124B/5.5B，视频理解 AutomationBench-AA 15.7%→61%。"
tags: ["vlm", "video"]
---

## Overview

Ling-3.2-air 是 InclusionAI 的开源原生多模态模型（Ling-3.0-flash-VL 的直接后继），124B 总参 / 5.5B 激活的 hybrid-linear MoE，图像与视频理解。GTA-Vid 视频理解 81.1（超越 Gemini-3.1-Flash-Preview 的 80.9），AutomationBench-AA 从 3.0-flash-VL 的 15.7 提到 61。

## 模型特点

- 架构 bailing_moe_v3_vl：hybrid-linear MoE，视觉与文本联合建模。
- 视频理解大幅强化：AutomationBench-AA +45.3 分（15.7→61），是其相对前代的核心增量。
- MIT 协议，商用友好。

## 训练要点

- 三阶段：大规模视觉-语言预训练 → 高质量 mid-training → 强化的 post-training。
- 具体数据配比与算力未公开。未证实。

## 关键技术

- Hybrid-linear MoE（KDA + gated MLA + 稀疏 MoE）应用于原生多模态场景。
- 视频长上下文训练支持 262K 上下文窗口。
