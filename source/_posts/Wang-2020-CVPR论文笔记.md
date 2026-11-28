---
slug: post-18
title: >-
  《Transferable, Controllable, and Inconspicuous Adversarial Attacks on Person
  Re-identification With Deep Mis-Ranking》论文笔记
tags:
  - Re-ID
  - CVPR
categories: 论文笔记
kind: paper
abstract: '【CVPR2020】 Hongjun Wang, Guangrun Wang, Ya Li, Dongyu Zhang, Liang Lin'
date: 2020-07-07 11:04:08
---
## Introduction

- 伴随着深度神经网络技术的发展，Re-ID任务得到了很好的发展，然而Re-ID从深度神经网络里得到不仅仅是提升，也继承了深度神经网络中脆弱性。近年来针对深度神经网络的对抗性攻击取得了不错的成果，在图像分类等人物中，已经有很好的方案去欺诈分类器。本文希望通过对抗性攻击完成对基于DNN的Re-ID模型的欺诈。
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200707143708.png)

- 通过探索对现有Re-ID模型的对抗性攻击，可以挖掘出现有的模型的弱点，有利于对Re-ID问题的鲁棒性的提升，是一项很有意义的工作。

- 由于现实世界中的人物是无穷尽的，且他们不会存在于数据集中。因此，针对Re-ID问题的攻击和对于图像分类等人物的攻击是不一样的，应被视为一个**跨域黑箱攻击**问题。现有的对抗性攻击方法通常都不具有跨域迁移性，同时，作者期望这样的攻击是隐式的，在不影响图像的感知质量的条件下实现攻击，使人眼不能发觉图像已经过了破坏。

## Methodology
### Overall Framework

- 下图展示了网络的基本框架，网络的目标是通过生成器$\mathcal{G}$为每一张输入图像$\mathcal{I}$生成一组具有欺骗性的噪音$\mathcal{P}$，进而获得对抗性样本$\hat{\mathcal{I}}$，该样本可以欺骗Re-ID系统$\mathcal{T}$使其输出错误的结果。
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200707112322.png)

### Learning-to-Mis-Rank Formulation For ReID

- 为了打乱Re-ID系统输出的排序，论文提出了一种新的**误排序损失Mis-ranking Loss**来攻击Re-ID系统的排序环节。该损失的形式同三元损失类似，但优化方向与三元损失相反，误排序损失希望最小化不匹配样本对之间的距离，同时最大化匹配的样本对之间的距离。该损失函数的形式如下：

$$\mathcal{L}_{adv\_etri}=\sum_{k=1}^{K}\sum_{c=1}^{C_k}[\max_{\substack{j\ne k\\ j=1\dotso K\\ c_{d}=1\dotso C_j}}\|\mathcal{T}(\hat{\mathcal{I}_c^k})-\mathcal{T}(\hat{\mathcal{I}_{c_d}^k})\|_2^2-\mathop{\min}_{c_s=1\cdots C_k}\|\mathcal{T}(\hat{\mathcal{I}_c^k})-\mathcal{T}(\hat{\mathcal{I}_{c_s}^k})\|_2^2+\Delta]_+$$

- 上式中$C_k$代表第$k$个ID下的人物图像样本的数量，$\mathcal{I}_c^k$代表第$k$个ID下的第$c$张图像样本，$c_s$和$c_d$代表同一个ID和不同ID下的样本，$\Delta$代表边界阈值。

### Learning Transferable Features for Attacking

- 为了提升模型的迁移能力，论文作者设计了一种新型的判别器结构，配合ResNet50的生成器，组成了一个拥有更强的表征学习能力的GAN网络，用于提取通用性更强的特征来实施对抗干扰。

- 判别器$\mathcal{D}$使用了多尺度输入下的多层次特征进行融合，其网络结构如图所示
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200707125744.png)

### Controlling the Number of the Attacked Pixels

- 为了使攻击不易被感知（即，使攻击可以欺骗Re-ID系统，但不易被人类察觉），作者做了两个方面的工作，其中之一是控制被攻击的像素点的个数。

- 本文对判别器的Softmax输出向量$\lambda_{i,j}$通过一个基于Gumbel-Softmax的方式计算特征图上所有像素点的概率分布，掩膜$\mathcal{M}$选取概率最高的$k$个像素点保留，其余在正向传播中舍弃，以此从生成器输出的初始噪声$\mathcal{P^\prime}$中选择出最终的噪声$\mathcal{P}$。
$$
M_{ij}=\left\{
\begin{aligned}
&\mathcal{KeepTopk}(p_{i,j}),& \text{in forward propagation}\\
&p_{i,j},& \text{in backward propagation}
\end{aligned}
\right. \\
p_{i,j}=\frac{\exp((\log(\lambda_{i,j}+\mathcal{N}_{i,j}))/\tau)}{\sum_{i,j=1}^{H,W}\exp((\log(\lambda_{i,j}+\mathcal{N}_{i,j}))/\tau)}
$$

- 式中$\mathcal{N}_{i,j}=-\log(-\log(U)),U\thicksim Uniform(0,1)$，$\tau$是分布的软化参数。

### Perception Loss for Visual Qualit

- 作者为了保证攻击不易察觉所做的另一个工作是引入了一个损失函数来描述所生成图像与原始图像的视觉差异。

- 受启发于**多尺度结构相似性（Multi-Scale-Structure Similarity Index，MS-SSIM）**，作者提出了感知损失（Perception Loss）$\mathcal{L}_{VP}$，其具体形式如下
$$
\mathcal{L}(\mathcal{I},\hat{\mathcal{L}})=[l_L(\mathcal{I},\hat{\mathcal{L}})]^{\alpha_L}\cdot \prod_{j=1}^{L}[c_j(\mathcal{I},\hat{\mathcal{L}})]^{\beta_j}[s_j(\mathcal{I},\hat{\mathcal{L}})]^{\gamma_j}\\
c_j(\mathcal{I},\hat{\mathcal{L}})=\frac{2\sigma_\mathcal{I}\sigma_{\hat{\mathcal{I}}}+C_2}{\sigma_\mathcal{I}^2+\sigma_{\hat{\mathcal{I}}}^2+C_2}\\
s_j(\mathcal{I},\hat{\mathcal{L}})=\frac{\sigma_{\mathcal{I}\hat{\mathcal{I}}}+C_3}{\sigma_\mathcal{I}\sigma_{\hat{\mathcal{I}}}+C_3}
$$

- 上式中$\sigma$代表方差或协方差，$\alpha_L,\beta_j,\gamma_j$是各个组件的权重，$L$代表图像的尺度级。

### Objective Function

- 除了上文提到的误排序损失$\mathcal{L}_{adv\_etri}$和感知损失$\mathcal{L}_{VP}$，网络还受两个损失函数的监督，分别是误分类损失（Misclassification Loss）$\mathcal{L}_{adv\_xent}$和GAN损失$\mathcal{L}_{GAN}$，四种损失经过加权得到总的损失$\mathcal{L}$。
$$\mathcal{L}=\mathcal{L}_{GAN}+\mathcal{L}_{adv\_xent}+\zeta\mathcal{L}_{adv\_etri}+\eta(1-\mathcal{L}_{VP})$$

- **误分类损失**在形式上是一个带有标签平滑的交叉熵损失，唯一的区别在于对于标签的编码形式，常规的分类任务会将标签编码成真实类别为1其余项为0的One-hot编码，这里的编码形式是使正确类别为0，其余类别为$\frac{1}{K-1}$，$K$是总的类别数。$\mathcal{S}(\cdot)$代表log-softmax函数，$\delta$是平滑因子。
$$\mathcal{L}_{adv\_xent}=-\sum_{k=1}^{K}\mathcal{S}(\mathcal{T}(\hat{\mathcal{I}}))_k((1-\delta)\mathbf{1}_{\arg\min\mathcal{T}({\mathcal{I}}_k)}+\delta v_k)$$

- **GAN损失**被定义为
$$\mathcal{L}_{GAN}=\mathbb{E}_{(I_{c_d},I_{c_s})}[\log\mathcal{D}_{1,2,3}(I_{c_d},I_{c_s})]+\mathbb{E}_{\mathcal{I}}[\log(1-\mathcal{D}_{1,2,3}(\mathcal{I},\hat{\mathcal{I}}))]$$

## Experiments

### 数据集与设置

- 四个最大规模 Re-ID 基准：Market1501（1,501 ID / 32,668 框）、CUHK03（1,467 ID / 28,192 框，新协议）、DukeMTMC（702 ID 训练 / 17,661 测试）、MSMT17（4,101 ID / 126,441 框，15 个摄像头室内外场景）。
- 评估指标：mAP 和 rank-{1,5,10,20}。注意与 Re-ID 问题相反，攻击问题中更低的 rank 准确率和 mAP 意味着更高的攻击成功率。
- 所有实验采用 $L_\infty$-bounded 攻击，$\varepsilon=16$（除非特别说明）。
- 实现：NVIDIA Titan X 12GB，batch size 32，训练 50 epochs，Adam 优化器学习率 2e-4。

### 攻击最先进的 Re-ID 系统（表1）

**Market1501 上的攻击效果**（Rank-1 / mAP）：

| 目标模型 | 攻击前 | GAP | PGD | Ours |
|----------|--------|-----|-----|------|
| IDE (ResNet-50) | 83.1 / 63.3 | 5.0 / 5.0 | 4.5 / 4.6 | **3.7 / 4.4** |
| DenseNet-121 | 89.9 / 73.7 | 2.7 / 3.7 | 1.2 / 1.3 | **1.2 / 1.3** |
| AlignedReid | 91.8 / 79.1 | 10.1 / 9.7 | 10.2 / 8.9 | **1.4 / 2.3** |
| PCB | 88.6 / 70.7 | 6.8 / 5.6 | 6.1 / 4.8 | **5.0 / 4.3** |
| HACNN | 90.6 / 75.3 | 2.3 / 3.0 | 6.1 / 5.3 | **0.9 / 1.5** |

- 所有模型的 rank-1 准确率均被攻击至接近零。例如表现最好的 AlignedReID 从 91.8% 骤降至 1.4%。
- 三种类型的 Re-ID 系统（不同骨干网络、基于部件、数据增强）均无法有效防御。

### Ablation Study

**不同损失函数对比**（表2a，AlignedReID / Market1501）：

| 损失 | Rank-1 |
|------|--------|
| (A) 传统误分类损失 | 28.5% |
| (B) 本文误分类损失 | 13.7% |
| (C) 误排序损失 | 4.5% |
| (D) 误分类+误排序 | **1.4%** |

- 传统误分类损失与感知损失不兼容，攻击性能差；本文的两种损失互补，组合后最优。

**不同 $\varepsilon$ 对比**（表2b）：$\varepsilon=40$ 时 rank-1 降至 0.0%，$\varepsilon=16$ 时 1.4%，$\varepsilon=10$ 时 24.4%。即使在小 $\varepsilon$ 下仍有良好攻击效果。

**多阶段判别器 vs PatchGAN**（表2c）：多阶段判别器在大小 $\varepsilon$ 下均明显优于 PatchGAN，验证了金字塔特征融合的有效性。

**攻击像素数量控制**（表3）：

| 像素比例 | Rank-1 | mAP |
|----------|--------|-----|
| Full size | 1.4 | 2.3 |
| 1/2 | 39.3 | 31.5 |
| 1/4 + 放松 | 0.3 | 0.7 |
| 1/8 + 放松 | 0.6 | 1.1 |
| 1/16 + 放松 | 8.2 | 6.9 |
| 1/32 + 放松 | 59.4 | 47.3 |
| 1/64 + 放松 | 75.5 | 61.5 |

- 攻击像素数 > $HW/2$ 时肯定成功；通过增强噪声幅度，最少可将攻击像素降至 $HW/32$。

**多 shot 采样有效性**（表4）：学习的位置（B: 79.4/65.3）比随机位置（A: 81.9/68.1）更有效，表明方法成功找到了敏感攻击位置。

### 黑盒攻击

**跨数据集攻击**（表2d，AlignedReID）：Market→CUHK 4.9% rank-1，Market→Duke 17.7%，Market→MSMT 35.1%。成功率接近白盒攻击。

**跨模型攻击**（表2e，Market1501）：攻击 AlignedReID 的噪声迁移到 PCB（31.7%）、HACNN（14.8%）、LSRO（17.0%），均成功欺骗。

**跨数据集+跨模型攻击**（表2f）：最极端条件下（无目标数据和模型先验），仍成功欺骗所有系统。如 →PCB(C) 6.9%、→HACNN(C) 3.6%。

**攻击可解释性**：统计发现网络倾向于攻击图像上半部分（对应行人上半身），暗示 Re-ID 系统对上半身区域依赖更强。

### 与现有攻击方法对比

在 CIFAR10 分类任务上（表5），本文方法将对抗训练 ResNet32 的准确率从 90.55% 降至 47.31%，优于 DeepFool（58.22%）、NewtonFool（69.79%）、CW（52.27%）、GAP（51.26%），证明了方法的泛化能力。

## Conclusion

- 论文首次系统性地检验了 Re-ID 系统对对抗攻击的脆弱性，提出了 learning-to-mis-rank 公式来扰动排序输出，与现有基于误分类的攻击器互补。

- 多阶段判别器架构提取通用可迁移特征，实现了跨数据集和跨模型的黑盒攻击。

- 通过可微多 shot 采样控制攻击像素数量，结合感知损失保证视觉质量，实现了不易察觉的攻击。

- 实验不仅证明了攻击的有效性，也为 Re-ID 系统鲁棒性的未来改进提供了方向：应关注上半身等主导区域，考虑对抗训练等防御策略。

## Paper Information

- Wang H, Wang G, Li Y, et al. Transferable, Controllable, and Inconspicuous Adversarial Attacks on Person Re-identification With Deep Mis-Ranking[C]//Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition. 2020: 342-351.

- Paper：[https://arxiv.org/abs/2004.04199](https://arxiv.org/abs/2004.04199)

- Code：[https://github.com/whj363636/Adversarial-attack-on-Person-ReID-With-Deep-Mis-Ranking](https://github.com/whj363636/Adversarial-attack-on-Person-ReID-With-Deep-Mis-Ranking)