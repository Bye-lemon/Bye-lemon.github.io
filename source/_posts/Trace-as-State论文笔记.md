---
slug: post-19
title: >-
  《Trace as State: Reasoning Traces as Conditional States for Long-Context
  Transformers》论文笔记
tags:
  - Long Context
  - LLM
  - Reasoning
categories: 论文笔记
abstract: '【arXiv:2609.02702】 Xu Zou, Jie Tang. Trace as State: Reasoning Traces as Conditional States for Long-Context Transformers.'
date: 2026-11-23 16:08:00
---
## Introduction

- 长上下文 Transformer 仍然保持因果注意力：后文可以影响后续生成，但不能改变同一遍处理中已经形成的前文表示。本文关注的是这种输入顺序与推理顺序不匹配的问题。

- 作者用 **conditional state update task** 形式化这个错位：如果条件状态在信息序列之前给出，因果处理器只需要维护一条已实现的状态路径；如果条件状态最后给出，最坏情况下需要保存关于所有可能条件的响应轮廓，内存需求可能出现指数级差距。

- 基于这个排序原则，作者提出 **TRACE AS STATE**：先让模型基于长上下文生成一条或多条 reasoning traces，再把这些 trace 序列化为文本状态代理 $T$，在全新一遍推理中把 $T$ 放到长上下文之前。

- 与 **TRACE APPEND** 相比，二者使用相同上下文、相同 trace、相同 serializer，唯一差异是第二遍输入顺序：`[T, x, q]` vs. `[x, T, q]`。因此这个对照实验检验的是：同一批 traces 放在上下文中，是否比放在上下文后更有用。

![Figure 1](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/papers/2609.02702/fig1.png)

## Methodology

- **Causal state update processor**：处理器按输入顺序读取每个单元 $c_i$，只根据当前状态 $s_{i-1}$ 和新输入 $c_i$ 更新状态。形式化定义为 $s_i = U(s_{i-1}, c_i)$。

- **Conditional state update task**：初始状态不由固定值给出，而由条件 $z$ 给出。若输入顺序是 $[z, C]$，处理器一开始就知道该更新哪条状态路径；若输入顺序是 $[C, z]$，读完序列后才得到初始状态，最坏情况下需要为不同响应轮廓保留更多配置。

- **Trace as textual state proxy**：长上下文推理中的有效状态，例如当前目标、已解析引用、搜索边界或已排除假设，可能是在读完上下文后的 reasoning 中才发现的。作者把 reasoning traces 视为任务状态的可观察文本代理，不假设它完整、无损或完全正确。

- **Serializer**：固定 serializer $\pi$ 把同一问题的一次或多次 source run 的 traces 拼成 $T=\pi(r_1,\dots,r_{n_{tr}})$。作者加入固定标签和分隔符，例如 `<trace_start>` 与 `<trace_end>`；实现中会把过长的 trace 截断到前 50,000 字符，以避免第二遍 prompt 超出模型上下文容量。

- **Second pass**：第二遍分别测试 `TRACE AS STATE` 的 $M([T,x,q])$ 和 `TRACE APPEND` 的 $M([x,T,q])$。TRACE AS STATE 让 $T$ 在处理长上下文时可用；TRACE APPEND 中 $T$ 到达较晚，只能影响后续 reasoning 和最终答案，不能改变已经形成的上下文表示。

## Experiments

- **模型**：作者在三个不同提供方、不同长上下文架构的模型上评估：DeepSeek V4 Pro Preview、GLM-5.2、Qwen 3.7 Max。三者都暴露 reasoning traces，可复用为第一遍产生的文本状态代理。

- **任务**：GraphWalks 256K、MRCRv2 8-needle 256K/512K、NUB-1M Season 2。任务分别覆盖图状态维护、长上下文检索绑定、长篇小说阅读理解。

- **主结果**：在 27 个报告的 model/task/metric 组合中，TRACE AS STATE 在 26 个组合上优于 TRACE APPEND。GraphWalks Parents 上提升最明显：DeepSeek V4 Pro Preview 的 EM 从 first pass 的 29.2% 提升到 81.8%，F1 从 46.5% 提升到 91.3%；GLM-5.2 在 Parents 上达到 100.0 EM 和 100.0 F1。

- **消融**：Question First、Answer Feedback、Random Trace、Trace Only、Re2 等控制实验均低于 TRACE AS STATE。作者据此认为收益不只是来自重复阅读、答案反馈、通用 trace scaffold 或文本近因性，而是来自同问题 reasoning traces 中携带的任务状态信息及其放置位置。

- **trace 数量**：在 DeepSeek V4 Pro Preview GraphWalks 256K 上，随着第一遍 traces 数量 $n_{tr}$ 从 1 增加到 5，性能总体上升，且 TRACE AS STATE 始终高于 TRACE APPEND。这支持把 trace count 视为一种 inference-scaling 参数。

![Figure 2](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/papers/2609.02702/fig2.png)

- **代价**：方法需要一次或多次 source runs，再进行全新一遍长上下文处理，因此会增加推理延迟和 token 成本。状态放在原上下文之前也可能降低多轮 agentic 场景中的 key-value cache 复用。

## Paper Information

- Zou X, Tang J. Trace as State: Reasoning Traces as Conditional States for Long-Context Transformers[J]. arXiv preprint arXiv:2609.02702, 2026.

- Paper：[https://arxiv.org/abs/2609.02702](https://arxiv.org/abs/2609.02702)

- PDF：[https://arxiv.org/pdf/2609.02702](https://arxiv.org/pdf/2609.02702)
