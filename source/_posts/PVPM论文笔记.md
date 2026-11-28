---
slug: pose-guided-visible-part-matching-for-occluded-person-reid
title: 《Pose-guided Visible Part Matching for Occluded Person ReID》论文笔记
tags:
  - Re-ID
  - CVPR
categories: 论文笔记
kind: paper
abstract: '【CVPR2020】 Shang Gao, Jingya Wang, Huchuan Lu, Zimo Liu'
date: 2020-07-02 15:54:46
---
## Introduction

- 许多Re-ID的方法都假设了行人完整的身体都是可见的，然而在真实场景下，这样的假设很难被满足，行人可能会被其他行人、树木、车辆等遮挡。因此，一种能够有效地解决有遮挡情况下的Re-ID问题的方法是被迫切需要的。

- 有遮挡的Re-ID任务主要有以下两个挑战：

    1. 传统的基于全局图像监督的Re-ID方法所提取的特征不仅仅包括行人特征还包括了遮挡物的特征，而遮挡物的颜色形状等特征具有多样性，使得对于目标特征的描述难以具有很高的鲁棒性。
    
    2. 有些时候，被遮挡的部分包含了更多的有判别性的特征而未被遮挡部分在数据集中趋向同质，这会导致错误匹配的问题。
    
- 一种直观的解决思路是检测未被遮挡的部分，使用这一部分去匹配。然而由于标注中没有遮挡部分和未遮挡部分的信息，现有的方法只能借助一些在其他数据源上进行的身体分割、姿态估计等任务来完成。但是这样的方法有着巨大的跨域数据偏差问题，不能保证其他数据源上的模型能够在当前数据集下有良好的效果。

- 这篇论文提出了一种**姿态导向的可见部位匹配（Pose-guided Visible Part Matching，PVPM）网络**，通过自主学习的方式直接对图像的可见性进行打分。PVPM包括两个主要的组件**姿态导向的部件注意力（Pose-guided Part Attention，PGA）**和**姿态导向的可见性预测器（Pose-guided Visibility Predictor，PVP）**。PVP的训练过程受一组伪标注监督，这一伪标注通过使用图匹配方法求解一个特征对应问题得到。最终两张图像的匹配得分通过将各个部件的距离按照其可见性得分加权聚合得到。


## Pose-Guide Visible Part Matching

- PVPM网络的流水线和训练过程如下图所示：
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200702164556.png)

### Part Features with Pose-Guide Attention

- 在有所遮挡的情形下，有判别性的部件会显得尤其重要，为了实现这样的区分，PVPM将身体上各个部件的特征通过一个由姿态导向的注意力加权融合。

- 对于一张给定的图像$$I$$，首先通过一个卷积神经网络提取其外观特征图$$F\in \mathbb{R}^{C\times H\times W}$$，接下来通过姿态估计器、姿态编码器和注意力生成器输出一组姿态注意力。

    - 在姿态估计这一过程，PVPM使用了OpenPose方法，OpenPose输出一组关键点热力图$$K$$和部件亲和力场$$L_p$$；
    
    - 随后，PVPM通过一个姿态编码器将$$P=K\oplus L_p$$作为输入嵌入到高阶姿态特征$$F_{pose}$$中，这一过程可以被描述为$$F_{pose}=PE(P;\theta_e)$$，其中$$\theta_e$$代表编码器的参数；
    
    - 此后，注意力生成器通过一个$$1\times 1$$卷积和紧随其后的Sigmoid函数，生成一组2维堆叠注意力图$$A$$，这一过程可被描述为$$A=PGA(F_{pose};\theta_a)\in \mathcal{R}^{N_p\times H\times W}$$。

- 注意力图$$A$$上的每一个元素$$a_i^{h,w}$$代表着特征图$$F$$上的点$$(h,w)$$属于第$$i$$个部件的度。由于理想情况下各个部件的覆盖区域应该是不重叠且彼此互补的，PVPM通过提取每一个部件特征图上值最大的部分的空间位置，来重新生成了每个部件的注意力图$$\bar{A}$$。即
$$$\bar{A}_i=A_i\circ [\mathop{\arg\max}_{i}  A_i]|_{onehot}^C$$$

- 最后，每一个部件的特征$$f_i$$可以通过对特征图上的各个部件的加权池化来获得
$$$
f_i=\frac{1}{\|\bar{A}_i\|}\sum_{h=1}^{H}\sum_{w=1}^{W}\bar{a}_i^{h,w}\circ F^{h,w}\\
\|\bar{A}_i\|=\sum_{h=1}^{H}\sum_{w=1}^{W}\bar{a}_i^{h,w}
$$$

### Pose-Guide Visibility Prediction

- 在对人体提取了基于部件的特征之后，对于特征间距离的度量自然需要做部件与部件之间的度量，然而并不是所有的部件在两幅图像中都存在，这时就需要一个预测器来预测部件的可见性。

- PVPM通过一个包含了全局平均池化、$$1\times 1$$卷积、批归一化和Sigmoid四层的小型网络来预测各部件的可见性，这一过程可被描述为$$\hat{v}=PVP(F_{pose};\theta_v)\in \mathcal{R}^{N_p}$$。

- 在这样的前提下，若$$d_i$$代表第$$i$$个部件特征间的余弦距离，probe图像和gallery图像之间的距离可以被描述为
$$d=\frac{\sum_{i=1}^{N_p}\hat{v}_i^p\hat{v}_i^qd_i}{\sum_{i=1}^{N_p}\hat{v}_i^p\hat{v}_i^q}$$

### Pseudo-Label Estimation by Graph Matching

- 由于在Ground Truth中各个部件的可见性一般是不能直接得到的，论文作者提出了一种自监督的可见部件检索方法。该方法基于两点前提：

     1. 只有当某一部件同时在$$I^p,I^g$$中均可见时，该部件对的相关性才会变高。
     
     2. 在同一幅图中有边连接的两个部件之间也呈现高度相关性。
     
- 基于上述考虑，PVPM希望通过估计一个描述两个部件的可见性向量的内积矩阵来估计这一相关性。

- 对于给定的正样本对，通过两张图$$\mathcal{G}^p=(\mathcal{V}^p,\mathcal{E}^p)$$和$$\mathcal{G}^g=(\mathcal{V}^g,\mathcal{E}^g)$$来描述，其中的元素$$\mathcal{V}_i$$和$$\mathcal{E}_{i,j}$$分别代表部件节点上的特征$$f_i$$和连接部件的边上的特征$$\{f_i-f_j\}$$。

- 定义二值指示向量$$c\in \{0,1\}^{N_p}$$代表$$\mathcal{G}^p$$和$$\mathcal{G}^g$$之间的匹配度，如果第$$i$$个部件同时在两张图上出现$$v_i$$将被设为1，否则为0。

- 定义亲和力矩阵$$M$$如下，其中$$\hat{M}_{i,j}$$代表$$M_{i,j}$$的滑动平均值：
$$$
M_{i,i}=\langle \mathcal{V}_i^p,\mathcal{V}_i^g \rangle\\
M_{i,j}=\langle \frac{\mathcal{E}_{i,j}^p}{\|\mathcal{E}_{i,j}^p\|_2},\frac{\mathcal{E}_{i,j}^g}{\|\mathcal{E}_{i,j}^g\|_2} \rangle - \hat{M}_{i,j}
$$$

- 此时，图匹配问题可以被视作一个整数二次规划问题和一个正则化项，式中$$\hat{M}_{diag}$$代表矩阵$$M$$的对角线上元素的滑动平均值：
$$$
\mathop{\arg\max}_{v} v^\top Mv-\bar{\lambda}^\top v\ \mathrm{s.t.}\ v\in\{0,1\}^{N_p}\\
\bar{\lambda}=\lambda\hat{M}_{diag}
$$$

- 通过对上述表达式的最优化，可以得到一个向量$$v^*$$，该向量指示着哪些部件在两幅图间是匹配的，这个向量将被用于优化PVP模块。

### Loss Function

- PVPM的损失函数一共分为三个部分，可见性部位的预测损失$$L_v$$，部件匹配的损失$$L_m$$和识别损失$$L_c$$，即$$L=L_m+L_c+L_v$$，其中
$$$
L_v=-\sum_{i=1}^{N_p}v_i^*\log(\hat{v}_i^p\hat{v}_i^g) \\
L_m=-v^{*\top}Mv^*+\lambda^{\prime\top}v^* \\
L_c=\sum_{i=1}^{N_p}\mathrm{cross-entropy}(\hat{y}_i,y_i) \\
\lambda_i^\prime=\frac{\sum_{j=1,j\neq i}^{N_p}S_{ij}^p+S_{ij}^g}{2(N_p-1)}
$$$

## Experiments

### 数据集与设置

- **Occluded-REID**：2,000 张标注图像 / 200 个身份，每人 5 张全身 + 5 张遮挡图像，校园移动摄像头拍摄。
- **Partial-REID**：900 张图像 / 60 个行人，每人 5 张全身 + 5 张遮挡 + 5 张手工裁剪部分图像（本文仅使用全身和遮挡图像评估）。
- **P-DukeMTMC-reID**：基于 DukeMTMC-reID 修改的大规模数据集，训练集 12,927 图（665 ID），查询集 2,163 图（634 ID），gallery 集 9,053 图。
- **Market-1501**：32,668 图 / 1,501 ID，仅用于模型预训练。
- 评估设置：所有遮挡图像作为 probe 集，全身图像作为 gallery 集；Occluded-REID 和 Partial-REID 无规定训练/测试划分，所有图像均用于测试。指标为 CMC 和 mAP，单查询设置。
- 实现细节：训练图像 resize 为 384×128；ResNet-50 骨干（按 PCB 相同设置预训练）；默认部位数 $N_p=6$；OpenPose（COCO 预训练）生成 18 个关键点热力图和 38 个部件亲和场；PVP 和 PGA 学习率 0.002，SGD 优化器；batch size 32，训练 30 epoch，$\lambda=0.9$；NVIDIA 1080Ti + PyTorch。

### Transfer 设置下的性能（表2）

模型在 Market-1501 上训练后直接测试，与整体方法和遮挡方法对比：

| 方法 | Occluded-REID R1/mAP | Partial-REID R1/mAP | P-DukeMTMC-reID R1/mAP |
|------|---------------------|--------------------|----------------------|
| IDE | 52.6 / 46.4 | 51.7 / 52.4 | 36.0 / 19.7 |
| PCB | 59.3 / 53.2 | 66.3 / 63.8 | 43.6 / 24.7 |
| PGFA | 57.1 / 56.2 | 68.0 / 56.2 | 44.2 / 23.1 |
| Teacher-S | 55.0 / 59.8 | 69.2 / 73.1 | 18.8 / 22.4 |
| **PVPM** | **66.8 / 59.5** | **75.3 / 71.4** | **50.1 / 29.4** |
| **PVPM+Aug** | **70.4 / 61.2** | **78.3 / 72.3** | **51.5 / 29.2** |

- PVPM 在所有三个基准上均大幅超越整体方法和遮挡专用方法，rank-1 超越第二优方法约 10%。
- +Aug 表示训练时加入随机遮挡增强以解决遮挡训练集的数据不平衡问题，进一步提升性能。

### 与 Partial ReID 方法对比（表3）

在 Partial-REID 数据集上，PVPM+Aug 达到 78.3% rank-1 / 87.7% rank-3，超越第二优 VPM（67.7% / 81.9%）达 10.6%。且 PVPM 不需要手动裁剪遮挡图像，实用性更强。

### Supervised 设置下的性能（表4）

在 P-DukeMTMC-reID 上使用目标训练集优化后，PVPM 达到 85.1% rank-1 / 69.9% mAP，超越基线 PCB（79.4% / 63.9%）达 5.7%。

### Ablation Study（表5）

| 变体 | Occluded R1 | Partial R1 | P-Duke R1 |
|------|------------|-----------|----------|
| Baseline (PCB) | 59.3 | 66.3 | 43.6 |
| PGA only | 61.1 | 68.7 | 43.9 |
| PVP only | 65.2 | 74.0 | 46.8 |
| PVPM - $L_m$ | 65.5 | 73.0 | 48.1 |
| PVPM-thre | 65.1 | 71.7 | 48.1 |
| **PVPM** | **66.8** | **75.3** | **50.1** |
| **PVPM+Aug** | **70.4** | **78.3** | **51.5** |

- PGA 块有效：姿态引导注意力对遮挡 Re-ID 有贡献。
- PVP 有效：可见性加权的部件距离比基线提升 5.9% / 7.7% / 3.2%。
- 图匹配方法优于阈值方法，验证了考虑部件间相关性的优势。
- 去除 $L_m$ 后 rank-1 下降约 1-2%，验证了其有效性。

### 姿态线索 vs 外观线索（表6）

| 方法 | Occluded R1/mAP | Partial R1/mAP | P-Duke R1/mAP |
|------|----------------|----------------|--------------|
| RPP（外观） | 55.8 / 51.3 | 63.7 / 61.2 | 40.4 / 23.4 |
| R+S（外观+可见性） | 51.8 / 47.3 | 59.7 / 59.0 | 35.6 / 21.1 |
| **PVPM（姿态）** | **66.8 / 59.5** | **75.3 / 72.3** | **50.1 / 29.4** |

- 基于外观的 RPP 在遮挡数据集上无提升；加入外观可见性预测器（VSP）后性能进一步下降。姿态引导的注意力图能更专注于未遮挡区域。

### 参数分析

- **正则化系数 $\lambda$**：从 0.6 到 1 变化，$\lambda=0.9$ 时性能达到峰值。过小的 $\lambda$ 会削弱可见性预测器的判别能力，过大的 $\lambda$ 可能将局部区域误判为不可见。
- **部件数量 $N_p$**：从 2 到 8 变化，$N_p=4$ 时达到峰值。过大的 $N_p$ 使小部件趋于相似，降低判别能力。

## Conclusion

- 论文提出了姿态引导的可见部件匹配（PVPM）方法，通过统一框架联合学习姿态引导注意力和部件可见性，解决了遮挡 Re-ID 的匹配问题。

- 与现有方法不同，PVPM 不从其他数据源获取可见性信息，而是通过图匹配自监督地学习部件对应关系，避免了跨域数据偏差。

- 在三个遮挡基准（Occluded-REID、Partial-REID、P-DukeMTMC-reID）上均取得领先性能，验证了姿态线索在遮挡场景下的有效性。

- 局限性：方法依赖 OpenPose 姿态估计的质量，姿态估计失败可能影响部件注意力生成；部件数量需要针对数据集调整，默认 $N_p=6$ 非 universally 最优。

## Paper Information

- Gao S, Wang J, Lu H, et al. Pose-guided Visible Part Matching for Occluded Person ReID[C]//Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition. 2020: 11744-11752.

- Paper：[https://openaccess.thecvf.com/content_CVPR_2020/papers/Gao_Pose-Guided_Visible_Part_Matching_for_Occluded_Person_ReID_CVPR_2020_paper.pdf](https://openaccess.thecvf.com/content_CVPR_2020/papers/Gao_Pose-Guided_Visible_Part_Matching_for_Occluded_Person_ReID_CVPR_2020_paper.pdf)

- Code：[https://github.com/hh23333/PVPM](https://github.com/hh23333/PVPM)