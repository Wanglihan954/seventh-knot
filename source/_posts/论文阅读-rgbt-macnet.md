---
title: "论文阅读｜MaCNet：模态注意力与竞争学习"
categories:
  - 视觉目标跟踪
tags:
  - "RGBT"
  - "单目标跟踪"
description: "阅读摘要： 不同场景下 RGB/TIR 可靠性不同，固定融合权重容易让较差模态拖累跟踪。双分支提取特征，模态感知注意力动态加权，再以 RGB、TIR、融合三路分类竞争学习。 证据边界： 采用视场对齐候选图像，不是未配准输入。"
readmore: true
mathjax: true
venue: "Sensors 2020"
cover: "https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/MaCNet/fig1-framework.jpg"
paper_url: "https://www.mdpi.com/1424-8220/20/2/393"
date: 2026-10-01 20:12:00
updated: 2026-10-01 23:00:00
abbrlink: "259ad61f"
---
> 本文根据个人阅读笔记整理。图表来自原论文或公开页面，仅用于学习与讨论。

**Venue:** Sensors 2020  
**Paper:** [原文访问](https://www.mdpi.com/1424-8220/20/2/393)  

<!-- more -->

## MaCNet：模态注意力与竞争学习

[期刊全文](https://www.mdpi.com/1424-8220/20/2/393)

### Abstract

**阅读摘要：**不同场景下 RGB/TIR 可靠性不同，固定融合权重容易让较差模态拖累跟踪。双分支提取特征，模态感知注意力动态加权，再以 RGB、TIR、融合三路分类竞争学习。 **证据边界：**采用视场对齐候选图像，不是未配准输入。

**证据状态：**据出版社/期刊页面；本地无 PDF。

## 快速导航

- 上方 Zotero 与原文/出版页链接。
- **阅读边界：**采用视场对齐候选图像，不是未配准输入。

## 1. Motivation

**要解决的问题：**不同场景下 RGB/TIR 可靠性不同，固定融合权重容易让较差模态拖累跟踪。

**作者的核心思路：**双分支提取特征，模态感知注意力动态加权，再以 RGB、TIR、融合三路分类竞争学习。

**与本专题的关系：**采用视场对齐候选图像，不是未配准输入。因此要区分论文实际验证的任务与可迁移到“未配准 RGBT + tiny-SOT”的假设。

## 2. Contributions

以下是阅读归纳，而非论文原文的贡献编号：

1. **RGB/TIR 双分支：**RGB 与 TIR 分别提特征。
2. **模态感知注意力：**根据特征层和模态可靠性加权。
3. **三路竞争分类：**RGB/TIR/融合三路竞争分类。

## ️ 3. Method

### 3.1 Overall Pipeline

> **原文图。**开放获取论文 Figure 1：MaCNet 总体架构与模态感知分支。

![MaCNet 原文 Figure 1：总体架构](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/MaCNet/fig1-framework.jpg)

### 3.2 Core Modules

| 模块 / 环节 | 作用 | 信息依据 |
|---|---|---|
| RGB/TIR 双分支 | RGB 与 TIR 分别提特征 | 出版页/摘要 |
| 模态感知注意力 | 根据特征层和模态可靠性加权 | 出版页/摘要 |
| 三路竞争分类 | RGB/TIR/融合三路竞争分类 | 出版页/摘要 |

Figure 2 展开了最关键的模态感知注意力层：先联合两路特征估计权重，再把跨模态融合结果以残差形式反馈到各自分支。因此这里放模块图，而不是放到文章末尾。

![MaCNet Figure 2：模态感知注意力层](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/MaCNet/fig-02.jpg)

### 3.3 论文要点与细节

以下保留原阅读记录中可追溯的具体说明；其中“对本课题的启发”是研究推断，不是论文实验结论。

#### 方法

MaCNet 为 RGB 和 TIR 各设一条特征提取分支，模态感知注意力估计不同特征层的重要性，再进行跨模态融合。分类端同时设置 RGB、TIR、融合三个分支，以竞争学习鼓励融合分支优于单模态分支。作者在 GTOT 与 RGBT234 上评测，并对 GTOT 的 Small Object 属性做分析。

### 3.4 Paper ↔ Code / Training & Inference

本次未核验官方代码或运行训练与推理。缺少本地全文，代码路径、公式和超参数均不作推测。

## 4. Experiments

### 4.1 GTOT 总体与属性结果

Figure 3 先给出 GTOT 的总体 PR/SR 曲线；Figure 5、Figure 6 再把优势拆到具体挑战属性。对应的 Table 3、Table 4 提供可检索的精确数值。

![MaCNet Figure 3：GTOT 总体 PR/SR 曲线](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/MaCNet/fig-03.jpg)

![MaCNet 原文 Figure 5：各属性精度图](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/MaCNet/fig5-precision-attributes.jpg)

![MaCNet 原文 Figure 6：各属性成功率图](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/MaCNet/fig6-success-attributes.jpg)

**原文 Table 3. Attribute-based PR scores (%) on GTOT**

| Attributes | OCC | LSV | FM | LI | TC | SO | DEF | ALL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MEEM [40] | 68.4 | 62.8 | 68.6 | 66.5 | 69.6 | 69.3 | 68.8 | 64.8 |
| SiameseFC [26] | 70.2 | 78.7 | 72.7 | 61.5 | 74.7 | 72.4 | 53.8 | 65.5 |
| SiamDW [43]+RGBT | 67.5 | 68.9 | 71.1 | 70.0 | 63.5 | 76.4 | 69.1 | 68.0 |
| STRUCK [1] | 67.4 | 66.0 | 64.0 | 74.0 | 68.0 | 74.5 | 75.6 | 68.1 |
| CCOT [21] | 75.1 | 81.8 | 75.4 | 71.3 | 74.5 | 83.8 | 66.4 | 71.2 |
| ADNet [41] | 72.7 | 74.8 | 72.8 | 71.5 | 71.2 | 81.9 | 70.7 | 71.8 |
| SRDCF [20] | 72.7 | 80.4 | 68.3 | 71.7 | 70.5 | 80.5 | 66.6 | 71.9 |
| RT-MDNet [42] | 73.3 | 79.1 | 78.1 | 77.2 | 73.7 | 85.6 | 73.1 | 74.5 |
| ECO [25] | 77.5 | 85.6 | 77.9 | 75.2 | 81.9 | 90.7 | 75.2 | 77.0 |
| DAT [27] | 77.2 | 78.6 | 82.0 | 76.0 | 80.9 | 88.6 | 76.9 | 77.1 |
| MDNet [24]+RGBT | 82.9 | 77.0 | 80.5 | 79.5 | 79.5 | 87.0 | 81.6 | 80.0 |
| SGT [3] | 81.0 | 84.2 | 79.9 | 88.4 | 84.8 | 91.7 | 91.9 | 85.1 |
| MaCNet | 87.6 | 84.6 | 82.3 | 89.4 | 89.2 | 95.0 | 92.6 | 88.0 |

**原文 Table 4. Attribute-based SR scores (%) on GTOT**

| Attributes | OCC | LSV | FM | LI | TC | SO | DEF | ALL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MEEM [40] | 53.0 | 46.2 | 52.3 | 51.8 | 54.6 | 49.6 | 57.8 | 52.3 |
| SiameseFC [26] | 55.9 | 63.5 | 60.4 | 50.7 | 59.5 | 55.2 | 45.0 | 54.0 |
| SiamDW [43]+RGBT | 53.6 | 56.5 | 57.6 | 58.8 | 51.7 | 58.8 | 58.2 | 56.5 |
| STRUCK [1] | 51.6 | 49.6 | 51.8 | 55.3 | 51.0 | 52.7 | 60.4 | 53.3 |
| CCOT [21] | 57.6 | 66.2 | 61.0 | 56.3 | 57.9 | 59.9 | 51.6 | 56.7 |
| ADNet [41] | 60.0 | 63.6 | 60.6 | 64.4 | 59.9 | 63.7 | 63.2 | 62.9 |
| SRDCF [20] | 58.0 | 68.1 | 61.1 | 59.4 | 58.0 | 57.5 | 53.7 | 59.1 |
| RT-MDNet [42] | 57.6 | 63.7 | 64.1 | 63.8 | 59.0 | 63.4 | 61.0 | 61.3 |
| ECO [25] | 62.2 | 70.5 | 64.5 | 61.7 | 65.3 | 69.1 | 59.8 | 63.1 |
| DAT [27] | 59.2 | 62.4 | 61.5 | 60.9 | 62.6 | 64.4 | 63.3 | 61.8 |
| MDNet [24]+RGBT | 64.1 | 57.3 | 59.8 | 64.3 | 60.9 | 62.2 | 68.8 | 63.7 |
| SGT [3] | 56.7 | 54.7 | 55.9 | 65.1 | 61.5 | 61.8 | 73.3 | 62.8 |
| MaCNet | 68.7 | 67.3 | 65.9 | 73.1 | 69.7 | 69.5 | 76.5 | 71.4 |

### 4.2 RGBT234 结果

Figure 4 同时比较 RGB tracker 与 RGB-T tracker；Table 5、Table 6 给出 RGBT234 各属性的 PR/SR，适合用于判断增益来自哪些困难场景。

![MaCNet Figure 4：RGBT234 对比结果](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/MaCNet/fig-04.jpg)

**原文 Table 5. Attribute-based PR scores (%) on RGBT234**

| Attributes | NO | PO | HO | LI | LR | TC | DEF | FM | SV | MB | CM | BC | ALL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SAMF [18] | 67.6 | 54.0 | 39.8 | 46.8 | 50.7 | 54.7 | 42.4 | 42.4 | 55.4 | 37.8 | 40.2 | 37.6 | 50.4 |
| CFnet [17] | 72.4 | 57.7 | 37.9 | 43.6 | 48.2 | 51.2 | 46.0 | 36.3 | 59.5 | 38.4 | 41.7 | 36.3 | 52.0 |
| DSST [45] | 69.7 | 56.5 | 41.0 | 48.3 | 57.9 | 49.5 | 43.8 | 35.5 | 56.8 | 35.8 | 39.9 | 45.8 | 52.4 |
| CSR-DCF [22] | 78.8 | 64.1 | 52.2 | 49.0 | 57.9 | 62.9 | 55.7 | 53.0 | 67.0 | 55.0 | 55.8 | 50.3 | 62.0 |
| SRDCF [20] | 79.1 | 68.8 | 52.6 | 57.5 | 62.0 | 66.1 | 56.3 | 52.6 | 70.4 | 55.9 | 56.9 | 48.1 | 64.1 |
| SOWP [44] | 80.1 | 66.6 | 54.7 | 52.4 | 67.9 | 71.2 | 61.1 | 57.9 | 66.6 | 59.8 | 59.8 | 52.8 | 64.2 |
| ECO [25] | 88.0 | 72.2 | 60.4 | 63.5 | 68.7 | 82.1 | 62.2 | 57.0 | 74.0 | 68.9 | 63.9 | 57.9 | 70.2 |
| MDNet [24] | 81.2 | 74.7 | 63.3 | 58.9 | 66.0 | 74.8 | 66.4 | 63.2 | 73.9 | 62.4 | 61.3 | 62.5 | 71.0 |
| MaCNet | 92.7 | 81.1 | 70.9 | 77.7 | 78.3 | 77.0 | 73.1 | 72.8 | 78.7 | 71.6 | 71.7 | 77.8 | 79.0 |

**原文 Table 6. Attribute-based SR scores (%) on RGBT234**

| Attributes | NO | PO | HO | LI | LR | TC | DEF | FM | SV | MB | CM | BC | ALL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SAMF [18] | 43.3 | 38.0 | 28.5 | 32.7 | 32.9 | 38.1 | 33.2 | 27.0 | 39.7 | 27.9 | 30.6 | 25.9 | 35.9 |
| CFnet [17] | 54.5 | 41.8 | 27.2 | 31.5 | 33.9 | 38.5 | 34.0 | 25.3 | 43.2 | 29.4 | 32.1 | 25.7 | 38.0 |
| DSST [45] | 43.3 | 36.2 | 27.0 | 29.9 | 36.8 | 32.5 | 32.5 | 22.4 | 33.7 | 25.1 | 27.9 | 29.3 | 33.6 |
| CSR-DCF [22] | 56.6 | 44.4 | 36.0 | 32.9 | 37.0 | 42.8 | 41.0 | 35.0 | 47.3 | 39.8 | 39.6 | 32.4 | 43.2 |
| SRDCF [20] | 58.5 | 49.9 | 37.1 | 40.9 | 41.0 | 46.7 | 40.6 | 34.3 | 51.8 | 41.5 | 40.9 | 32.4 | 46.3 |
| SOWP [44] | 50.2 | 42.7 | 35.4 | 33.6 | 42.1 | 46.2 | 42.0 | 33.5 | 39.6 | 39.9 | 39.0 | 33.6 | 41.1 |
| ECO [25] | 65.5 | 53.4 | 43.2 | 45.0 | 46.4 | 60.9 | 45.8 | 39.5 | 55.8 | 52.3 | 47.7 | 39.9 | 51.4 |
| MDNet [24] | 59.0 | 50.9 | 43.2 | 39.6 | 44.5 | 53.0 | 46.8 | 39.3 | 51.9 | 44.2 | 43.3 | 41.8 | 49.0 |
| MaCNet | 66.5 | 57.2 | 48.8 | 52.7 | 52.3 | 56.3 | 51.4 | 47.1 | 56.1 | 52.5 | 51.7 | 50.1 | 55.4 |

### 4.3 消融实验

Figure 7 与 Table 7 放在一起：曲线展示整体趋势，表格给出 MAA 和竞争学习的精确贡献。

![MaCNet Figure 7：模态注意力与竞争学习消融曲线](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/MaCNet/fig-07.jpg)

**原文 Table 7. Ablation study on GTOT**

|  | Only-Pretrain | MaCNet-noMAA | MaCNet-noCL | MaCNet |
| --- | --- | --- | --- | --- |
| PR | 82.2 | 85.2 | 85.9 | 88.0 |
| SR | 66.1 | 69.5 | 69.9 | 71.4 |

### 4.4 定性案例

Figure 8 用于观察遮挡、热交叉、低照度和小目标场景下各方法的框漂移，不把它与定量表混排。

![MaCNet Figure 8：定性跟踪结果](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/MaCNet/fig-08.jpg)

### 4.5 阅读整理表（非原文表）

| 项目 | 已核对的结果或设定 | 来源 |
|---|---|---|
| 关键证据 | 开放期刊全文讨论 GTOT Small Object 属性并在 RGBT234 评测 | 出版页/摘要 |
| 证据限制 | 采用视场对齐候选图像，不是未配准输入 | 本笔记的任务定位 |

**指标口径：**只在同一论文和相同协议内解释数值；不把检测 AP、跟踪 PR/SR、MPR/MSR 或跨论文 FPS 直接混为一谈。


## 5. Reproduction

**状态：未实际复现。**先获取全文，确认结构、训练配置、消融与数据划分，再决定复现。

### 5.1 原文网络配置

这两张配置表属于复现信息，因此放在复现章节，不与实验结果表混在一起。

**原文 Table 1. Feature extraction network**

| Layers | Kernel Size | Stride | Channels |
| --- | --- | --- | --- |
| (input) |  |  | ×3 |
| conv-1 | 7×7 | 2 | ×96 |
| ReLU |  |  | ×96 |
| LRN |  |  | ×96 |
| MaxPool | 3×3 | 2 | ×96 |
| conv-2 | 5×5 | 2 | ×256 |
| ReLU |  |  | ×256 |
| LRN |  |  | ×256 |
| MaxPool | 3×3 | 2 | ×256 |
| conv-3 | 3×3 | 2 | ×512 |
| ReLU |  |  | ×512 |

**原文 Table 2. Classification network**

| RGB Branch | Fusion Branch | Thermal Infrared Branch |
| --- | --- | --- |
|  | Dropout |  |
| Linear (fc4) | Linear (fc4) | Linear (fc4) |
| ReLU | ReLU | ReLU |
| Dropout | Dropout | Dropout |
| Linear (fc5) | Linear (fc5) | Linear (fc5) |
| ReLU | ReLU | ReLU |
| Dropout | Dropout | Dropout |
| Linear (fc6) | Linear (fc6) | Linear (fc6) |
| softmax | softmax | softmax |

## 6. Critical Thinking

**可迁移价值：**可借鉴模态可靠性选择，但未配准输入仍需要显式几何对应。

**局限：**采用视场对齐候选图像，不是未配准输入。

#### 阅读定位

它说明早期 RGBT 方法已关注小目标挑战，但核心仍是**一般场景下的模态融合**，不是专门 tiny tracker。期刊方法部分明确采用视场对齐的双模态候选图像，因此不能把它当作未配准输入的直接基线。对于当前研究，可借鉴按场景判断 RGB/TIR 可靠性的思路，再加入显式失准与尺寸敏感的评测。

## 7. 深度阅读标注

已补开放获取论文的方法图与属性结果图；尚未导入逐条 Zotero 高亮及公式、数值的页码索引。

## 8. Final Takeaway

1. **Problem：**不同场景下 RGB/TIR 可靠性不同，固定融合权重容易让较差模态拖累跟踪。
2. **Method：**双分支提取特征，模态感知注意力动态加权，再以 RGB、TIR、融合三路分类竞争学习。
3. **Result / Evidence：**开放期刊全文讨论 GTOT Small Object 属性并在 RGBT234 评测。

**一句话评价：**可借鉴模态可靠性选择，但未配准输入仍需要显式几何对应。相关技术点尚不能当成已验证的“未配准 + tiny”联合方案。
