---
title: WPS for Linux 字体配置(字体缺失解决办法)
categories:
  - Ubuntu个性化
tags:
  - Ubuntu
readmore: true
hideTime: true
abbrlink: 5cd3f1bd
date: 2025-12-26 10:48:39
---

## 1. 背景

> **说明**
> 有些linux装完wps后提示“部分字体无法显示”或“some formula symbols might be not display”。这是因为缺少某些字体导致，主要是特殊符号或公式字体等等，而这些字体其实是在windows中可以找到的。有兴趣的自己去研究。

## 2. 解决方案
### 步骤一：下载字体库

- [点此下载字体库（百度网盘/提取码：g9ci）](https://pan.baidu.com/s/1AhdMyXPbYsEnP0PYlLbVtQ "点击这里下载字体库（鼠标悬浮查看密码）")

---

### 步骤二：安装字体库

#### 方法一：复制到 WPS 专用字体目录

1. 解压字体文件并复制到 WPS 字体目录：
    
    ```bash
    sudo unzip wps_symbol_fonts.zip -d /usr/share/fonts/wps-office
    ```
    
2. 重启 WPS 即可生效。
    

> **注意**：若 `/usr/share/fonts/` 下没有 `wps-office` 文件夹，请使用方法二。

---

#### 方法二：全局字体安装

1. 解压字体文件：
    
    ```bash
    sudo unzip wps_symbol_fonts.zip
    ```
    
2. 将解压出的字体文件（如 .ttf 文件）复制到系统字体目录，例如 `/usr/share/fonts` 或 `~/.fonts`（个人用户）：
    
    ```bash
    sudo cp *.ttf /usr/share/fonts/
    ```
    
3. 更新字体缓存：
    
    ```bash
    sudo mkfontscale
    sudo mkfontdir
    sudo fc-cache
    ```
    
4. 重启 WPS 客户端，字体问题消失。

#### 方法三：图形界面安装（适合小白）

1. 右键 zip 文件，选择“解压”。
2. 得到若干 ttf 字体文件。
3. 双击 .ttf 字体文件，选择“安装”按钮（每个都装一遍）。
