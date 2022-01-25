---
title: 自动驾驶中间件Cyber RT中的实时通信机制简述
tags:
  - Apollo
mathjax: true
categories: 开发和调试笔记
abstract: 本文记录了笔者在对百度Apollo无人驾驶系统中间件应用Cyber RT中的多进程通信模块的调研笔记。
abbrlink: 89b2
date: 2020-12-30 21:04:09
---
### 无人驾驶系统与Cyber RT

- 无人驾驶是汽车自动化研究的一个问题，汽车自动化是一个已经有着百年研究历史课题。根据其自动化的实现程度，美国汽车工程师协会拟定了**SAEJ3016标准**，将其分成了六个等级，记做L0~L5。

- 现在我们看到的特斯拉以及百度等大部分商用无人车的研究都属于L4级别的范畴上。一个典型的L4级别的无人驾驶系统通常包括三个部分**用户端**、**算法**和**云端**。其中，用户端即是汽车及其附加的各类传感设备以及其上搭载的运算平台。在这个平台上运行了若干应用程序，机器人操作系统就是其中之一。

- **机器人操作系统（Robot Operating System，ROS）**是一个以BSD协议开源的中间件，提供了一系列程序库和工具包来帮助构建机器人软件系统，提供了硬件抽象、设备驱动、库函数、可视化、消息传递和软件包管理等诸多功能。ROS为无人驾驶系统的构建提供了极大地便利，具体的，包括了以下三个部分：

    - **通信系统**：ROS是一个分布式的松耦合系统，基于Socket实现了一个Publisher/Subscriber的节点间通信。
    
    - **框架和工具**：ROS提供了基于消息的用户库和通信层，开发者只需要关注消息处理的算法本身而无需考虑其调度。
    
    - **生态**：ROS拥有丰富的社区生态，许多传感器的驱动以及常用算法都有社区实现。

- 然而ROS也有不适合自动驾驶之处，ROS上的各个节点之间的调度是公平的，但自动驾驶任务中，算法节点的运行需要有一定的逻辑，此外ROS还有通信开销等一系列问题，因而，自动驾驶需要一个面向该特定场景下的专用系统。

- 面向上述ROS所存在的问题，百度基于ROS开发了一个面向自动驾驶任务的通信中间件Cyber RT，面对ROS存在的若干问题，Cyber RT使用**有向无环图**描述任务，并依次创建任务，按照预设的调度配置和任务配置将任务分配到处理器中，再由传感器数据驱动任务运转，同时，将处理器调度单位由进程、线程改成了**协程**，从而将调度、任务从内核空间转移到了用户空间，实现了与业务逻辑的更紧密结合，Cyber RT的整体架构如下图所示：
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20210109113942.png)
  
### Cyber RT中的多线程通信模块：Transport

- 在Cyber RT的代码架构中Transport模块负责完成多进程通信，其基本的类有：
  
  - ``Segment``类负责管理一段共享存储空间，通过Acquire-Release的机制，让其他类可以在线程安全的前提下获取Shared Memory中的对象；
  
  - ``Block``是最基本的数据存储单元，其中存储了各个Channel上的数据，他也是其他类读写的数据单元，在一个``Segment``中可以有多个``Block``；
  
  - ``State``用于管理``Segment``中的内部状态，以便在多个进程上做到状态的同步；
  
  - ``Receiver``是一个抽象类，它是``ShmReceiver``、``IntraReceiver``、``RtpsReceiver``的基类，其负责监听特定的Channel，当Channel上有数据时，调用相应的回调；
  
  - ``Transmitter``是一个抽象类，它是``ShmTransmitter``、``IntraTransmitter``、``RtpsTransmitter``的基类，其负责将数据发送到指定的Channel上，并通知相应的Notifier数据有更新；
  
  - ``Dispatcher``用于管理所有的Receiver对数据的读取，当有新数据时，就调用Receiver注册的回调，向Receiver分发新数据；
  
  - ``Notifier``用于发出有新数据时的提醒，与``Dispatcher``共同完成Receiver对数据的收取；
    
    - ``ConditionNotifier``是一种基于Conditional Variable的``Notifier``，供基于Shared Memory的通信使用；
  
    - ``MulticastNotifier``是一种基于Socket Multicast的``Notifier``，供基于RTPS的通信使用；
  
  - ``ReadableInfo``是一组包含了发送者信息、Channel信息和Block信息的结构体，由``Notifier``在接收到了新数据之后发送；
  
  - ``ListenHandler``是一种增强的回调；
  
  - ``Signal``、``Connect``、``Slot``参者构成了一种通用的回调机制；


### 基于共享存储空间的多进程通信

- 基于共享存储空间（Shared Memory）的多进程通信机制在Cyber RT中主要由``ShmDispatcher``、``ShmReceiver``、``ShmTransmitter``、``Segment``、``NotifierBase``这几个模块完成。其中``ShmDispatcher``、``ShmReceiver``、``ShmTransmitter``均为其基类基于Shared Memory的一种实现。

- 共享内存，即允许两个不相关的进程访问同一个逻辑内存，这一方式是两个运行中的进程之间共享和传递数据的一种非常高效的方式。不同的进程将同一段物理内存映射到各自不同的地址空间上，各个进程均可以访问共享内存中的地址，一个进程对共享内存的改动会立即影响到访问该共享内存的其他进程，十分高效。
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20210109174216.png)

- 不过共享内存并不包含同步机制，因此为保障线程安全，需要使用额外的机制来提供同步，例如条件变量。条件变量为线程提供了聚合的场所，当某一个线程修改这个变量使其满足其他线程继续往下进行的条件之后，其他线程将收到该条件已经发生改变的信号。条件变量与锁共同使用个可以使线程以一种无竞争的方式等待任意条件的发生，在Cyber RT对于基于共享内存的多进程通信的实现中，就应用了这一机制。

- 在Shared Memory的实现方式下，一次由``Transmitter``发送数据到``Receiver``中的过程如下：

  1. 应用调用``ShmTransmitter``中的``Transmit``接口发送数据；
  
  2. ``ShmTransmitter``从相应的``Segment``中获取可写的``Block``并为其上写锁，将数据序列化后写入``Block``，释放写锁，创建一个``ReadableInfo``结构体相关信息，并将其交付``Notifier``；
  
  3. ``Notifier``通过操作条件变量让``Listen``返回``true``；
  
  4. ``ShmTransmitter``不断轮询``Notifier``的消息，监听到``Listen``返回``true``之后，解析``ReadableInfo``结构体，在对应的``Segment``上请求读锁，将相应``Block``的数据反序列化成对象，而后，释放读锁。
  
  5. ``ListenHandler``找到需要的调用的回调并调用。

- Intra模式是Transport模块下的另一种实现，其用于进程内通信而非多进程通信，该模式也派生了相应的``IntraDispatcher``、``IntraReceiver``、``IntraTransmitter``来完成通信任务，其实现与基于Shared Memory的实现类似，区别在于去除了锁机制保护。

### 基于RTPS的多进程通信

- 基于实时发布订阅（Real-Time Publish Subscribe）的多进程通信机制，基于RTPS的多进程通信也实现了相应的``RtpsDispatcher``、``RtpsReceiver``、``RtpsTransmitter``来完成相应的功能。Cyber RT中的RTPS通信是基于``fastrtps``库来完成的，因此该模式下有几个特有的类：

  - ``UnderlayMessage``、``UnderlayMessageType``、``AttributesFiller``、``QosProfileConf``是``fastrtps``所要求的消息类型和配置文件的封装；
  
  - ``SubListener``是兼具了``Subscriber``和``Listener``两种作用的一个模块，负责在``eprosima::fastrtps::Subscriber``受到新的消息时，调用对应的回调。
  
- RTPS是一种基于UDP等不可靠传输进行的best-effort和reliable的发布-订阅通信，具有容错、可扩展、即插即用连接、模块化、可伸缩、类型安全等特点，其包括以下四个模块：

  - **结构模块**：定义通信端点，并将其映射到不同的DDS（数据分发服务）上；
  
  - **消息模块**：定义数据端点间可以交换哪些消息以及如何构建这些消息；
  
  - **行为模块**：定义了一组和合法交互，以及他们如何影响每一个通信端点；
  
  - **发现模块**：定义了一组允许自动发现的内置端点；
  
- RTPS的结构模块是被设计用来实现DDS的实体，因而，每个DDS的实体都将被映射到一个RTPS实体，每一个实体都被关联到一个Domain上，域内是一组Participants的通信平面，其中包含了众多Writer和Reader，这两种类型的端点在通信平面中交换RTPS消息。
![](https://raw.githubusercontent.com/Bye-lemon/Pictures/master/20210109181152.png)

- RTPS的消息模块用来定义Writer和Reader之间的信息交换的内容，由报头和子消息组成，RTPS定义的子消息一共有12类，其中常用的有如下三类子消息：

  - **DATA**：该子消息由Writer发送到Reader，其中包含了对属于Writer的数据对象的更改信息；
  
  - **HEARTBEAT**：该子消息由Writer发送到Reader，其中包含了此时Writer可用的CacheChange；
  
  - **ACKNACK**：该子消息由Reader发送到Writer，其中包含了其接受了那些更改，未收到哪些更改。
  
- RTPS的行为模块描述了在Writer和Reader间可能存在的合法的消息交换形式及其对Reader和Writer的状态修改，以确保不同实现间的互操作性；RTPS的发现模块定义了Participants获取Domain内其他Participants和Endpoints的存在和属性的协议，以保证不同实现间的即插即用连接。

- 在Cyber RT中，基于RTPS的多进程通信由于``fastrtps``的封装，其实现较为简单，通过``eprosima::fastrtps::Domain::createSubscriber()``和``eprosima::fastrtps::Domain::createPublisher()``完成注册，其余的事务均由``fastrtps``实现。
