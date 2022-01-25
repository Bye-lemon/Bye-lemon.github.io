---
title: 借助SSH反向代理隧道实现内网服务器的校外访问
tags:
  - DLUT
categories: 开发和调试笔记
abstract: 本文记录了借助一个公网跳板机通过SSH反向代理实现Linux服务器的外网访问的一种解决方案，核心思路来自张帆大佬，特别感谢！
abbrlink: 6c49
date: 2021-08-12 21:57:15
---
1. 首先要建立内网目标机与公网跳板机之间的SSH连接，在内网目标机中使用下述命令生成一组密钥对。
```bash
ssh-keygen -t rsa
```

2. 使用下述命令将生成的密钥添加到公网跳板机的``authorized_keys``中，如此，即可建立两者之间的SSH连接。
```bash
ssh-copy-id [Board Machine Username]@[Board Machine IP Address]
```
3. 修改跳板机的配置文件``/etc/ssh/sshd_config``，将其中``#GatewayPorts no``一行的注释取消，并将其配置值修改为``yes``。

4. 使用下述命令重启跳板机的``sshd``服务，使配置修改生效。
```bash
sudo service sshd restart
```

5. 在目标机中使用命令``sudo apt install autossh``安装``AutoSSH``，并执行以下命令创建反向代理。
```bash
autossh -M [Any Available Port] -NfR 0.0.0.0:[Board Machine Binding Port]:localhost:22 [Board Machine Username]@[Board Machine IP Address]
```

6. 若目标机有安全组策略，需要在入站规则中放行上述命令中使用的端口。

7. 至此，SSH隧道建立完毕，此时在跳板机所绑定端口上的访问均会被转发至目标机22端口，由此，便可以借助跳板机连接内网服务器，执行作业。使用方式为：
```bash
ssh [Target Machine Username]@[Board Machine IP Address] -p [Board Machine Binding Port]
```