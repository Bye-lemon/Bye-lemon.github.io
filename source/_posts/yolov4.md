---
layout: post
title: '《YOLO v4: Optimal Speed and Accuracy of Object Detection》论文笔记'
mathjax: true
tags:
  - Object Detection
categories: 论文笔记
abstract: Alexey Bochkovskiy、hien-Yao Wang、Hong-Yuan Mark Liao
abbrlink: dbc2
date: 2020-05-09 17:38:50
---
# 目标检测器的流水线
- Input -> Backbone -> Neck -> Head，在One-Stage检测器中，Head称为Dense Prediction，Two-Stage检测器中，成Sparse Prediction。

![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200502142454.PNG)

---
# Input的常见形式

- Input一般有三种，**Image**、**Patches**和**Image Pyramid**。

    - Image是原始的图像。
    
    - Patches是在图像上获取的子图的集合。

    - Image Pyramid是图像金字塔，是一组不同尺度的同一图像的集合，从一张大尺度图像下采样得到的金字塔称为**高斯金字塔（Gaussian Pyramid）**，由一张小尺度的图像上采样得到的金字塔称为**拉普拉斯金字塔（Laplacian Pyramid）**。

---
# Backbone

- Backbone即是负责提取特征的卷积神经网络。例如，VGG19、ResNet50、Darknet53等，这些经典的卷积神经网络也有很多的变体。

- ResNeXt是常见的一种变体，采用了分组卷积的思想，可以视作ResNet和Inception的结合体，在Inception上加一条Short-cut便是ResNeXt。

- 除此之外，ResNet的变种还有加入了通道注意力（Split Attention）的SE-Net，在SE-Net上引入分组卷积的SK-Net，最近还有一种类似于ResNeXt+SK-Net的ResNeSt被提出。

---

# ResNeXt

- YOLO v4中作者使用了DarkNet和ResNeXt进行对比，Darknet相比于ResNet放弃了池化层，使用步长为2的卷积进行下采样，ResNeXt的结构如下图所示：
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200502144617)

---
# Group Convolution 分组卷积

- 分组卷积将特征图分成若干组，对于每一组特征图的子集进行独立的卷积运算，最后将每一组的输出进行通道拼接。

- 分组卷积能够减少参数量，从$$C_{in}\times W\times H\times C_{out}$$减少到了$$G\times\frac{C_{in}}{G}\times W\times H\times \frac{C_{out}}{G}$$，参数量变为原本的$$\frac{1}{G}$$。

- ResNeXt可以使用分组卷积实现，$$input \rightarrow 256,1\times1,128\rightarrow 128,3\times3,128,group=32\rightarrow 128,1\times1,256\rightarrow +input$$。

---
# Neck

- Neck在流水线中负责连接特征提取网络和预测网络，执行一些诸如特征采样、特征聚合的任务，Neck的常见表现形式有SPP、FPN、PANet、Bi-FPN。

---
# SPP

- SPP：Spatial Pyramid Pooling 空间金字塔池化
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200101150115.png)

---
# FPN

- FPN：Feature Pyramid Network 特征金字塔网络

- FPN分为两条路径，自底向上的通路是普通地特征提取网络，自顶向下的通路将深层特征融合到浅层特征中。
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200502154117)


---
# PANet

- PANet：Path Aggregation Network 路径聚合网络

- PANet在FPN的基础上又加了一条自底向上的通路，PANet认为浅层特征中的形状和轮廓信息对于定位和分割等任务会有帮助。
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200502154942.png)

---
# Bi-FPN

- Bi-FPN：Bi-directional Feature Pyramid Network 双向特征金字塔网络

- Bi-FPN在PANet的基础上进行了结构调整，并在特征图上进行加权融合。
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200502155536.jpg)

---
# Head

- Head负责从特征图中预测出可能存在的目标，单阶段的Head网络有RPN、YOLO、SSD、RetinaNet、FCOS，双阶段的Head网络有Faster R-CNN、R-FCN等。

---
# 目标检测任务中的技巧

- 目标检测任务中的技巧分为两种，被称为BoF（Bag of Freebies）和BoS（Bag of Specials）两种。

- BoF指一些能够提升模型效果且不会在推断时带来额外的时间开销的技巧，譬如Mixup、Label Smooth等。

- BoS指一些能够提升模型想过但在推断时会额外花费一些时间开销的技巧，譬如Neck网络、注意力机制、激活函数和NMS上的各种变体等。

---
# BoF（1）

- 数据增强的方法：随机缩放、翻转、裁剪、旋转、随机擦除、CutOut、色彩变换、离散化等。

- 数据扩充的方法：Mixup、CutMix、GAN等。

- 特征正则化的方法：全连接网络中的DropOut和DropConnect、卷积网络中的DropBlock。

---
# BOF（2）

- 处理类别不平衡的方法：OHEM、Focal Loss等。

- 对于标签的优化方法：Label Smoothing、Knowledge Distillation等。

- 对于损失函数的优化方法：IoU、GIoU、DIoU、CIoU等。

---
# OHEM

- OHEM：Online Hard Example Mining 在线困难样本挖掘
- OHEM是为Faster R-CNN这种两阶段网络设计的一种方法，OHEM希望提升“短板”，使用loss最大的FP样本重新训练Head网络。
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200502173139.png)

---
# Focal Loss

- 交叉熵损失和焦点损失的对比：
$$$L=-y\log\hat{y}-(1-y)\log (1-\hat{y}) $$$
$$$L_{fl}=-y\alpha(1-\hat{y})^{\gamma}\log\hat{y}-(1-y)(1-\alpha)\hat{y}^{\gamma}log(1-\hat{y})$$$

- 焦点损失一般用在一阶段网络中，因子$$\gamma$$使得容易分类的（预测值与0或1接近的）样本在损失中占有一个较小的比重，而不易预测的在损失中占有一个较大的比重；因子$$\alpha$$用于平衡正负样本自身的不均衡。

---
# IoU Loss

- 对于目标的定位损失，常用的计算方式是对BBox和Ground Truth的坐标计算MSE Loss。但是我们评估的时候是使用IoU评判二者的重合程度，优化坐标和优化IoU不是等价的，此外，坐标对于尺度是敏感的而IoU具有良好的尺度不变性。所以，有学者提出了IoU Loss。
$$$\mathcal{L}_{IoU}=-\ln IoU$$$
$$$\mathcal{L}_{IoU}=1-IoU$$$
- 但是IoU在BBox和GT不重合时不能很好的描述二者的差异（IoU均为0），且即便是重合，同一种IoU可能对应着不同的重合情况，这些也是有差异的，IoU不能描述出这种差异。

---
# GIoU Loss

- GIoU：Generalized IoU 广义交并比
$$$GIoU=IoU-\frac{|A_c-U|}{|A_c|}$$$
$$$\mathcal{L}_{GIoU}=1-GIoU$$$
- 其中$$A_c$$代表BBox和GT的最小闭包面积，即能覆盖二者的最小矩形框面积。

- $$GIoU\in[-1, 1]$$，当BB和GT完全重合时最大，毫无交集且无限远时最小，GIoU不仅反映了BB与GT重合部分的情况，也描述了非重叠部分的情况，更能反应二者重合度。

---
# DIoU Loss

- DIoU：Distance IoU 距离交并比
$$$DIoU = IoU-\frac{\rho^2(b,b^{gt})}{c^2}$$$
$$$\mathcal{L}_{DIoU} = 1-DIou$$$
- 其中，$$\rho(b,b^{gt})$$代表BB和GT的中心点的距离，$$c$$代表BB和GT的最小闭包的对角线的距离。

- $$GIoU\in[-1, 1]$$，当BB和GT完全重合时最大，毫无交集且无限远时最小，DIoU直接最小化BB和GT的距离，相较于GIoU收敛更快，并且当BB和GT在水平方向或垂直方向上重叠时，GIoU退化为IoU而DIoU依然有效。

---
# CIoU loss

- CIoU：Complete IoU 完全交并比
$$$\mathcal{L}_{CIoU}=1-IoU+\frac{\rho^2(b,b^{gt})}{c^2}+\alpha\upsilon$$$
$$$\alpha=\frac{\upsilon}{(1-IoU)+\upsilon}\ ,\upsilon=\frac{4}{\pi^2}(\arctan\frac{w^{gt}}{h^{gt}}-\arctan\frac{w}{h})$$$

- 其中，$$\upsilon$$描述了BB和GT长宽比的相似性，$$\alpha$$是一个折中项。

- BB回归三要素：距离、尺寸、长宽比。CIoU引入了GIoU和DIou中没有考虑过的长宽比这一要素，进一步约束BB和GT。

---
# BoS

- 优化感受野的技巧：SPP、ASPP、RFB

- 注意力：通道注意力SE、空间注意力SAM

- 特征融合：Skip Connection、Hyper Column、FPN、SFAM、ASFF、Bi-FPN

- 激活函数：LReLU、PReLU、ReLU6、SELU、Swish、Hard-Swish、Mish

- 后处理：Soft NMS、DIoU NMS

---
# 空洞卷积 Dilate Convolution

- 空洞卷积与普通卷积相比具有更大的感受野，空洞卷积的感受野为$(dilation-1)(kernel\ size+1)+kernel\ size$。
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200503180237.png)

---
# ASPP & RFB

- ASPP：Atrous Spatial Pyramid Pooling 空洞空间金字塔池化

- 在SPP的基础上将一组池化操作使用一个$1\times1$的卷积核和3个采样率为$\{6,12,18\}$的$3\times3$的卷积核进行空洞卷积替换。原图和四个卷积层输出的四张特征图被连接到一起，通过$1\times1$的卷积核输出一张特征图。
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200503181813.png)

- RFB（Receptive Field Block）在ASPP的基础上引入了Inception结构。

---
# SFAM

- SFAM是M2Det网络使用的一种特征融合的方法，SFAM融合了不同层次的特征金字塔，SFAM将不同层次中相同尺度的特征图连接，并进行通道注意力的运算，最终形成一批不同尺度的特征金字塔，每一个尺度下包含不同层次的特征。（M2：Multi-Scale Multi-Level）
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200503184704)

---
# ASFF

- ASFF：Adaptive Spatial Feature Fusion 自适应空间特征融合
- 对于某一尺度的特征图，ASFF将其它尺度上的特征图重采样到该尺度下，对各特征图加权融合。
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200503185730)

---
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200503193804.png)

---
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200503194530.png)

---
# Soft NMS & DIoU NMS

- 传统NMS算法在处理密集目标时存在一个问题，由于多个密集目标的预测框彼此都有重叠，按照NMS算法，存在一种可能，会只保留其中一个框，而剔除掉其它预测框，导致对于密集目标识别效果变差。

- Soft NMS不直接剔除预测框，而是降低该目标的置信度，在完成了NMS操作之后，可以根据置信度阈值来筛选目标。

- DIoU NMS将NMS算法中的IoU计算替换为DIoU计算。

---
# YOLO v4的观点

- 目标检测任务和分类任务对于网络结构的要求是不同的：

    - 为了提高小目标检测能力，架构要适合高分辨率图像；
    - 为了获得更大的感受野，架构需要更深的层次；
    - 为了提高对不同尺度图像的预测效果，架构需要更多的参数。

- 综合考虑这些需求，YOLO v4使用了CSPDarknet53做Backbone网络，SPP做Neck网络，YOLO v3检测器做Head网络。

- 在技巧上，YOLO v4使用了Mosaic和SAT扩充图像，SAM加权残差连接，PAN融合特征，CmBN改进BN层，Mish激活函数，DropBlock正则化，CIoU损失，应用遗传算法选择最优超参数。对于SAM，YOLO v4直接使用卷积来实现；对于PAN，YOLO v4将加法改成了连接。改进的CmBN使得归一化的样本更多，归一化效果更好。

---
# CSPDarknet53

- CSPDarknet53：Cross Stage Partial Darknet53 跨阶段部分连接Darknet53

- CSPNet是一种通用的卷积神经网络改进形式，其核心思想是将特征图分为两个部分，一部分通过卷积网络，另一部分做一个简单的转换后与前一部分的输出直接连接。

- CSP的引入可以大幅减少运算量，对于分类任务，CSP的作用不大，但是对于目标检测任务，CSP能够有效的提升模型效果。

---
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200503205548.png)
