---
title: 复刻 Valaxy 两段式首页：为 Hexo 加入开场动画与个人主页
categories:
  - Seventh Knot
tags:
  - Hexo
  - Valaxy
  - 首页动画
  - Pug
  - JavaScript
readmore: true
hideTime: true
abbrlink: 73fda5c4
date: 2026-08-12 20:10:00
updated: 2026-08-12 20:10:00
---

# 复刻 Valaxy 两段式首页：为 Hexo 加入开场动画与个人主页

> 这次首页改造的重点不是复制一张静态页面，而是保留 Theme Yun 原本的文字动画，再用明确的状态切换衔接加载阶段和个人主页。

<!-- more -->

## 我想保留的体验

Valaxy 首页给我的启发，是让首页先完成一次短暂的视觉叙事，再向下交付真正的内容入口。Seventh Knot 的第一段仍然使用 Theme Yun 自带的 Banner 动画，文字是“世界需要七休日”；等待片刻后进入连接动画，最后弹出个人主页。

为了避免重写 Yun 的字符生成逻辑，我保留了原来的 `#banner` 结构：

```pug
#banner.home-sequence__banner
  .banner-line.vertical-line-top
  .banner-char-container
  .banner-line.vertical-line-bottom
```

原有 `banner.js` 继续负责字符方块、垂直线和进入动画。新的 Pug 只负责把 Banner、Loader、Profile、Cloud 和下拉箭头放进统一容器。

## 用状态而不是多个页面

首页没有跳转，也没有销毁并重新创建整块 DOM。JavaScript 只给根节点切换两个类：

```js
sequence.classList.add('home-sequence--loading')
sequence.classList.add('home-sequence--profile')
```

完整流程如下：

```text
初始状态
  └─ 显示 Yun Banner
       └─ 约 2.2 秒后进入 loading
            └─ 约 4 秒后进入 profile
```

CSS 根据根节点状态控制三个层的透明度、可见性、缩放和指针事件。这样既不会在动画期间误点隐藏元素，也便于后续调整时序。

## 为什么中间需要加载阶段

如果第一段结束后直接弹出个人主页，两个画面之间会显得过于突然。加载阶段承担了三个作用：

- 给第一段动画一个明确的结束点；
- 用系统连接语义解释界面切换；
- 为第二段个人主页提供视觉蓄力。

加载阶段包含网格、旋转扫描线、终端面板、邦布动画和进度条。它只存在约 1.8 秒，因此所有信息都必须一眼可读。

![Seventh Knot 首页加载阶段运行截图](/images/screenshots/seventh-knot-home-loading.png)

## 下拉箭头属于页面本身

下拉箭头必须放在首页内部，而不是悬浮在浏览器窗口之外。它链接到文章区域：

```html
<a href="#recent-posts" aria-label="向下浏览文章"></a>
```

点击后通过 `scrollIntoView` 平滑滚动：

```js
articles.scrollIntoView({
  behavior: reduceMotion ? 'auto' : 'smooth',
  block: 'start'
})
```

箭头放在云层上方，并使用轻微浮动动画。它足够明显，但不会变成一个抢夺注意力的大按钮。

## 无障碍与重复初始化

页面同时监听 `DOMContentLoaded` 和 `pjax:success`。每次初始化前都会清除旧计时器，避免 PJAX 返回首页时出现多套动画叠加。

对于开启“减少动态效果”的用户，等待时间被设为零，并禁用大部分过渡：

```js
const reduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches
```

动画可以增强表达，但不应该成为访问内容的障碍。

## 最终效果

![Seventh Knot 桌面端首页运行截图](/images/screenshots/seventh-knot-home-desktop.png)

这套实现没有照搬 Valaxy 的组件代码，而是保留 Theme Yun 原版 Banner，再按照相同的两段式体验重组首页。最终得到的不是互不相关的动画集合，而是一条完整路径：看到标题、建立连接、进入个人节点，然后继续阅读文章。
