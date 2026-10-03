---
title: "论文阅读｜HATrack：频率引导的空间重校准"
categories:
  - "文献阅读"
  - "RGBT 跟踪"
tags:
  - "RGBT"
  - "单目标跟踪"
  - "空间重校准"
  - "Adapter"
description: "阅读摘要： 跨模态显著区域和频率成分不同，直接融合可能放大局部错位与噪声。以 CFSR 分解高低频并重校准空间位置，再用异构 adapter 调整融合特征。 证据边界： 缺本地 PDF；通用 RGBT 融合而非专门 tiny-SOT。"
readmore: true
mathjax: true
venue: "Expert Systems with Applications 2026"
cover: "https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/HATrack/fig2-framework.jpg"
paper_url: "https://www.sciencedirect.com/science/article/abs/pii/S0957417426013394"
date: 2026-10-01 20:06:00
updated: 2026-10-01 23:00:00
abbrlink: "8f559381"
---
> 本文根据个人阅读笔记整理。图表来自原论文或公开页面，仅用于学习与讨论。

**Venue:** Expert Systems with Applications 2026  
**Paper:** [原文访问](https://www.sciencedirect.com/science/article/abs/pii/S0957417426013394)  

<!-- more -->

## HATrack：频率引导的空间重校准

[出版社页面](https://www.sciencedirect.com/science/article/abs/pii/S0957417426013394)

### Abstract

**阅读摘要：**跨模态显著区域和频率成分不同，直接融合可能放大局部错位与噪声。以 CFSR 分解高低频并重校准空间位置，再用异构 adapter 调整融合特征。 **证据边界：**缺本地 PDF；通用 RGBT 融合而非专门 tiny-SOT。

**证据状态：**据出版社/期刊页面；本地无 PDF。

## 快速导航

- 上方 Zotero 与原文/出版页链接。
- **阅读边界：**缺本地 PDF；通用 RGBT 融合而非专门 tiny-SOT。

## 1. Motivation

**要解决的问题：**跨模态显著区域和频率成分不同，直接融合可能放大局部错位与噪声。

**作者的核心思路：**以 CFSR 分解高低频并重校准空间位置，再用异构 adapter 调整融合特征。

**与本专题的关系：**缺本地 PDF；通用 RGBT 融合而非专门 tiny-SOT。因此要区分论文实际验证的任务与可迁移到“未配准 RGBT + tiny-SOT”的假设。

## 2. Contributions

以下是阅读归纳，而非论文原文的贡献编号：

1. **频率分解：**区分高频纹理与低频结构。
2. **CFSR 空间重校准：**重校准显著区域并学习偏移。
3. **HA 异构适配：**异构 adapter 调节融合与高频补充。

## ️ 3. Method

### 3.1 Overall Pipeline

> **原文图。**Elsevier 官方 Figure 2 资源：HATrack 总体框架，展示异构适配器及 CFSR、GRA、BA 等模块。

![HATrack 原文 Figure 2：总体框架](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/HATrack/fig2-framework.jpg)

### 3.2 Core Modules

| 模块 / 环节 | 作用 | 信息依据 |
|---|---|---|
| 频率分解 | 区分高频纹理与低频结构 | 出版页/摘要 |
| CFSR 空间重校准 | 重校准显著区域并学习偏移 | 出版页/摘要 |
| HA 异构适配 | 异构 adapter 调节融合与高频补充 | 出版页/摘要 |

Figure 3 对应空间重校准：RGB/TIR token 先交互生成跨模态提示，再用门控分支重加权显著位置。Figure 4 对应频率分解：低频路径维持主体结构，高频路径补充纹理，两条路径最终残差融合。两图分别解释“在哪里对齐”和“保留什么信息”。

![HATrack 原文 Figure 3：跨模态空间重校准模块](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/HATrack/fig-03.jpg)

![HATrack 原文 Figure 4：高低频分解与融合模块](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/HATrack/fig-04.jpg)

### 3.3 论文要点与细节

以下保留原阅读记录中可追溯的具体说明；其中“对本课题的启发”是研究推断，不是论文实验结论。

#### 方法

HATrack 针对跨模态目标区域错位和模态特征差异，组合 **Cross-modal Fusion Spatial Recalibration（CFSR）** 与 **Heterogeneous Adapter（HA）**。CFSR 分解并融合高频纹理与低频局部结构，再重校准显著区域并学习跨模态偏移。HA 包含利用热红外信息调节融合特征的 gated residual adapter，以及用非线性分支补充高频信息的 bidirectional adaptive adapter。

出版社摘要称其在四个常见基准上评测。其“空间重校准”是融合框架的一部分，不能直接等同于专门的原始未配准 RGBT-SOT 任务。

### 3.4 Paper ↔ Code / Training & Inference

本次未核验官方代码或运行训练与推理。缺少本地全文，代码路径、公式和超参数均不作推测。

## 4. Experiments

### 4.1 对比实验

Figure 8 给出总体 Precision/Success 曲线，Figure 9 进一步展示另一评测协议下的 OPE 曲线。曲线用于观察各阈值上的稳定排序，不能只截取峰值宣称全面领先。

![HATrack 原文 Figure 8：总体精度与成功率曲线](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/HATrack/fig-08.jpg)

![HATrack 原文 Figure 9：OPE 对比曲线](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/HATrack/fig-09.jpg)

### 4.2 定性实验

Figure 10 比较不同跟踪器在低照度、遮挡和背景干扰序列中的框位置。Figure 12 则直接展示重校准前后的响应变化：对齐后的响应更集中于目标区域，这比只看最终框更直接地验证了 CFSR 的作用。

![HATrack 原文 Figure 10：典型困难场景的跟踪对比](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/HATrack/fig-10.jpg)

![HATrack 原文 Figure 12：空间重校准前后的可视化](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/HATrack/fig-12.jpg)

### 4.3 阅读整理表（非原文表）

| 项目 | 已核对的结果或设定 | 来源 |
|---|---|---|
| 关键证据 | 摘要称在四个常见基准上评测；具体指标未核对 | 出版页/摘要 |
| 证据限制 | 缺本地 PDF；通用 RGBT 融合而非专门 tiny-SOT | 本笔记的任务定位 |

**指标口径：**只在同一论文和相同协议内解释数值；不把检测 AP、跟踪 PR/SR、MPR/MSR 或跨论文 FPS 直接混为一谈。


## 5. Reproduction

**状态：未实际复现。**先获取全文，确认结构、训练配置、消融与数据划分，再决定复现。

## 6. Critical Thinking

**可迁移价值：**微小目标边缘可能有用，也可能被传感器噪声淹没；需按尺寸与模态分层测试。

**局限：**缺本地 PDF；通用 RGBT 融合而非专门 tiny-SOT。

#### 对本课题的价值

频率分解可能帮助保留微小目标的边缘与局部结构；但微小目标的高频信号也可能被传感器噪声淹没。需要拿到全文确认频率模块、错位实验的扰动范围与复杂度。

## 7. 深度阅读标注

已补出版社官方方法图；仍待获取可核验全文后补充公式、完整实验表与页码。

## 8. Final Takeaway

1. **Problem：**跨模态显著区域和频率成分不同，直接融合可能放大局部错位与噪声。
2. **Method：**以 CFSR 分解高低频并重校准空间位置，再用异构 adapter 调整融合特征。
3. **Result / Evidence：**摘要称在四个常见基准上评测；具体指标未核对。

**一句话评价：**微小目标边缘可能有用，也可能被传感器噪声淹没；需按尺寸与模态分层测试。相关技术点尚不能当成已验证的“未配准 + tiny”联合方案。
