---
title: 利用阿里云ECS、Frp内网穿透与VSCode Remote-SSH实现远程开发
categories:
  - Ubuntu个性化
tags:
  - Ubuntu
  - FRP
  - VSCode
  - 远程开发
readmore: true
hideTime: true
abbrlink: 8e6c8e46
date: 2026-02-14 14:03:53
updated: 2026-02-14 14:03:53
---

# [利用阿里云ECS、Frp内网穿透与VSCode Remote-SSH实现远程开发](https://www.cnblogs.com/outs/p/18920953 "发布于 2025-06-09 16:44")

### 一、引言

在现代开发场景中，远程访问内网设备进行开发的需求日益增长。例如在户外，由于随身携带的笔记本电脑资源有限，需要访问家中的配置有GPU的台式机。

本文将详细介绍如何借助阿里云ECS（Elastic Compute Service， 弹性计算服务）、FRP（Fast Reverse Proxy， 快速反向代理）内网穿透工具以及VS Code的Remote-SSH插件，实现从公网安全便捷地连接内网开发设备，避免重复配置开发环境的繁琐过程。

整个过程除了阿里云ECS需要花钱，其它均免费。我租了一台最便宜的按使用时长收费的ECS，大约每小时一块钱。另外，对于阿里云的新用户，还有99元租一年的活动。

### 二、设备与环境准备

- **访问端**：户外环境中的笔记本电脑。
- **服务器**：阿里云ECS实例，有公网IP。
- **客户端**：办公室或家中的PC，处于内网环境，无公网IP。

### 三、整体架构与原理

采用FRP的TCP代理与STCP（Secret TCP）代理两种模式。

TCP代理直接将内网服务映射到公网IP，适合快速访问；STCP代理则通过密钥验证机制，仅允许授权用户访问内网服务，安全性更高。

其中TCP代理的架构图如下：

![image.png](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/20260107191217780.png)


访问者 → [阿里云ECS公网IP:6000] → 阿里云ECS(frps) → 内网客户端(frpc) → [127.0.0.1:22]

### 四、操作流程详解
> **警告 · ATTENTION**
> 下面的注释可能会导致`Failed to enable unit: "#" is not a valid unit name`,记得把下面配置文件中的"#"注释全部去掉


#### （一）服务器端配置（阿里云ECS）

1. **购买与初始化ECS实例**
    
    - 登录阿里云官网，选择“云服务器ECS”，购买最便宜的2核2G配置的Ubuntu实例。
    - 在控制台重置实例密码，确保通过SSH工具（如Xshell、Putty）能正常连接。
2. **安装与配置Frp服务端**
    
    - 在`/usr/local`目录下创建`frp`文件夹，下载[Frp服务端安装包](https://github.com/fatedier/frp/releases)，解压后进入目录。
    - 编辑`frps.toml`配置文件，设置客户端连接端口（如7000）、认证Token及Web管理页面参数：
        
        ```toml
        bindPort = 7000                   # 服务端监听端口，用于与客户端建立初始连接（必填）
        auth.token = "any_token"          # 客户端与服务端通信的认证令牌（需与客户端配置一致）
        webServer.addr = "0.0.0.0"        # 管理界面监听地址（0.0.0.0表示监听所有可用网络接口）
        webServer.port = 7500             # 管理界面访问端口（通过浏览器访问此端口查看服务状态）
        webServer.user = "admin"          # 管理界面登录用户名
        webServer.password = "admin"      # 管理界面登录密码
        ```
        
3. **开放防火墙端口**
    
    - 在阿里云控制台的安全组设置中，放行7000（客户端连接端口）、7500（Web管理端口）及后续映射端口（如6000）。  
        ![](https://img2024.cnblogs.com/blog/508474/202506/508474-20250609164140290-1264159586.png)  
        ![](https://img2024.cnblogs.com/blog/508474/202506/508474-20250609164247509-71811349.png)
4. **启动与管理Frp服务**
    
    - 使用systemd创建服务文件`frps.service`，实现开机自启动：
        
        ```bash
        sudo vim /etc/systemd/system/frps.service
        ```
        
        ```bash
         [Unit]
         Description = frp server
         After = network.target syslog.target
         Wants = network.target
        
         [Service]
         Type = simple
         ExecStart = /usr/local/frp/frps -c /usr/local/frp/frps.toml    # 启动命令：指定frps服务端程序路径及配置文件位置
        
         [Install]
         WantedBy = multi-user.target
        ```
        
        写入上述服务配置后，执行以下命令启动服务：
        
        ```bash
        # 启动frp服务端：立即启动frps服务，但不设置开机自启
        # 执行此命令后，frps将开始监听配置文件中指定的端口（如7000）
        sudo systemctl start frps 
        
        # 启用frp服务端：配置frps服务开机自动启动
        # 执行此命令后，系统每次启动时都会自动运行frps服务
        # 等价于在/etc/systemd/system/multi-user.target.wants/目录下创建软链接     
        sudo systemctl enable frps
        ```
        

#### （二）客户端配置（内网设备）

1. **安装Frp客户端**
    
    - 下载与服务器端同版本的Frp客户端（Linux AMD64架构），解压到任意目录（如`/home/user/frp`）。
2. **TCP代理模式配置**
    
    - 编辑`frpc.toml`，指定服务器IP、端口及认证Token，配置本地服务映射：
        
        ```toml
        serverAddr = "182.92.163.5"  # 服务端公网IP地址（必填，指向frps服务所在服务器，即本文中的阿里云服务器）
        serverPort = 7000            # 服务端监听端口（必须与frps配置中的bindPort一致）
        auth.token = "any_token"     # 安全认证令牌（必须与frps配置中的auth.token一致）
        
        [[proxies]]
        name = "rdp"                 # 代理名称（需唯一，用于标识此代理服务）
        type = "tcp"                 # 代理协议类型（支持tcp/udp/http/https等）
        localIP = "127.0.0.1"        # 本地服务IP地址（指向内网需暴露的服务）
        localPort = 22               # 本地服务端口（如SSH服务默认端口22）
        remotePort = 6000            # 服务端暴露的公网端口（通过此端口访问内网服务）
        ```
        
    - 启动Frp客户端：
        
        ```bash
        ./frpc -c ./frpc.toml
        ```
        
        如果希望开机自启动，可以参考前面的阿里云ESC端的方法，使用systemd创建服务文件。
        
        ```bash
        sudo vim /etc/systemd/system/frps.service
        ```
        
        ```bash
        [Unit]
        Description=frp client
        After=network.target syslog.target   # 该服务在网络服务和系统日志服务启动后启动
        Wants=network.target                 # 声明依赖网络服务（若网络服务启动失败，不影响当前服务启动）
        NetworkStartTimeoutSec=90            # 设置网络启动超时时间为90秒
        
        [Service]
        Type=simple                          # 表示服务进程为主进程，系统会直接启动该进程
        ExecStart=/usr/local/frp/frpc -c /usr/local/frp/frpc.toml    # 服务启动命令：定义启动frp客户端的具体指令
        Restart=always                       # 无论服务异常退出或正常退出，均自动重启
        RestartSec=60                        # 重启间隔时间为60秒
        StartLimitInterval=0                 # 关闭启动频率限制（单位：秒，0表示禁用
        StartLimitBurst=0                    # 允许连续启动的最大次数（0表示不限制）
        
        [Install]
        WantedBy=multi-user.target           # 将服务添加到多用户模式启动项（系统启动时自动运行）
        ```
        
3. **STCP代理模式（安全增强）**  
    如果不希望服务端暴露固定端口，可以使用STCP代理模式。
    
    - 修改配置文件，将代理类型改为`stcp`，并设置访问密钥`secretKey`：
        
        ```toml
        [[proxies]]
        name = "rdp_client"         # 代理名称（需在客户端和服务端保持唯一）
        type = "stcp"               # 安全隧道代理模式（Symmetric TCP，双向认证）
        secretKey = "abcdefg"       # 对称加密密钥（必须与访问端配置一致）
        localIP = "127.0.0.1"       # 本地服务IP（通常为内网SSH/RDP服务地址）
        localPort = 22              # 本地服务端口（SSH默认22，RDP默认3389）
        ```
        
    - 重新启动客户端使配置生效。
<mark>故障处理</mark>
```shell
sudo systemctl daemon-reload
sudo systemctl daemon-reload
sudo systemctl restart frps
sudo systemctl status frps

```

#### （三）访问端配置（Windows设备）

1. **测试SSH连接（TCP模式）**
    
    - 通过命令行直接测试连接：
        
        ```bash
        ssh -o Port=6000 user@182.92.163.5  # 替换为ECS公网IP和客户端用户名
        ```
        
2. **VSCode Remote-SSH插件配置**
    
    - 安装“Remote-SSH”插件，点击左下角远程连接图标，选择“Connect to Host”→“Configure SSH Hosts”。
    - 在配置文件中添加远程主机信息（以TCP模式为例）：
        
        ```ssh-config
        Host remote-dev
            HostName 182.92.163.5     # ECS公网IP
            Port 6000                # 映射的公网端口
            User tsy529              # 客户端用户名
        ```
        
    - 选择远程主机并输入密码，即可在VSCode中打开内网设备的开发环境。
3. **STCP模式下的访问端配置**  
    如果不希望服务端暴露固定端口，可以使用STCP代理模式。
    
    - 下载Windows版本的Frp客户端，解压后修改`frpc.toml`，配置访问密钥及本地端口映射：
        
        ```toml
        [[visitors]]
        name = "rdp_visitor"        # 访问者代理名称（需在当前客户端内唯一）
        type = "stcp"               # 安全隧道代理类型（Symmetric TCP）
        serverName = "rdp_client"   # 对应内网客户端注册的代理名称（必须与服务端保持一致）
        secretKey = "abcdefg"       # 与内网客户端相同的对称加密密钥（验证身份用）
        bindAddr = "127.0.0.1"      # 本地绑定地址（仅允许本地访问，提高安全性）
        bindPort = 6000             # 本地监听端口（访问此端口将转发到内网服务）
        ```
        
    - 启动Frp客户端后，通过`ssh -o Port=6000 user@127.0.0.1`连接本地映射端口。

### 五、安全与优化建议

- **定期更换Token与密钥**：避免使用默认值，定期更新`auth.token`和`secretKey`，降低安全风险。
- **限制公网端口访问**：STCP模式下仅允许授权访问端通过本地端口连接，减少暴露面。
- **监控Frp状态**：通过Web管理页面（`http://ECS公网IP:7500`）查看连接日志与流量统计，及时发现异常。

### 六、总结

通过阿里云ECS提供公网入口，结合Frp的灵活代理模式与VSCode的远程开发能力，开发者可轻松实现对内网设备的安全访问，无需重复搭建开发环境。TCP模式适合快速调试，STCP模式则为敏感环境提供了更高的安全性，两者结合可满足不同场景的远程开发需求。
