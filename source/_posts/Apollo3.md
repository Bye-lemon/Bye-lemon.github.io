---
title: Apollo D-Kit 调试笔记（三）：基于Lidar的自动驾驶
tags:
  - Apollo
mathjax: true
categories: 开发和调试笔记
abstract: 本文记录了笔者在对百度Apollo D-Kit上对激光雷达进行标定、制作虚拟车道线并进行感知适配和规划适配的全过程。
abbrlink: d69d
date: 2020-11-10 15:44:48
---
### 准备工作
---

- 在Apollo D-Kit中，各个传感器的坐标系定义如下图所示：
![https://github.com/ApolloAuto/apollo/raw/master/docs/D-kit/Lidar_Based_Auto_Driving/images/lidar_calibration_coordinate_system.jpg](https://github.com/ApolloAuto/apollo/raw/master/docs/D-kit/Lidar_Based_Auto_Driving/images/lidar_calibration_coordinate_system.jpg)

- 基于Lidar的自动驾驶需要对Lidar相对于GNSS设备的外参进行标定，在此之前，需要先设定一个参数作为初始化参数，其中translation代表了以IMU坐标系为基坐标系，Lidar坐标系相对于IMU坐标系的一组平移变换，在默认的安装方式下，这一组默认参数可以被设定为
```yaml
  rotation:
    w: 0.7071
    x: 0.0
    y: 0.0
    z: 0.7071
  translation:
    x: 0.0
    y: 0.38
    z: 1.33
```

### Lidar2GNSS标定
---

#### 标定数据采集

- 在进行Lidar-GNSS标定之前，需要先寻找一块平坦的地面，确保场地中心8米范围内有诸如电线杆、车辆、建筑等轮廓清晰的静态障碍物，避免有大量行人等动态障碍物出现。

- 进入Docker内环境，启动Dreamview，在``--setup mode--``中选择模式``Dev Kit Debug``，并在``--vehicle--``中选择``Dev Kit``车型，在侧边栏中进入``Module Controller``页面，打开``GPS``、``Localization``和``Lidar``三个模块，在``cyber_monitor``中检查对应Channel下是否有数据，对应标准如前序环节所述。

- 如各个Channel的输出没有问题，打开``Recorder``模块开始记录数据，使用遥控器控制车辆缓慢绕“8”字至少5圈，这个过程中车辆的转弯半径应尽可能小，完成后，关闭``Recorder``模块，采集的驾驶数据将被保存在``apollo/data/bag``下，文件名是当前时间。

#### 数据预处理

- 使用``cp -r docs/Apollo_Fuel/examples/sensor_calibration ./``命令将数据抽取工作目录复制到工程根目录下，``sensor_calibration``目录中的每一个文件夹代表一个标定预处理任务，包括一个原始数据文件夹``records``、一个存放抽取后的数据的文件夹``extracted_data``以及一个配置文件``XXX_to_XXXX.config``，在本任务重，我们只需要其中的``lidar_to_gnss``文件夹。

- 将``apollo/data/bag``目录下采集到的数据拷贝到``sensor_calibration/lidar_to_gnss/records``，修改``lidar_to_gnss.config``文件，修改``records``字段下的``record_path``一项对应的路径为存储记录文件的路径，该路径下须有形如``******.record.00001``的记录文件，记录下``io_config``字段下的``output_path``一项对应的路径，这将是抽取后数据的保存路径，需注意，这里的路径需要时自``/apollo/``始的绝对路径。

- 使用``cd /apollo/modules/tools/sensor_calibration``切换工作目录，运行``python extract_data.py --config /apollo/sensor_calibration/lidar_to_gnss/lidar_to_gnss.config``命令，从记录数据中抽取出标定需要的数据，等待出现``Data extraction is completed successfully!``字样，抽取工作完成。运行过抽取命令后的目录结构如下所示
```
lidar_to_gnss/
├── extracted_data
│   ├── lidar_to_gnss-2020-10-27-20-26
│   │   ├── lidar16_to_gnss_calibration
│   │   │   ├── _apollo_localization_pose
│   │   │   ├── _apollo_sensor_lidar16_PointCloud2
│   │   │   └── sample_config.yaml
│   │   └── tmp
│   │       ├── _apollo_localization_pose
│   │       ├── _apollo_sensor_lidar16_PointCloud2
│   │       └── lidar16_sample_config.yaml
│   └── readme.txt
├── lidar_to_gnss.config
└── records
    ├── 20200723180717.record.00000
    └── readme.txt
```

- 编辑``extracted_data/lidar_to_gnss-XXXX-XX-XX-XX-XX/sample_config.yaml``文件，修改``transform``字段下的``translation``的值，将其修改为前文所述的初始外参。

#### 云标定

- 在BOS的Bucket中创建一个名为``sensor_calibration``的文件夹存放原始数据，在建立一个名为``out``的文件夹存放输出的标定结果，将``lidar16_to_gnss_calibration``文件夹完整的上传至Bucket中``sensor_calibration``文件夹下，需要注意的是，目前BOS不支持文件夹上传，所以需要逐个文件夹的建立，再上传内部文件，同一次上传最多可以支持300个文件。

- 上传完成之后，打开Apollo云服务，在Apollo Fuel中新建一个感知标定类型的任务，输入数据路径为``sensor_calibration``，输出数据路径为``out``，然后将任务提交，标定过程大约需要持续1小时，完成后会收到邮件提醒。

- 标定完成之后，标定结果会作为附件发送到邮箱里，附件名称为``velodyne16_novatel_extrinsics_example.yaml``，同时在BOS的输出目录下会生成一个层次如下的目录：
```
out/
└── 20201104145626622504
    └── lidar16_to_gnss_calibration
        ├── results
        │   ├── tmp
        │   │   └── lidar
        │   │       ├── final_clouds
        │   │       ├── init_clouds
        │   │       ├── raw_clouds
        │   │       ├── raw_pose
        │   │       ├── lidar_result.pcd
        │   │       └── lidar16_result_rgb.pcd
        │   └── lidar16_novaltel_extrinsic.yaml
        └── lidar_to_gnss_calibration_config.yaml
```

- 对于标定结果的验证可以下载其中的``lidar16_result_rgb.pcd``文件，使用点云查看工具打开，比较推荐的工具是开源软件CloudCompare，其官网为[http://www.cloudcompare.org/](http://www.cloudcompare.org/)，打开点云后，红色的线条代表驾驶的轨迹，如果周围的障碍物清晰锐利、边缘整齐，说明标定成功。
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20201112172646.png)

#### 更新配置文件

- 如果标定成功，使用邮件附件``velodyne16_novatel_extrinsics_example.yaml``中的``rotation``值和``translation``值替代工程目录中``modules/calibration/data/dev_kit/lidar_params/velodyne16_novatel_extrinsics.yaml``中对应的值以应用标定数据。

### 虚拟车道线生成
---

#### 数据采集

- 将Apollo D-Kit驾驶至将进行自动驾驶的区域，进入Docker内环境，打开Dreamview，在``--setup mode--``中选择模式``Dev Kit Debug``，并在``--vehicle--``中选择``Dev Kit``车型，在侧边栏中进入``Module Controller``页面，打开``GPS``、``Localization``和``Lidar``三个模块，另启动两个终端，分别进入Docker内环境并运行以下两条命令，启动相应Channel的Publisher。
```bash
python modules/tools/sensor_calibration/ins_stat_publisher.py
python modules/tools/sensor_calibration/odom_publisher.py
```

- 检查``/apollo/localization/pose``、``/apollo/sensor/gnss/odometry``、``/apollo/sensor/gnss/ins_stat``、``/apollo/sensor/lidar16/compensator/PointCloud2``四个Channel上的输出是否正常，如若正常输出，可以开始采集必要的数据。

- 打开``Recorder``模块，驾驶车辆沿计划实施自动驾驶的道路中央运行至路段终点，关闭``Recorder``模块，在``apollo/data/bag``中找到对应的记录以备后续使用，需要注意的是，虚拟车道线的生成环节中，提交的数据包不能超过5GB。

#### 提交云服务

- 打开BOS中的Bucket，建立两个文件夹，用于存储原始数据的``virtual_lane``和用于存储生成的虚拟车道线的``lane_out``，将上述文件夹下形如``******.record.00001``的记录文件上传至BOS上的``virtual_lane``目录下，再将上一个环节中邮箱里收到的外参文件重命名为``velodyne16_novatel_extrinsics_example.yaml``，也上传到这一目录下。

- 打开Apollo云服务，在Apollo Fuel中提交虚拟车道线任务，输入数据路径为``virtual_lane``，输出数据路径为``lane_out``，区域编号为``51``（此为大连地区的UTM投影编号），雷达类型为``lidar16``，车道宽度设置为理想的虚拟车道线宽度，譬如``2.2``，额外ROI扩展是虚拟车道线与实际车道线边缘的距离，为了安全，虚拟车道线可能设置的比实际宽度更窄，但是对于不在虚拟车道线范围内的环境也要建立感知，这就需要设定这一参数。设定完成后，提交任务。

#### 应用虚拟车道线

- 在提交标定任务的约4-5小时后，预留的邮箱中会收到一条邮件提醒，代表标定工作已经完成，生成的地图将在BOS中的``lane_out``目录下，将其下载下来，重命名为相应的名字并拷贝到``/apollo/modules/map/data/``下，路径即可生效。

- **（Optional）**由于BOS网页版不支持文件夹的下载，可以在[https://cloud.baidu.com/doc/BOS/s/lk4tnbkrm](https://cloud.baidu.com/doc/BOS/s/lk4tnbkrm)中下载BOS桌面版，使用Access Key和Secret Access Key进行登录，在BOS桌面端里进行文件夹的下载。

### 自动驾驶实验
---

#### 感知适配

- 在进行感知适配之前，需要先修改``modules/common/data/global_flagfile.txt``，为其添加一行``--half_vehicle_width=0.43``，进入Docker内环境使用``bash apollo.sh build_opt_gpu``命令重新编译工程。

- 启动Dreamview，在``--setup mode--``中选择模式``Dev Kit Debug``，并在``--vehicle--``中选择``Dev Kit``车型，并选择生成的地图，在侧边栏中进入``Module Controller``页打开``Canbus``、``GPS``、``Localization``、``Transform``、``Lidar``以及``Lidar Preception``六个模块，检查``tf``、``tf_static``、``/apollo/localization/pose``、``/apollo/sensor/lidar16/PointCloud2``、``/apollo/sensor/lidar16/Scan``、``/apollo/sensor/lidar16/compensator/PointCloud2``、``/apollo/perception/obstacles``等Channel上是否有输出。

- 在Dreamview的界面中观察，界面中是否有障碍物出现。在Dreamviewer中，绿色代表车辆、黄色代表行人、青色代表自行车，带有箭头的线代表对目标运动方向和归集的预测，目标的上方是它的ID、速度以及Apollo为他执行的策略，如IGNORE或CAUTION等。

#### 规划适配

- 在感知适配的基础上再在``Module Controller``页打开``Planning``、``Prediction``、``Routing``、``Control``模块。

- 再在``Route Editing``页中点击``Add Point of Interest``，然后在车道线上点击一个点作为终点，点击``Send Routing Request``发送路径规划请求。在这一页面中，按住鼠标右键可以拖动地图，使用鼠标滚轮可以对地图进行放缩，点击鼠标左键可以添加一个PoI点。

- 此时，应看到一条红色的细线，标记着从当前位置到终点位置的路径，蓝色的粗线，代表着当前一个局部的具体规划，在终点处有一个红色的平面标志停止，当有行人出现在规划路径上时，同样会出现停止标志，并重新规划路径。

#### 自动驾驶

- 将``--setup mode--``切换为``Dev Kit Closeloop``，启动上述感知适配和规划适配中启动的各个模块，待模块完全启动后，发送路径规划请求，遥控器放权，在``Tasks``页面中点击``Start Auto``，此时，应看到车辆按照所规划的路径自动驾驶，此时可以观察界面中不断replan的轨迹和车辆的实时驾驶状态是否科学安全，如有异常，随时使用遥控器接管车辆。

- 到达终点后，车辆会自动停止，此时先使用遥控器接管车辆，发送下一个目的地点，或结束实验。

