---
title: "论文阅读｜三分支多阶段融合：浅层局部信息与深层语义"
categories:
  - 视觉目标跟踪
tags:
  - "RGBT"
  - "单目标跟踪"
description: "阅读摘要： 微小目标局部结构在高层下采样和全局注意力中容易被稀释。通过三分支多阶段设计联合浅层 CNN 局部细节和深层 Transformer 语义，CFM 加强相邻 patch 信息。 证据边界： 缺本地 PDF；不能声称专门解决 tiny-SOT。"
readmore: true
mathjax: true
venue: "中国图象图形学报 2026"
cover: "https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@0df6e1a/img/rgbt-notes/Three-branch-Fusion/fig1-framework-clean.png"
paper_url: "https://www.cjig.cn/en/article/doi/10.11834/jig.250256/"
date: 2026-10-01 20:36:00
updated: 2026-10-01 23:00:00
abbrlink: "6772bf74"
---
> 本文根据个人阅读笔记整理。图表来自原论文或公开页面，仅用于学习与讨论。

**Venue:** 中国图象图形学报 2026  
**Paper:** [原文访问](https://www.cjig.cn/en/article/doi/10.11834/jig.250256/)  

<!-- more -->

## 三分支多阶段融合：浅层局部信息与深层语义

[期刊页面](https://www.cjig.cn/en/article/doi/10.11834/jig.250256/)

### Abstract

**阅读摘要：**微小目标局部结构在高层下采样和全局注意力中容易被稀释。通过三分支多阶段设计联合浅层 CNN 局部细节和深层 Transformer 语义，CFM 加强相邻 patch 信息。 **证据边界：**缺本地 PDF；不能声称专门解决 tiny-SOT。

**证据状态：**据出版社/期刊页面；本地无 PDF。

## 快速导航

- 上方 Zotero 与原文/出版页链接。
- **阅读边界：**缺本地 PDF；不能声称专门解决 tiny-SOT。

## 1. Motivation

**要解决的问题：**微小目标局部结构在高层下采样和全局注意力中容易被稀释。

**作者的核心思路：**通过三分支多阶段设计联合浅层 CNN 局部细节和深层 Transformer 语义，CFM 加强相邻 patch 信息。

**与本专题的关系：**缺本地 PDF；不能声称专门解决 tiny-SOT。因此要区分论文实际验证的任务与可迁移到“未配准 RGBT + tiny-SOT”的假设。

## 2. Contributions

以下是阅读归纳，而非论文原文的贡献编号：

1. **浅层局部特征：**保留 CNN 浅层局部结构。
2. **深层全局语义：**提供 Transformer 深层全局语义。
3. **多阶段 CFM 融合：**利用 CFM 整合相邻 patch 的局部特征。

## ️ 3. Method

### 3.1 Overall Pipeline

> **原文图。**论文 Figure 1：MSFT 总体框架，包括 CFM 与 AFEM。

![Three-branch-Fusion 原文 Figure 1：MSFT 框架](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@0df6e1a/img/rgbt-notes/Three-branch-Fusion/fig1-framework-clean.png)

### 3.2 Core Modules

| 模块 / 环节 | 作用 | 信息依据 |
|---|---|---|
| 浅层局部特征 | 保留 CNN 浅层局部结构 | 出版页/摘要 |
| 深层全局语义 | 提供 Transformer 深层全局语义 | 出版页/摘要 |
| 多阶段 CFM 融合 | 利用 CFM 整合相邻 patch 的局部特征 | 出版页/摘要 |

### 3.3 论文要点与细节

以下保留原阅读记录中可追溯的具体说明；其中“对本课题的启发”是研究推断，不是论文实验结论。

#### 核心思路

论文区分 CNN 擅长的浅层局部结构与 Transformer 擅长的深层全局语义，设计三分支、多阶段的 RGB-T 特征增强与融合。期刊摘要介绍了卷积融合模块（CFM）：在相邻 patch 间提取并整合局部特征，以减少注意力机制对局部细节的稀释。

### 3.4 Paper ↔ Code / Training & Inference

本次未核验官方代码或运行训练与推理。缺少本地全文，代码路径、公式和超参数均不作推测。

## 4. Experiments

### 4.1 原文主结果表

Table 1 汇总 LasHeR 上的对比结果，用于验证三分支、多阶段融合的总体收益。这里的主结论是通用 RGBT 跟踪性能提升，不能因为定性图中含小目标就改写成专门的 tiny-SOT 结论。

![Three-branch-Fusion 原文 Table 1：LasHeR 对比结果](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@0df6e1a/img/rgbt-notes/Three-branch-Fusion/tab1-main-results-clean.png)

### 4.2 阅读整理表（非原文表）

| 项目 | 已核对的结果或设定 | 来源 |
|---|---|---|
| 关键证据 | 期刊摘要说明 CFM 设计；完整拓扑与数值未核对 | 出版页/摘要 |
| 证据限制 | 缺本地 PDF；不能声称专门解决 tiny-SOT | 本笔记的任务定位 |

**指标口径：**只在同一论文和相同协议内解释数值；不把检测 AP、跟踪 PR/SR、MPR/MSR 或跨论文 FPS 直接混为一谈。

### 4.3 原文消融表

Table 4 逐项验证三分支框架及融合模块。阅读时应关注浅层局部信息与深层语义是否互补，而不是只记录最佳一行。

![Three-branch-Fusion 原文 Table 4：MSFT 模块消融](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@0df6e1a/img/rgbt-notes/Three-branch-Fusion/tab4-ablation-clean.png)

### 4.4 定性实验

Figure 5 比较 MSFT、TBSI、ViPT、BAT 与 CAT。在强曝光、小目标和热交叉序列中，MSFT 的框更接近标注；图中也能看到部分方法发生明显尺度膨胀或漂移，直观支持局部特征保留的必要性。

![Three-branch-Fusion 原文 Figure 5：LasHeR 困难序列的定性对比](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@0df6e1a/img/rgbt-notes/Three-branch-Fusion/fig5-qualitative-clean.png)


## 5. Reproduction

**状态：未实际复现。**先获取全文，确认结构、训练配置、消融与数据划分，再决定复现。

## 6. Critical Thinking

**可迁移价值：**浅层细节与深层语义协同值得测，但不能据此宣称 tiny 属性已改善。

**局限：**缺本地 PDF；不能声称专门解决 tiny-SOT。

#### 与微小目标的关系

微小目标容易在高层下采样和全局注意力中失去细节，因此保留浅层高分辨率信息有合理动机。但它仍是通用 RGBT 跟踪方法，不能据此声称论文专门解决 tiny-SOT。当前 Zotero 无 PDF，具体三分支拓扑、实验指标和小目标属性收益还需全文核对。

## 7. 深度阅读标注

已核对期刊官方 PDF，并补方法图、主结果表和模块消融表；尚未导入逐条高亮及公式页码索引。

## 8. Final Takeaway

1. **Problem：**微小目标局部结构在高层下采样和全局注意力中容易被稀释。
2. **Method：**通过三分支多阶段设计联合浅层 CNN 局部细节和深层 Transformer 语义，CFM 加强相邻 patch 信息。
3. **Result / Evidence：**期刊摘要说明 CFM 设计；完整拓扑与数值未核对。

**一句话评价：**浅层细节与深层语义协同值得测，但不能据此宣称 tiny 属性已改善。相关技术点尚不能当成已验证的“未配准 + tiny”联合方案。
