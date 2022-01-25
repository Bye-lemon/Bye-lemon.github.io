---
title: 使用Altium Designer 19绘制劣质PCB的流程
tags:
  - Altium Designer
categories: 开发和调试笔记
abstract: 本文记录了笔者完成硬件综合训练的课程时使用AD的简要的流程，权当备忘，误人子弟有余，提供参考不足，特此声明。
abbrlink: e971
date: 2019-07-17 11:56:25
---
1. 创建一个AD工程，对应PrjPCB文件，创建原理图和PCB文件，对应SchDoc文件和PcbDoc文件。

   ![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/PicGo20190717113916.png)

2. 在原理图文件中完成原理图的设计，在完成设计之后，可以通过AD自带的更新功能，将原理图上的原件更新到PCB文件上，这一功能的位置在"Design" -> "Update PCB Document \<PCBFileName\>.PcbDoc"。

   ![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/PicGo20190717114011.jpg)

3. 当原理图上的设计全部完成之后，既可在PCB上进行布局和布线了。元器件布局时应该注意，元器件与元器件之间的布局应该遵循就近原则。

4. 元器件布局完成之后就可以进行布线了。布线可以使用自动布线，也可以使用手动布线。

   ![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/PicGo20190717114229.jpg)

5. 在布线大概完成之后就可以根据实际的布局更改合适的PCB板大小了，在View中切换到Board Planning Mode，在当前视图绘制PCB的大小即可。

   ![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/PicGo20190717114339.jpg)

6. 改好PCB的大小之后，切换到Keep-out Layer绘制PCB的外边框，需要注意的是这一步需要先切换回2D Layout Mode，绘制外边框要使用Place Keepout Track绘制，绘制完成后，选中边框，通过Design -> Board Shape -> Define from selected object确定边框的大小。

   ![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/PicGo20190717114412.jpg)

7. 在PCB板的四个角落放置安装孔，通常设置3mm内径，5mm外径。

8. 添加滴泪，在Tool -> Teardrop中添加滴泪。需要注意的是，滴泪不能重复添加，在添加了滴泪之后，如果要修改某根导线，需要移除全部滴泪，修改完成后再重新添加滴泪。

   ![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/PicGo20190717114435.jpg)

9. 最后添加覆铜，在Place -> Polygen Pour菜单中添加覆铜。

   ![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/PicGo20190717114457.jpg)

10. 单击Report 检查PCB的设计，将设计报告中的问题全部修改完成即可。

    ![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/PicGo20190717114520.jpg)