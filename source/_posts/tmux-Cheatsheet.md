---
layout: post
title: tmux Cheatsheet
tags:
  - tmux
  - Linux
categories: Cheatsheet
abstract: '部分快捷键仅适用于配置https://github.com/gpakosz/.tmux'
abbrlink: '6003'
date: 2019-01-16 08:57:49
---
## System
---
|快捷键|功能|
|:-:|:-:|
|Ctrl+b|&lt;prefix>|
|Ctrl+a|&lt;prefix>|
|Ctrl+l|清除屏幕和历史记录|
|&lt;prefix> e|修改tmux配置文件|
|&lt;prefix> r|重载tmux配置文件|
|&lt;prefix> m|激活/取消鼠标模式|
|&lt;prefix> ?|查看tmux帮助|

## Session
---
|快捷键|功能|
|:-:|:-:|
|&lt;prefix> Ctrl+c|创建一个新session|
|&lt;prefix> d|离开当前session|
|&lt;prefix> $|重命名当前session|
|&lt;prefix> s|显示所有session|
|&lt;prefix> Crtl+f|按名字切换session|
|&lt;prefix> ( )|切换到上一个/下一个session|

## Window
---
|快捷键|功能|
|:-:|:-:|
|&lt;prefix> c|创建一个新window|
|&lt;prefix> &|关闭当前window|
|&lt;prefix> ,|重命名当前window|
|&lt;prefix> Tab|切换到上一个活动的window|
|&lt;prefix> Ctrl+h|切换到上一个window|
|&lt;prefix> Ctrl+l|切换到下一个window|
|&lt;prefix> 0~9|按序号切换window|

## Pane
---
|快捷键|功能|
|:-:|:-:|
|&lt;prefix> %|水平方向创建一个新pane|
|&lt;prefix> "|竖直方向创建一个新pane|
|&lt;prefix> x|关闭当前pane|
|&lt;prefix> +|当前pane最大化到新window|
|&lt;prefix> h j k l|按方向切换pane|
|&lt;prefix> < >|切换到上一个/下一个pane|
|&lt;prefix> H J K L|按方向调整pane大小|

