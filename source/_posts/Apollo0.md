---
title: Apollo D-Kit 调试笔记（零）：修车备忘录
tags:
  - Apollo
categories: 开发和调试笔记
abstract: 本文记录了笔者在对百度Apollo D-Kit进行调试的过程中，遇到的文档中没有的问题，工程师所给出的答复。
abbrlink: d923
date: 2020-10-13 16:16:45
---
### 车前轮的零点飘移问题
---

- Apollo前轮的零点如果发生变化，可以按照如下步骤进行矫正：

    1. 将遥控器电锁打开，置于正常状态；
  
  2. 按住左下方``End``键，顺时针（车轮右旋）或逆时针（车轮左旋）旋转右下方轮盘至合适位置；
  
  3. 按下左下方``Push``键，同时松开``End``键和``Push``键，听到Apollo发出两声，修改完成。
  
- 上述操作如下图所示：
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20201023181348.png)