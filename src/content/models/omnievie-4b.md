---
name: "OmniEVIE-4B"
category: "retrieval"
tasks: ["embedding", "retrieval"]
modalities_in: ["text", "image", "video", "document"]
modalities_out: ["embedding"]
languages: ["multilingual"]
domains: []
role: "application"
architecture: "transformer"
training_stage: ["sft"]
access: "open-weights"
status: "stable"
size_class: "1-10B"
params: "4.54B"
context_length: ""
family: "OmniEVIE"
base: "Qwen/Qwen3.5-4B"
license: "Apache-2.0"
author: "腾讯"
updated: "2026-11-26"
published: "2026-11-24"
paper: "https://arxiv.org/abs/2611.32203"
link: "https://huggingface.co/tencent/OmniEVIE-4B"
hf_id: "tencent/OmniEVIE-4B"
downloads: 399
likes: 25
hf_last_modified: "2026-11-26T02:33:26.000Z"
note: "腾讯统一多模态多向量检索模型，MMEB 榜单（除音频）190 任务第一；单一 checkpoint 支持全文保真与压缩索引两种模式。"
tags: ["omnievie", "colbert", "multi-vector", "matryoshka", "late-interaction"]
---

## Overview

OmniEVIE-4B 是腾讯 IMA 产品中心与腾讯优图实验室推出的 4.54B 统一多模态多向量检索模型（Evidence-Vector-Informed Embedding），在 TIGER-Lab MMEB 榜单（除音频）190 个任务上排名第一，Visual Doc（84.70）、Text（52.97）、Agent（54.14）三个赛道均列第一，超过 9.4B 基线。单一 checkpoint 服务两种模式：Full 保留全部 token 的 2048D 未压缩向量（60.68），Compressed 把每条文档蒸馏为至多 128×64D int8 向量（百万条 8.82 GiB，60.06），单 CPU 线程检索百万条 54.2 ms，且每次命中可直接回溯到页面区域或视频时间段。

## 模型特点

- 全模态统一：文本、自然图像、视觉文档、原生视频、Agent/工具/GUI/记忆，一个模型覆盖。
- ColBERT 式 late interaction 多向量检索，Qwen3.5-4B 底座改造为双向全注意力。
- Prefix-MRL 弹性维度：单一投影头运行时可选 {64, 128, 256, 512, 1024, 2048} 维。
- 证据定位：检索 argmax 直接给出页面 bounding box 或视频时间区间，无需外部 OCR / 视频描述模型。
- 压缩友好：ST-HAC 时空 Ward 聚类 + 球面重归一化质心 + 定标 int8；K128×d64 约 8.82 GiB/百万条，K32 约 2.15 GiB。
- 配套 Learned Query Saliency Gate（query_gate.safetensors），过滤查询噪声 token。

## 训练要点

- 基于 Qwen3.5-4B 微调（base 与 finetune 标签均指向 Qwen/Qwen3.5-4B），具体训练配比未披露（未证实）。
- 训练/评测数据：MMEB-V2（HF 数据集标签）；视频帧采样 8 帧与 32 帧两档评测。
- 性能拐点：Full 模式 MMEB-V3 总分 60.68，Compressed（K128 int8）仅损失 0.62 至 60.06。

## 关键技术

- ST-HAC（spatio-temporal Ward 聚类）：把 token 多向量聚成固定数量质心，配合球面重归一化与定标 int8 量化，压缩后仍保 token 级对齐。
- 三阶段 CPU 索引：粗排（14.6 ms）+ Hamming（19.7 ms）+ int8 精排（19.9 ms）= 54.2 ms/百万条、120.2 ms/五百万条，比 Full int8 MaxSim 快 236×。
- Query Saliency Gate：学习到的 token 显著性门控（τ=0.6，噪声底 θ=0.38），抑制查询端无关 token。
- 证据溯源：检索命中自带空间/时间坐标，可视化可定位到表格行、跨语言答案句、图表元素或时间戳区间。
- 评测：MMEB-V3 190 任务 60.68（Full）/ 60.06（Compressed）；ViDoRe V3 8 领域 × 6 语言 graded nDCG@10 均值 64.34（Full）/ 62.96（K128）；QVHighlights 78.0% peak-in-segment 命中、94.3% 区间交叠。

## 使用

推荐官方包 `pip install git+https://github.com/Tencent/OmniEVIE.git`（需 flash-attn ≥ 2.7.0），或 sentence-transformers ≥ 6.3.0 的 MultiVectorEncoder 零自定义代码路径（未压缩向量 + MaxSim）。代码与模型（OmniEVIE / 2B / 4B）均为 Apache-2.0。
