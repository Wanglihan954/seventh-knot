# Seventh Knot 更新笔记

Seventh Knot 是基于 Hexo 与 Theme Yun 深度改造的个人博客。项目说明、运行方式和完整截图索引见仓库根目录的 `README.md`。

项目仓库：[Wanglihan954/seventh-knot](https://github.com/Wanglihan954/seventh-knot)

## 2026-08-12 · 运行截图同步

本次在本地启动 Hexo 后，按实际运行页面补充了八张截图：

- 桌面端两段式首页完成态；
- 首页加载面板与文章卡片阅读流；
- 分类页与代理人档案页；
- 390 × 844 移动端首页；
- 移动端展开导航；
- 桌面端文章阅读页。

![Seventh Knot 桌面端首页](/images/screenshots/seventh-knot-home-desktop.png)

截图同时同步到 README 与对应的 Seventh Knot 改造笔记，后续界面发生明显变化时应重新运行站点并更新这些图片。

## 2026-08-12 · 导航栏配置化与邦布图标同步

本次把顶部导航从模板硬编码迁移到 `_config.yun.yml`，同时完成 Seventh Knot 品牌文案与代理人档案邦布图标的同步。

### 配置入口

导航栏统一在 `_config.yun.yml` 的 `menu` 下维护：

- `brand`：顶部中央站点名称；
- `badge`：左下角黄色标牌，空字符串可隐藏；
- `mobile`：移动端菜单名称与图标；
- `home`：首页入口；
- `list`：桌面端导航项目，数组顺序就是显示顺序；
- `actions`：主题切换和搜索按钮的名称与图标。

单个导航项目支持 `title`、`path`、`target` 和 `color`，图标可使用以下任一种方式：

```yaml
icon: ri:github-line                 # Iconify
image: /images/example.png           # 原色图片
mask_image: /images/bangboo-nav.png  # 跟随文字颜色的遮罩图标
```

新增 GitHub 仓库入口的示例：

```yaml
- title: GitHub 仓库
  path: https://github.com/Wanglihan954/seventh-knot
  icon: ri:github-line
  target: _blank
```

代理人档案页通过 Front Matter 中的 `title_icon: bangboo` 使用邦布标题图标；如需保留彩色页面图标，可改用 `title_image: /images/example.png`。

![配置化后的 Seventh Knot 导航栏](/images/screenshots/seventh-knot-navbar-detail.png)

对应博客文章：[[从硬编码到配置驱动——用_config.yun.yml管理Seventh Knot导航栏]]。
