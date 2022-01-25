---
title: IPv6环境下的一次Docker部署实践
tags:
  - IPv6
  - Docker
  - Cernet
categories: 开发和调试笔记
abstract: 这篇文章记录了我参加赛尔网络主办的下一代互联网竞赛时，在IPv6服务器上部署服务的过程。
abbrlink: a140
date: 2018-12-01 23:03:29
---
## 服务器环境
---
- 赛尔网络IPv6 Iaas平台服务器，配置信息如下：

|配置项|参数|
|:--:|:--:|
|操作系统|CentOS 7.2 64bit|
|集成软件|无|
|CPU|2|
|内存|4G|
|磁盘|80G|

## Docker CE的安装
---
> 警告：Docker-CE要求CentOS 7.X版本，对更低的版本是不支持的。
> Docker官方文档传送门：[https://docs.docker.com/install/linux/docker-ce/centos/](https://docs.docker.com/install/linux/docker-ce/centos/)

1. 删除环境下的旧版本Docker
```bash
sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-selinux \
                  docker-engine-selinux \
                  docker-engine
```
2. 安装Docker-CE必要依赖
```bash
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
```
3. 添加Docker-CE软件源
```bash
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```
4. 安装Docker
```bash
sudo yum install docker-ce
```

## Docker-Compose的安装
---
> Docker官方文档传送门：[https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)

1. 下载Docker-Compose，这里的1.16.1可以替换为需要的版本号，下文中的操作都是在1.16.1的版本下操作的。
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.16.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```
2. 为Docker-Compose增加权限
```bash
sudo chmod +x /usr/local/bin/docker-compose
```

## 使用Docker部署一个TCP服务
---
### 写一份Pure Python的Dockerfile
```Dockerfile
# Pure Python3

FROM python
LABEL author="Li Yingping"

RUN apt-get update

ENV PYTHONIOENCODING=utf-8

# Build folder
RUN mkdir -p /deploy/app
WORKDIR /deploy/app
COPY /requirements.txt /deploy/app/requirements.txt
RUN pip install -r requirements.txt

CMD ["/bin/bash"]
```

### 写一份启动服务的docker-compose.yml
```yaml
version: "3.3"

services:
    webapp:
        build: .
        volumes:
         - ./app:/deploy/app
        ports:
         - "80:13333"
        command: python server.py
```

### 写一个描述了人类的本质的TCP Server
```python
import socket

def Server(IP,port):
    sock=socket.socket(socket.AF_INET6,socket.SOCK_STREAM)
    sock.bind((IP,port))
    sock.listen(3)
    print("Server Start, Listening [ %s : %s]" %(IP,str(port)))
    while True:
        connection, address=sock.accept()
        try:
            connection.settimeout(3600)
            buf=connection.recv(1024)
            print("Connection Construct, From：%s" % str(address))
            while buf != 'exit'.encode("utf-8"):
                cmdstr = buf.decode("utf-8")
                connection.send((cmdstr).encode("utf-8"))
                buf=connection.recv(1024)
        except socket.timeout:
            print ('socket timeout')
        connection.close()
        print ('Connection Break ...')

if __name__=='__main__':
    ip = '::'
    Server(ip,13333)
```

### 启动人类的本质服务
- 启动Docker服务
```bash
service docker start
```
- 在工作目录下使用docker-compose启动服务
```bash
sudo docker-compose up
```

## 填坑记录
---
### IPv6地址在浏览器中的访问
- 默认情况下，Google Chrome和IE等浏览器接受IPv6地址的访问，不过需要在地址的两端使用一对方括号，即，形如``http://[IPv6HOST]:PORT/``的形式。

### 开启SSH的密码登录

- 该服务器默认的SSH服务只开放了公钥登录，由于Iaas平台提供的在线远程连接服务不支持复制粘贴，所以，生成的公钥复制不方便。我就产生了开启SSH的密码登录的需求，具体操作是：使用命令``vim /etc/ssh/sshd_config``打开配置文件，找到``PasswordAuthentication``一行，修改为``yes``，尔后，使用命令``service sshd restart``重启服务即可。

## GitHub传送门
> Bye-lemon/Docker-Python3：[https://github.com/Bye-lemon/Docker-Pure-Python3](https://github.com/Bye-lemon/Docker-Pure-Python3)
