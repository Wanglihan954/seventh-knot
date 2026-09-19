---
title: "论文阅读｜HHA: Hyperbolic Hierarchical Alignment for Video-Based Visible-Infrared Person Re-Identification"
categories:
  - 目标重识别
tags:
  - "文献笔记"
  - "AI论文"
  - "目标重识别"
  - "Person Re-ID"
  - "视频行人重识别"
  - "可见光-红外"
  - "双曲学习"
  - "ICML"
description: "HHA 处理视频可见光—红外行人重识别中的双重困难：轨迹内部的姿态、遮挡和时间变化，以及两种成像模态之间的外观鸿沟。方法把时空聚合与跨模态对齐统一放入 Poincaré 球：HHSA 建立层级时空表示，GMA 再以模态中心和共享身份原型完成几何一致的对齐。"
readmore: true
mathjax: true
date: 2026-09-17 21:26:14
updated: 2026-09-17 21:26:14
abbrlink: "15c246a1"
---
> 本文基于论文、公开代码与本地阅读笔记整理；论文插图仅用于学习与讨论。

## 论文信息
**Title:** Hyperbolic Hierarchical Alignment for Video-Based Visible-Infrared Person Re-Identification  
**Authors:** Shuang Li, Changjiang Kuang, Jiaxu Leng, Mingpi Tan, Zhanjie Wu, Shuanglin Yan, Xinbo Gao  
**Venue:** ICML 2026  
**DOI:**  
**GitHub:** https://github.com/Visuang/HHA  
**IF/Level:** ICML 2026 | CCF-A

> **摘要**
> HHA 处理视频可见光—红外行人重识别中的双重困难：轨迹内部的姿态、遮挡和时间变化，以及两种成像模态之间的外观鸿沟。方法把时空聚合与跨模态对齐统一放入 Poincaré 球：HHSA 建立层级时空表示，GMA 再以模态中心和共享身份原型完成几何一致的对齐。

<!-- more -->

---

## 论文资源
- **Paper:** <https://openreview.net/forum?id=l17gjYai4X>

---

## 论文大纲

## 1. 动机与挑战 (Motivation & Challenges)
- **轨迹内部变化：** 帧间姿态、遮挡和可见区域不断变化，简单平均会把不同层级线索混在一起。
- **跨模态偏移：** visible 与 infrared 缺乏一致颜色和纹理，身份簇的中心存在系统性偏移。
- **欧氏空间拥挤：** 多层时空线索及身份—模态关系具有树状结构，平坦空间容易产生 cue crowding 和结构失真。

## 2. 核心贡献 (Key Contributions)
- [x] 提出 **Hyperbolic Hierarchical Spatio-Temporal Aggregator（HHSA）**。
- [x] 设计 **HGI** 在双曲空间组织时序层级，设计 **DGF** 融合欧氏外观与双曲结构线索。
- [x] 提出 **Geometry-Aware Modality Alignment（GMA）**，由 HMA 和 HPA 组成。
- [x] 在 HITSZ-VCM 与 BUPTCampus 上取得强结果，并给出组件、几何选择、插入位置和复杂度分析。

## 3. 技术路线 (Methodology)
> **核心架构图（Fig. 2，已按图体裁剪）**
> ![](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@main/img/hha-fig2-framework-v2.png)

- **ViT backbone：** 对每帧提取 patch 与 CLS token，并在若干 Transformer 层间插入 HHSA。
- **HGI：** 将时序 token 映射到 Poincaré 球，通过双曲交互生成层级 token memory，减少时变线索纠缠。
- **DGF：** 分别在欧氏与双曲空间做 CLS 引导读取，再融合互补的外观与结构信息。
- **HMA：** 对同一身份的 visible/infrared 模态中心施加双曲距离约束，先缩小模态 gap。
- **HPA：** 学习共享身份原型，将两种模态的中心拉向同一 prototype，进一步强化类间判别。
- **训练细节：** CLIP ViT-B/16 全量微调；输入 288×144；AdamW，学习率 $2.5\times10^{-5}$；60 epochs，batch size 32；每身份每模态采 4 个序列、每序列 6 帧；单卡 H800；曲率 $c=1$，$\lambda_{hma}=\lambda_p=0.05$。

## 4. 实验结论 (Results)
> **主结果（Table 1，表格局部）**
> ![](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@main/img/hha-table1-results-v2.png)

- **数据集与指标：** HITSZ-VCM、BUPTCampus；I2V/V2I 双向协议；CMC Rank-1/5/10 与 mAP。
- **HITSZ-VCM（6 帧）：** I2V 为 **76.0 R1 / 63.2 mAP**，V2I 为 **77.5 / 60.8**；10 帧进一步达到 **77.5/64.7、78.1/62.8**。
- **BUPTCampus（6 帧）：** I2V 为 **67.6/64.6**，V2I 为 **68.6/64.2**；10 帧为 **69.7/66.7、69.9/65.7**。
- **组件消融：** baseline 为 I2V **64.4/49.8**、V2I **63.6/47.7**；HGI+DGF 后为 **72.0/58.3、72.7/56.9**；完整 GMA 后达到 **76.0/63.2、77.5/60.8**。
- **几何选择：** 双曲 HGI + 双几何 DGF 最佳；仅把 DGF 换成双曲并不能弥补欧氏 HGI 的层级建模不足。
- **复杂度：** 参数量 87.54M→103.37M，FLOPs 13.96G→14.24G，单帧延迟 0.85→0.92 ms，说明增益并非来自大幅增加计算量。

---

## 深度阅读标注

### 核心创新/重点 (Key Ideas)
- HHA 不只在最终 embedding 上换一个双曲距离，而是让时间交互、读取和模态对齐都围绕同一几何结构展开。
- GMA 的顺序有明确含义：HMA 先把同一身份的双模态中心拉近，HPA 再用共享原型增强判别。

### 重要概念/背景 (Concepts)
- **VVI-ReID：** 查询与图库既跨摄像头又跨 visible/infrared 模态，并且输入为视频轨迹。
- **Poincaré ball：** 用有限球内距离表达指数扩张的层级空间，需要 exp/log map 和边界投影保证数值稳定。
- **双几何融合：** 欧氏分支保留局部外观，双曲分支保留层级结构，两者并非互相替代。

### 实验数据/指标 (Results)
- HHSA 单独将 I2V mAP 从 49.8 提高到 58.3（**+8.5**），GMA 再提高到 63.2（**+4.9**）。
- 完整模型相对 baseline，I2V/V2I 的 mAP 分别提升 **+13.4/+13.1**。
- HGI 每两层插入一次最佳；过密或过疏都下降，说明层级交互需要与原始 Transformer 表示交替更新。

### 数学推导/方法论 (Method)
- HMA 最小化同身份可见光与红外中心的双曲距离；HPA 以 prototype-based hyperbolic CE 和中心—原型距离联合优化。
- 实现时必须复查 Möbius 运算、映射前后的裁剪/投影及混合精度下的边界稳定性。

### 值得借鉴的灵感 (Inspiration)
- “模态中心对齐 + 共享身份原型”比逐样本硬对齐更适合存在较大类内变化的视频任务。
- HGI 的层间插入方式可用于长视频跟踪，把帧级 cue 组织成局部—轨迹层级。

### 疑问/待进一步查阅 (Queries)
- HHA 对曲率固定为 1；可学习曲率是否能适配不同数据集的层级深度？
- 与相同参数量的欧氏 memory/temporal attention 比较是否仍有同等优势？
- 10 帧在 BUPTCampus 的 mAP 并未全面超过 X-ReID，需要区分 Rank-1、mAP 与序列长度的实际取舍。

---

## 思考与行动
- **复现可能性：**
- [ ] Low
- [x] Medium
- [ ] High
- **相关工作：** VLD、X-ReID、STHF、TF-CLIP；重点比较视频聚合方式和跨模态对齐目标。
- **迁移思考：** 可将 HMA/HPA 与 HiHR 的共享—特有父子层级结合，形成“身份原型—模态中心—样本”的三级结构。
- [ ] 检查代码中的 Poincaré 投影阈值、HGI 插层位置和双几何融合权重。
- [ ] 在相同序列长度、backbone 与参数量下补做欧氏层级基线。
