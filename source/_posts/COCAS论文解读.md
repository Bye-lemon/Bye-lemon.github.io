---
title: >-
  《COCAS: A Large-Scale Clothes Changing Person Dataset for
  Re-identification》论文笔记
tags:
  - Re-ID
  - CVPR
categories: 论文笔记
abstract: >-
  【CVPR2020】 Shijie Yu, Shihua Li, Dapeng Chen, Rui Zhao, Junjie Yan, and Yu
  Qiao†
mathjax: true
abbrlink: aa5f
date: 2020-06-26 16:47:23
---
## Introduction

- 现有的Re-ID方法普遍假定同一个人穿着的都是同样的衣服，但如果所穿着的衣服发生改变，传统的Re-ID方法可能将不那么有效，原因主要有二：
  
  1. 在传统Re-ID方法的训练过程中，衣服被作为一种具有判别性的特征对待；
  
  2. 人脸和体型这样的生物特征通常只占据图像主体的一小部分，这样的特征不易学习。

- 衣服无关的Re-ID方法也是被需要的，在失踪儿童寻找、嫌疑人追捕这样的社会问题中，一种不依赖衣服的Re-ID方法是非常重要的。

- 为解决这一问题，论文作者构建了一个大规模基准数据集**C**l**O**thes **C**h**A**nging Person **S**et(**COCAS**)，该数据集包含了5266个人物的62832张图像，每个人物采集了5~25张图像，包含2~3种衣服。对于每一个人物，将一种衣服的图像收入Gallery Set作为目标图像，其余的图像归入Query Set。

- 进一步的，在此数据集的基础上，作者定义了**衣服改变的Re-ID问题（Clothes Changing Re-ID）**,这类问题是通过一张目标图像和一个衣服模板来寻找特定人物的Re-ID问题。

- 对应的，论文作者提出了一个适用于解决此类问题的神经网络**BC-Net(Biometric-Clothes Network)**，该网络有两条分支，一条分支用于提取人脸、体型这样的生物特征，另一条分支用于提取衣服特征。

## Related Work

- **Re-ID数据集方面**：最早的Re-ID数据集以**VIPeR**为代表，这类数据集规模太小，不足以支撑数据驱动的深度学习，于是诞生了**CUHK03**、**Market1501**和**DukeMTMC**这样的大规模数据集，近年来在这些数据集上的研究逐渐饱和，又出现了以**Airport**为代表的更大规模的Re-ID数据集。

- **Re-ID方法方面**：早期的Re-ID工作主要聚焦于特征提取和度量学习，最近的一些方法则多从CNN架构性能的提升中获益。Re-ID问题可以被简单地视每个人是一个特定类别来计算判别损失，在深度度量学习中Re-ID问题被使用一个带有对比损失的孪生网络来训练，也有一些方法通过三元组上的三元损失来进行。论文提出的BC-Net与这些方法不尽相同，通过两个分支提取生物特征和衣服特征，由判别损失和三元损失共同监督训练。

- **Re-ID问题中的衣服改变**：衣服改变是Re-ID中不可避免的一个问题，但受限于没有大规模数据集，这一问题现有的研究较少。目前，仅有一些Xue等人在PIPA数据集上的研究。此外，在GAN的研究上，有一些以Jetchev和Zhang为代表的学者进行了衣服迁移的研究。

## The COCAS Benchmark

- COCAS是一个同一个人物由不同的衣服的大规模行人重识别基准。包含了5266个人物，平均每个人物有12张图像，这些图像被采集于30个相机视角下，拥有多样的场景分布和不同的光照条件和遮挡现象。其中，训练集包括2800个人物的图像，测试集包括2466个人物的图像。COCAS与其他典型公开数据集的对比如下图所示
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200626180651.png)

- COCAS数据集的数据采集是在一个贸易商场进行的，在征得志愿者的同意之后，分别在4天采集了室内外30个相机下的图像，因此，图像具有明显的多样性。

- 所采集的图像中人物的关联通过以下四个步骤进行：

    1. **人物聚类Person Clustering**：通过Re-ID特征将相似的人物聚类，并手动移除聚类结果中的Outlier图像；
    
    2. **人脸检测Face Detection**：从每一个簇中选取一张锚图，检测该图像中的人脸；
    
    3. **人脸检索Face Retrieval**：使用FaceNet提取人脸特征，通过k近邻算法搜寻每一个锚图下的人脸；
    
    4. **手工标注Manually Annotation**：根据检索结果，手动选择真正匹配的图像。此后在该人物的图像下选取2~3种衣服，每种各5~6张图像构成数据集。
    
- 考虑到隐私保护的需要，论文额外发布了**desensitized COCAS**，该数据集对人脸和背景进行了高斯模糊。具体地，作者使用MTCNN对人脸部位进行检测，使用LIP分离前景和背景，对于脸部和背景部分，进行高斯模糊。

- 由于实际采集到的人脸不一定总是清晰的，环境信息也不应该作为判别条件，**desensitized COCAS**上虽然不会有较高的performance，但也是有价值的。

## Methodology

- BC-Net是一个两分支的网络，其中一个分支是**生物特征分支Biometric Feature(BF) Branch**，使用人物图像作为输入，通过一个**Mask模块**来提取衣服无关信息；另一个分支是**衣服特征分支Clothes Feature(CF) Branch**，使用衣服模板和检测到的衣服区块一起作为输入，提取衣服特征；最后将两组特征进行融合作为人物的特征表达。

### Network Structure

- BC-Net的网络结构图如下图所示

  ![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200626155824.PNG)

#### BF Branch

- BF分支将一组用户输入$$I^p$$通过ResNet50骨干网络产生一组特征图$$A^p\in \mathbb{R}^{H\times W\times D}$$，为了提取到与衣服无关的特征，在骨干网络之后，BF分支引入了一个Mask模块，通过特征图预测出一组掩码$$M^p\in \mathbb{R}^{H\times W\times 1}$$。BF分支最终的输出特征$$f^B\in \mathbb{R}^D$$，$$f^B$$中的每一个元素$$f_k^B$$是第$$k$$张特征图$$A_k^p$$与掩码矩阵$$M^p$$的哈达马积的全局平均池化，即
$$$f_k^B=\frac{1}{H\times W}\sum_{i=1}^{H}\sum_{j=1}^{W}[A_k^p\circ M^p]_{i,j}$$$

#### CF Branch

- CF分支通过一个Faster R-CNN检测器预测目标图像中衣服的位置，将检测结果resize到和衣服模板相同的尺寸作为输入$$I^c$$，通过骨干网络ResNet50提取特征$$A^c$$，经过全局平均池化得到CF分支的输出特征$$f^C\in \mathbb{R}^D$$。

#### Fusion

- BF分支输出的特征向量$$f^B$$和CF分支输出的特征向量$$f^C$$进行连接后，通过一个线性变换得到最终的人物表征$$f$$，即$$f=\mathbf{W}[(f^B)^\top,(f^C)^\top]^\top+\mathbf{b}$$。

### Loss Function

- BC-Net的损失函数包含一个交叉熵判别损失和一个基于欧氏距离的三元损失可以表示为
$$$
\mathcal{L}^f=\mathcal{L}_{id}^f+\alpha\mathcal{L}_{triplet}^{f} \\
\mathcal{L}_{triplet}^f=\frac{1}{N_{triplet}}\sum_{i=1}^{N_{triplet}}[d(\mathcal{I}_i^a,\mathcal{I}_i^b)+\eta-d(\mathcal{I}_i^a,\mathcal{I}_i^c)]\\
\mathcal{L}_{id}^f=-\frac{1}{N}\sum_{n=1}^{N}\sum_{l=1}^{L} y_{n,l}\log(\frac{e^{\mathbf{w}_l^\top f_n}}{\sum_{m=1}^L e^{\mathbf{w}_m^\top f_n}})$$$

## Experiments

- 论文设计了以下几组实验：

    - 在只使用ID信息的条件下，BC-Net与目前的SOTA方法在COCAS上的对比试验
    
    - 只使用ID信息和引入衣服模板信息，BC-Net的效果对比实验
    
    - BF分支、CF分支、Mask模块、损失函数、Faster R-CNN检测器、高斯模糊等设计的消融实验
    
- BC-Net与SOTA方法的对比结果如下图所示
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200626174212.png)

- 引入衣服模板进行训练，BC-Net的效果如下图所示
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200626174300.png)

- 消融实验的结果如下图所示
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200626174337.png)

- 查询结果的可视化展示如下图所示
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200626174513.png)

## Conclusion

- 论文提出了一种考虑到衣服改变的新Re-ID问题的基准数据集COCAS，并提出了一种能够分别提取生物特征和衣服特征的网络BC-Net，该网络相比于传统方法，更好的解决了衣服改变的Re-ID问题，在追踪嫌疑人、寻找遗失儿童等实际问题上有一定的现实意义。

## Paper Information

- Yu S, Li S, Chen D, et al. COCAS: A Large-Scale Clothes Changing Person Dataset for Re-identification[C]//Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition. 2020: 3400-3409.

- Link: [https://arxiv.org/abs/2005.07862](https://arxiv.org/abs/2005.07862)
