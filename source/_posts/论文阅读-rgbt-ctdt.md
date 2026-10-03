---
title: "论文阅读｜CTDT：从全图小目标检测衔接到单目标跟踪"
categories:
  - "文献阅读"
  - "RGBT 跟踪"
tags:
  - "RGBT"
  - "RGB"
  - "UAV"
  - "小目标"
  - "检测与跟踪"
description: "阅读摘要： 全图缩放会抹去几十像素目标的细节，纯局部跟踪又容易因目标出窗而漂移。先用全图裁切检测检索候选，再通过动态局部裁切持续跟踪单目标。 证据边界： 缺本地 PDF；密集遮挡场景适用性待核对。"
readmore: true
mathjax: true
venue: "Chinese Journal of Aeronautics 2026"
cover: "https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/CTDT/fig2-framework.jpg"
paper_url: "https://www.sciencedirect.com/science/article/pii/S1000936125005230"
date: 2026-10-01 20:03:00
updated: 2026-10-01 23:00:00
abbrlink: "c17f710e"
---
> 本文根据个人阅读笔记整理。图表来自原论文或公开页面，仅用于学习与讨论。

**Venue:** Chinese Journal of Aeronautics 2026  
**Paper:** [原文访问](https://www.sciencedirect.com/science/article/pii/S1000936125005230)  

<!-- more -->

## CTDT：从全图小目标检测衔接到单目标跟踪

[出版社页面](https://www.sciencedirect.com/science/article/pii/S1000936125005230)

### Abstract

**阅读摘要：**全图缩放会抹去几十像素目标的细节，纯局部跟踪又容易因目标出窗而漂移。先用全图裁切检测检索候选，再通过动态局部裁切持续跟踪单目标。 **证据边界：**缺本地 PDF；密集遮挡场景适用性待核对。

**证据状态：**据出版社/期刊页面；本地无 PDF。

## 快速导航

- 上方 Zotero 与原文/出版页链接。
- **阅读边界：**缺本地 PDF；密集遮挡场景适用性待核对。

## 1. Motivation

**要解决的问题：**全图缩放会抹去几十像素目标的细节，纯局部跟踪又容易因目标出窗而漂移。

**作者的核心思路：**先用全图裁切检测检索候选，再通过动态局部裁切持续跟踪单目标。

**与本专题的关系：**缺本地 PDF；密集遮挡场景适用性待核对。因此要区分论文实际验证的任务与可迁移到“未配准 RGBT + tiny-SOT”的假设。

## 2. Contributions

以下是阅读归纳，而非论文原文的贡献编号：

1. **全图裁切检测：**全图裁切检索多个目标。
2. **候选目标选择：**从候选中选定需要持续跟踪的目标。
3. **动态局部跟踪：**依据历史位置动态裁切并过滤结果。

## ️ 3. Method

### 3.1 Overall Pipeline

> **原文图。**Elsevier 官方 Figure 2 资源：CTDT 检测—跟踪总体框架。

![CTDT 原文 Figure 2：检测—跟踪框架](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/CTDT/fig2-framework.jpg)

### 3.2 Core Modules

| 模块 / 环节 | 作用 | 信息依据 |
|---|---|---|
| 全图裁切检测 | 全图裁切检索多个目标 | 出版页/摘要 |
| 候选目标选择 | 从候选中选定需要持续跟踪的目标 | 出版页/摘要 |
| 动态局部跟踪 | 依据历史位置动态裁切并过滤结果 | 出版页/摘要 |

Figure 3 展开了 CTFE 网络。它不是另一张总体流程图，而是检测与跟踪阶段共用的特征提取单元：多尺度卷积分支通过残差连接聚合，目的是在裁切区域内保留小目标响应。

![CTDT 原文 Figure 3：CTFE 多尺度特征提取网络](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/CTDT/fig-03.jpg)

### 3.3 论文要点与细节

以下保留原阅读记录中可追溯的具体说明；其中“对本课题的启发”是研究推断，不是论文实验结论。

#### 问题与方法

当目标在大幅 UAV 图像中仅占几十像素，固定缩放全图会抹掉细节。CTDT 把分析分成检测和跟踪两个阶段：检测阶段裁切整幅图寻找多个候选目标；跟踪阶段根据目标先前位置动态调整裁切区域。两个阶段都使用裁切、采样、识别和结果过滤，但空间搜索范围不同。

出版社页面给出的场景假设包括目标稀疏、相互不重叠，主要尺寸约 20×20 至 60×60 像素，且不考虑目标类别。这些前提限制了方法对密集遮挡场景的直接适用性。

### 3.4 Paper ↔ Code / Training & Inference

本次未核验官方代码或运行训练与推理。缺少本地全文，代码路径、公式和超参数均不作推测。

## 4. Experiments

### 4.1 对比实验

Figure 11 同时给出 UAVDT、UAV123 与 DTB70 上的成功率和精度曲线。红色曲线在多个阈值区间保持领先，说明收益不只来自某一个固定阈值；但三套数据的曲线应分别阅读，不能把不同协议的分数横向相加。

![CTDT 原文 Figure 11：三个 UAV 基准上的 OPE 对比曲线](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/CTDT/fig-11.jpg)

### 4.2 定性实验

Figure 12 展示多段 UAV 序列上的逐帧框对比。它主要支持“检测负责重新发现、局部跟踪负责连续定位”的设计动机：在尺度变化、快速运动和背景干扰下，CTDT 的框更稳定；单张成功案例不能替代定量曲线。

![CTDT 原文 Figure 12：典型 UAV 序列的定性跟踪对比](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/rgbt-notes/CTDT/fig-12.jpg)

### 4.3 阅读整理表（非原文表）

| 项目 | 已核对的结果或设定 | 来源 |
|---|---|---|
| 关键证据 | 出版社页面给出 20×20–60×60 像素、目标稀疏等场景假设 | 出版页/摘要 |
| 证据限制 | 缺本地 PDF；密集遮挡场景适用性待核对 | 本笔记的任务定位 |

**指标口径：**只在同一论文和相同协议内解释数值；不把检测 AP、跟踪 PR/SR、MPR/MSR 或跨论文 FPS 直接混为一谈。


## 5. Reproduction

**状态：未实际复现。**先获取全文，确认结构、训练配置、消融与数据划分，再决定复现。

## 6. Critical Thinking

**可迁移价值：**低频全图重检加高频局部跟踪可降低出窗漂移；RGB/TIR 裁切中心不应强行共用。

**局限：**缺本地 PDF；密集遮挡场景适用性待核对。

#### 对 RGBT tiny-SOT 的启发

当目标出搜索窗时，局部 SOT 容易漂移；“低频全图候选检索 + 高频局部跟踪”的两级策略值得考虑。若扩展到 RGB-T，裁切中心应分别适应双模态坐标，不能共用一个未经校准的框。当前缺少本地全文，具体识别网络和定量收益待核查。

## 7. 深度阅读标注

已补出版社官方方法图；仍待获取可核验全文后补充完整实验表、公式与页码。

## 8. Final Takeaway

1. **Problem：**全图缩放会抹去几十像素目标的细节，纯局部跟踪又容易因目标出窗而漂移。
2. **Method：**先用全图裁切检测检索候选，再通过动态局部裁切持续跟踪单目标。
3. **Result / Evidence：**出版社页面给出 20×20–60×60 像素、目标稀疏等场景假设。

**一句话评价：**低频全图重检加高频局部跟踪可降低出窗漂移；RGB/TIR 裁切中心不应强行共用。相关技术点尚不能当成已验证的“未配准 + tiny”联合方案。
