---
title: Ubuntu 24.04 安装 Parsec 及解决视频解码器 -10 错误
categories:
  - Ubuntu个性化
tags:
  - Ubuntu
  - Parsec
  - remote-desktop
  - troubleshooting
readmore: true
hideTime: true
abbrlink: 9a3bf775
date: 2026-07-29 14:30:00
updated: 2026-07-29 14:30:00
---

# Ubuntu 24.04 安装 Parsec 及解决视频解码器 -10 错误

> **摘要 · 解决方案**
> 在 **Settings → Client → Decoder** 中选择 **Software**，并将 **H.265 (HEVC)** 设置为 **Off**。  
> 连接日志出现 `FFMPEG 6 Software`，且不再出现 `decode_frame = -10`，说明设置已经生效。

<!-- more -->

## 一、环境与问题现象

本文对应的测试环境如下：

| 项目 | 配置 |
| --- | --- |
| 系统 | Ubuntu 24.04 LTS |
| 架构 | x86_64 / amd64 |
| Parsec | 150-104a |
| 核显 | Intel Iris Xe Graphics |
| 独显 | NVIDIA GeForce MX330 |
| PRIME 模式 | on-demand |

连接远程电脑时，Parsec 显示以下错误：

> Parsec couldn't find a compatible video decoder `[-10]`

日志中可以看到：

```text
FFMPEG 6 NVIDIA
decode_frame[341] = -10
```

> **警告**
> Parsec 官方目前只明确支持 Ubuntu 22.04 LTS Desktop。Ubuntu 24.04 通常可以运行，但可能遇到显卡驱动、混合显卡或视频解码兼容问题。

> **说明**
> Linux 版 Parsec 只能作为客户端连接其他电脑，不能将 Linux 电脑作为 Parsec 主机。

---

## 二、安装 Parsec

### 1. 下载官方安装包

```bash
curl -fL https://builds.parsec.app/package/parsec-linux.deb \
  -o parsec-linux.deb
```

### 2. 安装

```bash
sudo apt install ./parsec-linux.deb
```

### 3. 验证安装

```bash
dpkg-query -W -f='${Status} ${Version}\n' parsec
command -v parsecd
```

正常情况下应看到：

```text
install ok installed 150-104a
/usr/bin/parsecd
```

启动 Parsec：

```bash
parsecd
```

也可以在 Ubuntu 应用菜单中搜索 **Parsec**。

---

## 三、`-10` 错误原因

### 1. 检查显卡

```bash
lspci -nnk | grep -A4 -Ei 'VGA|3D controller|Display controller'
```

本机同时存在 Intel 核显和 NVIDIA 独显。

检查 DRI 设备：

```bash
for p in /dev/dri/by-path/*; do
  printf '%s -> %s\n' "$p" "$(readlink -f "$p")"
done
```

本机的映射结果为：

```text
NVIDIA -> /dev/dri/renderD128
Intel  -> /dev/dri/renderD129
```

桌面和 OpenGL 实际运行在 Intel 核显上：

```bash
glxinfo -B | grep -E 'direct rendering|OpenGL vendor|OpenGL renderer'
```

```text
direct rendering: Yes
OpenGL vendor string: Intel
OpenGL renderer string: Mesa Intel(R) Iris(R) Xe Graphics (TGL GT2)
```

### 2. 根本原因

在 PRIME `on-demand` 模式下，NVIDIA 被枚举为第一个渲染节点 `renderD128`，Intel 则是 `renderD129`。

Parsec 自动选择了 NVIDIA 解码器，但当前组合下 NVIDIA 硬件解码初始化失败：

```text
Failed to initialise VAAPI connection
VDPAU device creation on X11 display :0 failed
FFMPEG 6 NVIDIA
decode_frame[341] = -10
```

Intel VA-API 本身是正常的，可以使用下面的命令验证：

```bash
ffmpeg -hide_banner -loglevel error \
  -init_hw_device vaapi=intel:/dev/dri/renderD129 \
  -filter_hw_device intel \
  -f lavfi -i color=c=black:s=128x128:d=0.05 \
  -vf 'format=nv12,hwupload' \
  -frames:v 1 -f null -
```

如果命令没有报错，则说明 Intel 硬件接口正常，问题主要在于 Parsec 的自动解码器选择。

---

## 四、解决 `-10` 错误

### 方法一：在 Parsec 界面切换为软件解码（推荐）

1. 打开 Parsec。
2. 点击左侧的 **Settings** 齿轮。
3. 进入 **Client** 标签页。
4. 向下滚动到 **Decoder**。
5. 将 Decoder 从 **NVIDIA** 改为 **Software**。
6. 将 **H.265 (HEVC)** 设置为 **Off**。
7. 返回 **Computers** 页面并重新连接。

> **重要**
> Parsec 150-104a Alpha 版已经不再使用旧的 `decoder_software` 配置键。直接修改 `config.txt` 或使用 `decoder_software=1` 命令行参数可能被忽略，因此应优先在图形界面中选择 **Software**。

如果设置页显示：

```text
Some decoders have been disabled by a previous crash
```

说明 Parsec 已记录过解码器崩溃。只要 **Software** 仍可选择，就直接选择 Software，不需要重新启用发生崩溃的 NVIDIA 解码器。

### 验证是否成功

连接后检查日志：

```bash
grep -Ei 'FFMPEG|decode_frame|decoder' ~/.parsec/log.txt | tail -20
```

修复后应看到：

```text
FFMPEG 6 Software
```

同时不应再出现新的：

```text
decode_frame[341] = -10
```

> **提示**
> 软件解码会增加 CPU 占用。如果画面不够流畅，可将远端分辨率暂时降低到 `1920×1080`，并使用 `60 FPS`；仍不流畅时可以继续降低到 `30 FPS`。

---

## 五、连接后占满整个屏幕

Parsec 默认可能使用全屏模式。

### 临时切换

按下：

```text
Ctrl + Shift + W
```

即可在全屏与窗口模式之间切换。

如果快捷键无效，可以按：

```text
Ctrl + Shift + M
```

打开 Parsec 菜单，然后选择：

```text
Window Mode → Windowed
```

### 永久使用窗口模式

断开连接后进入：

```text
Settings → Client → Window Mode → Windowed
```

---

## 六、其他排查方法

### 1. 查看 Parsec 日志

```bash
tail -f ~/.parsec/log.txt
```

只筛选解码相关日志：

```bash
grep -Ei 'decoder|decode|FFMPEG|VAAPI|VDPAU|NVIDIA' \
  ~/.parsec/log.txt
```

### 2. 检查 Parsec 是否正在运行

```bash
pgrep -a -f '^/usr/bin/parsecd($| )'
```

### 3. 出现 “File System Error - Skel Crash”

Parsec 连续崩溃后，会在 `~/.parsec/cc0.txt` 中记录崩溃次数。当计数达到阈值时，即使程序文件没有损坏，启动器也可能阻止客户端启动。

先比较程序文件校验值：

```bash
sha256sum \
  /usr/share/parsec/skel/parsecd-150-104a.so \
  ~/.parsec/parsecd-150-104a.so
```

如果两个 SHA-256 完全一致，可以先关闭 Parsec，再将崩溃计数文件改名备份：

```bash
mv ~/.parsec/cc0.txt ~/.parsec/cc0.txt.backup
```

然后重新启动：

```bash
parsecd
```

> **谨慎操作**
> 只有在系统原版和用户目录中的 Parsec 组件校验值完全一致时，才建议重置崩溃计数。若校验值不同，应重新安装 Parsec。

---

## 七、最终检查清单

- [x] Parsec 安装状态为 `install ok installed`
- [x] Decoder 设置为 `Software`
- [x] H.265 设置为 `Off`
- [x] 日志显示 `FFMPEG 6 Software`
- [x] 日志不再出现新的 `decode_frame = -10`
- [x] 可以成功连接远程电脑
- [x] 使用 `Ctrl + Shift + W` 切换窗口模式

---

## 参考资料

- [Parsec 下载页面](https://parsec.app/downloads)
- [Parsec App for Linux](https://support.parsec.app/hc/en-us/articles/32381494397332-Parsec-App-for-Linux)
- [Error Codes - 10](https://support.parsec.app/hc/en-us/articles/32361372742036-Error-Codes-10-Parsec-couldn-t-find-a-compatible-video-decoder)
- [Software Versus Hardware Accelerated Decoding](https://support.parsec.app/hc/en-us/articles/32361394388500-Software-Versus-Hardware-Accelerated-Decoding)
