---
name: "LingSante-3.1-air-VL"
category: "multimodal"
tasks: ["document-extraction", "ocr", "qa", "agent", "tool-use"]
modalities_in: ["text", "image"]
modalities_out: ["text"]
domains: ["medical"]
architecture: "moe"
access: "open-weights"
status: "stable"
size_class: "100B-1T"
params: "124B (5.5B active)"
context_length: "256K"
family: "LingSante"
base: "Ling-3.0-flash-VL"
license: "MIT"
author: "蚂蚁集团"
updated: "2026-11-22"
published: "2026-11-16"
link: "https://huggingface.co/inclusionAI/LingSante-3.1-air-VL"
hf_id: "inclusionAI/LingSante-3.1-air-VL"
downloads: 0
likes: 42
hf_last_modified: "2026-11-22T17:03:07.000Z"
note: "LingSante 系列医疗视觉语言模型，支持文本/图像理解及 Agent 与工具工作流；基于去污染的多模态生物医学数据训练。"
---

## Overview

LingSante-3.1-air-VL is a 124B-parameter MoE visual language model for medical applications. It supports text and image inputs, long-context processing, and agent/tool workflows.
