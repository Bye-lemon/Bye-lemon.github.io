---
name: "Ming-Image Series"
category: "generation"
tasks: ["image-generation"]
modalities_in: ["text", "image"]
modalities_out: ["image"]
languages: ["zh", "en"]
domains: []
role: ""
architecture: "diffusion"
training_stage: ["pretrained"]
access: "open-weights"
status: "stable"
size_class: "1-10B"
params: "6B DiT + 17B Ming VLM 文本编码路径"
context_length: ""
family: "Ming"
base: ""
license: "MIT"
author: "InclusionAI"
updated: "2026-11-26"
published: "2026-09-16"
paper: ""
link: "https://huggingface.co/collections/inclusionAI/ming-image"
hf_id: ""
hf_collection: "inclusionAI/ming-image"
collection_models: ["inclusionAI/Ming-Image-0.2-Design", "inclusionAI/Ming-Image-0.1-Design-Layer", "inclusionAI/Ming-Image-0.1-Design"]
downloads: ""
likes: ""
hf_last_modified: ""
note: "蚂蚁 inclusionAI 6B 设计向文生图：0.1-Design（UI/电商/海报，RGBA）、0.1-Design-Layer（图层分解）、0.2-Design（复杂构图/光照/文字渲染升级，AA-Image-T2I v2.1 开放权重第一）。"
tags: ["text-to-image", "graphic-design", "text-rendering", "rgba"]
---

## Overview

Ming-Image 是蚂蚁 inclusionAI（Ant Ling）开源的设计向文生图系列，主打 UI 界面、电商主图、海报与空间效果图等文字密集版式场景，全部 MIT 许可。系列三个成员：

- **Ming-Image-0.1-Design**：6B DiT 文生图（2026-09 发布），2048×2048 直出，原生支持 RGBA 透明通道，发布时为 AA UI/UX Design 榜开放权重第一（截至 2026-09-22）。
- **Ming-Image-0.1-Design-Layer**：image-to-image 图层分解模型，把整张设计图拆解为可独立编辑的透明图层，为下游编辑与动画提供资产。
- **Ming-Image-0.2-Design**：0.1 的升级版（2026-11-25），重点改进复杂构图、光照与文字渲染；AA-Image-T2I v2.1 开放权重综合榜第一（2026-11-23 初评、11-25 快照，厂商自报口径）。

## 模型特点

- 设计向定位：非泛用插画模型，针对文字密集版式优化，能把提示词中的标题、正文按版式渲染进图。
- RGBA 原生输出：0.1-Design 即支持透明通道，适合 UI 素材与电商图直接下游使用。
- 图层分解：0.1-Design-Layer 将设计图拆成透明图层（0.2-Layer 版本发布时将细化到字符级，尚未上线）。
- 网页设计闭环：0.2-Design 与 Ling-3.2-flash 配合，可把设计概念转为交互式页面。

## 训练要点

- 架构：DiT 30 层、维度 3840；0.2 与 0.1 架构与推理代码完全相同，已有 diffusers 环境只需换权重。
- 完整流程的文本编码路径为 17B Ming VLM（也可用 qwen3.8-27B 等作提示增强器）。
- 推理默认 12 步、CFG 1.0、BF16，默认输出 2048×2048（2K 分档：2560×1440 / 2432×1824 / 1664×2496），单张 80 GiB GPU 验证。
- 训练数据与流程细节未披露。

## 关键技术

- 结构化提示：官方推荐 Figma 风格结构化提示（JSON 描述版式），配提示增强器（Ling-3.0-flash-VL / qwen3.8-27B）把自然语言改写为结构化提示。
- 部署生态：官方推理代码 inclusionAI/Ming-Image；Comfy-Org 重打包单文件权重，ComfyUI 原生可加载（`TextEncodeMingImageEdit` 条件节点）；提供 vLLM-Omni 配方与 INT8 / w4a8 量化。
- 榜单成绩：0.1 为 AA UI/UX 开放权重第一（2026-09-22）；0.2 为 AA-Image-T2I v2.1 开放权重综合第一（2026-11-25 快照，厂商自报）。
