---
slug: joint-detection-and-identification-feature-learning-for
title: 《Joint Detection and Identification Feature Learning for Person Search》论文笔记
tags:
  - Re-ID
  - Person Search
  - CVPR
categories: 论文笔记
kind: paper
abstract: 【CVPR2017】 Tong Xiao Shuang Li Bochao Wang Liang Lin Xiaogang Wang
date: 2020-08-09 14:28:52
---
## Introduction

- 现有的行人重识别研究都是基于裁剪好的行人照片来进行，而实际应用中，摄像机获取的都是全景图像，如果直接使用这样的图像去做重识别，效果会比裁剪过的输入差得多。在行人重识别中面临的光照、遮挡、背景干扰等问题也会得到放大。如果要缩小现有研究与应用之间的差距，就需要将行人检测和行人重识别结合起来，而不是作为两个单独的问题。
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200809163347.png)

## Method

- 论文提出了一种使用一个卷积神经网络联合处理行人检测和行人重识别两个子任务的深度学习框架。网络接受完整的原始图像作为输入，通过骨干网络（stem CNN）获取特征图，在特征图上使用行人提案网络（pedestrian proposal net）预测候选区域，通过RoI-Polling提取每一个区域的特征交由判别网络（identification net）判别身份。

- 在训练阶段，根据特征向量，使用OIM损失等一系列损失来监督判别网络的学习；在推断阶段，使用Gallery与目标行人之间的距离排序确定身份。

- 该框架的示意图如下：
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200809145110.png)

### Model Structure

- 论文采用ResNet50作为CNN的基本架构，使用conv1至conv4_3部分作为stem CNN，经过stem CNN，会生成一张大小为原图$$\frac{1}{16}$$、维度为1024的特征图。

- 类似Faster R-CNN，stem CNN之后是一个$$512\times 3\times 3$$的卷积层进行一次特征的转换，随后在特征图上的每个位置通过9个anchors和1个Softmax分类器来预测行人，通过一个线性回归器进行BB回归，最后采用NMS保留128个候选框作为最终的proposals。

- 对于每个proposal，使用RoI Pooling从特征图里获取一个$$1024\times 14\times 14$$的特征图，将其送入ResNet后续的conv4_4至conv5_3层，通过Global Average Pooling获取2048维的特征向量。

- 此后，网络分成两个任务分支，其中一个分支，将特征向量投影到经过L2正则化的256维空间，计算与目标行人的余弦相似度；另一个分支考虑到pedestrian proposal net中生成的提案存在误分类或不对齐的可能性，使用Softmax分类器和线性回归器来拒绝非行人提案并修正边框。

### Online Instance Matching Loss

- 假定训练集中存在$$L$$个不同身份的行人，若某一proposal匹配到某一目标行人，称该proposal为labeled identity，并为其确定对应的身份；若proposal确为行人，但不是目标行人，称为unlabeled identity；对于其他的非行人proposal，称为background clutter。
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200809152805.png)

- 类似三元损失，OIM也希望缩小相同身份的人之间的距离，增大不同身份的人之间的距离。OIM使用记忆体去存储所有任务的特征，通过在线逼近（online approximation）进行优化。具体的操作如下：

    - 对于labeled identity，其特征被记作$$x\in \mathbb{R}^D$$，维护一个查找表$$V\in \mathbb{R}^{D\times L}$$用于记录所有身份的特征信息，在前向传播中，通过计算$$V^\top x$$来计算样本和所有身份之间的余弦相似度；在反向传播过程中更新对应身份$$t$$对应的行$$v_t\leftarrow \gamma v_t+(1-\gamma)x$$。
    
    - 对于unlabeled identity，可以视为负样本，其特征被记作$$x\in \mathbb{R}^D$$，使用一个循环队列$$U\in \mathbb{R}^{D\times Q}$$保存其特征，其中$$Q$$为队列长度。每一轮迭代过后，将新的特征向量压入队列，并剔除过期的向量。
    
- 基于查找表和循环队列这两个记忆体，可以通过Softmax函数定义某个labeled identity的特征$$x$$属于第$$i$$个身份的概率$$p_i$$或某个unlabeled identity的特征$$x$$属于第$$i$$类unlabelled identity的概率$$q_i$$如下
$$$
p_i=\frac{\exp(v_i^\top x / \tau)}{\sum_{j=1}^L \exp(v_j^\top x / \tau)+\sum_{k=1}^{Q}\exp(u_k^\top x / \tau)} \\
q_i=\frac{\exp(u_i^\top x / \tau)}{\sum_{j=1}^L \exp(v_j^\top x / \tau)+\sum_{k=1}^{Q}\exp(u_k^\top x / \tau)}
$$$

- OIM损失函数的优化目标是使得对数似然函数的期望最大化，即
$$$
\mathcal{L}=E_x[\log p_t]\\
\frac{\partial \mathcal{L}}{\partial x}=\frac{1}{\tau}[(1-p_t)v_t-\sum_{j=1,j\neq t}^Lp_jv_j-\sum_{k=1}^Qq_ku_k]
$$$

## Experiments

### 数据集

- 论文构建了一个大规模的行人搜索基准数据集 **CUHK-SYSU**：共 18,184 张图像，96,143 个行人边界框，8,432 个标注身份。数据来源包括手持相机街景（StreetSnap，12,490 图 / 6,057 ID）和影视剧快照（Movie&TV，5,694 图 / 2,375 ID）。训练集 11,206 图 / 5,532 ID，测试集 6,978 图 / 2,900 ID。
- 评估协议：对 2,900 个测试身份随机选取一个实例作为查询，画廊包含该人的其他实例及随机抽样的干扰图像。默认报告 gallery size = 100 的结果。
- 评估指标：CMC top-K（IoU ≥ 0.5 计为匹配）和 mAP（遵循 ILSVRC 目标检测标准）。

### 实验设置

- 基于 Caffe + py-faster-rcnn 实现，ResNet-50 ImageNet 预训练初始化。
- 温度系数 $\tau = 0.1$，循环队列大小 $Q = 5,000$，所有损失权重相同。
- 每个 mini-batch 含 2 张场景图，学习率初始 0.001，40K 次迭代后降为 0.0001，50K 次迭代收敛。

### 与 Baseline 对比

- 论文构建了 3 种行人检测器（CCF: 59.9% AP, ACF: 62.9%, CNN: 78.0%）× 5 种 re-id 方法 = 15 种基线组合，另有 GT（完美检测器）作为上限。

- **完整方法（CNN 检测器）**：mAP 75.5%，top-1 78.7%，大幅超越所有分离式基线（最佳基线 CNN+IDNet: mAP 68.6%, top-1 74.8%）。
- **GT 检测器上限**：mAP 77.9%，top-1 80.5%。
- 关键发现：检测器可能成为瓶颈——使用现成检测器（CCF）时效果差，削弱了更好 re-id 方法的收益；不同 re-id 方法的相对性能在各检测器下一致，说明现有 re-id 数据集仍能指导特征设计。

### Ablation Study

**OIM vs Softmax 损失**：

| 损失函数 | 训练 ID 准确率 | 测试 mAP |
|----------|---------------|----------|
| Softmax | 11.1% | 8.7% |
| Softmax+Pretrain | 85.2% | 58.8% |
| **OIM** | **81.4%** | **75.5%** |

- 无预训练的 Softmax 因分类器矩阵大、梯度方差大而学习困难；有预训练收敛仍慢且测试 mAP 停在约 60%。OIM 起步训练准确率低但收敛快得多，且训练与测试准则一致（均为 L2 归一化特征的余弦相似度）。

**在标准行人 re-id 任务上验证 OIM**（表3，CMC top-1 %）：

| 网络 | 损失 | CUHK03 | Market1501 | Duke |
|------|------|--------|------------|------|
| Inception | Softmax | 73.2 | 75.8 | 54.4 |
| Inception | OIM | 77.7 | 77.9 | 61.7 |
| ResNet-50 | Softmax | 70.8 | 81.4 | 62.5 |
| ResNet-50 | **OIM** | **77.5** | **82.1** | **68.1** |

- 无论使用何种基础 CNN，OIM 均一致优于 Softmax。

**身份子采样**（分母中标注/未标注身份的子采样规模）：

| 子采样规模 | mAP |
|-----------|-----|
| 10 | 72.2% |
| 100 | 73.0% |
| 1000 | 73.7% |

- 小子采样数放松了训练目标，性能略降但收敛更快，框架可通过适当子采样率扩展到更大规模数据集。

## Conclusion

- 论文提出了首个联合行人检测与重识别的端到深度学习框架，通过 OIM 损失有效利用了标注身份和未标注身份的信息，在两个任务上同时取得提升。

- OIM 损失避免了大规模 Softmax 分类器的训练困难，通过查找表和循环队列维护记忆体，使训练目标与测试准则一致。

- 论文构建的 CUHK-SYSU 大规模行人搜索基准成为后续研究的标准评测数据集。局限性在于框架仍依赖两阶段设计（proposal 生成 + 识别），未实现完全端到端的检测-识别联合优化。

## Paper Information

- Xiao T, Li S, Wang B, et al. Joint detection and identification feature learning for person search[C]//Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition. 2017: 3415-3424.

- Paper：[https://arxiv.org/abs/1604.01850v3](https://arxiv.org/abs/1604.01850v3)

- Code：[https://github.com/ShuangLI59/person_search](https://github.com/ShuangLI59/person_search)