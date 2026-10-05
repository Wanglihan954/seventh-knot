---
title: "论文阅读｜STHFT：融合层级相似图的时空 Transformer"
categories:
  - 视觉目标跟踪
tags:
  - "RGB"
  - "UAV"
  - "单目标跟踪"
  - "Transformer"
description: "阅读摘要： 单一层的模板/搜索相关图难兼顾 UAV 场景的局部定位和高层判别。构造层级时空相似图，经 Transformer 交互后预测目标框角点。 证据边界： 未定义 tiny，也不涉及 RGB/TIR 对齐。"
readmore: true
mathjax: true
venue: "ISPRS Journal of Photogrammetry and Remote Sensing 2023"
cover: "https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/STHFT/fig-01.jpg"
paper_url: "https://www.sciencedirect.com/science/article/pii/S0924271623002575"
date: 2026-10-01 20:33:00
updated: 2026-10-01 23:00:00
abbrlink: "847853c6"
---
> 本文根据个人阅读笔记整理。图表来自原论文或公开页面，仅用于学习与讨论。

**Venue:** ISPRS Journal of Photogrammetry and Remote Sensing 2023  
**Paper:** [原文访问](https://www.sciencedirect.com/science/article/pii/S0924271623002575)  

<!-- more -->

## STHFT：融合层级相似图的时空 Transformer

[出版社页面](https://www.sciencedirect.com/science/article/pii/S0924271623002575)

### Abstract

**阅读摘要：**单一层的模板/搜索相关图难兼顾 UAV 场景的局部定位和高层判别。构造层级时空相似图，经 Transformer 交互后预测目标框角点。 **证据边界：**未定义 tiny，也不涉及 RGB/TIR 对齐。

**证据状态：**据出版社/期刊页面；本地无 PDF。

## 快速导航

- 上方 Zotero 与原文/出版页链接。
- **阅读边界：**未定义 tiny，也不涉及 RGB/TIR 对齐。

## 1. Motivation

**要解决的问题：**单一层的模板/搜索相关图难兼顾 UAV 场景的局部定位和高层判别。

**作者的核心思路：**构造层级时空相似图，经 Transformer 交互后预测目标框角点。

**与本专题的关系：**未定义 tiny，也不涉及 RGB/TIR 对齐。因此要区分论文实际验证的任务与可迁移到“未配准 RGBT + tiny-SOT”的假设。

## 2. Contributions

以下是阅读归纳，而非论文原文的贡献编号：

1. **层级时空相似图：**由模板与搜索区域构造多层相似图。
2. **Transformer 交互：**Transformer 交互融合时空线索。
3. **角点预测：**卷积头预测目标框角点。

## ️ 3. Method

### 3.1 Overall Pipeline

Figure 1 从模板、搜索区域、多层相似图一直画到 Transformer 与预测头，说明“层级相似图”是主干输入，而不是实验阶段附加的后处理。

![STHFT 原文 Figure 1：总体层级时空跟踪框架](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/STHFT/fig-01.jpg)

### 3.2 Core Modules

| 模块 / 环节 | 作用 | 信息依据 |
|---|---|---|
| 层级时空相似图 | 由模板与搜索区域构造多层相似图 | 出版页/摘要 |
| Transformer 交互 | Transformer 交互融合时空线索 | 出版页/摘要 |
| 角点预测 | 卷积头预测目标框角点 | 出版页/摘要 |

Figure 2 展开 Transformer 内部的相似图交互，Figure 3 展示角点预测头如何从变换后的特征生成左上角和右下角热图。两图分别对应特征建模与最终定位。

![STHFT 原文 Figure 2：层级相似图 Transformer 模块](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/STHFT/fig-02.jpg)

![STHFT 原文 Figure 3：角点预测头](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/STHFT/fig-03.jpg)

### 3.3 论文要点与细节

以下保留原阅读记录中可追溯的具体说明；其中“对本课题的启发”是研究推断，不是论文实验结论。

#### 核心想法

单一层的模板与搜索图相关响应，在复杂 UAV 场景中可能定位不准；分别使用多个相似图又会增加计算。STHFT 将多层卷积产生的时空层级相似图送入 Transformer，交互融合浅层时空线索与深层语义，然后用简洁的卷积预测框角点。

出版社摘要报告在 UAV123 和 UAV20L 上评测，相对 DaSiamRPN 的成功率与精度在 UAV123 分别提高 7.3%、6.5%，在 UAV20L 分别提高 10.9%、10.4%。这些是特定对比对象和基准的结果。

### 3.4 Paper ↔ Code / Training & Inference

本次未核验官方代码或运行训练与推理。缺少本地全文，代码路径、公式和超参数均不作推测。

## 4. Experiments

### 4.1 对比实验

Figure 4 给出 UAV123 的 Precision/Success 曲线，展示 STHFT 相对 Siamese 与 UAV 跟踪基线的总体排序。曲线覆盖多个定位误差和 IoU 阈值，因此比单个摘要数字更完整。

![STHFT 原文 Figure 4：UAV123 上的 OPE 对比曲线](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/STHFT/fig-04.jpg)

### 4.2 定性实验

Figure 6 比较相似目标、尺度变化和复杂背景序列中的跟踪框。Figure 7 的响应热图进一步显示，层级时空建模后注意区域更集中于目标而非背景干扰。

![STHFT 原文 Figure 6：典型困难序列的跟踪框对比](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/STHFT/fig-06.jpg)

![STHFT 原文 Figure 7：响应热图可视化](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/STHFT/fig-07.jpg)

### 4.3 阅读整理表（非原文表）

| 项目 | 已核对的结果或设定 | 来源 |
|---|---|---|
| 关键证据 | 摘要称相对 DaSiamRPN 在 UAV123 成功率/精度 +7.3/+6.5 | 出版页/摘要 |
| 证据限制 | 未定义 tiny，也不涉及 RGB/TIR 对齐 | 本笔记的任务定位 |

**指标口径：**只在同一论文和相同协议内解释数值；不把检测 AP、跟踪 PR/SR、MPR/MSR 或跨论文 FPS 直接混为一谈。


## 5. Reproduction

**状态：未实际复现。**先获取全文，确认结构、训练配置、消融与数据划分，再决定复现。

## 6. Critical Thinking

**可迁移价值：**层级相似图可保留定位线索；跨模态弱纹理和偏移下须检验相关图可靠性。

**局限：**未定义 tiny，也不涉及 RGB/TIR 对齐。

#### 与 tiny RGBT 的关系

层级相似图能给小目标保留较高分辨率线索，但论文并未专门定义 tiny 目标，也不涉及 RGB/TIR 错位。若迁移，应考察跨模态相似图在弱纹理与位置偏差下是否可靠。

## 7. 深度阅读标注

已补出版社官方模块图；仍待获取可核验全文后补充完整框架、实验表、公式与页码。

## 8. Final Takeaway

1. **Problem：**单一层的模板/搜索相关图难兼顾 UAV 场景的局部定位和高层判别。
2. **Method：**构造层级时空相似图，经 Transformer 交互后预测目标框角点。
3. **Result / Evidence：**摘要称相对 DaSiamRPN 在 UAV123 成功率/精度 +7.3/+6.5。

**一句话评价：**层级相似图可保留定位线索；跨模态弱纹理和偏移下须检验相关图可靠性。相关技术点尚不能当成已验证的“未配准 + tiny”联合方案。
