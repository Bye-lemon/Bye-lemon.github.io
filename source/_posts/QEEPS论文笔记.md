---
slug: query-guided-end-to-end-person-search-lun-wen-bi-ji
title: 《Query-guided End-to-End Person Search》论文笔记
tags:
  - Re-ID
  - Person Search
  - CVPR
categories: 论文笔记
kind: paper
abstract: 【CVPR2019】 Bharti Munjal Sikandar Amin Federico Tombari Fabio Galasso
date: 2020-08-09 16:35:52
---

## Introduction

- Person Search 任务旨在从画廊（gallery）图像中定位并匹配查询（query）行人。现有方法通常将检测与重识别分为独立的两个阶段，未能充分利用查询图像的信息来引导搜索过程。

- 论文提出 QEEPS（Query-guided End-to-End Person Search），首个查询引导的端到端行人搜索网络。核心思想有两点：其一，检测与重识别应在联合优化框架中完成；其二，搜索过程应充分利用查询图像，既包括全局上下文（如整体色调、光照条件），也包括局部线索（如查询行人的独特纹理和颜色模式）。

- QEEPS 基于 OIM（Xiao et al., CVPR 2017）构建，通过三个查询引导模块扩展：QSSE-Net（全局通道重加权）、QRPN（查询引导区域提案）、QSimNet（查询引导相似度学习）。在 CUHK-SYSU 和 PRW 数据集上均大幅超越此前最优方法。

## Query-guided Person Search

### QSSE-Net

- Query-guided Siamese Squeeze-and-Excitation Network。将 SE-Net 扩展到孪生结构，同时处理查询和画廊图像。

- Squeeze：对查询和画廊的 $C$ 个通道分别做全局平均池化，得到 $z_q, z_g \in \mathbb{R}^C$；Excitation：拼接 $[z_q, z_g] \in \mathbb{R}^{2C}$，经两个全连接层（瓶颈结构，降维比 $r=16$），输出通道权重 $s = \sigma(W_2 \delta(W_1[z_q, z_g]))$，其中 $W_1 \in \mathbb{R}^{2C/r \times 2C}$，$W_2 \in \mathbb{R}^{C \times 2C/r}$。

- 输出：$\tilde{X}_Q = X_Q + s \odot U_Q$，$\tilde{X}_G = X_G + s \odot U_G$（通道逐元素相乘重加权残差输出）。

- 作用：同时建模网络内通道依赖与跨网络（查询-画廊）通道相似性。处理整图，属全局上下文（例如图像偏暗时形状通道比颜色通道更有判别力）。

### QRPN

- Query-guided Region Proposal Network。用裁剪的查询特征重加权画廊图像的 BaseNet 特征响应。

- 首次将 SE 思想应用于查询裁剪区域的池化特征图，激励应用于画廊图像特征而非查询自身特征，强调画廊中与查询局部模式匹配的通道。与标准 RPN 并行互补：QRPN 产生查询相似度分数的提案，RPN 产生标准 objectness 分数；最佳做法是对每个 anchor 简单相加两者分数再做 NMS。

- 属局部（person crop 级别），可定位查询行人特有的局部模式。

### QSimNet

- Query-guided Similarity Subnetwork。基线 OIM 使用余弦相似度比较查询与画廊的 re-id 特征；QSimNet 使其端到端可学习。

- 结构：re-id 特征的 L2 距离（逐元素相减并平方）→ Batch Normalization → 全连接层（256×2）→ Softmax。推理时使用 QSimNet 输出分数做最终匹配的 NMS。

- 属局部，可针对每个查询定制相似度度量（平衡颜色、形状等属性）。

### 联合优化

- 总损失函数：

$L = \lambda_1 L_{cls} + \lambda_2 L_{reg} + \lambda_3 L_{rpn_o} + \lambda_4 L_{rpn_r} + \lambda_5 L_{oim} + \lambda_6 L_{qrpn} + \lambda_7 L_{sim}$

所有权重 $\lambda_{1-7}$ 均设为 1。

- $L_{qrpn}$ 为交叉熵损失：与查询人重叠的 anchor 为正样本；刻意不从画廊中其他行人采负样本（避免与并行 RPN 目标冲突）。

- $L_{sim}$ 为二元交叉熵损失：最大化查询裁剪与画廊中对应行人提案的相似度。

- 正负样本比例：画廊图每图至多含一个查询 ID，正样本稀少，故通过 jittering 数据增强、anchor 正样本 IoU 阈值放宽至 0.6、mini-batch 从 256 减至 128。

## Experiments

### 数据集与评估

- **CUHK-SYSU**：18,184 张图像，8,432 个 ID，96,143 个行人框。训练 11,206 图 / 5,532 ID；测试 2,900 查询 / 6,978 画廊图。画廊规模 50 和 100。
- **PRW**：11,816 张图像，43,110 个框，932 个 ID。每 ID 平均 36.8 个框（CUHK-SYSU 仅 2.8），更具挑战性。训练 5,134 图 / 482 ID；测试 2,057 查询 / 6,112 画廊图。
- 评估指标：mAP 和 CMC top-1。

### 与 Baseline 对比

| 数据集 | 方法 | mAP (%) | top-1 (%) |
|--------|------|---------|-----------|
| CUHK-SYSU (gallery=100) | Mask-G | 83.0 | 83.7 |
| | **QEEPS** | **88.9** | **89.1** |
| PRW | Mask-G | 32.6 | 72.1 |
| | **QEEPS** | **37.1** | **76.7** |
| PRW-mini | Mask-G | 33.1 | 70.0 |
| | **QEEPS** | **39.1** | **80.0** |

- QEEPS 在 CUHK-SYSU 上超越 Mask-G 达 5.9pp mAP 和 5.4pp top-1；在 PRW 上超越 4.5pp mAP 和 4.6pp top-1。

### Ablation Study

- 各组件贡献（CUHK-SYSU, gallery=100）：OIM 基线 → +QSSE → +QRPN → +QSimNet 逐步提升，完整模型达到最优。
- QSSE-Net 提供全局上下文；QRPN 提供查询相关的局部提案；QSimNet 学习查询定制的相似度度量。

### 实现细节

- SGD + momentum，训练 2 epochs，基础学习率 0.001，第一个 epoch 后降为 1/10。
- anchor scales $\{2, 4, 8, 16, 32\}$，aspect ratios $\{1, 2, 3\}$；输入图像短边缩至 600 像素，查询图填充/裁剪至与画廊图同尺寸。
- CUHK-SYSU 用全部查询-画廊对训练，PRW 每查询仅用 3 张画廊图；训练时对查询和画廊图都做翻转增强。
- 推理速度：Nvidia P6000 上 300ms。

## Conclusion

- QEEPS 是首个查询引导的端到端行人搜索网络，通过 QSSE-Net、QRPN、QSimNet 三个模块将查询信息引入检测和重识别的每个阶段。

- 在 CUHK-SYSU 和 PRW 上均大幅超越此前最优方法，证明了查询引导策略的有效性。

- 局限性：查询依赖的处理方式使得推理需要对每个 [query-gallery] 对联合处理，计算复杂度为 $O(MN)$（M 查询 × N 画廊图），在 PRW 等大数据集上评估开销大。为此论文提出了 PRW-mini 子集来缓解这一问题。
