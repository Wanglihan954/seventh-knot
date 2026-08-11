---
title: 给深度改造的 Hexo 博客一个新名字：Seventh Knot 的项目化与 GitHub 迁移
categories:
  - Seventh Knot
tags:
  - GitHub
  - Git
  - 项目命名
  - 开源
  - Hexo
readmore: true
hideTime: true
abbrlink: d0c4982b
date: 2026-08-12 21:00:00
updated: 2026-08-12 21:00:00
---

# 给深度改造的 Hexo 博客一个新名字：Seventh Knot 的项目化与 GitHub 迁移

> 当一个博客开始拥有自己的模板、交互、脚本和设计语言时，给它一个正式名字不是包装，而是在明确它接下来如何被维护。

<!-- more -->

## 为什么叫 Seventh Knot

项目最终命名为 **Seventh Knot · 第七绳结**。

“Seventh”来自首页文字“世界需要七休日”，“Knot”对应 Inter-Knot 的绳网概念。组合在一起，它既能指向首页最有辨识度的内容，也表达了“个人网络节点”的项目定位。

站点当前显示标题仍然保留“宁翰のHEXO”，而 Seventh Knot 作为代码仓库与整体改造项目的名称。项目名和站点标题不必完全相同：前者服务维护与传播，后者服务页面中的个人表达。

## 先补齐项目元数据

原来的 `package.json` 使用通用名称 `hexo-site` 和版本 `0.0.0`。项目化后更新为：

```json
{
  "name": "seventh-knot",
  "version": "1.0.0",
  "description": "Seventh Knot - an Inter-Knot inspired personal Hexo node.",
  "private": true
}
```

同时补充作者、主页和仓库地址。`private: true` 可以避免误把博客根项目发布到 npm，它不影响 GitHub 仓库是否公开。

## README 应该回答什么

一个基础 README 至少需要回答：

- 这个项目是什么；
- 它和 Theme Yun 有什么关系；
- 目前实现了哪些功能；
- 如何本地安装、预览和构建；
- 主要代码放在哪里；
- 第三方代码与素材遵循什么规则。

Seventh Knot 的 README 还特别说明：它是基于 Hexo 与 Theme Yun 的深度改造项目，不是全新的静态站点生成器；《绝区零》和邦布等素材属于其权利人，本项目为非官方个人博客。

## 重命名现有仓库，而不是新建空仓库

如果原仓库已经保存完整提交历史，最合适的方法是在 GitHub 仓库设置中直接重命名。这样可以保留历史、分支和仓库设置，也避免新建仓库后处理两套不相关的初始提交。

仓库重命名后，本地更新远端：

```bash
git remote set-url origin \
  git@github.com:Wanglihan954/seventh-knot.git
git remote -v
```

README 中的克隆地址和 `package.json` 中的仓库地址也要同步修改。

## 把开发分支安全合入 main

新版功能最初集中在 `test` 分支，而 `main` 保留了自己的提交。两个分支已经分叉，因此不应该直接强推覆盖。

更稳妥的流程是：

```bash
git fetch origin main test
git switch main
git merge --no-ff test
npm run build
git push origin main
```

如果发生冲突，应按文件职责处理。站点配置采用最新开发版本；编辑器工作区状态则保留 `main`，避免将临时界面状态误当成程序更新。

最终 `main` 同时保留双方提交历史，并成为 GitHub 默认展示的最新版本。

## 关于公开、许可证和素材

仓库可以设置为公开，但不代表仓库中的所有内容自动允许任意使用。Theme Yun 自身遵循 MIT License；个人文章、个人图片和第三方游戏素材需要分别说明权属。

在没有为原创代码和文章确定完整授权策略之前，不应随意给整个仓库添加一个覆盖所有内容的许可证。更完善的做法，是未来将“原创程序”“文章内容”“第三方素材”分开声明。

## 项目化之后发生了什么

命名和 README 不会直接改变页面效果，却会改变维护方式：新增功能需要考虑它是否符合 Seventh Knot 的视觉系统；修改文件时需要说明属于上游主题还是项目扩展；发布时以 `main` 的可构建状态为准。

从这一刻开始，博客不再只是一个存放文章的目录，而是一个有名称、有版本、有边界，也有继续演进方向的个人项目。

