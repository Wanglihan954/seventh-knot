---
title: 从硬编码到配置驱动：用 _config.yun.yml 管理 Seventh Knot 导航栏
categories:
  - Seventh Knot
tags:
  - Hexo
  - Theme Yun
  - 导航栏
  - 配置化
  - 邦布
readmore: true
hideTime: true
abbrlink: 7c4e2b91
date: 2026-08-12 03:00:00
updated: 2026-08-12 03:00:00
---

# 从硬编码到配置驱动：用 `_config.yun.yml` 管理 Seventh Knot 导航栏

> 一个导航栏真正变得容易维护，不是因为图标画得更漂亮，而是因为下一次调整时不再需要翻模板。

Seventh Knot 最近完成了三件彼此相关的小改造：站点名称和文案正式统一为 **Seventh Knot · 第七绳结**，代理人入口的旧符号被邦布图标替代，顶部导航也从 Pug 模板中的硬编码链接迁移到了 `_config.yun.yml`。项目源码与后续更新记录保存在 [Wanglihan954/seventh-knot](https://github.com/Wanglihan954/seventh-knot)。

![配置化后的 Seventh Knot 导航栏](/images/screenshots/seventh-knot-navbar-detail.png)

<!-- more -->

## 为什么要把导航栏移出模板

改造前，首页、归档、分类和标签虽然已经读取了一部分主题配置，但“友链”和“代理人档案”仍直接写在 `nav.pug` 中，站点名称、黄色编号标牌以及右侧操作按钮也散落在模板和 CSS 里。

这种写法在界面还没有稳定时很直接，但每次重命名、换图标或调整顺序都必须修改模板；内容配置和页面结构混在一起，也容易发生“配置已经改了，页面还沿用旧图标和旧文字”的不同步问题。

这次改造把导航栏拆成五组配置：

- `brand`：顶部中央的站点名称；
- `badge`：左下角黄色的 Inter-Knot 标牌；
- `mobile`：移动端菜单按钮；
- `home` 与 `list`：首页和左侧导航项目；
- `actions`：右侧主题切换与搜索按钮。

模板只负责遍历配置并生成结构，日常维护则集中在 `_config.yun.yml`。

## 当前的导航配置

现在的核心配置如下：

```yaml
menu:
  brand: Seventh Knot
  badge: INTER-KNOT // 20020730

  mobile:
    title: 菜单
    icon: ri:menu-line

  home:
    title: 首页
    path: /
    icon: ri:home-4-line

  list:
    - title: 归档
      path: /archives/
      icon: ri:archive-line
    - title: 分类
      path: /categories/
      icon: ri:folder-2-line
    - title: 标签
      path: /tags/
      icon: ri:price-tag-3-line
    - title: 我的小伙伴们
      path: /links/
      icon: ri:links-line
    - title: 代理人档案
      path: /girls/
      mask_image: /images/bangboo-nav.png

  actions:
    theme:
      title: 切换主题
      icon: ri:contrast-2-line
    search:
      title: 搜索
      icon: ri:search-line
```

以后需要新增入口时，只需在 `menu.list` 中增加一项。例如，把 GitHub 仓库放进顶部导航：

```yaml
- title: GitHub 仓库
  path: https://github.com/Wanglihan954/seventh-knot
  icon: ri:github-line
  target: _blank
```

项目的显示顺序就是 YAML 中的排列顺序，删除项目也不会再碰到模板代码。

## 让配置同时支持三种图标

并不是所有图标都适合来自同一套图标库，因此导航渲染器提供了三种入口：

```yaml
# Iconify 图标
icon: ri:archive-line

# 保留图片原来的颜色
image: /images/example.png

# 把图片作为单色遮罩，颜色跟随导航状态
mask_image: /images/bangboo-nav.png
```

邦布使用的是 `mask_image`。CSS 通过 `mask-image` 读取它的轮廓，再用 `currentColor` 填充，因此它能像普通 Iconify 图标一样继承导航栏颜色，并在悬停时切换成黑色，不需要额外准备黑白两套素材。

![邦布图标、代理人标题与最新版页面](/images/screenshots/seventh-knot-configurable-navbar.png)

## 邦布不只出现在导航栏

代理人档案页原来使用的是 `ri:women-line`，它更像一个通用分类符号，和页面里的绝区零主题没有直接关系。现在页面 Front Matter 改为：

```yaml
title_icon: bangboo
```

页面标题渲染器会识别这个值，输出同一套邦布遮罩图标。这样顶部导航、代理人标题和侧边栏入口共享相同的视觉语言，但仍能根据所在区域继承不同颜色。

同时，页面标题还预留了 `title_image`：如果以后某个独立页面需要保留彩色图片，可以直接填写图片路径，不必再添加专用模板。

## 顺手修掉一个配置化后的边界问题

配置项变得可选后，图标渲染函数有机会收到空值。旧实现会直接执行 `name.indexOf(...)`，因此在合并默认主题配置时可能触发构建错误。

现在图标 mixin 会先检查 `name` 是否存在，再判断它属于 Iconify、Material Icons 还是主题内置 SVG。这个改动很小，却是“配置可以省略”真正成立的前提。

## 这次改造留下的维护规则

导航栏现在形成了一条更清楚的边界：

1. 改名称、顺序、链接和图标，编辑 `_config.yun.yml`；
2. 改导航结构或交互，编辑 `themes/yun/layout/_partial/nav.pug`；
3. 改尺寸、遮罩和悬停效果，编辑 `source/css/custom_theme.css`；
4. 改某个页面的标题图标，编辑该页面 Front Matter。

从视觉上看，这次更新只是把一个符号换成邦布，并把站点名称统一为 Seventh Knot；从维护角度看，它把未来最常见的导航调整变成了纯配置操作。对于仍在持续生长的个人博客，这种小型接口往往比再增加一个华丽动画更有价值。
