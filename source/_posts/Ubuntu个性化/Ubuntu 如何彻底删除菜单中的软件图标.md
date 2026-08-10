---
title: Ubuntu 如何彻底删除菜单中的软件图标？三种实用方法全解析
categories:
  - Ubuntu个性化
tags:
  - Ubuntu
  - 桌面环境
readmore: true
hideTime: true
abbrlink: 78f76398
date: 2026-04-24 00:24:25
updated: 2026-04-24 00:24:25
---

# Ubuntu 如何彻底删除菜单中的软件图标？三种实用方法全解析

在 Ubuntu 桌面环境（如 GNOME）中，有时候卸载软件后，应用菜单里仍然残留一些无用的软件图标。要彻底清除这些图标，通常需要删除或隐藏对应的 `.desktop` 启动器文件。下面分享三种常用方法：

---

## 方法一：删除用户级 `.desktop` 文件（针对本地用户安装或自定义快捷方式）

1. 打开终端。
    
2. 查看当前用户下所有快捷方式：
    
    ```bash
    ls ~/.local/share/applications
    ```
    
3. 找到你要删除的那个图标对应的 `.desktop` 文件，如 `example-app.desktop`。
    
4. 删除该文件：
    
    ```bash
    rm ~/.local/share/applications/example-app.desktop
    ```
    

---

## 方法二：删除系统级 `.desktop` 文件（针对系统预装或全局软件）

1. 以管理员身份查看所有系统级快捷方式：
    
    ```bash
    ls /usr/share/applications
    ```
    
2. 找到对应的 `.desktop` 文件名，比如 `org.gnome.Calculator.desktop`。
    
3. 删除它（需 sudo 权限）：
    
    ```bash
    sudo rm /usr/share/applications/org.gnome.Calculator.desktop
    ```
    
    ⚠️ 注意：此操作会影响所有用户，建议先备份再删除：
    
    ```bash
    sudo mv /usr/share/applications/org.gnome.Calculator.desktop ~/Desktop/
    ```
    

---

## 方法三：隐藏图标而不删除（安全推荐）

如果你只是不想让图标在菜单中显示，而又想保留文件，可以选择隐藏它：

1. 编辑对应的 `.desktop` 文件（如用 nano 编辑器）：
    
    - 用户级：
        
        ```bash
        nano ~/.local/share/applications/example-app.desktop
        ```
        
    - 系统级（需加 sudo）：
        
        ```bash
        sudo nano /usr/share/applications/example-app.desktop
        ```
        
2. 在文件末尾添加一行：
    
    ```
    NoDisplay=true
    ```
    
3. 保存并关闭，图标将不再显示，但文件依旧存在且可恢复。
    

---

## 补充技巧：如何快速查找对应的 `.desktop` 文件？

如果你不确定某个软件图标对应哪个 `.desktop` 文件，可以用关键词在所有启动器中搜索：

```bash
grep -ril "应用名称" /usr/share/applications
```

把 “应用名称” 替换为对应软件的名称或关键字即可。
