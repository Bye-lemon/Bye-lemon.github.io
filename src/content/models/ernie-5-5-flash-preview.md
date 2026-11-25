---
name: "ERNIE 5.5 Flash Preview"
category: "language"
tasks: ["chat", "text-generation", "agent", "code"]
modalities_in: ["text"]
modalities_out: ["text"]
languages: ["zh", "en"]
domains: []
role: "chat"
architecture: "moe"
training_stage: ["pretrained", "continual", "sft"]
access: "open-weights"
status: "preview"
size_class: "100B-1T"
params: "280B total, 14B active"
context_length: "1048576"
family: "ERNIE"
base: "ERNIE-5.5-Flash-Base"
license: "Apache-2.0"
author: "Baidu"
updated: "2026-11-24"
published: "2026-11-24"
paper: "https://arxiv.org/abs/2610.24766"
link: "https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview"
hf_id: "baidu/ERNIE-5.5-Flash-Preview"
hf_collection: ""
collection_models: []
downloads: 75
likes: 255
hf_last_modified: "2026-11-24T07:17:13.000Z"
note: "ERNIE 5.5 Flash Base 的首个后训练版；280B-A14B MoE，1M 上下文；训练数据效率比 ERNIE 5.0 高 5 倍。"
tags: ["ernie", "agent"]
---

## Overview

ERNIE 5.5 Flash Preview 是百度基于 ERNIE 5.5 Flash Base 的首个后训练模型（post-training 中间 checkpoint，训练仍在进行）。280B 总参、每 token 激活 14B 的 MoE 语言模型，1M 上下文。定位编码、3D 建模、知识工作（表格/文档/幻灯片）与长任务代理；非思考模式解码快，thinking 默认开启可调 effort。

## 模型特点

- 与 Base 共享架构与 tokenizer：43 层（1 dense + 42 MoE），512 路由专家 top-10 + 1 共享，注意力为 37×HCA（head dim 512）+ 6×MLA-DSA，词表 201,216。
- 能力重心在 agent 场景：长任务编码（11 小时在 UE 5.8 上完成完整武侠游戏；从设计文档构建近 100 个小游戏）、Blender/CAD 脚本化 3D 建模、30 万工作区/千万文件的知识工作训练、15 万创作环境的视频生产。
- 多精度发布：默认 FP8 blockwise + MXFP4（W4A8，量化感知训练）路由专家，另有 FP8 与 BF16 仓库；FP4 专家权重 + DSpark draft head 加速长任务。

## 训练要点

- 分阶段训练：data-efficient mid-training → high-intensity RL → agentic RL → advanced mid-training → polishing。
- 长上下文靠 mid-training 从 128K 扩到 1M。
- 环境化 post-training：编码、3D、知识工作、视频四类场景各有大规模合成环境（workspaces / creation environments）。

## 关键技术

- HCA（异构上下文注意力）：37 层全注意力头 + 6 层 MLA-DSA（DeepSeek-Style Attention，head dim 256）混合。
- DSpark draft head：投机解码草稿头，FP4 专家下长任务显著加速且精度损失小。
- 与 ERNIE 5.0 同量级下训练数据效率提升 5 倍。
