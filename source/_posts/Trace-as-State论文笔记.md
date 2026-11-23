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
date: 2026-11-23 16:45:00
---
## Introduction

### Problem：长上下文推理中的“状态发现顺序”错位

长上下文模型已经把名义上下文窗口扩展到数十万甚至百万 token，但自回归 Transformer 仍然服从因果注意力：后面的信息可以参与后续生成，却不能回头修改同一遍处理中已经形成的上下文表示。这带来一个结构性问题：**输入顺序不一定等于推理顺序**。

很多长上下文任务要求模型边读边维护某种任务状态，例如：

- 当前正在追踪的目标节点；
- 已解析出的引用、指代或实体关系；
- 搜索 frontier；
- 已排除或已验证的假设集合。

这些状态 often 不是一开始就知道，而是在模型读完一部分上下文、甚至开始 reasoning 之后才逐渐明确。作者把这类现象抽象成 **conditional state update task**：处理器需要用一个后给出的条件 $z$ 去更新一段已经读过的信息序列 $C$。若顺序是 $[z,C]$，因果处理器可以沿着一条确定的状态路径更新；若顺序是 $[C,z]$，处理器必须在读完 $C$ 之前保留“不同初始状态会如何影响整个序列响应”的信息。论文证明，在这种最坏情况下，两者的内存需求可能出现指数级差距。

### Motivation：把 reasoning trace 当作下一遍阅读的“前置状态”

现代 reasoning model 会在输出可见答案前生成 reasoning traces。这些 trace 可能不完整、有损甚至包含错误，但往往会记录模型已经做过的中间计算、假设、排除过程和状态更新。本文的核心想法是：**不要把 trace 只当作解释文本，而把它当作任务状态的文本代理，并在重新阅读长上下文之前提供给模型**。

这就是 **TRACE AS STATE**：

1. 第一遍读取原始长上下文 $x$，运行一次或多次模型，收集 reasoning traces；
2. 用固定 serializer $\pi$ 把这些 traces 拼成文本状态块 $T$；
3. 开启全新一遍推理，把 $T$ 放在长上下文之前，即 $[T,x,q]$。

论文的关键对照是 **TRACE APPEND**。它使用相同上下文 $x$、相同 reasoning traces、相同 serializer 生成同一个 $T$，只是把 $T$ 放在上下文之后：$[x,T,q]$。因此，这不是“有没有 trace”的比较，而是严格的**位置干预**：同一批状态信息，在上下文前还是上下文后可用，哪一种更有用？

![Figure 1: TRACE AS STATE 总览。A 表示因果状态更新；B 表示 condition-first 与 condition-last 的内存差异；C 表示 reasoning trace 作为任务状态代理；D 表示把 trace 放到新一遍长上下文之前。](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/papers/2609.02702/fig1.png)

### 一句话结论

在 GraphWalks 256K、MRCRv2 8-needle 256K/512K、NUB-1M Season 2 上，作者用 DeepSeek V4 Pro Preview、GLM-5.2、Qwen 3.7 Max 三个不同架构的长上下文模型评估。27 个报告的 model/task/metric 组合中，TRACE AS STATE 在 26 个组合上优于 TRACE APPEND，并且所有报告设置中都高于 first pass。最强提升出现在 GraphWalks Parents：DeepSeek V4 Pro Preview 的 exact match 从 first pass 的 29.2%、TRACE APPEND 的 43.0% 提升到 TRACE AS STATE 的 81.8%；GLM-5.2 则达到 100.0 EM / 100.0 F1。

## Methodology

### 1. Causal state update：为什么“先给状态”可能本质上更容易

作者先定义一个理想化的 **causal state update processor**。设输入信息单元序列为 $C=(c_1,\dots,c_n)$，处理器维护有限状态 $s_i\in S$，每次只读取一个新单元 $c_i$，并根据固定更新规则 $U$ 更新状态：

$$
s_i = U(s_{i-1}, c_i), \qquad i=1,\dots,n.
$$

这里的关键是“因果”：第 $i$ 步只能使用当前状态 $s_{i-1}$ 和新输入 $c_i$，不能回头重读之前的输入。

在普通设定中，初始状态 $s_0$ 固定，因此处理器沿一条确定路径前进。但在 **conditional state update task** 中，初始状态由条件 $z\in S$ 指定：

$$
s_0=z.
$$

同一个任务有两种输入顺序：

- **Condition first**：$[z,C]$。处理器一开始就知道该沿哪条状态路径更新；
- **Condition last**：$[C,z]$。处理器读完整段 $C$ 后才知道应该传播哪个初始状态。

令 $b=\log_2|S|$。若条件是 $[z,C]$，处理器只需要保存当前状态，因此 $\lceil b\rceil$ bits 足够。若条件是 $[C,z]$，处理器读 $C$ 时还没有选择状态路径，必须保留由 $C$ 诱导出的所有可能响应轮廓。最坏情况下需要至少：

$$
\left\lceil |S|\log_2|S| \right\rceil
=
\left\lceil b\,2^b \right\rceil
$$

bits，而不是 condition-first 情况下的 $\lceil b\rceil$ bits。这就是论文的 ordering principle：**如果一个条件会指导后续信息处理，那么把它放在信息序列之前，可能显著降低因果处理器的状态维护负担。**

作者也说明，这不是对真实长上下文任务的逐字建模，而是用于解释和预测一种干预原则：在下一轮阅读前把迟到的任务状态前置。

### 2. Reasoning traces as textual state proxy

在长上下文任务中，形式化的条件 $z$ 通常不是现成输入。有用状态往往在模型 reasoning 时才被发现。例如 GraphWalks 中，模型可能在推理过程中逐渐明确当前节点、父节点集合或搜索边界；这些状态如果能在重新读图之前获得，就可能改变模型对边列表的编码方式。

因此，作者把 reasoning trace 看作任务状态的**可观察文本代理**。它不必完整、精确或正确；只要其中包含足够的状态信息，把它放在长上下文之前就可能让第二遍处理“带着状态去读”。

具体地，对同一问题运行模型 $n_{tr}$ 次，每次得到 reasoning trace $r_j$ 和可见答案 $a_j$：

$$
(r_j,a_j)\sim M(\cdot\mid x), \qquad j=1,\dots,n_{tr}.
$$

固定 serializer $\pi$ 将这些 traces 按源顺序拼成状态块：

$$
T=\pi(r_1,\dots,r_{n_{tr}}).
$$

论文实现中的 serializer 很保守：保留 reasoning text 的源顺序，只加入固定标签与分隔符，例如 `<first_run_reasoning_traces>`、`[Trace 1]`、`[Trace 2]` 等；每条 trace 若超过 50,000 字符，则截断到前 50,000 字符并追加省略标记，避免第二遍 prompt 超出模型上下文容量。

### 3. TRACE AS STATE vs TRACE APPEND：唯一差异是位置

第二遍分别测试：

$$
(r'_{Tap},a'_{Tap})\sim M(\cdot\mid[x,T]),
$$

$$
(r'_{Tas},a'_{Tas})\sim M(\cdot\mid[T,x]).
$$

实验中问题 $q$ 被固定放在末尾，因此字面 prompt 顺序是：

- TRACE AS STATE：$[T,x,q]$
- TRACE APPEND：$[x,T,q]$

这保证了上下文、trace、serializer 都相同，唯一变化是 $T$ 的插入位置。TRACE AS STATE 中，$T$ 在模型重新处理 $x$ 时已经可用；TRACE APPEND 中，$T$ 来得较晚，仍可影响后续 reasoning 和最终答案，但不能改变已经为前文上下文 token 形成的表示。

![Figure 2: DeepSeek V4 Pro Preview 在 GraphWalks 256K 上的 trace-count ablation。随着第一遍 traces 数量 $n_{tr}$ 从 1 增加到 5，TRACE AS STATE 始终高于 TRACE APPEND。](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/papers/2609.02702/fig2.png)

## Experiments

### 实验设置

论文评估三个不同提供方、不同长上下文设计的 reasoning model：

| 模型 | 披露架构 | Input budget | Output budget | Reasoning 配置 |
| --- | ---: | ---: | ---: | --- |
| Qwen 3.7 Max | GDN + GA | 983,616 | 65,536 | 官方 xhigh system prompt |
| DeepSeek V4 Pro Preview | CSA + HCA + mHC | 1,048,576 | 131,072 | max |
| GLM-5.2 | DSA + IC，1M-token MoE | 1,048,576 | 65,536 | max |

三个任务分别覆盖图状态维护、多跳检索绑定和长篇小说阅读理解：

| 任务 | 使用子集 | 问题数 | 重复次数 | 指标 |
| --- | --- | ---: | ---: | --- |
| GraphWalks | 256K | 200 | 5 | EM, set F1 |
| MRCRv2 8-needle | 256K, 512K | 200 / 200 | 5 | EM, SequenceMatcher ratio |
| NUB-1M | Season 2 | 20 | 5 | Accuracy |

GraphWalks 要求模型在很长边列表上维护图状态；MRCRv2 要求把最终请求绑定到正确的历史 request-response instance；NUB-1M 是 400K–700K token 的小说理解基准。作者没有把 1M bin 全量用于 GraphWalks/MRCR，因为不同模型 tokenizer 会导致公平性问题；他们选择保留给 TRACE AS STATE / TRACE APPEND 额外文本空间的最长可行 bin。

### Main results

下表汇总论文 Table 2 的主结果。数值为 5 次重复后的平均百分比，越高越好。

| 模型 | 条件 | GraphWalks BFS<br>EM / F1 | GraphWalks Parents<br>EM / F1 | MRCR 256K<br>EM / Seq. | MRCR 512K<br>EM / Seq. | NUB-1M<br>Acc. |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| DeepSeek V4 Pro Preview | First Pass | 31.6 / 36.4 | 29.2 / 46.5 | 53.8 / 78.5 | 45.4 / 63.6 | 60.0 |
| DeepSeek V4 Pro Preview | TRACE APPEND | 41.8 / 48.3 | 43.0 / 65.3 | 66.6 / 79.6 | 49.4 / 66.9 | 71.0 |
| DeepSeek V4 Pro Preview | TRACE AS STATE | **58.8 / 65.9** | **81.8 / 91.3** | **76.2 / 88.5** | **52.6 / 73.3** | **73.0** |
| Qwen 3.7 Max | First Pass | 60.0 / 68.1 | 60.8 / 87.2 | 79.8 / 83.1 | 36.2 / 43.7 | 37.0 |
| Qwen 3.7 Max | TRACE APPEND | 60.4 / 70.4 | 71.0 / 91.7 | 84.0 / 87.1 | 40.4 / 47.4 | 49.0 |
| Qwen 3.7 Max | TRACE AS STATE | **63.8 / 71.7** | **96.4 / 99.1** | **88.4 / 91.3** | **46.8 / 52.5** | **51.0** |
| GLM-5.2 | First Pass | 55.8 / 70.7 | 66.4 / 88.5 | 40.2 / 48.2 | 42.6 / 52.0 | 43.0 |
| GLM-5.2 | TRACE APPEND | 60.0 / **75.8** | 83.2 / 92.7 | 40.0 / 58.3 | 44.6 / 59.9 | 65.0 |
| GLM-5.2 | TRACE AS STATE | **63.4 / 75.0** | **100.0 / 100.0** | **61.2 / 71.9** | **55.4 / 70.1** | **66.0** |

几点观察：

- **总体排序非常稳定**：27 个组合中 TRACE AS STATE 赢 26 个。唯一例外是 GLM-5.2 GraphWalks BFS F1，TRACE APPEND 高 0.8 点，但 TRACE AS STATE 的 EM 仍更高。
- TRACE APPEND 相比 first pass 也常提升，说明 reasoning traces 本身确实携带了有用信息；TRACE AS STATE 的额外优势来自位置，而不只是“重复读”或“多给文本”。
- 最大提升集中在 GraphWalks Parents。这个子任务要求维护 predecessor state，天然对应“条件状态”解释：如果模型能在重读图之前知道父节点集合等中间状态，就更容易在边列表中定位相关结构。

### Ablation：排除简单解释

作者在 DeepSeek V4 Pro Preview / GraphWalks 256K 上做了严格对照，排除“只是多了文本”“只是重读”“只是答案反馈”“只是 trace 格式”等解释。

| 条件 | Prompt | BFS<br>EM / F1 | Parents<br>EM / F1 |
| --- | --- | ---: | ---: |
| First pass | $[x,q]$ | 31.6 / 36.4 | 29.2 / 46.5 |
| Majority@5 | 5 次 first-pass 答案多数投票 | 35.0 / 39.6 | 31.0 / 47.8 |
| Oracle@5 | 5 次 first-pass 中事后最优 | 50.0 / 55.5 | 50.0 / 75.0 |
| Question First | $[q,x,q]$ | 33.4 / 36.8 | 53.0 / 64.6 |
| Re2 | $[x,q,x,q]$ | 49.0 / 52.9 | 50.0 / 68.9 |
| Answer Feedback | $[a,x,q]$ | 35.4 / 39.4 | 45.4 / 58.0 |
| Random Trace | $[T_{rand},x,q]$ | 22.4 / 35.9 | 14.2 / 31.3 |
| Trace Only | $[T,q]$ | 46.2 / 52.7 | 43.8 / 67.3 |
| TRACE APPEND | $[x,T,q]$ | 41.8 / 48.3 | 43.0 / 65.3 |
| TRACE AS STATE | $[T,x,q]$ | **58.8 / 65.9** | **81.8 / 91.3** |

这些控制实验很关键：

- **Question First** 在 Parents 上提升明显，说明问题本身确实携带状态；但仍远低于 TRACE AS STATE。
- **Re2** 证明重读有效，但低于 TRACE AS STATE，说明 $T$ 不只是 prompt repetition。
- **Answer Feedback** 低于 TRACE AS STATE，说明中间 reasoning 比最终答案更像可用状态。
- **Random Trace** 甚至低于 first pass，说明“看起来像 trace”的 scaffold 没用，必须是同问题、任务相关的 traces。
- **Trace Only** 高于 first pass，说明 traces 中有答案相关信息；但仍远低于 TRACE AS STATE，说明原始上下文仍然必要，不能把方法简化成只靠 trace。
- TRACE AS STATE 甚至高于 **Oracle@5**，说明反馈式重读不是简单的事后挑选最好一次 first-pass 输出。

### Trace count：一种 inference-scaling 参数

作者进一步把 $n_{tr}$ 从 1 增到 5，每个 $n_{tr}$ 下 TRACE AS STATE 与 TRACE APPEND 都使用相同 realized $T$。结果显示性能总体随 trace 数增加而上升，并且 TRACE AS STATE 在每个 $n_{tr}\ge1$ 上都高于 TRACE APPEND。这支持把 trace count 看作一种 inference-scaling 参数：更多第一遍推理可以提供更丰富的状态代理，但代价是额外推理成本。

### 不确定性、成本与边界

论文的 bootstrap 结果显示，在 24 个严格 same-$T$ 比较 cell 中，20 个 cell 的 95% percentile interval 完全位于零以上；4 个跨过零的 cell 是 DeepSeek V4 Pro MRCRv2 512K EM、Qwen 3.7 Max GraphWalks BFS F1、GLM-5.2 GraphWalks BFS EM/F1。也就是说，整体趋势很强，但不是每个单一 cell 都完全无可争议。

成本也很直接：TRACE AS STATE 需要先跑一次或多次 source runs，再完整重读长上下文。Table 6 显示总 token 成本会显著增加，例如 DeepSeek V4 Pro 在 GraphWalks 256K 上 first pass 约 206.8M provider-reported tokens，TRACE APPEND 约 477.8M，TRACE AS STATE 约 483.8M。方法收益不是免费的。

## Limitations & Future Work

论文明确承认的限制包括：

- 当前实现依赖模型暴露 raw reasoning traces 或其他状态接口；只返回最终答案的模型/API 需要不同接口。
- 只评估了三个 causal transformer 模型和三类长上下文任务，未覆盖多轮 agentic tasks；是否能泛化到更多模型、领域、上下文长度和交互场景仍需验证。
- 方法会增加推理延迟和 token 成本；在多轮 agentic 场景中，把状态放在原上下文之前还可能降低 key-value cache 复用。
- reasoning traces 本身可能含错误，因此 $T$ 是有损状态代理；论文未深入训练模型更好地区分 trace 中哪些状态可信。

作者提出的方向包括：选择和压缩 traces、学习更好的 textual state interface、优化 feedback 放置位置，以及训练能联合学习模型与反馈接口的框架。论文还报告了一个值得注意的 agentic 安全观察：在进一步 agentic coding 实验中，TRACE AS STATE 相比普通 interleaved thinking 出现更多 sandbox breakout attempts，因此需要更透明的 reasoning traces 和更稳健的监控。

## 我的理解

这篇论文最重要的不是“用 trace 再喂一遍模型”这个工程技巧，而是把现象说成了一个清晰的结构问题：因果 Transformer 在同一遍内无法回头修正早期上下文表示，因此后 discovered state 的价值取决于它在下一次阅读前是否可用。TRACE AS STATE 的收益来自“带着状态重读”，不是来自 trace 本身，也不是来自简单重复。

它的适用边界也很清楚：适合长上下文、状态密集、第一遍 reasoning 能提取出可复用中间状态的任务；不太适合状态很少、trace 基本不含新信息、或无法承受第二遍长上下文成本的任务。

## Paper Information

- Zou X, Tang J. Trace as State: Reasoning Traces as Conditional States for Long-Context Transformers[J]. arXiv preprint arXiv:2609.02702, 2026.

- Paper：[https://arxiv.org/abs/2609.02702](https://arxiv.org/abs/2609.02702)

- PDF：[https://arxiv.org/pdf/2609.02702](https://arxiv.org/pdf/2609.02702)
