---
title: Windows 10系统下使用SMB实现媒体文件共享
tags:
  - SMB
  - Windows 10
categories: 英平的工具箱
abstract: 本文记录了笔者在Windows 10系统下启用SMB共享服务，实现媒体文件的共享访问的过程。
abbrlink: f81
date: 2021-02-25 19:03:25
---
## Step 1、打开SMB服务
---

- 由于存在一定的安全漏洞，Windows 10系统默认禁用了SMB服务。因此，需要手动打开SMB服务，具体的操作流程如下：
  1. 使用``Win+R``快捷键打开运行，输入``control``并回车打开控制面板。
     
     ![image-20210225174947991](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20210225174951.png)
     
  2. 点击``程序``，进入程序选项卡组。
  
     ![image-20210225175103685](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20210225175103.png)
  
  3. 在``程序与功能``中点击``启用或关闭Windows功能``。
  
     ![image-20210225175320239](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20210225175320.png)
  
  4. 在弹出的对话框中勾选上``SMB 1.0/CIFS 文件共享支持``，之后点击``确定``。
  
     ![image-20210225175359504](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20210225175359.png)
  
  5. 等待系统下载所需要的组建之后，重启计算机，应用更改，启用相应的功能。

## Step 2、开启局域网内文件共享服务
---

- 开启SMB服务之后，需要开启局域网内的共享，具体流程如下：

  1. 在通知栏中右击网络图标，点击``打开“网络和Internet”设置``。

     ![image-20210225180141304](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20210225180141.png)

  2. 在弹出的页面中点击``网络与共享中心``。

     ![image-20210225180327602](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20210225180327.png)

  3. 在弹出的页面中点击左侧选项卡中的``更改高级共享设置``。

     ![image-20210225180431490](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20210225180431.png)

  4. 启用``网络发现``，设置``有密码访问的共享``。

     ![image-20210225180607240](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20210225180607.png)

     ![image-20210225180656545](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20210225180656.png)

## Step 3、设置共享文件夹
---

- 完成前两步操作之后，即可为需要共享的文件夹设置共享，具体操作如下：

  1. 在想共享的文件夹上右击，在右键菜单里点击``属性``。

     ![image-20210225181229281](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20210225181229.png)

  2. 在弹出的对话框中选择``共享``选项卡，在``网络文件和文件夹共享``中点击``共享``。

     ![image-20210225184222073](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20210225184222.png)

  3. 在弹出的对话框中选择当前用户，点击``添加``，随后点击``共享``，如果看到下方图二就说明已经共享成功。

     ![image-20210225184601265](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20210225184601.png)

     ![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20210225190452.png)

## Step 4、访问共享文件夹
---

- 对于Android设备，可以使用带有SMB功能的播放器访问共享的文件夹，比如**VLC**，最新版本的VLC下载地址为https://get.videolan.org/vlc-android/3.3.0/VLC-Android-3.3.0-arm64-v8a.apk。
- 对于iOS设备，可以在App Store上搜索下载**VLC**或**APlayer**等软件访问共享的媒体文件夹。