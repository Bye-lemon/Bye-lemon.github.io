---
layout: post
title: MI MIX2S(Polaris)全程负优化记录
categories: 开发和调试笔记
tags:
  - 刷机
  - 小米
  - Android
abstract: 本文是笔者对小米MIX2S（Polaris）的刷机备忘录。
abbrlink: b76d
date: 2020-01-30 13:58:56
---
## Preparation·准备工作
---

### Android SDK Platform-Tools

- Android SDK Platform-Tools是Android SDK的一个组件。它包括PC与Android平台交互的各类必要工具，例如adb，fastboot和systrace。这些工具是Android应用开发所必需的，对于刷机，也是很好的工具。Android SDK Platform-Tools向下兼容，最新版的下载地址是[https://developer.android.com/studio/releases/platform-tools](https://developer.android.com/studio/releases/platform-tools)。

### 小米手机刷机驱动

- 群友整合了一款小米刷机驱动的聚合包，下载地址为[https://www.lanzous.com/i9p453g](https://www.lanzous.com/i9p453g)。

### 解锁BootLoader锁

- 小米解除BL锁需要向官方申请解锁权限，申请网址是[http://www.miui.com/unlock/index.html](http://www.miui.com/unlock/index.html)，获得BL锁解锁权限之后，下载BL锁解锁工具，登录已经获得解锁权限的小米账号。在手机上打开开发者模式，在开发者选项->设备解锁状态中绑定账号和设备，重启手机进入BootLoader模式，将手机连接至电脑，点击工具中“解锁”按钮，等待操作完成即可解除手机上的BL锁。

> 小米解锁工具下载地址：[http://miuirom.xiaomi.com/rom/u1106245679/3.5.1108.44/miflash_unlock-3.5.1108.44.zip](http://miuirom.xiaomi.com/rom/u1106245679/3.5.1108.44/miflash_unlock-3.5.1108.44.zip)

## Recovery·恢复
---
### 官方版TWRP
- TWRP的全称是TeamWin Recovery Project，是一款由TeamWin和omni开发的开源第三方Rec，TWRP支持触屏、界面友好、功能强大且易用，是一款非常优秀的刷机工具。将对应型号的镜像文件下载至手机中，重启进入BootLoader模式，使用命令``fastboot flash recovery twrp.img``即可将下载好的twrp.img镜像文件烧录至recovery分区。

> TWRP官网：[https://twrp.me/](https://twrp.me/)
> MIX2S下载地址：[https://twrp.me/xiaomi/xiaomimimix2s.html](https://twrp.me/xiaomi/xiaomimimix2s.html)

### LR.Team TWRP

- LR.Team是一个由一些Rom和Rec的开发人员组成的非营利性团队，LRTeam的官方微博是[https://weibo.com/5969889578](https://weibo.com/5969889578)，LR.Team在TWRP的基础上维护了定制版的TWRP，定制版的TWRP由开发者wzsx150进行维护，其个人微博是[https://www.weibo.com/u/6033736159](https://www.weibo.com/u/6033736159)。同时，LR.Team提供了刷入脚本，可以方便的刷入系统。

- LR.Team定制版TWRP通过百度网盘发布维护，其地址为[https://pan.baidu.com/s/1iB2y__dnRsnc27767X35Ow](https://pan.baidu.com/s/1iB2y__dnRsnc27767X35Ow)，提取码是``itk8``。

### Win10 USB3.0补丁

- 在收集进入BootLoader之后，连接至Win10系统上的USB3.0接口后，可能出现手机提示``Press anykey to shutdown``的情况，可以将以下代码保存成``.bat``文件，以管理员权限运行该补丁解决。
```batch
@echo off
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\usbflags\18D1D00D0100" /v "osvc" /t REG_BINARY /d "0000" /f
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\usbflags\18D1D00D0100" /v "SkipContainerIdQuery" /t REG_BINARY /d "01000000" /f
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\usbflags\18D1D00D0100" /v "SkipBOSDescriptorQuery" /t REG_BINARY /d "01000000" /f

pause
```

### 删除DM校验

- 在LR.Team定制版TWRP中进入高级选项，在解除强制加密中移除DM校验即可，移除后，对``/data``分区格式化即可。

## Framework·框架
---

### Magisk·面具框架

- Magisk由台湾开发者topjohnwu维护，能提供root权限，并通过systemless的方式提供诸多服务。其运行机理是通过挂载一个与系统文件相隔离的文件系统来加载自定义内容，为系统分区打开了一个通往平行世界的入口，所有改动在那个世界（Magisk 分区）里发生，在必要的时候却又可以被认为是（从系统分区的角度而言）没有发生过，Magisk的操作不影响系统分区的完整性。

- Magisk的刷入需要使用TWRP，在其Github Repo的Release页面上下载对应版本的zip包，在Rec中刷入zip包即可。刷入框架之后，安装Magisk Manager即可对Magisk进行管理，通过Magisk Manager，可以实现对Magisk的升级和拆卸、Magisk模块的下载和管理、Root权限的授予和隐藏等等。经测试在当前ROM下，Magisk 20.3搭配Magisk Manager 7.5.1可以正常使用。

> Magisk Github Repo：[https://github.com/topjohnwu/Magisk](https://github.com/topjohnwu/Magisk)
> Magisk XDA Thread：[https://forum.xda-developers.com/apps/magisk](https://forum.xda-developers.com/apps/magisk)

- Magisk安装完成之后可以安装MagiskHide Props Config模块，配合该模块Magisk Hide可以实现有效的Root隐藏和Magisk隐藏。

### EdXposed·XP框架

- 上古时代，开发者rovo89开发了大名鼎鼎的XP框架Xposed，Xposed通过劫持Android系统的zygote进程来加载自定义功能，在应用运行之前就已经将我们需要的自定义内容强加在了系统进程当中，实现了不修改APK文件的请款修改修改程序的运行。然而在Android 7.0之后，rovo89便不再维护Xposed，后XP时代，Xposed的主流实现有很多种，比较典型的有TaiChi和EdXposed。

- EdXposed全称Elder driver Xposed Framework，基于Riru框架实现了对zygote的植入，并通过Sandhook和YAHFA两个可选的框架对ART运行时进行Hook。目前EdXposed支持Android 8.0-10.0的版本，是Xposed之后的很出色的替代品。

- EdXposed的安装需要使用Magisk Manager搜索安装Riru-Core和Riru-EdXposed，或下载对应的包后在TWRP中依次刷入，完成后重启系统，即可生效。此外，在软件部分还会提到另一种刷入方式。EdXposed的管理需要使用EdXposed Manager，其使用方式与Magisk Manager类似。经测试在当前的ROM下，Riru-Core 19.7搭配Riru-EdXposed-YAHFA-v0.4.6.1(4504)可以正常使用。

- 需要注意的是EdXposed的使用需要禁用SELinux，否则会出现无法启动的现象。

> EdXposed Github Repo：[https://github.com/ElderDrivers/EdXposed](https://github.com/ElderDrivers/EdXposed)

## Software·软件
---

### MT管理器

- MT 管理器是安卓平台上的老牌经典神器，是一款功能强大的工具软件，拥有独具特色的双窗口文件管理和强大的 APK 编辑功能，让你可以在手机上高效地进行各种文件操作以及修改安卓软件。

> MT管理器官网：[http://binmt.cc](http://binmt.cc)
> MT管理器下载地址：[https://www.coolapk.com/apk/bin.mt.plus](https://www.coolapk.com/apk/bin.mt.plus)

### 搞机助手

- 搞机助手是个人开发者[@情非得已c](http://www.coolapk.com/u/1167988)开发的一款工具软件，提供了诸多刷机需求的一站式入口。软件提供了Magisk模块管理、常用模块一键刷入、开机动画修改、镜像提取和ROM打包、应用程序管理、系统调试、充电控制、OTG功能、adb命令行和诸多杂项功能，软件对于MIUI系统也有着很多设置和修改入口。

- 使用搞机助手可以很方便的一键刷入EdXposed框架，同时，可以刷入2.4GWiFi频率提升模块、AD Hosts模块，并在APP内禁用SELinux。

> 搞机助手更新地址：[https://www.lanzous.com/b880553](https://www.lanzous.com/b880553)

### 动画壁纸

- 动画壁纸可以生成包含高斯模糊和缩放的非线性动画壁纸，其下载地址为[https://www.coolapk.com/apk/com.srm.blurscalewallpaper](https://www.coolapk.com/apk/com.srm.blurscalewallpaper)。

- 在使用的过程中，需先设置一款预设的动画壁纸，再应用生成的壁纸，否则，锁屏壁纸可能无法生效。一组比较合适MIUI内测版桌面的参数是：

|名称|值|
|:-:|:-:|
|动画曲线|40,0,25,90|
|动画模式|AVC|
|超高帧率模式|True|
|动画时长|15|
|缩放幅度|10%|
|高斯模糊时长|60%|
|高斯模糊程度|180|

### 谷歌相机

- 谷歌相机的算法经常被推荐，其有许多第三方Mod，可以在Google Camera Port Hub上进行下载，谷歌相机要求谷歌基础服务，可以通过Go谷歌安装器或安装microG来满足，同时谷歌相机要求开启Camera2 API，可以通过Sense等软件打开。安装好了谷歌相机之后，还可以安装PlayGround进行AR拍摄。经测试在当前ROM下，Urnyx05的7.2版本Mod能够正常使用。

> Google Camera Port Hub：[https://www.celsoazevedo.com/files/android/google-camera/](https://www.celsoazevedo.com/files/android/google-camera/)
> ARCore, AR Stickers, and Playground：[https://www.celsoazevedo.com/files/android/google-camera/ar/](https://www.celsoazevedo.com/files/android/google-camera/ar/)

### EX Kernel Manager

- EX Kernel Manager是一款非常使用的内核调度软件，是DevCheck开发者的又一款作品，可以配合烧录的内核实现自定义的调度。

> EX Kernel Manager下载地址：[https://www.lanzous.com/i9p424j](https://www.lanzous.com/i9p424j)

## Module·模块
---
### CustoMIUIzer

- CustoMIUIzer是一款基于Xposed框架的MIUI个性化定制模块，其包含了对于MIUI各种页面的个性化定制设置，功能强大，简洁易用。

> CustoMIUIzer XDA：[https://forum.xda-developers.com/xposed/modules/mod-customiuizer-customize-miui-rom-t3910732](https://forum.xda-developers.com/xposed/modules/mod-customiuizer-customize-miui-rom-t3910732)

### Thanox

- Thanox可以实现对软件后台的管理、交叉启动及链式调用的限制、应用软件权限管理、自动化规则等功能。Thanox基于Xposed框架，是一个系统级的服务。Thanox框架运行于``system_server``进程，并提供一个APP供可视化调整设置。Thanox可以部分相当于冰箱、绿色守护等诸多软件的聚合应用，是一款非常强大的系统优化工具。

> Thanox官网：[https://tornaco.github.io/Thanox/](https://tornaco.github.io/Thanox/)
> Thanox Github Repo：[https://github.com/Tornaco/Thanox](https://github.com/Tornaco/Thanox)

### 核心破解

- 核心破解是一款基于Xposed模块开发的小工具。可以用来去除系统签名校验，直装修改APK，降级安装APP，比如说直接覆盖安装老版本应用、重新签名后覆盖安装官方版app、修改某apk但不重新签名直接安装等等。Android 10对应其2.2版本，可在[https://www.lanzous.com/i7z2rqh](https://www.lanzous.com/i7z2rqh)下载。

### SuperMod音效包

- 酷安用户@wvwvw维护了一个聚合音效包，其中包含蝰蛇（ViPER）、杜比（Dolby）和极限（XTREME）音效。经测试可以在当前ROM下正常运行。聚合包的安装方式，解压压缩包后有说明文件，蝰蛇音效的预设可以解压后覆盖用户目录下的同名文件夹。

> SuperMod音效包下载地址(密码:boom)：[https://www.lanzous.com/b063sotzg](https://www.lanzous.com/b063sotzg)
> ViPER音效预设包下载地址：[https://www.lanzous.com/i9p5nbi](https://www.lanzous.com/i9p5nbi)

## Kernel·内核
---
### SticKernel

- SticKernel是开发者[@Amktiao](https://github.com/Aquarius223)维护的一款MIX2S的手机内核，其在MIUI官方内核的基础上做出了若干修改，实测感受系统流畅度和功耗都有了大幅度的优化。开发者打包了卡刷包，使用TWRP即可刷入，不过刷入之后需要重新刷一遍Magisk来保留Root权限。SticKernel支持四合一调度，日常使用省电调度即可。作者在酷安上进行内核包更新，作者的个人主页为[http://www.coolapk.com/u/925348](http://www.coolapk.com/u/925348)。

## Additional·补充说明
---
### 系统更新

- 在TWRP的设置里取消勾选系统更新后自动启动，MIUI的系统更新应使用完整包更新，完整包烧录完毕之后，应再刷入内核包，而后刷入Magisk再重启，初次重启可能卡在第二屏，强行再次重启即可。

### 传感器失灵问题的解决

- 降级刷机等行为可能导致传感器失效，这是因为persist分区丢失，解压线刷包image文件夹下有persist.img，通过twrp刷到persisit分区即可恢复。

### 模块卡米的处理

- 在已经清楚卡米的模块是哪一个的情况下，可以在TWRP中进入文件系统，``/data/adb/modules``文件夹下即是Magisk的模块目录，删除对应模块的文件夹即可完成模块的拆卸，如果依然有问题，可以刷入Magisk拆卸包。

### Magisk Hide的必要勾选项

- 银行类App要勾选，否则无法通过Root检测正常使用。

- 网易云音乐需要勾选，否则无法扫描本地音乐。