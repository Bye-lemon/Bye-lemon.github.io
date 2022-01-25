---
title: Apollo D-Kit 调试笔记（二）：动力学标定与循迹验证
tags:
  - Apollo
mathjax: true
categories: 开发和调试笔记
abstract: 本文记录了笔者在对百度Apollo D-Kit进行动力学标定以及进行循迹验证的操作流程。
abbrlink: d2b3
date: 2020-10-22 20:41:29
---
### 准备工作
---

#### Apollo Fuel服务的申请

- 打开[https://login.bce.baidu.com/?redirect=https%3A%2F%2Fconsole.bce.baidu.com%2F](https://login.bce.baidu.com/?redirect=https%3A%2F%2Fconsole.bce.baidu.com%2F)登录BOS，进入控制台后点击``对象存储BOS``，在页面中开通对象存储服务，并创建一个Bucket，选择私有、按使用流量计费。创建完成之后，记录下Bucket名称、地域，而后，点击右上角``Access Key``按钮，在弹出的页面中记录下``Ak``和``SK``。

- 打开[http://bce.apollo.auto](http://bce.apollo.auto)，在左侧选择“帐号状态”，点击“Apollo Fuel”下方的蓝色超链接“这里”，在弹出的模态框中输入对应的信息，包括车辆自身的信息和上述BOS服务的信息，提交确认，等待商务人员审核。

#### 可能用到的软件

- 循迹实验中，Apollo D-Kit的行驶数据会被保存在本地的一个CSV文件中，为了方便对其中的数据进行可视化分析，可能会使用到Matlab和QGIS，Matlab可以用来可视化速度、油门大小等信息，QGIS可以将GPS信息进行可视化。QGIS是一个开源软件的，其下载地址如下：

    > QGIS Project：[https://www.qgis.org/zh-Hans/site/](https://www.qgis.org/zh-Hans/site/)
  > QGIS 下载页：[https://www.qgis.org/zh-Hans/site/forusers/download.html](https://www.qgis.org/zh-Hans/site/forusers/download.html)

### 动力学标定
---

#### 动力学标定概述

- 动力学标定是通过采集车辆底盘在运行时油门幅度、刹车幅度、车辆速度、车辆加速度等数据，建立车辆动力学模型的过程。动力学标定的结果是一张车辆踏板标定表，反映了油门和刹车作用在车辆上的效果。Apollo D-Kit的动力学标定过程可以在Dreamview中可视化完成。

- Apollo D-Kit的动力学标定需要采集低速小油门、低速大油门、低速急刹车、低速缓刹车、高速大油门、高速小油门、高速急刹车、高速缓刹车这8种场景条件下的运行数据，其中速度条件、油门条件和刹车条件的定义如下：

    - **速度条件**：低速——$$0\sim 2.5m/s$$；高速——$$\geq 2.5m/s$$。
    
    - **油门条件**：小油门——$$deadzone\sim 24%$$；大油门——$$\geq 24%$$。
    
    - **刹车条件**：缓刹车——$$deadzone\sim 28%$$；急刹车——$$\geq 28%$$。
    
- 上述标定配置位于``apollo/modules/calibration/data/dev_kit/dreamview_conf/data_collection_table.pb.txt``中。

#### 动力学标定流程

##### 数据采集

- 将Apollo D-Kit移动至足够长的直线路段后，启动Apollo D-Kit，进入Docker容器内，并通过``bootstrap.sh``脚本启动Dreamview。在``--setup mode--``中选择``vehicle calibration``并将``--vehicle--``置为``Dev_Kit``。

- 在下方``Others``区域中勾选``Data Collection Moniter``，在右侧弹出的面板中点击``Go Straight``按钮，下方出现8个进度条，分别对应上述8种场景条件。在后续的驾驶过程中，当满足其中的一种场景条件时，相应的进度条就会增加，当所有进度条都满了之后，即可完成数据采集。

- 在Docker内终端运行命令``cyber_monitor``，检查``/apollo/canbus/chassis``是否有数据，检查``/apollo/sensor/gnss/best_pose``是否有数据且``sol_type``字段是否为``NARROW_INT``，检查``/apollo/localization/pose``是否有数据。若均无误，在``Dreamview``中点击左侧``Module Controller``，打开三个开关，开始操作车辆采集数据。

- 当采集完成后，在``Module Controller``中关闭``Recoder``开关。在``apollo/data/bag``下可以找到一个形如``yyyy-MM-dd-HH-mm-ss``和一个形如``yyyy-MM-dd-HH-mm-ss_s``的两个文件夹，复制出其中不带``_s``后缀的文件夹备用。

- （Optional）如果采集过程中出现失败，重新进入Dreamview无法打开``Go Straight``页面，需要运行``rm -rf ~/apollo/data/bag/*``删除残缺的数据文件，在Docker内执行``bash apollo.sh build_opt``重新编译工程。

##### 标定任务提交

- 登录百度智能云，打开BOS服务，在Bucket根目录下新建一个任务文件夹，例如``Task001``，在其中建立一个代表车辆的文件夹，例如``Dev_Kit``，在其中建立一个名为``Records``的文件夹，在、再上传一个该车辆的配置文件（位于``/apollo/modules/calibration/data/dev_kit/vehicle_param.pb.txt``），再``Records``文件夹下建立一个形如``yyyy-MM-dd-HH-mm-ss``的文件夹，将Apollo采集的数据传到该文件夹下。需要注意的是，BOS服务按量计费，再进行后续操作之前需要在百度智能云中预存足够的费用。

- 打开[http://bce.apollo.auto](http://bce.apollo.auto)，在左侧选择``Apollo Fuel``并在二级菜单中选择``任务``，点击“新建任务”，在下拉菜单中选择“控制评测”，在“输入数据路径”中填写上一个步骤中建立的任务文件夹名，即``Task001``，点击“提交任务”。

##### 更新配置文件

- 云标定完成后，会将标定结果发送至预留的邮箱中，压缩包是``.tar.gz``格式，解压后将标定结果用于替换``apollo/modules/calibration/data/dev_kit/control_conf.pb.txt``中的``lon_controller_conf``字段下的``calibration_table``字段。

### 循迹实验
---

#### 录制阶段

- 在完成车辆的动力学标定之后，可以进行车辆的循迹实验。启动工控机，在命令行下打开CAN卡，启动Docker容器，进入Docker内环境，使用``bash apollo.sh build_opt_gpu``命令重新编译工程，并通过``bash scripts/bootstrap.sh``命令启动Dreamview。

- 在``--setup mode--``中选择模式``Rtk``，并在``--vehicle--``中选择``Dev Kit``车型，在侧边栏中进入``Module Controller``页面，打开``Canbus``、``GPS``和``Localization``三个模块，在``cyber_monitor``中监听``/apollo/canbus/chassis``、``/apollo/canbus/chassis_detail``、``/apollo/sensor/gnss/best_pose``、``/apollo/localization/pose``四个Channel的数据是否正常。

- 如各个Channel的数据均符合要求，可以将车辆开至合适的场地，记录下车辆的车头方向和起点位置，点击``RTK Recorder``启动循迹数据的记录模块录制数据，此时使用遥控器手动控制车辆前进一段轨迹，在达到终点后，再次点击``RTK Recorder``，关闭录制。需要注意的是，车辆停止和关闭数据录制之间的间隔需要尽可能的短，以免录制过多冗余数据。

#### 回放阶段

- 驾驶车辆返回录制过程的起始点后，将遥控器放权，在``Module Controller``页面中打开``Control``模块，再启动``RTK Player``模块，此时在界面中应规划出一条光滑无毛刺的蓝色轨迹线，该轨迹即是录制阶段车辆行驶的轨迹，请确认轨迹是否符合预期。

- 在侧边栏点击``Task``，在下方的控制区域点击``Start Auto``，此时车辆将按照规划的轨迹执行自动驾驶，此时可以观察界面中不断replan的轨迹和车辆的实时驾驶状态是否科学安全，如有异常，随时使用遥控器接管车辆。

- 到达终点后，车辆会自动停止，此时先使用遥控器接管车辆，再在``Module Controller``页面中关闭``RTK Player``和``Control``模块，完成循迹实验。

#### 循迹实验的调试

##### CAN总线的调试

- Dreamview中高层下达的指令通过CAN总线控制地盘的运动，如果车辆的循迹运动有问题，可以检查CAN总线的控制是否正常。在Apollo的工程代码中，官方提供的``canbus_teleop``脚本能实现这一功能，在Docker的内环境中执行下列命令可以进入一个这个脚本的CLI页面。
```bash
cd /apollo/scripts
bash canbus_teleop.sh
```

- 在CLI中会显示该工具的使用方法，一般说来，需要先同时按下``m``键和``0``键重置系统，在同时按下``m``键和``1``键开始对底盘进行控制，连续按下``a``键和``d``键观察车前轮是否有左右运动，同时按下``g``键和``1``键为汽车挂前进挡，连续按下``w``键观察汽车是否前进，连续按下``s``键观察汽车是否能停下来。

- 如果上述操作均无异常，说明CAN总线通信没有问题。

##### 录制数据的可视化

- 在录制阶段，RTK Recorder采集到的数据会被保存在``apollo/data/log/garage.csv``这一文件中，其中包括车辆在每一时刻下的位置信息、速度、加速度、油门档位等各种驾驶信息，记录的频率是100Hz。

- 对于其常规数据的可视化，通过Excel中的图表工具就可以完成，对于GPS信息，文件中记录的是WGS84坐标系下UTM投影后的值，这个信息可以通过QGIS软件进行可视化，具体的操作步骤可以参考下方其官方文档中的说明，更多的关于GIS的内容可以在下方的网站中获得：

    > Importing a delimited text file：[https://docs.qgis.org/3.10/en/docs/user_manual/managing_data_source/opening_data.html?highlight=csv#importing-a-delimited-text-file](https://docs.qgis.org/3.10/en/docs/user_manual/managing_data_source/opening_data.html?highlight=csv#importing-a-delimited-text-file)
    > 麻辣GIS：[https://malagis.com/](https://malagis.com/)

