---
title: Apollo D-Kit 调试笔记（一）：系统安装与传感器集成
tags:
  - Apollo
mathjax: true
categories: 开发和调试笔记
abstract: 本文记录了笔者在对百度Apollo D-Kit上搭载的工控机重新安装系统、配置Apollo软件环境并进一步集成各类传感器的操作流程。
abbrlink: 11e
date: 2020-10-15 15:37:36
---

### 准备工作

---
#### Apollo D-Kit相关网站

  > Apollo Project 官网：[https://apollo.auto/](https://apollo.auto/)
  > Apollo Github Repo：[https://github.com/ApolloAuto/apollo](https://github.com/ApolloAuto/apollo)
  > Apollo D-Kit 用户手册：[https://github.com/ApolloAuto/apollo/blob/r5.5.0/docs/specs/D-kit/Vehicle_Guide/Quick_Start_V04.md](https://github.com/ApolloAuto/apollo/blob/r5.5.0/docs/specs/D-kit/Vehicle_Guide/Quick_Start_V04.md)
  > Apollo D-Kit 官方文档：[https://github.com/ApolloAuto/apollo/tree/r5.5.0/docs/specs/D-kit](https://github.com/ApolloAuto/apollo/tree/r5.5.0/docs/specs/D-kit)
  > Apollo 仿真、反馈和服务中心：[http://bce.apollo.auto/accounts?locale=zh-cn](http://bce.apollo.auto/accounts?locale=zh-cn)

#### 设置工控机满功率运行

- 在工控机启动的过程中，按`F2`键进入BIOS菜单，在`Power`选项卡下将`SKU POWER CONFIG`设置为`MAX TDP`，使工控机始终保持以最佳性能状态运行。

#### 安装Ubuntu操作系统

- Apollo平台的运行需要依赖Linux操作系统，百度官方推荐的版本是Ubuntu 18.04.3，目前Ubuntu 18.04LTS的最新版本为Ubuntu 18.04.5，实测表明，在该版本上Apollo系统可用。系统的ISO镜像可以在Ubuntu官方获得。

  > Ubuntu官方网站：[https://ubuntu.com/](https://ubuntu.com/)
  >
  > Ubuntu 18.04.5 BitTorrent：[https://releases.ubuntu.com/18.04/ubuntu-18.04.5-desktop-amd64.iso.torrent](https://releases.ubuntu.com/18.04/ubuntu-18.04.5-desktop-amd64.iso.torrent)

- 下载好Ubuntu镜像之后，即可制作引导盘，Rufus是一款不错的引导盘制作工具。插入U盘，在Rufus中使用默认设置制作引导盘后，在工控机的BIOS之中选择`Legacy`方式引导，将第一启动设备设置为所制作的U盘引导盘即可从该引导盘启动，按照提示，即可完成系统的安装。

  > Rufus下载地址：[http://rufus.ie/](http://rufus.ie/)
  >
  > Ubuntu安装指南：[https://ubuntu.com/tutorials/install-ubuntu-desktop](https://ubuntu.com/tutorials/install-ubuntu-desktop)

- （可选）如果在使用`apt`包管理工具安装软件时，Ubuntu默认的官方源下载速度不够理想，可以更换系统自带的软件源，可以使用可视化操作，也可以使用Super权限对`/etc/apt/sources.list`进行修改来完成。

    - 使用可视化操作，可以打开左侧快捷启动栏里的`Software`软件，单机左上方软件名称，在下拉菜单里选择第一项，进入狗，在Server一栏，Choose Best Server。返回时，通过Reload刷新本地信息。

    - 如果通过修改配置文件的方式更换软件园，可以参照清华开源软件镜像站[TUNA](https://mirrors.tuna.tsinghua.edu.cn/)给出的帮助信息，完成替换，具体的操作方式参见[https://mirrors.tuna.tsinghua.edu.cn/help/ubuntu/](https://mirrors.tuna.tsinghua.edu.cn/help/ubuntu/)，完成替换之后，使用`sudo apt update`完成本地缓存的更新。

### 编译安装Apollo内核

---

- 在进行各类驱动包的安装之前，需要先安装一些必要的工具，这是工具将被用来完成后续的编译工作，具体的安装可以通过以下命令完成

  ```bash
  sudo apt install vim git wget curl make
  ```

- Apollo内核的编译要求使用4.8版本编译工具包，可以使用``gcc -- version``和``g++ --version``命令检查对应工具的版本，如不满足4.8版本的要求，也使用下述命令安装特定版本。

  ```bash
  sudo apt install g++-4.8 g++-4.8-multilib gcc-4.8 gcc-4.8-multilib
  sudo /usr/bin/update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.8 99 --slave /usr/bin/g++ g++ /usr/bin/g++-4.8
  ```

- 完成编译工具的准备之后，即可开始编译Apollo Kernel，Apollo Kernel是一个实时操作系统内核，Apollo D-Kit的正常使用需要Apollo Kernel提供的系统及支持。编译Apollo Kernel的第一步是获取其源码，Apollo Kernel最新一次的Release版本，可以从[https://github.com/ApolloAuto/apollo-kernel/releases/tag/1.5.5](https://github.com/ApolloAuto/apollo-kernel/releases/tag/1.5.5)处获得。

- 切换到保存有源码包的目录，依次执行一下三条语句，即可完成对源码的解压、编译与安装。

  ```bash
  tar -zxvf linux-4.4.32-apollo-1.5.5.tar.gz
  cd install
  sudo bash install_kernel.sh
  ```

- Ubuntu使用Grub进行系统的引导启动，在完成Apollo Kernel的编译安装之后，需要对`grub`的部分而皮质进行修改，以便在后续的使用中选择从Apollo Kernel引导。Grub的配置文件是``/etc/default/grub``，在Super权限下编辑该文件，将``grub_timeout_style=hidden``注释掉，修改``grub_timeout``的值为``10``，将``grub_cmdline_linux_default``的值由``quiet splash``修改为``text``。完成修改并保存后，使用``sudo update-grub``命令是修改的配置生效，重新启动工控机。

- 在重启工控机进入到Grub界面时，选择``Ubuntu Advantace Settings``，在其中选择Apollo Kernel的引导项，重启后，使用``Crtl+Alt+T``打开终端，输入命令``uname -r``并检查输出，若包含``4.4.32-apollo-2-RT``说明安装成功。

### 编译安装硬件驱动包

---

#### 编译安装网卡驱动

- D-Kit的工控机背板上有两个有两个以太网接口，默认情况下，其中一个没有驱动，无法进行连接，需要为其额外编译安装一份驱动程序。驱动程序源码可以在英特尔网站上获取，具体的下载页面是[https://downloadcenter.intel.com/zh-cn/download/15817?_ga=1.159975677.114505945.1484457019](https://downloadcenter.intel.com/zh-cn/download/15817?_ga=1.159975677.114505945.1484457019)，目前，该驱动的最新版本为3.8.4版本。

- 下载好驱动源码后，可以依次执行下列命令完成有线网卡驱动的安装流程。在完成安装后，检验两个以太网接口，均可识别到有线连接，即可执行后续操作。

  ```bash
  tar -zxvf e1000e-3.8.4.tar.gz
  cd e1000e-3.8.4/src/
  sudo make install
  sudo modprobe e1000e
  ```

- （可选）为了更方便的实现网络连接，可以为工控机编译安装无线网卡的驱动，以便在维护工控机时更方便的使用Wi-Fi连接。在无线网卡的选择上，一种方便可行的方案是选购Tenda U6无线网卡。下面以Tenda U6无线网卡为例，介绍无线网卡的驱动编译。

    - 类似地，首先在Tenda官方网站上获取无线网卡驱动的源码，Tenda U6网卡的驱动源码可以在[https://www.tenda.com.cn/download/detail-2656.html](https://www.tenda.com.cn/download/detail-2656.html)页面下载。

    - 切换到源码包所在的目录，使用``unzip``命令解压，打开其中名为``RTL8192EU_linux_v5.6.4_35685_COEX20171113-0047.20191108``的目录，执行命令``sudo bash install.sh``即可完成驱动的编译和安装。

    - 验证工控机是否能够搜索并连接到无线网络，如果可以，说明安装成功。

#### 编译安装GPU驱动

- 为了让Apollo平台可以在拥有GPU支持的情况下高效运行，需要为工控机编译安装GPU驱动。需要注意的是，GPU驱动的编译安装不支持在实时系统上进行，所以需要将工控机以普通方式引导启动，即在Grub界面中不选择高级选项直接引导系统。

- Apollo Kernel的官方Github仓库提供了一个用于安装GPU驱动的脚本，可以使用``wget https://github.com/ApolloAuto/apollo-kernel/blob/master/linux/install-nvidia.sh``将该自动化脚本下载到本地。随后，通过``sudo bash install-nvidia.sh``完成驱动安装。

- 在完成显卡内核驱动的安装后，该脚本还会生成一个名为``NVIDIA-Linux-x86_64-430.50.run``的文件，使用以下命令完成用户驱动库的安装。

  ```bash
  sudo bash ./NVIDIA-Linux-x86_64-430.50.run --no-x-check -a -s --no-kernel-module  
  ```

- 完成安装之后，可以使用``cat /proc/driver/nvidia/version``命令检查驱动内核，若出现“430.50”字样，说明安装成功，随后可以使用``nvidia-smi``命令查看显卡信息，若能正常输出，说明用户库也正常安装，可供后续操作。

#### 编译安装CAN驱动

- 工控机与底盘等硬件设备的通信采用的是CAN通信，为此，需要为工控机安装CAN驱动。在安装驱动之前，需要先添加一条重命名规则，将CAN设备重命名为``ttyACM10``。通过命令``ll /sys/class/tty/ttyACM*``可以查看存在的ACM设备，记录下终端显示的形如``1-10:1.0``的一组编号，使用``sudo vim /etc/udev/rules.d/99-kernel-rename-emuc.rules``命令进入编辑器，按下``i``进入编辑模式，输入``ACTION=="add",SUBSYSTEM=="tty",MODE=="0777",KERNELS=="1-10:1.0",SYMLINK+="ttyACM10``，注意，这里的``1-10:1.0``应替换为前述过程中终端显示的编号，完成输入之后，按下``ESC``推出编辑模式，在输入``:wq``即可保存修改。

- 重启工控机，使用命令``ll /dev/ttyACM*``检查``ttyACM10``是否存在，如存在，可执行后续的驱动安装过程。

- 打开链接[https://www.innodisk.com/Download_file?D7856A02AF20333811EBF83A6E6FDFE31262BBEB35FDA8E63B4FCD36B5C237175D714D7286AF87B5](https://www.innodisk.com/Download_file?D7856A02AF20333811EBF83A6E6FDFE31262BBEB35FDA8E63B4FCD36B5C237175D714D7286AF87B5)下载EMUC-B202的驱动包，使用下列命令解压并将驱动目录拷贝到用户目录下。

  ```bash
  unzip EMUC-B202.zip
  cd EMUC-B202/Linux
  unzip EMUC-B202_SocketCAN_Driver_v2.3_Utility_v2.2.zip
  mv EMUC-B202_SocketCAN_Driver_v2.3_Utility_v2.2/ ~/SocketCan/
  ```

- 此时，即可对CAN驱动进行编译。

  ```bash
  cd ~/SocketCan
  sudo make
  ```

- 完成编译之后，使用``gedit start.sh``命令将文件中``sudo ./emucd_64 -s9 ttyACM0 can0 can1``一行修改为``sudo ./emucd_64 -s7 ttyACM10 can0 can1``，执行``sudo bash start.sh``验证是否能启动CAN通信。运行启动脚本后终端可能会显示``rmmod: ERROR: Module emuc2socketcan is not currently loaded``，不必担心，这是正常输出，此时，CAN卡已启动成功。

- 在后续Apollo D-kit的正常使用中，每次使用之前，均需要在Docker外执行该启动脚本，打开CAN通信。

### 编译安装Apollo软件包

---

#### 准备Docker环境

- Apollo软件包使用Docker容器进行封装，因此，需要为工控机安装Docker环境，使用``wget https://github.com/ApolloAuto/apollo/blob/r5.5.0/docker/setup_host/install_nvidia_docker.sh``下载自动化脚本，完成下载后，执行``sudo bash install_nvidia_docker.sh``完成自动化安装。

- 为检验Docker安装是否成功，可以执行``sudo docker run hello-world``，如果Docker安装成功，可以看到有helloworld输出。

#### 准备Apollo源代码

- 在Docker环境正常搭建之后，即可从Apollo的官方仓库中克隆Apollo最新的源码包，需要注意的是，Apollo D-Kit套件的很多代码提交比较新，Release页面上的5.5.0发行版尚不足以支持D-Kit的使用，因此需要克隆Apollo的主仓库，以获取5.5.0分支上最新的代码提交。

  ```bash
  cd ~
  git clone https://github.com/ApolloAuto/apollo.git
  cd apollo
  git checkout r5.5.0
  ```

- 完成之后，使用``git branch``命令检查是否处于5.5.0分支上。上述命令在执行过程中约需要从Github上下载2.2G的文件，执行时间受网络环境决定。若在克隆过程中出现TLS连接错误，可能是GNUTLS的问题，需要手动编译基于OpenSSL的Git工具，其过程如下：

    - 首先，需要准备必要的Git的最小依赖，使用命令``sudo apt install dh-autoreconf libcurl4-openssl-dev  libexpat1-dev fettext libz-dev libssl-dev install-info``安装这些必要依赖。

    - Git最新的发行版可以从[https://github.com/git/git/releases](https://github.com/git/git/releases)处获得，以2.28.0版本为例，下载``.tar.gz``格式的源码包后，在对应路径下打开终端，使用以下命令编译安装。

      ```bash
      tar -zxvf git-2.28.0.tar.gz
      cd git-2.28.0
      make configure
      ./configure --prefix=/usr
      make
      sudo make install
      ```

- 另外，Github原生使用亚马逊的CDN，访问起来不是很友好，Repo的克隆和Release的下载一般较为缓慢，Repo的克隆可以通过导入Gitee来实现加速，Release包的下载可以通过以下两个网站来提高下载速度：

  > Widora：[https://d.serctl.com/](https://d.serctl.com/)
  >
  > MangoGeek：[http://gitd.cc/](http://gitd.cc/)

#### 编译Apollo源代码

- 准备好源码之后，需要将源代码所在目录加入环境变量，重新引入设置，使其生效。

  ```bash
  cd ~
  echo "export APOLLO_HOME=$(pwd)" >> ~/.bashrc
  source ~/.bashrc
  ```

- 添加了环境变量之后，还需要将当前用户加入Docker用户组，并授权必要权限，完成之后，重启工控机。

  ```bash
  sudo gpasswd -a $USER docker  
  sudo usermod -aG docker $USER  
  sudo chmod 777 /var/run/docker.sock
  ```

- 系统重启之后，打开终端，使用``cd ~/apollo``切换工作路径到Apollo源码文件夹下，运行``bash docker/scripts/dev_start.sh``，将自动完成Apollo的Image镜像的下载和构建，该过程的执行时间受网络质量影响。

- 完成构建之后，使用``bash docker/scripts/dev_into.sh``可以进入Docker容器内的终端，运行``bash apollo.sh build_opt``完成Apollo软件包的编译，该过程约需20分钟。

- 编译完成之后，使用``bash scripts/bootstrap.sh``可以启动Apollo的浏览器控制端Dreamview，在浏览器中访问[http://localhost:8888](http://localhost:8888)，如果正常显示Dreamview控制页面，说明没有问题。

- 在后续的正常使用中，每次启动工控机均需要进入Apollo工作目录，使用``bash docker/scripts/dev_start.sh -n``启动容器，``-n``参数的添加会跳过对远端的版本更新检查，加快启动速度，随后执行``bash docker/scripts/dev_into.sh``并在Docker内终端执行``bash scripts/bootstrap.sh``。如果想要停止Dreamview服务，可以运行``bash scripts/bootstrap.sh stop``，在Docker内终端执行``exit``可以回到系统终端。

### 传感器集成与配置
---
#### 准备工作

- 在传感器的集成与配置工作开始之前，应参考一下文档完成硬件上的连接：

  > Apollo D-Kit传感器集成说明：[https://github.com/ApolloAuto/apollo/blob/r5.5.0/docs/specs/D-kit/Vehicle_Guide/Apollo_D-kit_sensor_integration_V04.md](https://github.com/ApolloAuto/apollo/blob/r5.5.0/docs/specs/D-kit/Vehicle_Guide/Apollo_D-kit_sensor_integration_V04.md)

- Apollo平台使用一组差分GPS实现厘米级高精度定位，其所使用的定位技术是实时动态载波相位差分技术（Real-time Kinematic，RTK）。RTK作业需要有对应的服务支持，千寻位置提供的FindCM服务是可供选择的一种方案。

  > 千寻知寸服务：[https://mall.qxwz.com/market/services/FindCM](https://mall.qxwz.com/market/services/FindCM)

- Apollo有两个以太网，二者分别与4G路由器和激光雷达相连，为了方便对两个设备的有序访问，可以为两个以太网连接设定静态IP，在桌面右上角点击网络图标，选择有线连接下方的Setting，将与4G路由器相连的接口IP、子网掩码和网关设成``192.168.0.118``、``255.255.255.0``、``192.168.0.1``；将与激光雷达相连的接口IP、子网掩码和网关设成``192.168.1.118``、``255.255.255.0``、``192.168.1.1``，关闭后重新打开连接，使其生效。

#### Newton M2控制器的配置

- 使用``ll /sys/class/tty/ttyACM0``命令检查M2主机是否已经与工控机正常连接，如果连接正常，可以看到一串形如``1-10:1.0``的编号，通过``sudo vim /etc/udev/rules.d/99-kernel-rename-imu.rules``创建并编辑配置文件，在文件中键入``ACTION=="add",SUBSYSTEM=="tty",MODE=="0777",KERNELS=="1-10:1.0",SYMLINK+="imu"``，其中，``KERNELS``字段替换为ttyACM0对应的编号，保存配置文件，重启工控机。

- 使用``ll /dev/imu``查看是否存在设备，如存在，说明配置无误，可以进行M2的配置。M2的配置需要通过串口进行，为了方便配置，可以创建一个配置文件``imu.conf``在其中写入以下内容，并将``$cmd,set,netuser,[FindCM UserName]:[FindCM Password]*ff``修改为FindCM提供的账号和密码。
  ```bash
  $cmd,set,leverarm,gnss,0,-0.1,0.6*ff
  $cmd,set,headoffset,0*ff
  $cmd,set,navmode,FineAlign,off*ff
  $cmd,set,navmode,coarsealign,off*ff
  $cmd,set,navmode,dynamicalign,on*ff
  $cmd,set,navmode,gnss,double*ff
  $cmd,set,navmode,carmode,on*ff
  $cmd,set,navmode,zupt,on*ff
  $cmd,set,navmode,firmwareindex,0*ff
  $cmd,output,usb0,rawimub,0.010*ff
  $cmd,output,usb0,inspvab,0.010*ff
  $cmd,through,usb0,bestposb,1.000*ff
  $cmd,through,usb0,rangeb,1.000*ff
  $cmd,through,usb0,gpsephemb,1.000*ff
  $cmd,through,usb0,gloephemerisb,1.000*ff
  $cmd,through,usb0,bdsephemerisb,1.000*ff
  $cmd,through,usb0,headingb,1.000*ff
  $cmd,set,localip,192,168,0,196*ff
  $cmd,set,localmask,255,255,255,0*ff
  $cmd,set,localgate,192,168,0,1*ff
  $cmd,set,netipport,203,107,45,154,8002*ff
  $cmd,set,netuser,[FindCM UserName]:[FindCM Password]*ff
  $cmd,set,mountpoint,AUTO*ff
  $cmd,set,ntrip,enable,enable*ff
  ppscontrol enable positive 1.0 10000
  log com3 gprmc ontime 1 0.25
  $cmd,save,config*ff
  ```

- 使用命令``sudo apt install cutecom``安装串口调试助手，执行命令``sudo cutecom``打开程序，以``115200``的波特率打开``ttyS0``，点击下方的``Open``按钮，打开保存的配置文件，向M2主机发送配置。如配置成功，应收到25条``$cmd,config,ok*ff``的回复，然后为M2主机重新上电。

- 完成M2主机上的配置之后，工控机上Apollo项目的配置文件也应同步修改，具体应该修改的内容包括以下几个文件：
  
  - GNSS配置：编辑配置文件``modules/calibration/data/dev_kit/gnss_conf/gnss_conf.pb.txt``，修改其中``proj4_text: "+proj=utm +zone=50 +ellps=WGS84 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"``一行的``+zone``参数，将其改为所在地区的UTM Zone，50对应了北京，大连的UTM Zone为51，该值可以通过$$utmzone=\lfloor \lfloor longitude \rfloor / 6 \rfloor + 31$$计算。
  
  - Localization配置：编辑配置文件``modules/calibration/data/dev_kit/localization_conf/localization.conf``，修改其中的``local_utm_zone_id``为上一环节中所计算的区域UTM Zone的值，修改其中``--enable_lidar_localization``的值为``false``。
  
- 为验证配置是否生效，须进入Docker环境，重新编译Apollo工程，并通过``bootstrap.sh``脚本启动Dreamview，在其中打开各个传感器后，在Docker终端输入``cyber_monitor``命令，使用方向键查看``/apollo/canbus/chassis``、``/apollo/sensor/gnss/best_pose``、``/apollo/sensor/gnss/imu``和``/apollo/localization/pose``等Channel下是否有数据被采集。其中，``apollo/sensor/gnss/best_pose``中``sol_type``字段的值须为``NARROW_INT``。

#### Lidar和Radar的配置

- 激光雷达的默认IP地址是``192.168.1.201``，通过浏览器访问该IP地址可以打开激光雷达的配置界面，将``HOST IP Address``的值修改为``255.255.255.255``，将``DATA Port``修改为``2369``，将``Telemetry Port``修改为``8309``，之后点击``Set``键和``Save Configure``保存配置。

- D-Kit只使用了毫米波雷达的前向毫米波，未使用后向毫米波，因此，需要在``modules/drivers/radar/conti_radar/dag/conti_radar.dag``中删除后向毫米波的配置，具体应删除内容如下：
```config
components {
    class_name : "ContiRadarCanbusComponent"
    config {
        name: "conti_radar_rear"
        config_file_path:  "/apollo/modules/drivers/radar/conti_radar/conf/radar_rear_conf.pb.txt"
    }
}
```

- 启动Dreamview，在``cyber_monitor``中监控``tf``、``tf_static``和``/apollo/localization/pose``至出现定位数据后，监控``/apollo/sensor/lidar16/PointCloud2``、``/apollo/sensor/lidar16/Scan``和``/apollo/sensor/lidar16/compensator/PointCloud2``三个Channel，观察激光雷达数据是否正常，再监控``/apollo/sensor/radar/front/``，观察毫米波雷达数据是否正常。

#### 摄像头的配置

- 使用``ll /sys/class/video4linux/video*``命令查看工控机上所挂载的摄像头设备，记录下形如``1-10:1.0``的编号，通过``sudo vim /etc/udev/rules.d/99-webcam.rules``创建并编辑配置文件，在文件中键入下列内容并保存，其中，``KERNELS``字段替换为对应相机的编号，重启工控机，使用``ls /dev/camera``命令检查摄像头设备是否存在。
```bash
SUBSYSTEM=="video4linux", SUBSYSTEMS=="usb", KERNELS=="2-6:1.0", MODE="0666", SYMLINK+="camera/left_front", OWNER="apollo", GROUP="apollo"
SUBSYSTEM=="video4linux", SUBSYSTEMS=="usb", KERNELS=="2-7:1.0", MODE="0666", SYMLINK+="camera/right_front", OWNER="apollo", GROUP="apollo"
SUBSYSTEM=="video4linux", SUBSYSTEMS=="usb", KERNELS=="2-8:1.0", MODE="0666", SYMLINK+="camera/front_12mm", OWNER="apollo", GROUP="apollo"
```

- 编辑Apollo工程下的``apollo/modules/drivers/camera/dag/camera.dag``文件，取消``camera_left_front``、``camera_right_front``两段内容的注释，进入Docker环境，使用``bash apollo.sh build_cyber``命令编译工程，运行``cyber_visualizer``可视化工具，查看``/apollo/sensor/camera/left_front/image``、``/apollo/sensor/camera/right_front/image``和``/apollo/sensor/camera/front_12mm/image``上的信息是否正常。
