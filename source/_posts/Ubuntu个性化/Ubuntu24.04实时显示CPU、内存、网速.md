---
title: Ubuntu24.04实时显示CPU、内存、网速
categories:
  - Ubuntu个性化
tags:
  - Ubuntu
  - 系统监控
readmore: true
hideTime: true
abbrlink: f4e16fad
date: 2026-04-24 00:24:26
updated: 2026-04-24 00:24:26
---

# 一、添加indicator-sysmonitor的下载源

~~~bash
sudo add-apt-repository ppa:fossfreedom/indicator-sysmonitor -y
~~~

![image.png](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/20260123162820554.png)


# 二、更新apt-get

~~~Bash
sudo apt-get update
~~~

![image.png](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/20260123162858810.png)


# 三、安装indicator-sysmonito

~~~Bash
sudo apt-get install indicator-sysmonitor
~~~

![image.png](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/20260123162921576.png)

# 四、启动

![image.png](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/20260123163024048.png)
这时候通知栏默认会显示cpu和内存的实时数据!
![image.png](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/20260123163155352.png)
配置：点一下通知栏内容，按如下提示操作
![image.png](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/20260123163243261.png)
启动开机自启动
![image.png](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/20260123163518306.png)

进行配置
显示格式：`CPU : {cpu} mem:{mem} 网速 : {net}`
![image.png](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/20260123163633057.png)
其他配置可根据下面的示例自行发挥
