---
name: "RD Flow 64"
category: "generation"
tasks: ["image-generation"]
modalities_in: ["text"]
modalities_out: ["image"]
languages: ["en"]
domains: ["gaming"]
role: "application"
architecture: "transformer"
training_stage: ["pretrained"]
access: "open-weights"
status: "stable"
size_class: "<1B"
params: "270.9M（绘图） + 3.1B（提示词阅读器）"
context_length: ""
family: ""
base: "Qwen3-VL-4B-Instruct（提示词阅读器，冻结）"
license: "Model-Specific"
author: "Retro Diffusion"
updated: "2026-11-26"
published: "2026-11-24"
paper: ""
link: "https://huggingface.co/Retro-Diffusion/rd-flow-64"
hf_id: "Retro-Diffusion/rd-flow-64"
downloads: 403
likes: 32
hf_last_modified: "2026-11-25T13:57:38.000Z"
note: "271M 参数的像素级 64×64 像素画生成模型：直接在像素网格上按生成调色板作画，支持透明背景，2 GB 显卡可跑。"
tags: ["pixel-art", "flow-matching", "game-assets", "sprites"]
---

## Overview

RD Flow 64 是 Retro Diffusion 推出的 271M 参数文生图模型，专门生成真正的 64×64 像素画。它不是先画大图再缩小，而是直接在 64×64 像素网格上工作，并随图生成调色板——每个像素都指向调色板条目，没有中间色，平均约 37 色/图，精灵图带真正的透明通道。绘图模型 542 MB，2 GB 显卡即可运行；整条管线在普通笔记本 CPU 上也能跑（4090 上 4 张图 0.7 秒）。

## 模型特点

- 像素原生：hourglass flow transformer 作用于 64×64 网格，16×16 核心联合注意力覆盖 caption、调色板与图像。
- 调色板优先：采样后期每个像素变成调色板条目的指针，输出无中间色；也支持传入自定义色板强制取色。
- 透明与全幅同模型：透明精灵图与满幅场景图共用一套权重。
- 提示词阅读器：Qwen3-VL-4B-Instruct 冻结裁剪（embeddings + 前 27/36 解码层 + final norm，3.1B），随仓库附带（Apache-2.0）。
- 发布形态：rd-flow-64.safetensors（fp16 绘图模型）+ text_encoder/ + samples/；配套推理代码（MIT）、ComfyUI 节点包与在线 Demo（retrodiffusion.ai/rd-flow）。

## 训练要点

- 训练数据 525,430 张完整 64×64 图像：67% 来自 Retro Diffusion 自有模型生成，33% 为手工像素画/插画降采样到 64×64。
- 每张图由视觉模型撰写详细 caption（120–200 词：主体、各部分颜色与位置、姿态、视角构图、背景、描边与明暗），模型对同等长度的精细描述表现最好，短 prompt 明显变弱。
- 采样：flow matching，16 步 Euler，CFG 4；生产环境单图约 0.13 秒。

## 关键技术

- Hourglass flow transformer：64×64 网格上的流匹配 Transformer，16×16 全局核心联合建模 caption、调色板与像素。
- 像素→调色板指针化：采样末端把像素硬约束到调色板条目，保证色彩纯净。
- 极限小模型路线：与 SD1.5（0.86B）、SDXL（2.6B）、FLUX.1（12B）、Qwen-Image（20B）相比小 3–74 倍，牺牲通用性换取像素画的可控与速度。

## 局限

只出 64×64（其他尺寸需 Retro Diffusion 全量模型）；依赖长 caption；训练集仅 50 万图，知识覆盖有限；prompt 跟随弱于大模型；不透明场景弱于透明精灵；同 caption 不同种子多样性低；不支持文字与 logo；训练数据 2/3 为自生成，风格与偏差随之继承。

## 许可

权重采用 RD Flow 64 Model License：非商用——模型及其衍生（微调、合并、LoRA、蒸馏）不可出售或商用，产出图片归用户所有（可商用），但禁止用产出图训练其他模型。text_encoder/ 保持 Apache-2.0，推理代码 MIT。
