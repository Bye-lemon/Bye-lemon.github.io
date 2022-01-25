---
layout: post
title: Aurora在Refresh时报错Running Problem Latex的若干玄学解决方案
tags:
  - Aurora2
  - MS Office
categories: 英平的工具箱
abstract: 本文记录了笔者在Word中使用Aurora在Refresh公式时报错Running Problem Latex的解决方案。
abbrlink: '1271'
date: 2020-04-16 16:23:50
---
## 系统环境和软件环境
---
|项目|值|
|:-:|:-:|
|操作系统|Windows10 Professional 2004|
|Word版本|MS Office专业增强版 2019 版本 2003|
|Aurora版本|2（使用Aurora 2.x Keygen破解）|
|MiKTeX版本|2.5|

## 可能有效的玄学解决方案
---
1. 在``Perferences``中修改``Path``选项卡下的路径，取消勾选``Use default values``，在下面的三栏中输入latex、dvipng和pdflatex的路径。

2. 在``Perferences``中修改``Packages``选项卡下的内容，改为：
```latex
\usepackage{amsmath}
\usepackage{amssymb}
%\usepackage{euler}
```

3. 在``Perferences``中修改``Properties``选项卡中``Rendering Method``为``Vector``。

4. 修改Windows系统时间至2005年。