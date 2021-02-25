---
title: DLUT校园网自动认证的解决方案
tags:
  - DLUT
categories: 开发和调试笔记
abstract: 本文实现了一个认证大连理工大学校园网的程序，可以用于树莓派等设备的命令行下联网等，核心思路来自耀波师兄，特别感谢！
abbrlink: 258b
date: 2021-01-17 11:30:50
---
## 准备
---
- 耀波师兄曾经给过我一个文档，记录了早年间，他在树莓派的命令行下认证DLUT的解决方案，其思路基本是抓包再重放。运恒跟我提出想要一个脚本实现服务器开机自动认证校园网之后，我本想使用无头浏览器模拟点击的方式登录，想到师兄当年的这个经验之后，我觉得也是一个很方便的方案，简单暴力，于是复现了一遍师兄的思路。

- 在具体的实施过程中，可能需要Fiddler4来进行网络抓包，由于程序使用Java开发，所以需要JDK和IDEA这样的集成开发环境支持，相应软件的下载链接如下：
  > Fiddler 4官网：[https://www.telerik.com/download/fiddler](https://www.telerik.com/download/fiddler)
  > OpenJDK 11官网：[http://openjdk.java.net/projects/jdk/11/](http://openjdk.java.net/projects/jdk/11/)
  > IntelliJ IDEA官网：[https://www.jetbrains.com/idea/](https://www.jetbrains.com/idea/)

## 抓包
---
- 在[auth.dlut.edu.cn](http://auth.dlut.edu.cn)上退出已经认证的账号，再重新登录，使用Fiddler4或Chrome Dev Tools捕获点击登录之后发出的POST请求，以RAW的方式查看，会得到一条形如下文所示的报文。需要注意的是，使用Chrome Dev Tools需要勾选``Preserve log``的复选框，否则Chrome Dev Tools会在页面发生更新时清除此前的记录，校园网认证页面登录后会跳转新页面，原页面的记录将会被清除，会导致找不到POST提交。
```
POST http://auth.dlut.edu.cn/eportal/InterFace.do?method=login HTTP/1.1
Host: auth.dlut.edu.cn
Proxy-Connection: keep-alive
Content-Length: 642
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36 Edg/87.0.664.75
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
Accept: */*
Origin: http://auth.dlut.edu.cn
Referer: http://auth.dlut.edu.cn/eportal/index.jsp?wlanuserip=***************************
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6
Cookie: EPORTAL_COOKIE_SAVEPASSWORD=true; EPORTAL_AUTO_LAND=; EPORTAL_COOKIE_OPERATORPWD=; EPORTAL_COOKIE_USERNAME=********************

userId=************************
```

- 将上述报文内容保存到本地，编写程序进行重放即可完成校园网的认证。此处插一句吐槽，明文传输用户名密码真是我校保留节目了。

## 重放
---
- 作为一个很“不讲武德”的方法，该方案最优的一点在于简单暴力，不像无头浏览器模拟点击需要分析网页或者模拟POST请求需要解析报文字段，该方案将捕获的报文当做一个完整的TCP数据报，通过Socket直接发送，简单有效。

- 为了实现Java的重放，我在耀波师兄的基础上维护了一个Java的程序，该程序延续PING百度的光荣传统，如果发现PING不通就使用所捕获的报文重新认证网络，代码如下：
```Java
import java.io.IOException;
import java.net.InetAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SocketChannel;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public class Main {
    static String auth = "POST http://auth.dlut.edu.cn/eportal/InterFace.do?method=login HTTP/1.1\n"
            + "Host: auth.dlut.edu.cn\n" + "Proxy-Connection: keep-alive\n" + "Content-Length: 642\n"
            + "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36 Edg/87.0.664.75\n"
            + "Content-Type: application/x-www-form-urlencoded; charset=UTF-8\n" + "Accept: */*\n"
            + "Origin: http://auth.dlut.edu.cn\n"
            + "Referer: http://auth.dlut.edu.cn/eportal/index.jsp?wlanuserip=***********\n"
            + "Accept-Encoding: gzip, deflate\n" + "Accept-Language: zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6\n"
            + "Cookie: EPORTAL_COOKIE_SAVEPASSWORD=true; EPORTAL_AUTO_LAND=; EPORTAL_COOKIE_OPERATORPWD=; EPORTAL_COOKIE_USERNAME=***********\n"
            + "\n"
            + "userId=***************";

    public static boolean ping(String address) throws Exception {
        int timeOut = 3000;
        boolean status = InetAddress.getByName(address).isReachable(timeOut);
        return status;
    }

    public static void main(String[] args) {
        try {
            if (ping("www.baidu.com")) {
                System.out.println("Baidu reachable\n");
            } else {
                System.out.println("Baidu unreachable\n");
                System.out.println("Using LYP's authentication\n");
                try {
                    SocketChannel socketChannel = SocketChannel.open();
                    socketChannel.connect(new InetSocketAddress("auth.dlut.edu.cn", 80));
                    socketChannel.write(ByteBuffer.wrap(auth.getBytes()));
                    ByteBuffer buffer = ByteBuffer.allocate(1024);
                    while (socketChannel.read(buffer) > 0) {
                        buffer.flip();
                        String content = StandardCharsets.UTF_8.decode(buffer).toString();
                        System.out.println(content + "\n");
                        buffer.clear();
                    }
                    socketChannel.close();
                } catch (IOException e) {
                    e.printStackTrace();
                } finally {
                    if (ping("www.baidu.com")) {
                        System.out.println("Baidu reachable\n");
                    } else {
                        System.out.println("Baidu unreachable\n");
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

```

- 将程序打包成``.jar``的包保存到本地，就构成了一个令牌，使用其即可使用自己的身份授权校园网的登录。

## 部署
---
- 对于树莓派来说，其自带Java的运行环境，可以直接使用``java -jar token.jar``来运行程序完成认证，在命令行下，使用``sudo iwconfig wlan0 essid [Wi-Fi Name]``即可连接到网络下，使用前述命令即可完成认证。

- 对于一台普通的Ubuntu服务器，需要先安装JRE，可以使用``sudo apt install default-jre``完成JRE的安装，然后，同样可以使用``java -jar token.jar``来运行程序完成认证。

- 为了实现开机自动认证，可以将这一命令加入到``/etc/rc.local``下；为了实现每日定时运行，可以借助``crontab``命令。