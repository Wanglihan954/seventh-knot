---
title: "论文阅读｜CMRL：基于因果的模态与平台不变动态 RGBT 跟踪"
categories:
  - 视觉目标跟踪
tags:
  - "DRGBT"
  - "跨平台跟踪"
  - "缺失模态"
description: "本文首次系统定义 Dynamic RGBT Tracking（DRGBT） ：跟踪过程中，可用的 RGB/TIR 模态和观察平台都可能变化。作者提出 CMRL，通过“风格干预 + 因果一致性约束”学习模态/平台不变表征，并在平台切换时启动全局重定位；同时构建首个 DRGBT 基准 DRGBT603，包含 603 条序列、约 1.49M 帧对，其中 203 条真实采集、400 条合成。"
readmore: true
mathjax: true
venue: "IEEE Transactions on Image Processing"
cover: "https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@9d8ebc3c9d7a900f6e398300db666643e9044162/img/CMRL/fig1-dynamic-rgbt-task.png"
paper_url: "https://doi.org/10.1109/TIP.2026.3674367"
code_url: "https://github.com/dongdong2061/DRGBT"
date: 2026-10-03 20:00:00
updated: 2026-10-03 23:00:00
abbrlink: "bc510b9"
---
> 本文根据个人阅读笔记整理。图表来自原论文或公开页面，仅用于学习与讨论。

**Venue:** IEEE Transactions on Image Processing  
**Paper:** [原文访问](https://doi.org/10.1109/TIP.2026.3674367)  
**GitHub:** [代码与数据](https://github.com/dongdong2061/DRGBT)  

<!-- more -->

## CMRL：基于因果的模态与平台不变动态 RGBT 跟踪

> **摘要｜一句话总结**
> 本文首次系统定义 **Dynamic RGBT Tracking（DRGBT）**：跟踪过程中，可用的 RGB/TIR 模态和观察平台都可能变化。作者提出 CMRL，通过“风格干预 + 因果一致性约束”学习模态/平台不变表征，并在平台切换时启动全局重定位；同时构建首个 DRGBT 基准 DRGBT603，包含 603 条序列、约 1.49M 帧对，其中 203 条真实采集、400 条合成。

### 0. 论文信息与核心贡献

| 项目 | 内容 |
|---|---|
| 论文 | *Causality-Based Modality- and Platform-Invariant Representation Learning for Dynamic RGBT Tracking and a Benchmark* |
| 期刊 | IEEE TIP, Vol. 35, pp. 3141–3156, 2026 |
| 方法简称 | CMRL（本文按论文主题简称） |
| 基础跟踪器 | OSTrack |
| 预训练权重 | DropMAE |
| 新任务 | Dynamic RGBT Tracking |
| 新数据集 | DRGBT603 |
| 代码与数据 | <https://github.com/dongdong2061/DRGBT> |

本文的贡献可以拆成三个层次：

1. **任务层**：指出传统 RGBT 的固定模态、固定平台假设不适合协同监控；
2. **方法层**：提出 Causal Consistency Encoder（CCE）与 Global Re-localization Mechanism（GRM）；
3. **数据层**：构建 DRGBT603，并给出常规 RGBT 方法在动态场景下的统一评测。

---

## 1. 研究问题：DRGBT 与传统 RGBT 有何不同？

### 1.1 传统 RGBT 的固定假设

传统 RGBT 跟踪通常假设每个时刻都存在同步的 RGB–TIR 图像对，并且整段视频由同一平台拍摄：

$$\hat b_t=f_\theta(I_t^R,I_t^T,z^R,z^T).$$

这种设置主要研究双模态互补融合，却没有覆盖：

- RGB 或 TIR 在跟踪途中消失；
- 输入由双模态变成单模态，之后又恢复；
- 目标从无人机交接给地面相机，或反向交接；
- 平台切换后目标位置、尺度和观察视角突然改变。

### 1.2 DRGBT 的任务定义

DRGBT 中的观测写成：

$$O_t=\{I_t^m\mid m\in\mathcal M_t\}, \qquad \mathcal M_t\subseteq\{R,T\}, \qquad p_t\in\mathcal P,$$

其中 $\mathcal M_t$ 表示当前可用模态，$p_t$ 表示当前平台；二者都可以随时间变化。

![Figure 1：传统 RGBT 跟踪失败后，DRGBT 通过平台切换继续跟踪](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@9d8ebc3c9d7a900f6e398300db666643e9044162/img/CMRL/fig1-dynamic-rgbt-task.png)

图 1 展示了任务的关键区别：目标在无人机画面中完全受遮挡后，传统跟踪器丢失目标；DRGBT 系统可以切换到另一个监控平台继续跟踪。这里的“切换”不只是更换一帧图像，而是切换整个观测生成机制。

### 1.3 三类动态序列

DRGBT603 按变化来源分成：

| 子集 | 模态变化 | 平台变化 | 序列数 |
|---|:---:|:---:|---:|
| MVO | ✓ | ✗ | 201 |
| PVO | ✗ | ✓ | 167 |
| CV | ✓ | ✓ | 235 |
| 合计 |  |  | 603 |

其中 CV 同时包含模态与平台变化，是最接近复杂协同感知的设置。

---

## 2. 因果建模：作者真正做了什么？

### 2.1 结构因果模型

论文把影响跟踪的潜在因素分为：

- $T$：target-related causal factors，目标身份、状态和定位相关信息；
- $M$：target-irrelevant factors，模态与平台带来的观察风格；
- $X$：实际观测图像；
- $B$：目标边界框。

其直觉是：$T$ 和 $M$ 共同决定观测 $X$，但可靠定位应该依赖目标因素 $T$，而不是偶然绑定某个模态或平台的外观风格。

![Figure 2：DRGBT 的结构因果图，目标相关因素 T 决定边界框 B，模态与平台因素 M 只影响观测 X](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@9d8ebc3c9d7a900f6e398300db666643e9044162/img/CMRL/fig2-causal-graph.png)

作者希望在干预 $M$ 后，目标预测机制仍保持稳定：

$$P(B\mid do(M),T)\approx P(B\mid T).$$

换句话说，改变 RGB/TIR 风格或平台视角时，只要目标身份与状态没有改变，模型仍应关注同一个目标。

> **说明｜“因果”的准确理解**
> 论文没有从数据中识别一个完整、可验证的物理因果图。它把特征均值和方差视作模态/平台风格的代理变量，在特征空间随机扰动这些统计量，再用一致性损失约束输出。因此，这里更准确的理解是：**用近似干预实现不变表示学习**。

### 2.2 两个关键假设

方法成立依赖两个重要假设：

1. **独立生成假设**：$T\perp M$，目标身份与所用模态/平台相互独立；
2. **风格代理假设**：模态和视角变化至少可以部分由中间特征的通道均值、方差描述。

这两个假设带来可操作的训练方法，但也构成局限：严重遮挡、极弱目标或强噪声下，特征统计可能主要由背景决定，此时改变“风格统计”也可能破坏目标信息。

---

## 3. 方法总览

![CMRL 总体框架](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/CMRL/fig3-overall-framework.png)

整体框架由两部分组成：

| 模块 | 工作阶段 | 主要职责 |
|---|---|---|
| Causality-inspired Dynamic Tracker | 正常连续跟踪 | 适配单/双模态输入，学习模态不变特征 |
| Platform-independent Global Searcher | 平台切换后 | 在整幅新平台图像中重新找到目标 |

作者采用两阶段训练，以避免动态跟踪器和全局搜索器互相干扰：

```text
阶段 1：训练 Dynamic Tracker
  OSTrack + Causal Consistency Encoder
  目标：适应 RGB/TIR/RGBT 状态变化

阶段 2：训练 Global Searcher
  ResNet-50 双分支 + 风格干预 + 响应一致性
  目标：平台切换后全局重定位
```

风格干预模块只在训练时开启，推理时关闭，因此不会在测试时随机修改特征。

---

## 4. Causal Consistency Encoder（CCE）

### 4.1 用特征统计模拟模态变化

设中间特征为 $x$，其通道均值和标准差分别为 $\mu(x)$ 和 $\sigma(x)$。作者利用小批量内特征统计的变化估计不确定性 $\Sigma_\mu(x)$、$\Sigma_\sigma(x)$，随机采样新的风格参数：

$$\beta(x)=\mu(x)+\epsilon_\mu\Sigma_\mu(x), \qquad \epsilon_\mu\sim\mathcal N(0,1),$$

$$\gamma(x)=\sigma(x)+\epsilon_\sigma\Sigma_\sigma(x), \qquad \epsilon_\sigma\sim\mathcal N(0,1).$$

参考 AdaIN，将原特征替换为：

$$x'=\gamma(x)\odot \frac{x-\mu(x)}{\sigma(x)} +\beta(x).$$

这一步保留归一化后的内容结构，同时随机改变特征的“风格”。作者把它解释为对潜在模态/平台变量 $M$ 的近似干预。

### 4.2 构造四种模板—搜索组合

设模板特征为 $Z$、搜索区域特征为 $S$，干预后的特征为 $Z'$、$S'$。CCE 构造：

$$\begin{aligned} x^1&=[Z,S],\\ x^2&=[Z',S],\\ x^3&=[Z',S'],\\ x^4&=[Z,S']. \end{aligned}$$

目的不是要求四组原始特征完全相同，而是要求它们经过注意力匹配后仍聚焦到同一目标。

### 4.3 因果一致性损失

四种组合经过共享参数的 Transformer 编码器，得到注意力矩阵集合。上下两条模态分支分别聚合为 $\hat A_{up}$ 与 $\hat A_{down}$，使用 KL 散度约束：

$$\mathcal L_{ccl} =D_{KL}\!\left( \hat A_{up}\parallel\hat A_{down} \right).$$

这相当于要求：即使模板或搜索区域的模态风格受到干预，两条分支的目标注意分布仍然一致。

### 4.4 CCE 插入位置

作者不是替换所有层，而是在 OSTrack 的第 1、4、7、10 个编码块中加入 style intervener 与一致性约束。消融表明，分散插入浅层、中层和深层优于只替换连续的前四层或后四层，因为不同层次分别编码局部外观、结构和语义。

---

## 5. 平台无关全局搜索与重定位

### 5.1 为什么局部搜索一定会失败？

常规 SOT 假设相邻帧目标位置连续，并围绕上一帧位置裁剪局部搜索区域。平台切换后，新旧图像坐标之间通常没有直接关系：

$$\lVert c_t-c_{t-1}\rVert \gg r_{local}.$$

如果目标根本不在局部窗口内，再强的融合网络也无法找回目标。因此 CMRL 把平台切换处理为一次全局重检测问题。

### 5.2 Global Searcher 的结构

- ResNet-50 提取模板和候选搜索区域特征；
- RGB/TIR 双分支共享权重；
- 使用滑窗遍历整幅图像，产生候选区域；
- 模板与候选特征执行互相关，生成响应图；
- 预测头输出位置和分类置信度；
- 训练阶段同样加入 style intervener；
- 一致性约束施加在上下分支的互相关响应图上。

响应一致性损失为：

$$\mathcal L'_{ccl} =D_{KL}\!\left( \hat C_{up}\parallel\hat C_{down} \right).$$

### 5.3 测试时工作流

![CMRL 测试时的动态跟踪与全局重定位流程](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/CMRL/fig5-inference-workflow.png)

测试逻辑可以写成：

```text
读取当前模态与平台状态
        ↓
平台没有变化？ ── 是 → Dynamic Tracker 局部跟踪
        │
        否
        ↓
Global Searcher 全图滑窗 → 生成候选区域
        ↓
Dynamic Tracker 重新验证候选
        ↓
最高分类分数 > σ=0.6？
        ├─ 是：接受重定位结果，恢复正常跟踪
        └─ 否：下一帧继续全局搜索
```

模型还根据输入是否属于同一模态，在单分支与双分支特征提取之间切换，以减少单模态状态下的计算。

> **注意｜一个重要实验前提**
> 论文通过读取数据集提供的平台切换标签来决定何时启动 GRM。真实部署中，平台切换事件未必是已知的，因此“在线检测切换点”仍是未解决问题。

---

## 6. 两阶段训练目标

动态跟踪器与全局搜索器分别优化：

$$\mathcal L_{stage1} =\mathcal L_{cls} +\lambda_1\mathcal L_1 +\lambda_2\mathcal L_{giou} +\lambda_3\mathcal L_{ccl},$$

$$\mathcal L_{stage2} =\mathcal L_{cls} +\lambda_1\mathcal L_1 +\lambda_2\mathcal L_{giou} +\lambda_3\mathcal L'_{ccl}.$$

其中：

- $\mathcal L_{cls}$：加权 focal loss；
- $\mathcal L_1$：边界框 L1 回归损失；
- $\mathcal L_{giou}$：GIoU 损失；
- $\lambda_1=5$，$\lambda_2=2$，$\lambda_3=1$。

训练设置：

| 项目 | 阶段 1 | 阶段 2 |
|---|---:|---:|
| 训练对象 | Dynamic Tracker | Global Searcher |
| Batch size | 16 | 32 |
| Epoch | 15 | 沿用主要设置 |
| Backbone LR | $10^{-5}$ | 同阶段 1 |
| 其他参数 LR | $10^{-4}$ | 同阶段 1 |
| Optimizer | AdamW | AdamW |
| Weight decay | $10^{-4}$ | $10^{-4}$ |

学习率在第 10 个 epoch 衰减为原来的 0.1；随机种子为 0，增强包括亮度扰动、随机水平翻转、随机灰度化和颜色空间变换。

---

## 7. DRGBT603 数据集

### 7.1 总体组成

| 项目 | DRGBT603 |
|---|---:|
| 序列数 | 603 |
| 帧对 | 约 1.49M |
| 类别 | 29 |
| 属性 | 12 |
| 真实采集 | 203 |
| 合成序列 | 400 |
| MVO / PVO / CV | 201 / 167 / 235 |

### 7.2 真实数据采集

作者使用两台 DJI 无人机和一台海康双目 RGB–TIR 手持相机，从不同区域/平台拍摄同一个目标：

1. 先完成同一设备内 RGB 与 TIR 序列的空间对齐；
2. 找到不同平台拍摄的同一目标；
3. 按时间顺序裁剪并拼接对应序列；
4. 构造包含模态变化和平台交接的连续跟踪序列。

![DRGBT603 类别、挑战属性和目标尺寸统计](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/CMRL/fig6-8-dataset-statistics.png)

29 类目标中 person、car、bike、e-bike 和 bus 最常见，也包含 fox、helmet、cigarette 等长尾类别。由于含有大量 UAV 数据，目标宽高多集中在约 100 像素及以下，小目标占比较高。

### 7.3 合成数据如何构造？

400 条合成序列来自 RGBT234、LasHeR 和 VTUAV：

- **模拟模态变化**：在不同时间段保留 RGB-only、TIR-only 或双模态输入；
- **模拟平台变化**：随机丢弃部分帧并修改相应真值，制造位置和时间上的不连续；
- 为合成序列补充模态标签和平台切换标签。

需要注意：随机丢帧可以制造轨迹不连续，却无法生成真正由地面侧视切换到无人机俯视时的外观、尺度和结构变化。这正是后续 [DRGBT-1K](/posts/147fa31e/) 改为全真实跨平台采集的原因。

### 7.4 标注

- 边界框采用 $[x,y,w,h]$；
- 使用 ViTBAT 辅助逐帧标框；
- 提供逐帧模态标签；
- 提供平台是否切换的布尔标签；
- 提供序列级挑战属性。

### 7.5 12 种挑战属性

![DRGBT603 属性定义及各属性/MVO/PVO/CV 的跟踪结果](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/CMRL/tab2-3-attributes-and-subsets.png)

| 属性 | 含义 | 论文判据或说明 |
|---|---|---|
| PO | Partial Occlusion | 局部遮挡 |
| HO | Heavy Occlusion | 遮挡面积超过 80% |
| LI | Low Illumination | 目标区域照度过低 |
| LR | Low Resolution | 分辨率不足以提取稳定特征 |
| BC | Background Clutter | 背景复杂、干扰显著 |
| HI | High Illumination | 强光导致难以识别 |
| SA | Similar Appearance | 目标附近存在相似物体 |
| FL | Frame Lost | 部分热红外帧丢失 |
| SO | Small Object | 宽和高均小于 50 像素 |
| FM | Fast Motion | 相邻帧中心移动超过 20 像素 |
| SV | Scale Variation | 论文定义为尺度比超出 $[0.5,1]$ |
| OV | Out-of-View | 目标离开视野 |

属性数量最多的是 HO 318、SA 288、BC 242 和 OV 222；FL 只有 10 条，属性分布明显长尾。

---

## 8. 实验结果

### 8.1 评测协议

作者在 DRGBT603 训练集上重新训练 9 个代表性跟踪器，并在测试集统一评测，包括 TBSI、CKD、AINet、AFter、STTrack、OSTrack、OSTrack+DropMAE、SeqTrackv2 和 CAFormer。

指标为：

- PR：20 像素中心精度；
- NPR：按目标尺寸归一化的精度；
- SR：IoU 成功率曲线 AUC。

### 8.2 总体结果

![DRGBT603 总体结果、真实/合成子集和模态分布](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@0df6e1a/img/rgbt-notes/CMRL/fig10-tab4-overall-real-synthetic-clean.png)

CMRL 达到：

| PR | NPR | SR |
|---:|---:|---:|
| 57.4 | 51.4 | 41.3/41.4 |

图 10 报告 SR 为 41.3%，消融表经过四舍五入报告 41.4%，笔记保留这一口径差异。

与强基线相比，CMRL 的优势主要来自两点：

1. CCE 减少模态变化造成的模板—搜索不一致；
2. GRM 允许平台切换后跳出上一帧局部搜索范围。

### 8.3 MVO、PVO、CV 与属性结果

表 III 中 CMRL 的 PR/SR 为：

| 子集 | PR | SR |
|---|---:|---:|
| MVO | 63.4 | 47.2 |
| PVO | 56.7 | 44.0 |
| CV | 51.9 | 34.8 |

CV 的 SR 显著低于 MVO/PVO，说明当模态与平台同时变化时，即使有不变表示和全局重定位，精细边界框定位仍然很困难。

CMRL 在 HO、PO、LI、BC、SA、FL、FM 等多数属性上取得最佳结果；在 LR、HI、SO、SV 等属性上并非始终第一。这意味着方法主要改善“输入分布突变和重定位”，但不会自动解决所有小目标和低分辨率问题。

### 8.4 真实数据与合成数据差异

真实测试子集：53.0 PR / 44.2 NPR / 32.4 SR；合成测试子集：60.3 / 55.8 / 46.9。合成数据明显更容易。

模态分布也不一致：

- 真实子集中 RGBT/RGB/TIR 约为 48.8%/25.2%/25.9%；
- 合成子集中 RGBT/RGB/TIR 约为 61.6%/14.6%/23.8%。

真实数据更多集中在 CV、HO、LI、LR、OV 等困难条件；合成数据则更偏向 MVO、PO、SA、SO。这证明“合成数量很多”不代表覆盖了真实跨平台分布。

### 8.5 公平初始化比较与组件消融

![真实/合成难度差异、统一初始化比较以及 CCE/GRM 消融](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@0df6e1a/img/rgbt-notes/CMRL/fig12-tab5-7-ablation-clean.png)

| CCE | GRM | PR | NPR | SR |
|:---:|:---:|---:|---:|---:|
|  |  | 48.4 | 46.1 | 37.0 |
| ✓ |  | 51.9 | 49.4 | 39.7 |
| ✓ | ✓ | **57.4** | **51.4** | **41.4** |

CCE 相对基线提升 3.5 PR、3.3 NPR、2.7 SR；加入 GRM 后 PR 又提升 5.5，说明平台切换造成的全局位置跳变是主要误差来源。

随着 CCE 从一层逐渐扩展到第 1/4/7/10 层，结果从 52.7/47.3/38.2 提升至 57.4/51.4/41.4，支持多层次干预的设计。

### 8.6 插层位置和超参数

![平台切换定性结果、CCE 插层位置和一致性权重消融](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@0df6e1a/img/rgbt-notes/CMRL/fig13-tab8-10-qualitative-ablation-clean.png)

- CCE 放在 $[1,4,7,10]$ 层时取得最佳 57.4/51.4/41.4；
- 全局重定位接受阈值 $\sigma=0.6$ 最优；
- 一致性损失权重 $\lambda_3=1.0$ 最优；
- 阈值过高时，正确候选难以被接受，跟踪器会长期停留在重定位状态。

定性结果显示，在平台和模态同时变化后，STTrack、CKD、TBSI、SeqTrackv2 容易漂移到相似目标或背景，而 CMRL 能通过全局搜索继续跟踪。

### 8.7 跨数据集泛化

作者把 GTOT 处理成模拟动态版本，CMRL 达到 79.3 MPR / 68.7 MSR：

| 方法 | MPR | MSR |
|---|---:|---:|
| TBSI | 73.8 | 61.7 |
| CAFormer | 61.8 | 51.6 |
| Baseline | 73.7 | 63.9 |
| CMRL | **79.3** | **68.7** |

相对基线提升 5.6 MPR、4.8 MSR，说明 CCE 学到的表征并非只适用于 DRGBT603；但 GTOT 的动态变化仍是模拟生成，尚不能证明对未知真实平台的开放域泛化。

### 8.8 表征可视化与效率

![CMRL 的 T-SNE、失败模式与速度/显存分析](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@0df6e1a/img/rgbt-notes/CMRL/fig15-16-tab14-representation-efficiency-clean.png)

T-SNE 显示 CMRL 的 RGB/TIR 特征分布比基线更接近，注意力也更集中于目标。但论文同时展示了失败情况：当夜间 RGB 完全无法提供目标信息时，两模态特征仍明显分离，不变性机制不能从无效观测中“创造”身份线索。

| 方法 | 正常跟踪 FPS | 重定位 FPS | 参数量 | 显存 |
|---|---:|---:|---:|---:|
| Baseline | 46 | – | 92.2M | 1236 MB |
| CMRL | 55 | 16 | 125.9M | 1236–1426 MB |

正常跟踪阶段由于可按模态数量切换单/双分支，CMRL 反而比基线快；一旦启动全图滑窗重定位，速度降至 16 FPS。

---

## 9. 论文的真正创新点

### 9.1 不是又一个融合模块

大多数 RGBT 方法默认目标一定在局部搜索区域内，研究如何融合 RGB/TIR。CMRL 指出：平台切换后目标可能根本不在窗口里，所以必须改变搜索机制。这一问题分解比单纯增加 cross-attention 更符合任务结构。

### 9.2 把模态变化转成训练时干预

CCE 不尝试生成缺失图像，而是随机改变中间特征风格，并要求目标注意保持一致。相比直接 RGB↔TIR 图像翻译，它避免把生成质量当作跟踪上限。

### 9.3 首次形成 DRGBT 研究闭环

论文同时提供任务、方法、数据集、动态子集和评测协议，使“动态 RGBT”从应用设想变成可训练、可比较的问题。

---

## 10. 局限与批判性分析

### 10.1 因果干预只是近似

通道均值/方差不仅包含模态风格，也可能携带目标亮度、尺度和结构信息。随机扰动不保证只改变非因果因素 $M$。因此一致性提升可以解释为强数据增强或域泛化正则化，不能单凭实验断言已恢复真实因果因素。

### 10.2 平台切换标签是已知的

GRM 由数据集平台标签触发，绕过了真实系统中的切换检测问题。完整系统还需要判断：何时是普通快速运动、何时是平台交接、何时只是丢帧或遮挡。

### 10.3 合成跨平台变化不够真实

随机丢帧制造的是轨迹跳变，不会产生真正的俯视/侧视差异、目标结构变化、相机内参与成像噪声变化。400/603 的合成比例会明显影响训练分布。

### 10.4 全局滑窗效率有限

重定位只有 16 FPS。面对高分辨率 UAV 图像和极小目标时，滑窗粒度、召回率和计算成本之间存在明显矛盾。

### 10.5 两阶段训练隔离了两个模块

两阶段训练避免相互干扰，但 Dynamic Tracker 与 Global Searcher 无法联合优化候选生成和验证。候选区域质量、定位置信度与后续模板更新之间仍是手工流程。

### 10.6 极弱模态下不变性失效

论文自己指出，在完全夜间 RGB、严重遮挡、重噪声或目标特征极弱时，特征统计由背景/破坏信息主导；此时 style intervention 可能影响真正的目标相关因素。

### 10.7 与未配准问题尚未统一

DRGBT603 的真实 RGB/TIR 对先完成配准。方法主要解决模态和平台分布变化，没有显式估计跨模态空间偏移。自然未配准与平台切换同时出现时，逐 token 融合和一致性约束仍可能受到错误对应影响。

---

## 11. 与 DRGBT-1K 的关系

| 维度 | CMRL / DRGBT603 | DRGBT-1K |
|---|---|---|
| 作用 | 首次定义任务并提出专用方法 | 扩大并提高真实数据质量 |
| 序列 | 603 | 1,045 |
| 真实/合成 | 203 / 400 | 1,045 / 0 |
| 类别/属性 | 29 / 12 | 24 / 15 |
| 专用方法 | CMRL | 主要提供统一基准 |
| 派生任务 | 无 | Unaligned DRGBT-1K、UGVT-1K |

DRGBT-1K 不是取代 CMRL 的方法论文，而是针对 DRGBT603 的数据真实性和规模限制做的下一步工作。CMRL 在 DRGBT-1K 上的总体结果为 43.03 PR / 38.48 NPR / 31.82 SR；它在 PVO/CV 等平台切换子集仍有优势，但总体不如部分强常规 RGBT 方法，说明只学习不变性可能损失模态特异的互补信息。

---

## 12. 对后续研究的启示

可以在 CMRL 基础上继续推进：

1. **共享—特异联合表示**：保留平台/模态不变身份信息，同时显式保存 RGB/TIR 特有线索；
2. **切换点在线检测**：不再依赖已知平台标签；
3. **粗到细重定位**：用候选生成或跨平台先验替代密集滑窗；
4. **质量感知专家路由**：极弱模态时不要强行对齐，转入单模态或历史记忆专家；
5. **未配准 DRGBT**：把几何对齐不确定性纳入因果一致性约束；
6. **防污染模板记忆**：平台切换后只有高置信候选才能更新长期模板；
7. **小目标专用特征**：在 CV×SO/LR/SV 子集检验全局搜索能否真正发现 UAV 小目标。

---

## 13. 最终结论

CMRL 最重要的贡献不是它在 DRGBT603 上取得 57.4 PR，而是建立了一个新的问题框架：

$$\boxed{ \text{模态变化}\rightarrow\text{不变表征}, \qquad \text{平台变化}\rightarrow\text{全局重定位} }$$

这个分解抓住了 DRGBT 与传统 RGBT 的本质区别。CCE 证明风格干预和一致性学习能够缓解模态变化，GRM 证明跨平台任务必须突破局部搜索假设。但方法仍依赖已知平台标签、近似因果假设和大量合成数据；它更像 DRGBT 的第一个可工作的基线和研究起点，而不是最终解决方案。

---

### 资源

- 论文 DOI：<https://doi.org/10.1109/TIP.2026.3674367>
- 官方代码与 DRGBT603：<https://github.com/dongdong2061/DRGBT>
- 本地 PDF：`D:\文献\Zotero\storage\ZAA4EDZV\Ding 等 - 2026 - Causality-based modality- and platform-invariant representation learning for dynamic RGBT tracking a.pdf`
- 方向综述：[DRGBT动态RGBT跟踪方向综述](/posts/3340bff1/)
- 后续数据集：[DRGBT-1K](/posts/147fa31e/)
