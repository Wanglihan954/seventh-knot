---
title: Linux命令
categories:
  - Ubuntu个性化
tags:
  - Ubuntu
  - Linux
  - 命令行
readmore: true
hideTime: true
date: '2026-04-24 00:26'
abbrlink: 82734d8
updated: 2026-05-10 00:08:53
---

# Linux命令
## 必会命令
1. 系统信息查询
   > **说明**
   > + whoami：（**Who am I**）查看当前登录用户名
   > + pwd：（**P**rint **W**orking **D**irectory）查看当前在哪个目录
   > + hostname：查看主机名
   > + date：系统时间
   > + uptime：查看系统开机多久
   > + cal：日历
2. 探索与帮助
> **说明**
   > + history：查看输入过的<mark>所有</mark>历史命令列表
   > + man：（**man**ual）查看命令使用方法
   > + which/whereis：which只找到这个程序，whereis找到命令的九族
3. 文件创建与操作
   > **说明**
   >+ mkdir：创建目录
   >+ cd：进入目录
   >+ touch：创建空文件
   >+ ls：查看目录所有内容
## apt、yum、dnf……
apt管Debian系（deb）、yum管CentOS 7以前的、dnf管CentOS 8+，Fedora（rpm）

| 功能   | apt          |
| ---- | ------------ |
| 安装   | install      |
| 卸载   | remove       |
| 更新源  | update       |
| 升级系统 | full-upgrade |
| 清理依赖 | autoremove   |
## 系统信息查看
![image.png|561](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/20260504212157667.png)


1. 检查内核
   > **说明**
   >+ uname -a：查看内核版本
   >+ cat /proc/version
   >+ dmesg：查看内核日志与硬件
2. 识别系统
   > **说明**
   >+ cat /etc/os-release
   >+ hostnamectl：查看系统发行版
3. 识别CPU
   > **说明**
   >+ lscpu：查看cpu硬件
   >+ cat /proc.cpuinfo
   
## 关机
1. 简单快速关机：halt、poweroff（相当于直接拔插头）
2. 简单的重启：reboot
3. 高级的关机：shutdown（定时关机，适合在服务器上用，广播全部用户）
   > **示例 · 实际案例**
   > shutdown +5：5分钟后关机
   > shutdown -h 21:00：21：00关机
   > shutdown -c：取消定时关机

---
## hostnamectl
显示与设置主机名称（**hostname** **c**on**t**ro**l**）
> **示例 · 实际演练**
>+ `hostnamectl status`：查看基本信息
>+ `hostnamectl set-hostname "new-web-server"`：即时更改主机名为"new-web-server"`

## 时间管理 date vs timedatectl
+ date：显示或设置系统时间（临时修改）
+ timedatectl：设置系统时间，写进系统配置文件，长期有效

| command        | descriptions |
| -------------- | ------------ |
| list-timezones | 列出支持的时区<br>  |
| set-timezone   | 设置系统时区       |
| set-ntp        | 打开或改变自动同步时间  |
## localectl
查询和修改系统本地化与键盘布局设置
1. localectl status
2. localectl list-locales
3. sudo loaclectl set-locale
---
## cd
cd（**c**hange **d**irectory）
+ `cd+目录名`
+ `cd ~`：回家
+ `cd  ..`：去上一级
+ `cd -`：切换至上一次所在目录（回退）

## ls
 - ls -a：查看所有文件（包括隐藏文件）
 - ls -lh：获取更加详细信息（文件所有者、文件大小）（**l**ong format 长格式/**h**uman redable 方便阅读）
 - 排序：-S（**s**ize）  -t（**t**ime）  -r（**r**everse）
 - 组合：上述所有的参数可以自由组合实现定制效果（ex. ls -Slh：按大小排序同时展示详细信息）

## pwd
告诉你现在在哪个文件夹（绝对路径）
+ pwd -L（**L**ogical Path）：告诉你快捷方式本身所在路径
+ pwd -P（**P**hysical Path）：告诉你快捷方式指向的最终文件路径

## cp
cp：（**c**o**p**y）复制文件或者目录。
基本cp蓝图：cp+ 选项【参数】+源文件名 +目标文件名

| 参数<br> | 功能                         |
| ------ | -------------------------- |
| -r     | （**r**ecursive）递归复制文件（文件夹） |
| -i     | （默认交互模式）覆盖前询问              |
| -f     | （强制模式）强制覆盖                 |
| -a     | 保留所有属性（完美克隆）               |
| -v     | 显示执行过程                     |
## mv
mv：（**m**o**v**e）移动或者重命名文件或者目录。
基本mv蓝图：mv+ 选项【参数】+源文件名 +目标目录/目标文件名（存在就是目录不存在就是重命名）

| 参数<br> | 功能            |
| ------ | ------------- |
| -i     | （默认交互模式）覆盖前询问 |
| -f     | （强制模式）强制覆盖    |
| -v     | 显示执行过程        |
## mkdir 
mkdir：（**m**a**k**e **dir**cectories）创建目录。
基本mkdir蓝图：mkdir+ 选项【参数】+目录名（可以多个）
*mkdir可以一次性创建多个文件*

| 参数<br> | 功能                               |
| ------ | -------------------------------- |
| -p     | 构造嵌套目录（也就是你要创建的目录需要放在另一个未创建的目录下） |
| -m     | 创建目录同时设置权限                       |
| -v     | 显示执行过程详细信息                       |

## rm
rm：（**r**e**m**ove）删除。
基本rm蓝图：rm+ 选项【参数】+目标文件名

| 参数<br> | 功能                                 |
| ------ | ---------------------------------- |
| -r     | （**r**ecursive）递归删除文件夹（包括文件夹下所有文件） |
| -i     | （默认交互模式）删除前询问                      |
| -f     | （强制模式）强制删除                         |
| -v     | 显示执行过程                             |
## rmdir
删除<mark>空白目录</mark>（安全），参数与mkdir相似

## touch
创建空白文件和修改文件时间戳
文件时间戳：文件最近一次访问（access）和最近修改（modify）的时间。（还包括一个属性变更时间（change），也就是你什么时候去修改上面的两个时间戳的时间）

+ touch -d：同时修改access和modify时间，会导致change变为当前时间
+ touch -a：只修改access
+ touch -m：只修改modify
+ touch -c：与 -d 功能相似，不同在于 -d 文件不存在会创建新文件，-c 不会创建文件。

---
## echo

**功能：**
- **打印输出**：输出文本和变量（加 `-e` 参数开启转义，支持 `\n` 换行、`\t` 制表符等美化输出）。
- **构造与追加文件**：
    - 使用 `>`（覆盖重定向）：`echo "内容" > 目标文件`
    - 使用 `>>`（追加重定向）：`echo "内容" >> 目标文件`（在不破坏原文件的情况下追加配置，极为常用）。

> **示例 · echo 实际案例**
> - \# 打印带有换行符的多行文本
> 	echo -e "Host github.com\n\tStrictHostKeyChecking no" 
> - \# 查看系统环境变量的值
> 	echo $PATH 
> - \# 快速初始化一个配置文件（覆盖）
> 	echo "server { listen 80; }" > nginx.conf
> - \# 向服务器的授权密钥文件中追加 SSH 公钥（极其常用的免密登录操作）
> 	echo "ssh-rsa AAAAB3NzaC1..." >> ~/.ssh/authorized_keys


## grep

**核心思想：** 文本过滤器（Global Regular Expression Print），按行提取包含目标关键词（或符合正则表达式）的内容。

**基础语法：** `grep [选项] '匹配模式' 文件名`

**常用参数：**

- `-i`：忽略大小写匹配（Ignore case）。
- `-v`：反向查找（Invert match），只打印**不**包含关键词的行。
- `-n`：显示匹配行及行号（Number）。
- `-r` 或 `-R`：递归搜索目录下的所有文件（Recursive）。
- `-E`：支持扩展正则表达式（相当于 `egrep`）。

> **示例 · grep 实际案例**
> - \# 在系统日志中查找包含 "Error" 的行，并显示行号
> 	  grep -n "Error" /var/log/syslog
> - \# 递归搜索当前项目目录下所有文件中提到 "DeepSeek" 的地方
> 	grep -r "DeepSeek" ./projects/
> - \# 查看配置文件，但过滤掉所有以 "#" 开头的注释行和空白行（高级组合）
> 	grep -v "^#" config.yaml | grep -v "^$"
> - \# 检查当前系统是否有指定的端口正在被监听（结合管道符使用）
> 	netstat -tuln | grep ":8080"


## sed

**核心思想：** 流编辑器（Stream Editor），非交互式地按行对文本进行替换、删除、新增等批量高效操作。

**基础语法：** `sed [选项] '地址+sed指令' 文件名`

**常用参数：**

- `-n`：关闭默认输出（仅显示被 `p` 指令匹配处理的结果）。
- `-i`：直接修改文件内容（危险操作，建议先不加 `-i` 预览结果，确认无误后再加）。
- `-e`：允许多点编辑（执行多个指定的脚本）。
- `-r`：支持扩展正则表达式（在较新的系统中常写为 `-E`）。

**核心指令：**

- `s`：替换（Substitute）。格式：`s/旧内容/新内容/g`（`g`代表全局替换）。
- `p`：打印（Print）。常与 `-n` 连用。
- `d`：删除（Delete）。
- `a`：在指定行后追加内容（Append）。

> **示例 · sed 实际案例**
> - \# 批量替换：将配置文件中的 localhost 全部替换为 127.0.0.1，并直接修改文件
> 	sed -i 's/localhost/127.0.0.1/g' config.yml
> - \# 提取并打印数据文件的第 2 到第 5 行的内容
> 	sed -n '2,5p' data.csv
> - \# 自动化清理：删除 Nginx 等配置文件中的所有注释行（以 # 开头的行）
> 	sed -i '/^#/d' nginx.conf
> - \# 匹配特定内容所在的行，并在该行下方追加一行新的配置项
> 	sed -i '/Zotero_Path/a\Auto_Sync=true' settings.ini


## find
根据<mark>给定的路径与条件</mark>，查找相关文件或目录的Linux命令行工具。
基本语法：find +【查找路径】+【 条件】+【 执行动作】
+ 路径：/ 代表整个系统， . 代表当前目录
+ 条件：查找线索，文件名（-name）、大小（-size）、修改时间（-mtime）

> **示例 · 实际案例**
> + find /var/log -name ’\*.log‘
> + find /etc -size +1M
> + find . -mtime +7

不只是查找，还能操作文件（自动化）
-exec 参数
> **示例 · 实际案例**
> + find / -name ’\*.mp4' -exec rm {} \\;删除这台电脑上全部的MP4文件

---
## mkfs
硬盘格式化
mkfs：(**m**a**k**e **f**ile **s**ystem)一个Linux命令，其功能是在存储设备上建立一个文件系统（相当于规定怎么放东西）。
基本mkfs蓝图：命令+选项【参数】+位置【设备名】
Linux常见文件系统
+ ext4
+ xfs
+ fat

| 参数<br>    | 功能         |
| --------- | ---------- |
| -t        | 设置档案系统模式   |
| -V        | 显示执行过程详细信息 |
| -c        | 检查指定设备是否损坏 |
| --help    | 帮助信息       |
| --version | 版本信息       |
> **示例 · 实际演练**
>假设存在硬盘设备（/dev/sdb），任务是将其格式化为ext4
>命令：`mkfs -t ext4 /dev/sdb`

mkfs前先使用cfdisk分区，然后还需要mount命令将其挂载到系统
