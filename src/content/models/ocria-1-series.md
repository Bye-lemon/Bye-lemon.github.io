---
name: "OCRia-1 Series"
category: "multimodal"
tasks: ["ocr", "document-extraction"]
modalities_in: ["image", "document"]
modalities_out: ["text"]
languages: ["en", "multilingual"]
domains: ["document"]
role: "application"
architecture: "dense"
training_stage: ["distillation", "sft"]
access: "open-weights"
status: "stable"
size_class: "1-10B"
params: "8.1M~4B"
context_length: "32768"
family: "OCRia"
base: "Qwen3.5-4B"
license: "Model-Specific"
author: "LlamaIndex"
updated: "2026-11-25"
published: "技术报告"
paper: "https://arxiv.org/abs/2611.00092"
link: "https://huggingface.co/collections/llamaindex/ocria-1-parsing-models"
hf_id: ""
hf_collection: "llamaindex/ocria-1-parsing-models"
collection_models: ["llamaindex/OCRia-1", "llamaindex/OCRia-nano-1"]
downloads: ""
likes: ""
hf_last_modified: ""
note: "LlamaIndex 文档解析系列：4B VLM 走图像→Markdown，8.1M CPU 流水线走本地；ParseBench 双榜第一。"
tags: ["document-parsing", "vlm"]
---

## Overview

OCRia-1 Series 是 LlamaIndex 的文档解析模型系列，含两个成员：

- **OCRia-1**：4B 视觉语言模型（基座 Qwen3.5-4B）。每页图像一次性转 Markdown：表格用 HTML（含 colspan/rowspan 合并单元格）、图表转为数据点 HTML 表、公式转 LaTeX（含手写）、删除线/下标/复选框等语义格式保留、版式要素（页眉页脚水印）独立标签、多栏还原阅读顺序、示意图输出 Mermaid。不依赖版面检测器、OCR 引擎或 PDF 文本层。ParseBench 2 得分 85.2（61 个系统第 7）、ParseBench 1 得分 84.7（158 个系统第 2），均为开源权重模型第一；图表维度 82.5，超次优开源模型 13 分。
- **OCRia-nano-1**：8.1M 参数的 CPU 端解析流水线（LiteParse），检测器+识别器 OCR 栈配 LayoutNet（表格结构+版面联合模型）。知识蒸馏自 OCRia-1（参数为其 1/500）。ParseBench-2 得分 59.2，超 Indra（55.1）与 Marker（52.5）；16 vCPU 上 27.8 页/秒。支持拉丁/CJK/阿拉伯希伯来（RTL）/世界文字四路识别器路由，WASM 可跑浏览器。

## 模型特点

- 同一解析能力的两个部署极端：4B VLM 走精度上限，8.1M 流水线走本地 CPU 覆盖；后者蒸馏前者，保持同一输出约定。
- 单页单调用：文本完全来自页面图像，无外部 OCR/版面工具串联，错误不会被流水线放大。
- 输出即结构化文档：表格、图表、公式、格式、示意图各自有强制输出契约（系统提示锁定，改动会导致格式漂移）。

## 训练要点

- 数据质量优先于数量：合成页面提供长表格与复杂格式的精确 ground truth；真实页面用基于 PDF 文本层的有依据转写管线构造标签。
- 维度特定奖励（reward design）：表格重建、图表数据抽取等维度分别设计奖励信号，是报告归因性能的首要因素。
- nano 版蒸馏：LayoutNet 与识别器栈从 OCRia-1 蒸馏，兼顾速度（单核 426ms/页）与精度。

## 关键技术

- 图表→数据表的强制契约：禁止 iframe/canvas 等逃避输出，图表必须还原为底层数据表。
- 版面框（layout boxes）实验性输出，可用于视觉定位与校验。
- 服务端版本为量化+投机解码+定制 kernel 的同款模型，推理约快 10 倍（LlamaParse 线上形态）。
