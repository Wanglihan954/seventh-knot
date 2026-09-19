---
title: "论文阅读｜HPL: Hierarchical Prompt Learning for Image- and Text-Based Person Re-Identification"
categories:
  - 目标重识别
tags:
  - "文献笔记"
  - "AI论文"
  - "目标重识别"
  - "Person Re-ID"
  - "图文行人重识别"
  - "提示学习"
  - "CLIP"
  - "AAAI"
description: "HPL 试图用一个模型同时完成 image-to-image（I2I）与 text-to-image（T2I）行人重识别。其关键是先用双分类 token 隔离任务偏好，再用身份级和实例级提示补足共享语义，最后通过跨模态提示正则化限制图像与文本伪提示的偏移，从而缓解朴素联合训练中的语义冲突。"
readmore: true
mathjax: true
date: 2026-09-17 21:26:16
updated: 2026-09-17 21:26:16
abbrlink: "22166495"
---
> 本文基于论文、公开代码与本地阅读笔记整理；论文插图仅用于学习与讨论。

## 论文信息
**Title:** Hierarchical Prompt Learning for Image- and Text-Based Person Re-Identification  
**Authors:** Linhan Zhou, Shuang Li, Neng Dong, Yonghang Tai, Yafei Zhang, Huafeng Li  
**Venue:** AAAI 2026  
**DOI:** 10.1609/aaai.v40i16.38380  
**GitHub:** https://github.com/LH-Z-Ac/HPL-AAAI26  
**IF/Level:** AAAI 2026 | CCF-A

> **摘要**
> HPL 试图用一个模型同时完成 image-to-image（I2I）与 text-to-image（T2I）行人重识别。其关键是先用双分类 token 隔离任务偏好，再用身份级和实例级提示补足共享语义，最后通过跨模态提示正则化限制图像与文本伪提示的偏移，从而缓解朴素联合训练中的语义冲突。

<!-- more -->

---

## 论文资源
- **Paper:** <https://arxiv.org/abs/2511.13575>

---

## 论文大纲

## 1. 动机与挑战 (Motivation & Challenges)
- **任务偏好不同：** I2I 依赖跨视角稳定的身份外观，T2I 需要对齐文本描述中的包、手机、颜色等实例细节。
- **共享表示冲突：** 单个 CLS token 同时服务两任务时，梯度和注意区域相互干扰，联合训练可能不如单任务训练。
- **监督粒度不足：** 只有身份标签或整句文本难以同时覆盖身份级共性与样本级差异。

## 2. 核心贡献 (Key Contributions)
- [x] 提出 **Task-Routed Transformer（TRT）**，用双 CLS token 在共享视觉编码器内形成任务专属路径。
- [x] 提出身份级 learnable token 与实例级 pseudo-text token 组成的 **Hierarchical Prompt Learning**。
- [x] 通过视觉/文本反演网络产生实例提示，并以 **CMPR** 约束跨模态提示一致性。
- [x] 在三个 T2I 与三个 I2I 基准上统一评估，同一模型兼顾两类检索。

## 3. 技术路线 (Methodology)
> **核心架构图（Fig. 2，已按图体裁剪）**
> ![](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@main/img/hpl-fig2-framework-v2.png)

- **TRT：** 在同一视觉 Transformer 中放入 I2I-CLS 与 T2I-CLS，既共享主干参数，又保留任务特定聚合路径。
- **身份级提示：** 每个身份对应一组可学习 token，表达相对稳定的身份语义。
- **实例级提示：** 图像和文本分别通过 inversion network 生成 pseudo-token，表达当前样本中的细节。
- **提示模板：** “A photo of [id-tokens] and [inst-tokens] person”，再经文本编码器产生层级语言监督。
- **CMPR：** 最小化图像引导提示与文本引导提示的 Frobenius 距离，防止两种实例提示在共享空间中漂移。
- **训练细节：** 两阶段训练；第二阶段 60 epochs，前 5 epochs warm-up（$10^{-6}\rightarrow10^{-5}$）后 cosine annealing；每批 64 个图文对 + 64 张 I2I 图像；单卡 RTX 4090；$\lambda_1=0.4,\lambda_2=0.06$。

## 4. 实验结论 (Results)
> **主结果（Table 1，表格局部）**
> ![](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@main/img/hpl-table1-results-v2.png)

- **T2I 数据集：** CUHK-PEDES、ICFG-PEDES、RSTPReID；HPL 的 Rank-1/mAP 分别为 **76.28/70.90、66.61/44.14、64.00/53.13**。
- **I2I 数据集：** Market1501、MSMT17、DukeMTMC；Rank-1/mAP 分别为 **95.99/89.82、91.04/79.01、90.35/82.93**。
- **TRT 消融：** 相比单 CLS baseline，T2I Rank-1 从 74.22 升至 75.27，I2I mAP 从 86.91 升至 88.98。
- **完整组件：** TRT→TRT+HPL→TRT+HPL+CMPR 的 T2I Rank-1 为 **75.27→75.60→76.28**，I2I mAP 为 **88.98→89.72→89.82**。
- **结论：** TRT 负责减少任务干扰，HPL 补充分层语义，CMPR 的主要价值是稳定跨模态实例提示；三者作用互补。

---

## 深度阅读标注

### 核心创新/重点 (Key Ideas)
- 这篇工作的重点不是单纯 prompt tuning，而是“先路由、再共享”：任务特定 CLS token 负责隔离冲突，提示空间再承担跨任务语义连接。
- 身份级与实例级提示对应 ReID 中长期稳定属性和当前样本细节，粒度划分清晰。

### 重要概念/背景 (Concepts)
- **I2I ReID：** 图像查询图像；更依赖跨视角身份一致性。
- **T2I ReID：** 文本查询图像；更依赖描述中显式出现的局部属性。
- **Prompt inversion：** 从输入模态反推出可送入文本编码器的 pseudo-token，而不是只使用固定自然语言模板。

### 实验数据/指标 (Results)
- CUHK-PEDES 上相对 IRRA，HPL 从 73.38/66.13 提升到 **76.28/70.90**（Rank-1/mAP）。
- MSMT17 上相对 CLIP-ReID，HPL 从 88.70/73.40 提升到 **91.04/79.01**。
- 完整模型相对 baseline：T2I Rank-1 **+2.06**，I2I mAP **+2.91**；联合建模没有以牺牲某一任务为代价。

### 数学推导/方法论 (Method)
- CMPR 形式为图像/文本伪提示矩阵之间的 $\|P_i^t-P_i^v\|_F^2$，本质上是 prompt-level consistency regularization。
- 复现时要特别确认 identity label 在不同数据集组合中的重新编号以及 test sample 排除策略，避免数据泄漏。

### 值得借鉴的灵感 (Inspiration)
- 多任务共享编码器出现负迁移时，可先用少量任务 token 隔离聚合路径，再在更高层语义空间做一致性约束。
- 层级提示可迁移为“身份级—轨迹级—帧级”三级结构，用于视频 ReID。

### 疑问/待进一步查阅 (Queries)
- 与两个独立模型相比，统一模型的参数量、吞吐和部署收益是否足以抵消两阶段训练复杂度？
- CMPR 对未见描述风格、噪声文本和属性缺失是否稳健？
- Table 4 中双模态实例提示对 T2I 增益较小，是否说明文本监督已足够强？

---

## 思考与行动
- **复现可能性：**
- [ ] Low
- [x] Medium
- [ ] High
- **相关工作：** CLIP-ReID、IRRA、TBPS-CLIP；重点比较共享骨干、任务 token 与 prompt inversion 的差别。
- **迁移思考：** 可把 TRT 的双 CLS 设计用于 RGB/IR 双模态任务，再把实例 prompt 与 HHA 的共享身份原型结合。
- [ ] 检查仓库中两阶段训练脚本、身份标签重映射与数据采样方式。
- [ ] 统计统一模型相对双独立模型的参数量和实际推理吞吐。
