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
updated: 2026-09-17 21:26:15
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

## 论文资源
- **Paper:** <https://arxiv.org/abs/2607.09186>

---

## 论文大纲

## 1. 动机与挑战 (Motivation & Challenges)
- **跨视角差异极端：** 航拍与地面相机在俯仰角、人体尺度、遮挡和背景上存在明显域差异。
- **直接对齐的副作用：** 只追求视角不变性容易造成 feature collapse，把某个视角下仍有判别力的局部信息一并抹去。
- **平坦空间的限制：** 欧氏嵌入不擅长表达“共享身份语义—视角特有细节”的天然层级结构。

## 2. 核心贡献 (Key Contributions)
- [x] 提出 **MFE**，从 CLIP 图像编码器第 5、8、12 层提取互补的多粒度视觉 token。
- [x] 提出 **TMF**，用视角无关与视角相关文本特征作为语义查询，自适应融合 class/patch token。
- [x] 提出 **HHL**，在 Lorentz/双曲空间中用父—子层级同时保留跨视角一致性和视角特有判别信息。
- [x] 在 AG-ReID v1/v2、LAGPeR、CARGO 四个基准上验证泛化性。

## 3. 技术路线 (Methodology)
> **核心架构图（Fig. 2，已按图体裁剪）**
> ![](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@main/img/hihr-fig2-framework-v2.png)

- **MFE：** 以 CLIP ViT-B/16 为骨干，跨深度抽取 class token 与 patch token；中层补充局部结构，高层提供身份语义。
- **双层提示：** view-agnostic prompt 强调共享身份证据，view-aware prompt 显式承载 aerial/ground 条件。
- **TMF：** 文本特征作为 semantic query 选择各层 class token，再复用注意力权重聚合 patch token，避免简单平均造成冗余。
- **HHL：** 粗粒度父节点组织视角无关身份信息，细粒度子节点保存视角特有线索；entailment cone 约束父子关系，度量损失维持身份可分性。
- **训练细节：** A800；CLIP 预训练部分学习率 $5\times10^{-6}$；默认层集合 $\{5,8,12\}$，$\lambda_e=5$，曲率初始化 $\tau=1.0$，尺度初始化 $(s_1,s_2)=(0.5,2.0)$。

## 4. 实验结论 (Results)
> **主结果（Table 1，表格局部）**
> ![](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@main/img/hihr-table1-results-v2.png)

- **数据集与指标：** AG-ReID v1、AG-ReID v2、LAGPeR、CARGO；使用 mAP 与 CMC Rank-1。
- **AG-ReID v1：** A→G 为 **79.21 mAP / 86.06 R1**，G→A 为 **81.28 / 87.94**。
- **AG-ReID v2：** A→C、C→A、A→W、W→A 的 mAP 分别为 **84.04、83.21、87.57、84.02**，六个方向均取得最高 mAP。
- **LAGPeR：** A→G、G→A、G→AG 分别达到 **33.80/46.95、36.74/39.30、23.99/31.39**（mAP/R1）。
- **CARGO：** ALL 为 **67.52/74.36**；最困难的 A→G 为 **70.53/75.53**，相对最强基线提升 **+1.53 mAP、+4.25 R1**。
- **组件消融：** CARGO ALL 从 baseline 的 **63.61/68.23**，加入 TMF 后变为 **65.46/72.08**，再加入 HHL 后达到 **67.52/74.36**。
- **层选择结论：** $\{5,8,12\}$ 优于仅第 12 层及相邻深层组合，说明收益来自跨深度互补，而不是堆叠更多层。

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
