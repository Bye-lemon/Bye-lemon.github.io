---
slug: xing-ren-zhong-shi-bie-person-re-identification-yan-jiu-gai
title: 行人重识别（Person Re-identification）研究概述
tags:
  - Re-ID
categories: 论文笔记
kind: survey
abstract: '【arXiv 2020 / TPAMI 2022】Ye et al.'
date: 2020-07-11 18:38:06
---
## 行人重识别任务
---
- **行人重识别（Person Re-identification，Re-ID）**是一种在由**多个互不重叠的摄像头**组成的监控系统中**判别特定行人身份**的计算机视觉任务。给定一张查询图像，行人重识别系统需要在其余由多摄像机系统采集的的图像或视频序列中找出同样身份的图像。
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200712093708.png)

- 行人重识别是一个以人为研究主体的视觉任务，类似的，以人为研究主体的视觉任务还有很多，比如**检测Detection**、**属性Attributes**、**跟踪Tracking**、**行为识别Action Recognition**、**语义分割Semantic Segmentation**和**人脸识别Face Recognition**等等。行人重识别与这些相关工作的联系紧密。

    - 行人检测判断图像中是否存在人物，标记出人物在图像中的位置，行人重识别的发展就是建立在行人检测之上的，如果检测给出的边界框不精准，重识别的精度也会受到很大的影响。
    
    - 行人属性的信息也常常用在行人重识别的任务中，用于进行语义级查询或者单纯用于提升表征能力。
    
    - 将行人重识别的结果和相机的空间位置和区域分布等信息结合起来，就能获知行人的运动轨迹，这就是**多目标多机跟踪（Multi-target Multi-camera Tracking，MTMC）**，事实上，Re-ID最早也是从MTMC问题中被提出来的。
    
    - 类似地，人脸识别同样是判别人物身份的技术，然而由于室外监控场景常常无法获得高质量的、高分辨率的人脸图像，所以重识别在这样的场景下有着更重要的意义。
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200712095906.png)

- 通常，构建一个特定场景下的Re-ID系统需要经过以下五个步骤：

    1. **原始数据采集Raw Data Collection**
    
    2. **生成人物边界Bounding Box Generation**
    
    3. **训练数据标注Training Data Annotation**
    
    4. **模型训练Model Training**
    
    5. **行人检索Pedestrians Retrieval**
    
- 根据上述五个步骤中的区别，Re-ID人物可以被划分为两个大类：**封闭世界中的Re-ID（Closed-world）**和**开放世界中的Re-ID（Open-world）**，两者的区别如下表所示：

|Step|Closed-World|Open-world|
|:-:|:-:|:-:|
|原始数据采集|单模态数据|异构数据|
|生成人物边界|已完成人物的裁剪|原始图像或视频|
|训练数据标注|充分的标注数据|没有标注或难以获得标注|
|模型训练|能够根据正确标注顺利训练|标注有噪音干扰|
|行人检索|查询人物一定存在于图库中|开放世界|

## 数据集和评估标准
---
### 常见数据集

| 数据集 | 提出 | 规模 | 相机 | 划分与说明 |
|--------|------|------|------|------------|
| Market-1501（Zheng et al. ICCV 2015） | 2015 | 32,668 图 / 1,501 ID | 6 | 训练 12,936 / 751 ID；Query 3,368；Gallery 19,732 / 750 ID。检测框由 DPM 检测器生成，最常用基准 |
| CUHK03（Li et al. CVPR 2014） | 2014 | 约 14,096 图 / 1,467 ID | 2 | 分 Labeled（人工标注）与 Detected（检测器标注）两版；现通用 CUHK03-NP 新划分：训练 7,365 / 767 ID，测试 700 ID（Query 1,400 / Gallery 5,332） |
| DukeMTMC-reID（Zheng et al. 2017，源自 DukeMTMC） | 2017 | 36,411 图 / 1,812 ID | 8 | 训练 16,522 / 702 ID；Query 2,228；Gallery 17,661。已因隐私原因下架，仅作历史对比 |
| MSMT17（Wei et al. CVPR 2018） | 2018 | 126,441 图 / 4,101 ID | 15 | 训练 32,621 / 1,041 ID；Query 11,659；Gallery 82,161 / 3,060 ID。目前最大规模、最困难的常用基准 |

早期小规模数据集还有 VIPeR、GRID、iLIDS（数百至千余张图），如今主要作为跨库（cross-dataset）实验的目标域。

### 常用评估标准

- Re-ID任务可以看作一个检索（retrieval）任务，其返回一组带有排名的图像。因此，Re-ID任务常用的评价标准有：**Rank-N**、**CMC**、**mAP**等，此外也有部分使用**AUC**和**ROC**作为评估标准。

#### Top-K、CMC、Rank-N

- **Top-K**是指检索结果中置信度最高的K张图像中有正确结果的概率，即如果前K个结果中有正确的图像，Top-K就是1，否则就是0。Top-K的图像是一个单位阶跃函数，在首次出现的排名F处开始从0变成1。

- **CMC（Cumulative Matching Characteristics，累计匹配特性）**是Top-K的平均，$\text{CMC}(N)=\frac{1}{N}\sum_{n=1}^N\text{Top-K}(n)$，CMC曲线上的某一点代表了检索结果前几位中包含正确结果的概率。

- **Rank-N**指CMC曲线上横轴取值为N一点处的CMC值，其意义如上所述。

#### Precision、Recall、AP、mAP

- 在Re-ID任务中，对于一张待查询图像$I$，在图库中其同ID图像的集合为$\mathcal{I}$，Re-ID系统返回的查询结果的前k个的集合为$\mathcal{R}_k$，那么，前k位的**查准率Precision@k**和**查全率Recall@k**被定义为
$$
\text{precision@k}=\frac{|\mathcal{I}\cap \mathcal{R}_k|}{|\mathcal{R}_k|}\\
\text{recall@k}=\frac{|\mathcal{I}\cap \mathcal{R}_k|}{|\mathcal{I}|}
$$

- 为了更好的描述排名情况，引入了**平均精度（Average Precision，AP）**来评估查询结果，它是PR曲线下的面积，可以被使用以下公式计算
$$
\text{AP}=\frac{1}{2}\sum_{i=2}^{R}[(\text{recall@i}-\text{recall@i-1})(\text{precision@i}+\text{precision@i-1})]
$$

- Re-ID的mAP即是每一个Query的AP的均值。
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200712112318.png)

## 封闭世界的Re-ID研究
---

- 封闭世界内的Re-ID研究大致可以分为三个方向：**基于表征学习的Re-ID**、**基于度量学习的Re-ID**和**排名优化**。

### 基于表征学习的Re-ID
#### 基于全局特征的Re-ID

- PersonNet: Person Re-identification with Deep Convolutional Neural Networks
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200712115208.png)

- 注意力

#### 基于局部特征的Re-ID

全局特征把行人压成一个向量，容易受遮挡、姿态变化与检测框错位影响。局部特征方法用人体结构先验把图像切块、分区域提取并聚合：

- **Spindle Net**（Zhao et al. CVPR 2017）：以人体区域引导特征分解与融合，分区域提特征后逐区域比对。
- **Part-Aligned Representations**（Zhao et al. ICCV 2017）：为各局部学习动态对齐，缓解检测框错位。
- **PCB**（Sun et al. ECCV 2018）：把 backbone 的 feature map 水平切 6 条、各接分类器，再叠 RPP（Refined Part Pooling）以注意力把像素软分配到条带。局部范式的强基线。
- **MGN**（Wang et al. ACM MM 2018）：多粒度切分（整图 / 2 块 / 3 块三分支），全局与局部联合监督。
- **Pyramidal**（Zheng et al. CVPR 2019）：不同 ID 的分割尺度对齐到同一水平条带划分，配合多损失训练。

与姿态引导方法（显式利用 14 个关键点，如 FD-GAN）的区别：局部切分不显式依赖姿态估计，错位靠结构先验或软对齐消化。

#### 基于辅助特征的Re-ID
##### 基于语义属性的Re-ID

- Improving person re-identification by attribute and identity learning
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200712121518.png)

##### 基于相机视角的Re-ID

- [ICCV2019] View Confusion Feature Learning for Person Re-identification
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200712122135.png)

##### 基于域信息的Re-ID

- [CVPR2016] Learning Deep Feature Representations with Domain Guided Dropout for Person Re-identification
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200712122606.png)

##### 基于GAN的Re-ID

- [CVPR2018] Camera Style Adaptation for Person Re-identification
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200712123323.png)

#### 基于视频特征的Re-ID

- [TCSVT] Video-based Person Re-identification with Accumulative Motion Context
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200712123753.png)

### 基于度量学习的Re-ID

#### 常见距离度量方式

- **欧氏距离（L2）**：默认度量，配合 BN 归一化后效果稳定。
- **余弦距离**：只比方向不比模长，常见于归一化强基线。
- **马氏距离**：度量学习学一个线性变换（XQDA、KISSME），是手工特征时代（LOMO 等）的标准做法；深度特征时代多被归一化欧氏/余弦取代。
- **学习距离度量**：不预设距离形式，用损失直接塑形特征空间——对比、三元组、四元组、Center Loss、难样本采样，本质上都在优化距离的间隔。
- 度量空间定型后，可叠加**重排序（Re-ranking）**：利用近邻间的 Jaccard 距离修正原始排序（k-reciprocal）。

#### 常见损失函数

- 判别损失

- 验证损失

- 对比损失

- 三元损失

- 四元损失

- Triple Hard

- 边界挖掘损失

- OIM损失

- Circle Loss


### 排名优化

#### 重排名Re-ranking
##### 自适应重排名

- [CVPR2017] Re-ranking Person Re-identification with k-reciprocal Encoding
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200712125359.png)

##### 基于人机交互的重排名

- [ECCV2016] Human-In-The-Loop Person Re-Identification
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200712130017.png)

## 开放世界的Re-ID研究
---

Ye et al. 把开放世界 Re-ID 归纳为五类问题：

1. **异构数据（Heterogeneous Data）**：跨模态 Re-ID，最典型是可见光-红外（RGB-IR）跨模态检索；另有文本-图像检索、跨分辨率等。
2. **原始图像/视频中的 Re-ID（Re-ID from Raw Images/Videos）**：不假设有标注包围框与 ID 标签，从无标注数据直接学习——无监督 Re-ID（聚类伪标签、域适应）与半监督 Re-ID。对应工程落地最常见的场景：新摄像头上线没有标注。
3. **标签不可用/受限（Unavailable/Limited Labels）**：标注成本约束下的 one-shot / few-shot 与主动学习设置。
4. **噪声标注（Noisy Annotation）**：训练标签本身有错（检测框错位、ID 标错）时的鲁棒学习。
5. **开放集 Re-ID（Open-Set Re-ID）**：Gallery 中可能根本没有 query 对应的人，要求模型具备「拒绝」能力，对应实际监控中目标未必出现的情形。

## 展望
---

Ye et al. 在综述之外给领域的三份直接贡献：

1. **新评测指标 mINP（mean Inverse Negative Penalty）**：mAP 反映整体精度，但不区分「找齐所有正确匹配有多难」；mINP 惩罚需要扫很深的 Gallery 才能找全正确匹配的模型，让最难那个正确匹配的位置进入指标视野。
2. **强基线 AGW**：注意力引导的通用基线，在图像/视频、可见光/红外四个 Re-ID 任务上统一给出有竞争力的结果，供后续方法公平比较。
3. **开放问题**：三大主流库上 Rank-1 已超 90%，投入趋近饱和；真正欠研究的是开放世界五类问题，以及推理效率与可解释性。

## Survey Information
---

> Ye M, Shen J, Lin G, Xiang T, Shao L, Hoi S C H. Deep Learning for Person Re-identification: A Survey and Outlook[J]. IEEE Transactions on Pattern Analysis and Machine Intelligence (TPAMI), 2022.（arXiv 首发 2020，arXiv:2001.04193）

- Paper: https://arxiv.org/abs/2001.04193
- 说明：原笔记称「两篇 2020 年发表的 Survey」，其中 closed-world / open-world 框架出自本文。另一篇未在原文注明出处；常见的对读文献是 Zheng et al.《Person Re-identification: Past, Present and Future》（arXiv:1610.02984, 2016），年份不符，是否即原笔记所指待确认。
