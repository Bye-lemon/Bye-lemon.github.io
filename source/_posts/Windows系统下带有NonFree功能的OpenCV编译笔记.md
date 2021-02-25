---
title: Windows系统下带有NonFree功能的OpenCV编译笔记
tags:
  - OpenCV
categories: 开发和调试笔记
abstract: 本文记录了笔者在Windows系统下为Anaconda编译带有SIFT等Nonfree功能的OpenCV 4.3版本的过程。
abbrlink: 3acc
date: 2020-04-12 20:14:01
---
## 系统环境和编译环境
---
|项目|值|
|:-:|:-:|
|操作系统|Windows10 Professional 2004|
|Python发行版|Anaconda3 2019.10|
|CMake版本|3.17.0|
|VS版本信息|Visual Studio 2017 & Visual Studio 15生成工具|

## 准备工作
---
1. 下载CMake工具
> CMake官网：[https://cmake.org/](https://cmake.org/)
> CMake下载地址：[https://cmake.org/download/](https://cmake.org/download/)

2. 下载Visual Studio工具
> Visual Studio 2017工具集：[https://my.visualstudio.com/Downloads?q=visual%20studio%202017&wt.mc_id=o~msft~vscom~older-downloads](https://my.visualstudio.com/Downloads?q=visual%20studio%202017&wt.mc_id=o~msft~vscom~older-downloads)

3. 下载Anaconda3
> Anaconda官网：[https://www.anaconda.com/](https://www.anaconda.com/)
> Anaconda官方下载地址：[https://www.anaconda.com/distribution/](https://www.anaconda.com/distribution/)
> Anaconda下载地址镜像：[https://mirrors.tuna.tsinghua.edu.cn/anaconda/archive/](https://mirrors.tuna.tsinghua.edu.cn/anaconda/archive/)

## 编译过程
---
1. 在Github下载OpenCV 4.3版本的源代码以及contrib库的源代码，然后解压。
> OpenCV Release：[https://github.com/opencv/opencv/archive/4.3.0.zip](https://github.com/opencv/opencv/archive/4.3.0.zip)
> OpenCV Contrib Release：[https://github.com/opencv/opencv_contrib/archive/4.3.0.zip](https://github.com/opencv/opencv_contrib/archive/4.3.0.zip)

2. 打开CMake-GUI，使用CMake配置编译选项并生成VS工程。

    - 点击``Where is the source code``一行的``Browse Source...``按钮，选择解压好的OpenCV源代码目录。
    
    - 点击``Where to build the binaries``一行的``Browse Build...``按钮，选择一个目录存放编译生成的VS工程。
    
    - 点击下方的``Configure``按钮，在弹出的对话框的``Specify the generator for this project``下拉菜单中选择VS生成工具的版本(``Visual Studio 15 2017 Win64``)，再点击``Finish``，等待配置完成。
    
    - 在中间的区域中定制自己的编译选项并重新配置，红色背景色的项目是最新一次配置所新产生的项目。重复这一操作，直至无新的配置项产生。
    
    - 点击下方的``Generate``选项，等待一段CMake完成VS工程的生成。

3. 在VS工程中构建OpenCV。

    - 在Visual Studio 2017中打开在生成目录下的``OpenCV.sln``工程文件。
    
    - 在工具栏中将编译模式由``Debug``切换成``Release``，在``解决方案资源管理器``中找到``CMakeTarget``，右击``INSTALL``，在弹出的菜单栏中选择``生成``，等待过程完成，编译完成的文件将位于工程目录下的``install``文件夹下。
    
4. 在Python中验证``cv2``包是否支持NonFree功能。

## 附：自定义配置项的参考
---
- 通常需要关注的配置项和参数的设置如下：

|配置项名称|需执行的操作|
|:-:|:-:|
|OPENCV_EXTER_MODULES_PATH|选择OpenCV Contrib源代码的路径|
|OPENCV_ENABLE_NONFREE|勾选|
|OPENCV_PYTHON3_VERSION|勾选|
|BUILD_opencv_python3|勾选|
|PYTHON3_为前缀的若干项目|选择对应的路径|

![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20200412214638.png)