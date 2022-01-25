---
title: 行人重识别（Person Re-identification）研究概述
tags:
  - Re-ID
categories: 论文笔记
abstract: 本文是笔者近期对两篇2020年发表的Re-ID领域的Survey的阅读笔记，以及对Re-ID领域的一些内容的简要总结。
mathjax: true
abbrlink: cde6
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

- PASS

### 常用评估标准

- Re-ID任务可以看作一个检索（retrieval）任务，其返回一组带有排名的图像。因此，Re-ID任务常用的评价标准有：**Rank-N**、**CMC**、**mAP**等，此外也有部分使用**AUC**和**ROC**作为评估标准。

#### Top-K、CMC、Rank-N

- **Top-K**是指检索结果中置信度最高的K张图像中有正确结果的概率，即如果前K个结果中有正确的图像，Top-K就是1，否则就是0。Top-K的图像是一个单位阶跃函数，在首次出现的排名F处开始从0变成1。

- **CMC（Cumulative Matching Characteristics，累计匹配特性）**是Top-K的平均，$$\text{CMC}(N)=\frac{1}{N}\sum_{n=1}^N\text{Top-K}(n)$$，CMC曲线上的某一点代表了检索结果前几位中包含正确结果的概率。

- **Rank-N**指CMC曲线上横轴取值为N一点处的CMC值，其意义如上所述。

#### Precision、Recall、AP、mAP

- 在Re-ID任务中，对于一张待查询图像$$I$$，在图库中其同ID图像的集合为$$\mathcal{I}$$，Re-ID系统返回的查询结果的前k个的集合为$$\mathcal{R}_k$$，那么，前k位的**查准率Precision@k**和**查全率Recall@k**被定义为
$$$
\text{precision@k}=\frac{|\mathcal{I}\cap \mathcal{R}_k|}{|\mathcal{R}_k|}\\
\text{recall@k}=\frac{|\mathcal{I}\cap \mathcal{R}_k|}{|\mathcal{I}|}
$$$

- 为了更好的描述排名情况，引入了**平均精度（Average Precision，AP）**来评估查询结果，它是PR曲线下的面积，可以被使用以下公式计算
$$$
\text{AP}=\frac{1}{2}\sum_{i=2}^{R}[(\text{recall@i}-\text{recall@i-1})(\text{precision@i}+\text{precision@i-1})]
$$$

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

- PASS

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

- PASS

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
