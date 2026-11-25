---
name: "Hy4"
category: "multimodal"
tasks: ["chat", "reasoning", "code", "agent"]
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
params: "770B total, 49B active (text) + 1.23B vision + 3.3B DFly2"
context_length: "1048576"
family: "Hy"
base: ""
license: "Model-Specific"
author: "Tencent"
updated: "2026-11-20"
published: "2026-11-20"
paper: "https://arxiv.org/abs/2512.02556"
link: "https://huggingface.co/tencent/Hy4"
hf_id: "tencent/Hy4"
hf_collection: ""
collection_models: []
downloads: "2384"
likes: "304"
hf_last_modified: "2026-11-20T03:05:49.000Z"
note: "Hy4 preview 的正式发布版：加入视觉、扩大前后训练规模；Gated DSA + IndexCache + iHC + DFly2 投机解码。"
tags: ["moe", "vlm", "agent"]
---

## Overview

Hy4 是腾讯 Hy 团队的新一代 MoE 旗舰（Hy4 preview 的正式发布版），支持文本、图像、视频理解。语言主干 770B 总参、每 token 激活 49B（文本）+ 1.23B（视觉）；78 层（1 dense + 77 MoE），每层 256 路由专家 + 1 共享专家，top-8 路由；1M 上下文。另有 5 层 DFly2 drafter（3.3B）内建投机解码。同时开源 Hy4、Hy4-FP8 与 Hy4 base。

## 模型特点

- 相对 preview 的增量：加入视觉能力（40 层 ViT，动态分辨率，adapter 注入视觉 token），预训练与后训练双双扩大；指令跟随、长上下文、长程任务、deep research 显著提升。
- 金融场景：数千真实工作区、数万任务训练；579 个真实金融任务上开源模型第一（3.04/4，超 DeepSeek-V4.1-Flash 与 Kimi K3.1 Pro）；幻觉率从 preview 的 15.76% 降到 5.45%。
- 游戏开发：与腾讯 IEG 共建数据与评测，覆盖 UE/Unity/Godot 及多人游戏；GameDev +19.1%、GameLogic +9.8%（对 preview）。
- 科研：TenureTrail 123 任务七学科开源第一；配合 Hyra 2.0 自主训练出超越官方 Jev baseline 的同架构变体。
- 已知局限：研究级数学、长程编码、模型自我改进、高级视觉问答上与顶级闭源仍有差距（官方自评）。

## 训练要点

- 数据与评测垂直共建：金融（FiT + 213 位专业人士）、游戏（IEG）、科研（Hyra 2.0 harness）各有真实环境数据与专业评测。
- 搜索定向升级：时效检索、多源综合、事实一致性校验；推测性错误从 23.1% 降至 5.6%。
- mid-training 引入大量合成指令数据（官方提示偶发影响 few-shot 评测格式遵从）。

## 关键技术

- Gated DeepSeek Sparse Attention（Gated DSA）：MLA 注意力 + 门控稀疏索引，每 token 由 indexer 选 top-2,048 上下文 token；索引头 32、head dim 128。
- IndexCache：跨层稀疏索引复用，降低长上下文稀疏注意力开销。
- iHC（identity Hyper-Connections）：残差通路 4 条流，扩展层间信息流。
- DFly2：并行 drafter，复用 Hy4 KV cache 与稀疏索引，长上下文投机解码恒定低开销。
