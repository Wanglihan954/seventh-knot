---
title: "论文阅读｜CADTrack：上下文聚合与可变形对齐"
categories:
  - 视觉目标跟踪
tags:
  - "RGBT"
  - "单目标跟踪"
  - "Mamba"
description: "阅读摘要： RGB/TIR 信息需要交互，但只用单一深层特征会损失局部细节，位置偏差还会影响融合。MFI 交换模态信息，CAM 从多层专家池选择上下文，DAM 以可变形采样和时间线索缓解局部错位。 证据边界： 一般 RGBT 跟踪，未单独定义原始未配准 tiny-SOT。"
readmore: true
mathjax: true
venue: "AAAI 2026"
cover: "https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/CADTrack/fig2-framework.png"
paper_url: "https://ojs.aaai.org/index.php/AAAI/article/view/37535"
date: 2026-10-01 20:00:00
updated: 2026-10-01 23:00:00
abbrlink: "84cae140"
---
> 本文根据个人阅读笔记整理。图表来自原论文或公开页面，仅用于学习与讨论。

**Venue:** AAAI 2026  
**Paper:** [原文访问](https://ojs.aaai.org/index.php/AAAI/article/view/37535)  

<!-- more -->

## CADTrack：上下文聚合与可变形对齐

[AAAI 论文](https://ojs.aaai.org/index.php/AAAI/article/view/37535)

### Abstract

**阅读摘要：**RGB/TIR 信息需要交互，但只用单一深层特征会损失局部细节，位置偏差还会影响融合。MFI 交换模态信息，CAM 从多层专家池选择上下文，DAM 以可变形采样和时间线索缓解局部错位。 **证据边界：**一般 RGBT 跟踪，未单独定义原始未配准 tiny-SOT。

**证据状态：**本地 PDF 已核对。

## 快速导航

- 上方 Zotero 与原文/出版页链接。
- **阅读边界：**一般 RGBT 跟踪，未单独定义原始未配准 tiny-SOT。

## 1. Motivation

**要解决的问题：**RGB/TIR 信息需要交互，但只用单一深层特征会损失局部细节，位置偏差还会影响融合。

**作者的核心思路：**MFI 交换模态信息，CAM 从多层专家池选择上下文，DAM 以可变形采样和时间线索缓解局部错位。

**与本专题的关系：**一般 RGBT 跟踪，未单独定义原始未配准 tiny-SOT。因此要区分论文实际验证的任务与可迁移到“未配准 RGBT + tiny-SOT”的假设。

## 2. Contributions

以下是阅读归纳，而非论文原文的贡献编号：

1. **MFI 跨模态交互：**双向 Mamba 交换 RGB/TIR 信息。
2. **CAM 跨层选择：**路由选择不同层的上下文特征。
3. **DAM 可变形对齐：**用可变形采样与时间线索修正局部错位。

## ️ 3. Method

### 3.1 Overall Pipeline

> **原文图。**论文 Figure 2：CADTrack 总体框架，包含 MFI、CAM 与 DAM。

![CADTrack 原文 Figure 2：总体框架](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/CADTrack/fig2-framework.png)

### 3.2 Core Modules

| 模块 / 环节 | 作用 | 信息依据 |
|---|---|---|
| MFI 跨模态交互 | 双向 Mamba 交换 RGB/TIR 信息 | 原文 PDF |
| CAM 跨层选择 | 路由选择不同层的上下文特征 | 原文 PDF |
| DAM 可变形对齐 | 用可变形采样与时间线索修正局部错位 | 原文 PDF |

### 3.3 论文要点与细节

以下保留原阅读记录中可追溯的具体说明；其中“对本课题的启发”是研究推断，不是论文实验结论。

#### 一句话

CADTrack 联合三项设计：Mamba 特征交互（MFI）、稀疏选择跨层特征的上下文聚合（CAM）、结合可变形采样与时间传播的对齐（DAM）。

#### 方法拆解

1. **MFI：**对 RGB/TIR 特征做通道压缩，再以双向 Mamba 建立跨模态联系，目标是在较低计算复杂度下交换信息。
2. **CAM：**对每个模态设置多层专家池，用路由器按场景选择骨干网络不同层的特征，避免只用最后一层丢失局部细节。
3. **DAM：**预测模态相关采样偏移，以双线性采样校正特征；跨模态注意力更新时序对齐线索，抑制定位漂移。PDF 第 5 页的公式 15–19 展示了采样、线索更新和响应生成。

训练采用 ViT-B 骨干，模板与搜索区域分别为 128×128、256×256；在 LasHeR 训练集训练，VTUAV 则用其自身训练集。评测包括 GTOT、RGBT210、RGBT234、LasHeR、VTUAV；部分数据集采用最大精度/成功率指标，不能与普通 PR/SR 混记。论文在 GTOT 报告 95.8% MPR、78.3% MSR（PDF 第 5 页）。

### 3.4 Paper ↔ Code / Training & Inference

本次未核验官方代码或运行训练与推理。具体代码文件、版本和超参数应在复现时再逐项映射。

## 4. Experiments

### 4.1 原文主结果表

Table 1 汇总多个 RGBT 基准上的 PR/NPR/SR 或 MPR/MSR。它支持的是“CADTrack 在通用 RGBT 跟踪上具有稳定竞争力”，不是“已经解决未配准 tiny-SOT”；不同数据集的指标口径必须分列阅读。

![CADTrack 原文 Table 1：多个 RGBT 基准上的比较](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/CADTrack/tab1-main-results.png)

### 4.2 阅读整理表（非原文表）

| 项目 | 已核对的结果或设定 | 来源 |
|---|---|---|
| 关键证据 | GTOT：95.8% MPR、78.3% MSR；评测还含 LasHeR、VTUAV 等 | 原文 PDF |
| 证据限制 | 一般 RGBT 跟踪，未单独定义原始未配准 tiny-SOT | 本笔记的任务定位 |

**指标口径：**只在同一论文和相同协议内解释数值；不把检测 AP、跟踪 PR/SR、MPR/MSR 或跨论文 FPS 直接混为一谈。

### 4.3 原文消融表

Table 3 逐步加入 MFI、CAM 和 DAM。阅读重点是三个模块是否带来累计增益，以及 DAM 的提升是否建立在前两者已启用的基础上，不能把整行增益全部归给对齐模块。

![CADTrack 原文 Table 3：模块消融](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/CADTrack/tab3-ablation.png)

### 4.4 定性实验

Figure 8 展示 RGB（上）与 TIR（下）的注意力演化。Baseline 的响应容易分散到背景；加入 MFI 后跨模态目标位置趋于一致，CAM 进一步集中关键区域，DAM 抑制错位噪声。它直接对应三个模块的设计，而不是作为普通示例图堆放。

![CADTrack 原文 Figure 8：MFI、CAM、DAM 的注意力演化](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/CADTrack/fig8-attention-evolution.png)


## 5. Reproduction

**状态：未实际复现。**先核对原文实验协议，再检查代码、权重和数据版本。

## 6. Critical Thinking

**可迁移价值：**跨层选择利于保留 tiny 细节；大偏移时须先保证目标仍落在搜索区域。

**局限：**一般 RGBT 跟踪，未单独定义原始未配准 tiny-SOT。

#### 可借鉴与局限

跨层特征选择适合探索微小目标的浅层分辨率需求；DAM 可处理局部非刚性残差。但本文主要解决一般 RGBT 跟踪中的模态差异与空间偏差，**未把原始未配准双流输入定义成独立任务**，也没有专门构造 tiny-SOT 基准。迁移时应测试大偏移下目标是否还落在搜索区域内。

## 7. 深度阅读标注

已补原文方法图、主要结果表与消融表；尚未导入逐条 Zotero 高亮及图表页码索引。

## 8. Final Takeaway

1. **Problem：**RGB/TIR 信息需要交互，但只用单一深层特征会损失局部细节，位置偏差还会影响融合。
2. **Method：**MFI 交换模态信息，CAM 从多层专家池选择上下文，DAM 以可变形采样和时间线索缓解局部错位。
3. **Result / Evidence：**GTOT：95.8% MPR、78.3% MSR；评测还含 LasHeR、VTUAV 等。

**一句话评价：**跨层选择利于保留 tiny 细节；大偏移时须先保证目标仍落在搜索区域。相关技术点尚不能当成已验证的“未配准 + tiny”联合方案。
