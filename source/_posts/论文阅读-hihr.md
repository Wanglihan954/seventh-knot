---
title: "论文阅读｜HiHR: Hierarchical Hyperbolic Representation for Aerial-Ground Person Re-Identification"
categories:
  - 目标重识别
tags:
  - "文献笔记"
  - "AI论文"
  - "目标重识别"
  - "Person Re-ID"
  - "空地行人重识别"
  - "双曲学习"
  - "CLIP"
description: "HiHR 面向空中—地面行人重识别中极端视角、尺度与背景差异。作者不把所有特征强行压到单一视角无关表示，而是先以文本语义引导多层视觉特征融合，再在双曲空间建立“跨视角共享身份—视角特有细节”的父子层级，从而同时保证身份一致性与细粒度判别性。"
readmore: true
mathjax: true
date: 2026-09-17 21:26:15
updated: 2026-09-19 22:16:27
abbrlink: "a0936075"
---
> 本文基于论文、公开代码与本地阅读笔记整理；论文插图仅用于学习与讨论。

## 论文信息
**Title:** HiHR: Hierarchical Hyperbolic Representation for Aerial-Ground Person Re-Identification  
**Authors:** Qiwei Yang, Pingping Zhang  
**Venue:** arXiv  
**DOI:** 10.48550/arXiv.2607.09186  
**GitHub:** https://github.com/YangQiWei3/HiHR  
**IF/Level:** Preprint | Aerial-Ground Person Re-ID

> **摘要**
> HiHR 面向空中—地面行人重识别中极端视角、尺度与背景差异。作者不把所有特征强行压到单一视角无关表示，而是先以文本语义引导多层视觉特征融合，再在双曲空间建立“跨视角共享身份—视角特有细节”的父子层级，从而同时保证身份一致性与细粒度判别性。


<!-- more -->
---

## 快速导航
- **Paper:** <https://arxiv.org/abs/2607.09186>
---

## 论文大纲 (AI Context)

### 1. 动机与挑战 (Motivation & Challenges)
- **跨视角差异极端：** 航拍与地面相机在俯仰角、人体尺度、遮挡和背景上存在明显域差异。
- **直接对齐的副作用：** 只追求视角不变性容易造成 feature collapse，把某个视角下仍有判别力的局部信息一并抹去。
- **平坦空间的限制：** 欧氏嵌入不擅长表达“共享身份语义—视角特有细节”的天然层级结构。

### 2. 核心贡献 (Key Contributions)
- [x] 提出 **MFE**，从 CLIP 图像编码器第 5、8、12 层提取互补的多粒度视觉 token。
- [x] 提出 **TMF**，用视角无关与视角相关文本特征作为语义查询，自适应融合 class/patch token。
- [x] 提出 **HHL**，在 Lorentz/双曲空间中用父—子层级同时保留跨视角一致性和视角特有判别信息。
- [x] 在 AG-ReID v1/v2、LAGPeR、CARGO 四个基准上验证泛化性。

### 3. 技术路线 (Methodology)
> **补充说明｜核心架构图（Fig. 2，已按图体裁剪）**
> ![](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@main/img/hihr-fig2-framework-v2.png)

- **MFE：** 以 CLIP ViT-B/16 为骨干，跨深度抽取 class token 与 patch token；中层补充局部结构，高层提供身份语义。
- **双层提示：** view-agnostic prompt 强调共享身份证据，view-aware prompt 显式承载 aerial/ground 条件。
- **TMF：** 文本特征作为 semantic query 选择各层 class token，再复用注意力权重聚合 patch token，避免简单平均造成冗余。
- **HHL：** 粗粒度父节点组织视角无关身份信息，细粒度子节点保存视角特有线索；entailment cone 约束父子关系，度量损失维持身份可分性。
- **训练细节：** A800；CLIP 预训练部分学习率 $5\times10^{-6}$；默认层集合 $\{5,8,12\}$，$\lambda_e=5$，曲率初始化 $\tau=1.0$，尺度初始化 $(s_1,s_2)=(0.5,2.0)$。

---

## 方法详解：从输入图像到最终检索特征

### 1. 论文真正想解决的矛盾

AG-ReID 要在 aerial、ground、CCTV、wearable 等异构视角之间检索同一身份。传统的直接对齐可以概括为：

$$f_{\mathrm{aerial}}\approx f_{\mathrm{ground}}.$$

它有利于跨视角匹配，却可能连同有用的视角特有信息一起压掉。例如，航拍图中的头肩轮廓、身体比例，与地面图中的衣服纹理、正面结构都可能帮助区分身份。HiHR 因而把目标拆成两层：

| 层级 | 希望保留的信息 | 几何角色 |
|---|---|---|
| Coarse | 跨视角共享、能区分身份的语义 | Parent |
| Fine | 当前视角下仍有判别力的细节 | Child |

> **阅读说明｜核心立场**
> View difference 并不全部是噪声。HiHR 不要求 aerial 与 ground 表示完全相同，而是要求它们共享同一个身份父层，同时允许子层保留有控制的差异。

### 2. MFE：从不同 Transformer 深度取互补证据

CLIP 图像编码器第 $l$ 层的输出写作：

$$Z^{(l)}=[c^{(l)};X^{(l)}]\in\mathbb R^{(1+N)\times D},$$

其中：

- $c^{(l)}\in\mathbb R^D$ 是 class token，可看作该层的全局摘要；
- $X^{(l)}\in\mathbb R^{N\times D}$ 是 patch tokens，保存局部结构和纹理；
- $N$ 是 patch 数，$D$ 是 token 维度。

默认选取 $\{5,8,12\}$ 层：中层偏局部结构与人体形状，深层偏身份语义。它不是默认“层越多越好”；消融显示相邻的 $\{10,11,12\}$ 冗余较大，继续增加层也可能引入噪声。

#### 两类文本 Prompt

作者同时构造两类提示：

$$p_{vag}=\text{“A photo of [shared] person.”},$$

$$p_{vaw}=\text{“A photo of [shared] person from [view-private] view.”}.$$

经过文本编码器 $E_t$ 后得到：

$$f_{vag}=E_t(p_{vag}),\qquad f_{vaw}=E_t(p_{vaw}).$$

$vag$ 表示 view-agnostic，用于询问“这个人是谁”；$vaw$ 表示 view-aware，用于询问“这个人在当前视角下是什么样”。二者已经预先定义了后续的 parent/child 语义。

### 3. TMF：文本先选层，Patch 再提供细节

先把 $M$ 个选定层的 class token 堆叠：

$$C=[c^{(l_1)};c^{(l_2)};\ldots;c^{(l_M)}]\in\mathbb R^{M\times D}.$$

对于 $k\in\{vag,vaw\}$，文本特征充当 Query，各层 class token 充当 Key 和 Value：

$$\alpha_k=\operatorname{softmax}\left(\frac{Q_kK^\top}{\sqrt D}\right), \qquad t_k=\alpha_kV,$$

其中 $(Q_k,K,V)$ 是 $(f_k,C,C)$ 的线性投影。若取三层，$\alpha_k$ 就包含三个权重，例如：

$$\alpha_{vag}=[0.15,0.30,0.55].$$

它回答的是“针对当前文本语义，哪一层更重要”。使用 class token 的理由在于每层只有一个全局摘要，因此注意力结果能直接解释为层权重。论文没有给出 class token 与 mean-pooled patch 的专项消融，所以“class token 一定最优”并未被单独证明。

随后，作者复用同一组层权重融合 patch tokens：

$$X_k=\sum_{m=1}^{M}\alpha_k^{(m)}X^{(l_m)}.$$

再将全局 token 和局部 tokens 一同送入标准 Transformer：

$$S_k=\operatorname{Trans}([t_k;X_k]),$$

取 $S_k$ 的第一个 token 作为输出 $s_k$，得到：

$$s_{vag}\quad\text{与}\quad s_{vaw}.$$

因此 TMF 的分工可以压缩为：

```text
Prompt → 与各层 CLS 做注意力 → 得到层权重 α
                                  ↓
                           加权各层 Patch
                                  ↓
                 [全局 token；局部 tokens] 再融合
                                  ↓
                     s_vag（共享）/ s_vaw（视角特有）
```

> **补充说明｜两组权重并不相同**
> $\alpha_{vag}$ 和 $\alpha_{vaw}$ 分别由两种 Prompt 产生。共享身份语义与视角语义可以选择不同的特征深度。

### 4. 为什么是双曲空间

HiHR 想表示的不是简单的“正样本靠近、负样本远离”，而是：

```text
共享身份 Parent
├── Aerial-specific Child
└── Ground-specific Child
```

树的节点数通常随深度指数增长；负曲率空间的可用容量也随半径快速增长。二维曲率为 $-\tau$ 的双曲空间中，测地半径 $r$ 的圆周长度为：

$$C_H(r)=\frac{2\pi}{\sqrt\tau}\sinh(\sqrt\tau r),$$

当 $r$ 较大时近似随 $e^{\sqrt\tau r}$ 增长。于是可以把半径理解为层级深度、方向理解为不同语义分支。这是一种适合树结构的几何归纳偏置，不代表双曲空间会自动产生正确层级。

#### Ambient 与 Intrinsic 不要混淆

Lorentz 双曲面嵌在更高维的环境空间中。点的 ambient coordinates 描述它在外部坐标系中的位置；intrinsic distance 则是在双曲面上沿测地线测得的距离。固定双曲半径 $r$ 后，环境坐标中的空间半径是：

$$\rho=\frac{1}{\sqrt\tau}\sinh(\sqrt\tau r),$$

一般有 $\rho\neq r$。前者是外部坐标尺度，后者才是双曲测地半径。

### 5. HHL 第一步：把“语义方向”和“层级半径”分开

作者先归一化 TMF 的两个输出，再重新指定模长：

$$g^p=s_1\frac{s_{vag}}{\|s_{vag}\|_2},$$

$$g^c=s_1s_2\frac{s_{vaw}}{\|s_{vaw}\|_2}, \qquad s_1>0,\ s_2>1.$$

于是：

$$\|g^p\|_2=s_1, \qquad \|g^c\|_2=s_1s_2>s_1.$$

这一步去除原始特征模长的不确定性，把信息重新分工：

| 分量 | 含义 |
|---|---|
| 特征方向 | “它是什么”，即身份/视角语义 |
| 向量模长 | “它处于哪一层”，即 coarse/fine 深度 |
| $s_1$ | 整个层级的全局尺度 |
| $s_2$ | Child 相对 Parent 的径向间隔 |

$s_1,s_2$ 都参与端到端学习，初始化为 $(0.5,2.0)$。论文规定了取值范围，但正文没有交代代码使用哪种参数化来始终保证 $s_1>0,s_2>1$，复现时需要检查仓库。

### 6. Exponential Map 只负责把点送进双曲空间

曲率为 $-\tau$ 的 Lorentz 模型定义为：

$$\mathbb H_\tau^n= \left\{x\in\mathbb R^{n+1}:\langle x,x\rangle_L=-\frac1\tau,\ x_0>0\right\},$$

原点为：

$$o=\left[\frac1{\sqrt\tau},0,\ldots,0\right].$$

对原点切空间中的向量 $v$，标准 exponential map 为：

$$\exp_o^\tau(v)= \cosh(\sqrt\tau\|v\|_L)o+ \frac{\sinh(\sqrt\tau\|v\|_L)}{\sqrt\tau\|v\|_L}v.$$

它沿初速度为 $v$ 的测地线走到参数 1 的位置，并满足：

$$d_\tau(o,\exp_o^\tau(v))=\|v\|_L.$$

因此上述尺度分离映射后仍体现为 Parent 近、Child 远：

$$z^p=\exp_o^\tau(g^p), \qquad z^c=\exp_o^\tau(g^c).$$

> **注意｜关键纠正**
> Exponential map 只把切空间向量送到双曲面，并保持径向测地距离与切向量范数的关系。它不会自动让 Child 落入某个 Parent 的 entailment cone；后者由损失函数约束。

### 7. 身份原型：这里的 $y$ 是身份标签

在一个 batch 内，对身份 $y$ 的所有 Parent 特征求平均：

$$\pi_y^p=\operatorname{Mean}(\{g^p\mid y\}).$$

这里 $y$ 是 identity label，不是双曲点。$\pi_y^p$ 是当前 batch 中该身份的 Parent prototype，而不是跨整个训练集维护的全局可学习中心。再将其映射为：

$$z^\pi=\exp_o^\tau(\pi_y^p).$$

由于训练默认每个身份采样 4 张图，一个 batch 原型通常由该身份在当前 batch 的若干 Parent 特征平均得到。

### 8. Entailment Cone：规定 Child 可以往哪里走

以双曲点 $x$ 为 Parent，其 cone 半开角为：

$$\omega(x)=\sin^{-1}\left( \frac{2k}{\sqrt\tau\|x_{\mathrm{space}}\|} \right), \qquad k=0.1.$$

$\phi(x,y)$ 表示 Child $y$ 相对 cone 轴的角度偏差。论文使用 hinge 形式：

$$\mathcal L_e(x,y)= \max(0,\phi(x,y)-\omega(x)).$$

- 若 $\phi\leq\omega$，Child 已在合法 cone 中，损失为 0；
- 若 $\phi>\omega$，只惩罚超出 cone 的角度部分；
- 这是训练时的 soft constraint，不是前向过程中把点硬投影进 cone。

#### 四条锥约束分别做什么

| 约束 | Parent → Child | 作用 |
|---|---|---|
| $\mathcal L_e(z^\pi,z^c)$ | 身份 Parent prototype → Child visual | 限制 Child 漂移及跨身份混淆 |
| $\mathcal L_e(z_P^p,z_P^c)$ | View-agnostic prompt → View-aware prompt | 建立文本侧 coarse-to-fine 层级 |
| $\mathcal L_e(z_P^p,z^p)$ | Parent prompt → Parent visual | 对齐共享语义层 |
| $\mathcal L_e(z_P^c,z^c)$ | Child prompt → Child visual | 对齐视角语义层 |

Prompt 的双曲表示同样使用 $s_1,s_2$：

$$z_P^p=\exp_o^\tau\left(s_1\frac{f_{vag}}{\|f_{vag}\|_2}\right),$$

$$z_P^c=\exp_o^\tau\left(s_1s_2\frac{f_{vaw}}{\|f_{vaw}\|_2}\right).$$

> **提示｜两类约束的分工**
> $s_2>1$ 负责纵向层级，让 Child 比 Parent 更靠外；entailment loss 负责方向约束，让 Child 沿属于该 Parent 的分支向外，而不是任意漂移。

### 9. 两级 ReID 监督为什么不同

Parent 层使用跨视角混合采样的分类与 Triplet 监督：

$$\mathcal L_g(F)=\lambda_g\mathcal L_{CE}(F)+\mathcal L_{Tri}(F),$$

$$\mathcal L_g(g^p),$$

目的是压紧同一身份的 aerial/ground 表示，强化跨视角一致性。

Child 层使用同视角内采样的 Triplet：

$$\mathcal L_{g,\mathrm{intra}}(g^c) =\lambda_g\mathcal L_{CE}(g^c)+\mathcal L_{Tri,\mathrm{intra}}(g^c).$$

其正负样本与 Anchor 来自同一视角，从而避免 Child 层再次被强行跨视角压平。论文默认 $\lambda_g=1.0$ 用于 Parent，$0.25$ 用于 Child 的该权重设置。

最终目标为：

$$\begin{aligned} \mathcal L={}&\mathcal L_g(g^p)+\mathcal L_{g,\mathrm{intra}}(g^c)\\ &+\lambda_e\big[ \mathcal L_e(z^\pi,z^c) +\mathcal L_e(z_P^p,z_P^c)\\ &\qquad\quad +\mathcal L_e(z_P^p,z^p) +\mathcal L_e(z_P^c,z^c) \big]. \end{aligned}$$

### 10. 推理阶段使用什么特征

测试时不直接拿四条损失中的 Prompt 或 prototype 做检索。作者将视觉双曲点映回原点切空间：

$$\log_o^\tau(z^p),\qquad \log_o^\tau(z^c),$$

再分别除以 $s_1$ 与 $s_1s_2$，最后拼接为检索特征：

$$f_{\mathrm{test}}= \left[ \frac{\log_o^\tau(z^p)}{s_1}; \frac{\log_o^\tau(z^c)}{s_1s_2} \right].$$

这一步同时保留 Parent 的跨视角身份信息与 Child 的视角特有信息。训练时双曲几何负责组织层级，最终检索特征则回到欧氏切空间完成后续度量流程。

### 4. 实验结论 (Results)
> **实验结果｜主结果（Table 1，表格局部）**
> ![](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@main/img/hihr-table1-results-v2.png)

- **数据集与指标：** AG-ReID v1、AG-ReID v2、LAGPeR、CARGO；使用 mAP 与 CMC Rank-1。
- **AG-ReID v1：** A→G 为 **79.21 mAP / 86.06 R1**，G→A 为 **81.28 / 87.94**。
- **AG-ReID v2：** A→C、C→A、A→W、W→A 的 mAP 分别为 **84.04、83.21、87.57、84.02**，六个方向均取得最高 mAP。
- **LAGPeR：** A→G、G→A、G→AG 分别达到 **33.80/46.95、36.74/39.30、23.99/31.39**（mAP/R1）。
- **CARGO：** ALL 为 **67.52/74.36**；最困难的 A→G 为 **70.53/75.53**，相对最强基线提升 **+1.53 mAP、+4.25 R1**。
- **组件消融：** CARGO ALL 从 baseline 的 **63.61/68.23**，加入 TMF 后变为 **65.46/72.08**，再加入 HHL 后达到 **67.52/74.36**。
- **层选择结论：** $\{5,8,12\}$ 优于仅第 12 层及相邻深层组合，说明收益来自跨深度互补，而不是堆叠更多层。

#### 消融实验如何支持方法设计

##### 四条 Entailment 约束是逐步互补的

Table 5 从没有 entailment loss 的 **64.62 mAP / 71.15 R1** 开始：

| 加入的约束 | CARGO ALL mAP / R1 | 论文给出的含义 |
|---|---:|---|
| 无 | 64.62 / 71.15 | 仅靠度量监督不足以维持层级 |
| $z^\pi\rightarrow z^c$ | 65.46 / 72.12 | Identity cone 限制 Child cluster 漂移 |
| 再加 $z_P^p\rightarrow z_P^c$ | 65.71 / 72.44 | 文本侧形成 Parent/Child 层级 |
| 再加两条 Prompt→Visual | **67.52 / 74.36** | 视觉与文本的两级语义同时对齐 |

第三行并非在所有协议上单调领先，例如 A→G mAP 会从 69.50 变为 68.21；完整四项联合才获得总体最佳结果。因此更稳妥的结论是“四种关系联合有效”，而不是每条约束在所有方向都独立增益。

##### Prompt 设计

| Prompt 方案 | CARGO ALL mAP / R1 |
|---|---:|
| 固定手工文本 | 64.58 / 68.91 |
| CoCoOp 实例条件 Prompt | 66.73 / 71.47 |
| HiHR 双层数据集级 Prompt | **67.52 / 74.36** |

作者据此认为 AG-ReID 的主要变化是较系统的视角差异，紧凑的数据集级双层 Prompt 比逐样本生成 Prompt 更合适。这是当前四个数据集上的经验结论，不能直接外推到所有跨域任务。

##### Fusion 设计

| 融合方式 | CARGO ALL mAP / R1 |
|---|---:|
| 各层 Class Token 均值 | 64.95 / 69.87 |
| 普通 Prompt-Class Cross Attention | 65.80 / 71.15 |
| 完整 TMF | **67.52 / 74.36** |

普通 Cross Attention 已优于静态均值；TMF 再复用层权重融合 patch tokens，ALL 设置相对普通 Cross Attention 提升 **+1.72 mAP / +3.21 R1**，支持“全局选层 + 局部补充”的设计。

#### 结果阅读中的边界

- HiHR 在 CARGO ALL 的 mAP 为 **67.52**，略高于 LATex 的 **67.09**；但 Rank-1 为 **74.36**，低于 LATex 的 **76.96**。因此“全面最优”不准确，更准确是多数设置下 mAP 最优、完整排序质量更强。
- 四个基准包含真实与合成数据，但论文仍主要是闭集检索协议；对未见平台、开放集身份和真实无人机部署的泛化尚未充分证明。
- HHL 的价值由组件和损失消融支持，但论文没有提供参数量、吞吐、显存和与参数量严格匹配的欧氏层级基线，难以把增益完全归因于负曲率几何。
- 论文展示了不同初始化的敏感性，却没有给出训练后 $s_1,s_2,\tau$ 的最终值及层级半径分布；“模型确实学到预期几何”的证据仍可加强。

---

## 深度阅读标注

### 核心创新/重点 (Key Ideas)
- 真正的创新点不是“使用双曲距离”，而是让共享身份信息成为父层、视角特有信息成为子层，使对齐与保留差异不再互相冲突。
- TMF 将文本提示当作多层视觉 token 的选择器，比固定加权或均值融合更有解释性。

### 重要概念/背景 (Concepts)
- **AG-ReID：** 查询与图库来自 aerial、ground、CCTV 或 wearable 等明显不同视角。
- **双曲层级：** 负曲率空间容量随半径指数增长，适合表达树状父子关系。
- **Entailment cone：** 约束子节点落在父节点诱导的锥体内，用几何关系显式编码层级。

### 实验数据/指标 (Results)
- 主表最稳定的优势体现在 mAP，说明 HiHR 改善的是完整候选排序，而非只改善第一个命中结果。
- TMF 对 CARGO A→G 带来 **+3.44 mAP / +4.26 R1**；HHL 继续把 ALL mAP 从 65.46 提升到 67.52。
- 对 $\lambda_e$、曲率和尺度初始化总体不敏感，但过小负曲率会明显退化。

### 数学推导/方法论 (Method)
- 复现时需逐项核对 exp/log map、Lorentz/Poincaré 表示转换、曲率可学习参数和数值裁剪。
- 父子层级损失与普通 CE/triplet 共同优化；仅有度量监督不足以维持稳定层级。

### 值得借鉴的灵感 (Inspiration)
- “共享因素作为父节点、域特有因素作为子节点”可迁移到 RGB-T 跟踪、跨摄像头检索和多传感器融合。
- 多层特征不必全部融合，可先用语言先验做语义筛选，再进入几何建模。

### 疑问/待进一步查阅 (Queries)
- 增益中有多少来自 CLIP 文本先验，有多少来自双曲层级？需要与参数量匹配的欧氏层级基线比较。
- CARGO 上 ALL Rank-1 低于 LATex，但 mAP 更高；真实部署应根据 Top-1 与整体排序需求选择。
- 双曲操作的训练稳定性、推理延迟和不同曲率参数化仍需代码级验证。

---

## 思考与行动
- **复现可能性：**
- [ ] Low
- [x] Medium
- [ ] High
- **相关工作：** LATex、ViSA、SeCap、SAS-VPReID；进一步比较语言辅助对齐与纯视觉域泛化路线。
- **迁移思考：** 可把 coarse/fine 双曲父子结构用于 RGB/IR 的身份共享—模态特有分解，并与 HHA 的 modality prototype 结合。
- [ ] 阅读仓库中 HHL 的曲率更新、cone aperture 与数值保护实现。
- [ ] 在统一 CLIP backbone 下重做欧氏层级与双曲层级的公平对比。
