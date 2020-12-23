## React Native 新架构分析

> 引用链接: https://mp.weixin.qq.com/s/tU08eVhNfqwsdxAPjB0OAw

本文主要介绍FB团队正在重构的React[Native](http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=201380205&idx=1&sn=e0c800a14b9e2724ee5ea4eebb0d67da&scene=21&subscene=126#wechat_redirect)(下面称RN)新架构，主要当前架构，Bridge带来的问题，新架构，[JS](http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=200235684&idx=2&sn=07f181c1951fa920049810ab3e95760c&scene=21#wechat_redirect)I，Fabric，TurboModules，CodenGen及LeanCore等概念。

### 当前架构

![Xnip2020-12-22_13-20-58](/Users/qs/Desktop/note-life/03-react/react-native新架构分析.assets/Xnip2020-12-22_13-20-58.jpg)

RN现在主要有3个线程

JS thread。JS代码执行线程，负责逻辑层面的处理。Metro（打包工具）将React源码打包成一个单一JS文件(就是图中JSBundle)。然后传给JS引擎执行，现在ios和android统一用的是JSC。

UI Thread(Main Thread/Native thread)。这个线程主要负责原生渲染（Native UI）和调用原生能力(Native Modules)比如蓝牙等。

Shadow Thread。这个线程主要是创建Shadow Tree来模拟React结构树。Shadow Tree可以类似虚拟dom。RN使用Flexbox布局，但是原生是不支持，所以Yoga就是用来将Flexbox布局转换为原生平台的布局方式。

#### Bridge的问题

首先回顾一下当前Bridge的运行过程。

当我们写了类似下面的React源码。

```
<Viewstyle={{backgroundColor: 'pink',width: 200,height: 200}}/> 
```

JS thread会先对其序列化,形成下面一条消息

```
UIManager.createView([343,"RCTView",31,{"backgroundColor":-16181,"width":200,"height":200}])
```

通过Bridge发到ShadowThread。Shadow Tread接收到这条信息后，先反序列化，形成Shadow tree，然后传给Yoga，形成原生布局信息。

接着又通过Bridge传给UI thread。

UI thread 拿到消息后，同样先反序列化，然后根据所给布局信息，进行绘制。

从上面过程可以看到三个线程的交互都是要通过Bridge，因此瓶颈也就在此。

Bridge三个特点：

- 异步。这些消息队列是异步的，无法保证处理事件。
- 序列化。通过JSON格式来传递消息，每次都要经历序列化和反序列化，开销很大。
- 批处理。对Native调用进行排队，批量处理。

异步设计的好处是不阻塞，这种设计在大部分情况下性能满足需求，但是在某些情况下就会出问题，比如瀑布流滚动。

当瀑布流向下滑动的时候，需要发请求给服务端拿数据进行下一步渲染。

滚动事件发生在UI thread，然后通过Bridge发给JS thread。JS thread 监听到消息后发请求，服务端返回数据，再通过Bridge返回给Native进行渲染。由于都是异步，就会出现空白模块，导致性能问题。

从上面可以看出，性能瓶颈主要是存在JS线程和Native有交互的情况，如果不存在交互，RN的性能良好。

因此，对于RN的优化，主要集中在Bridge上，有下面3个原则：

- JS和Native端不通信。最彻底的方式，消息不走Bridge。
- JS和Native减少通信。在两端无法避免的情况下，尽量通信减少次数。比如多个请求合并成一个。
- 较少JSON的大小。比如图片转为Base64会导致传输数据变大，用网络图片代替。

RN里面可以通过MessageQueue来监听Bridge通信，主要代码如下

```
importMessageQueuefrom'react-native/Libraries/BatchedBridge/MessageQueue.js';
const spyFunction = (msg) => {  console.log(msg);};
MessageQueue.spy(spyFunction);
```

下面是监听到的信息

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MeviasaOvnR7uCDibzasT6gcDqlyJWhk4NAnhptc2iasOyA4LDTdiaVcZicTw7ahLplR3kW9u3WaB9SXygJg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

#### 新架构

FB团队逐渐意识到了这些问题，同时也受到Flutter的压力，在2018年提出了新架构

![图片](https://mmbiz.qpic.cn/mmbiz_png/meG6Vo0MeviasaOvnR7uCDibzasT6gcDqlSpkr2sJaicfdRFz6msR0S3eeTn6z5wgmSSadsdKDicO9JtIHBLJic85icQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

主要有JSI、Fabric、TurboModules、CodeGen、LeanCode组成。

##### JSI

JSI是整个架构的核心和基石，所有的一切都是建立在它上面。

JSI是Javascript Interface的缩写，一个用C++写成的轻量级框架，它作用就是通过JSI，JS对象可以直接获得C++对象(Host Objects)引用，并调用对应方法。

另外JSI与React无关，可以用在任何JS 引擎（V8,Hermes)。

有了JSI，JS和Native就可以直接通信了,调用过程如下：

```
JS->JSI->C++->ObjectC/Java
```

自此三个线程通信再也不需要通过Bridge，可以直接知道对方的存在，让同步通信成为现实。具体的用法可以看 官方例子。

另外一个好处就是有了JSI，JS引擎不再局限于JSC，可以自由的替换为V8,Hermes，进一步提高JS解析执行的速度。

##### Fabric

Fabric是整个架构中的新UI层，包括了新架构图中的renderer和shadow thread。

下图是旧的通信模型。

![图片](https://mmbiz.qpic.cn/mmbiz_png/meG6Vo0MeviasaOvnR7uCDibzasT6gcDqlV2lQc1hEWqpEAXGRv5wycNzFPD8SUuDLJ9bIXGzkSxKZRTpic8icK4Zg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

三个线程通过Bridge异步通信，数据需要拷贝多份。

有了JSI以后，JS可以直接掉调用其他线程，实现同步通信机制。另外数据可以直接引用，不需要拷贝，于是就变成了下面新的通信模式.

![图片](https://mmbiz.qpic.cn/mmbiz_png/meG6Vo0MeviasaOvnR7uCDibzasT6gcDqla3jo4Ku5UVEZOsNOaZrgYzJt2TYluKGgniaAlVotLGgCOBekzKIOXGg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

除了同步能力，直接引用，另外一个好处是Fabric现在支持渲染优先级比如React的Concurrent和Suspense模式

下面两张图是从启动到渲染阶段，加入Fabric前后的变化。

![图片](https://mmbiz.qpic.cn/mmbiz_png/meG6Vo0MeviasaOvnR7uCDibzasT6gcDqlmNZU8GsAZA7Yjr4L0FZMCibPbJwgmxZBiahHGCSgK5z5ukkV4Ge9AMNQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)



改造为Fabric之后

![图片](https://mmbiz.qpic.cn/mmbiz_png/meG6Vo0MeviasaOvnR7uCDibzasT6gcDqlWWIXk5e7kWEpRYOg90uSxxCdHiaBVzAibmGjNn5OQql9zQlMjTibBgPzw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

##### TurboModules

TurboModules主要和原生应用能力相关，对应新架构图上的Native Modules，这部分的优化是：

- 通过JSI，可以让JS直接调用Native模块，实现一些同步操作。比如调用摄像头能力。
- Native模块懒加载。之前RN框架启动的时候会加载所有Native模块，导致启动慢，时间久。现在有了TurboModules后，可以实现按需加载，减少启动时间，提高性能。

##### CodeGen

通过CodeGen，自动将Flow或者Ts等有静态类型的JS代码翻译成Fabric和TurboModules使用的原生代码。

##### Lean Core

这部分主要是包的瘦身，以前所有的包都放在RN核心工程里面。现在RN核心只保留必要的包，其他都移到react-native-community 或者拆出单独的组件，比如Webview和AsyncStore。

#### 当前进度

- JSI已经跟随RN0.59(JSIExecuter.cpp)发布，但是任然使用Bridge来通信
- Fabric和TurboModules还在开发，LeanCore已经完成
- 现在可以使用C++跨平台模块。
- 对JS会实现向下兼容，对Native Modules不会兼容。

具体的进度可以参考Fabric进度讨论和 TurboModules进度讨论和JSI进度讨论和CodeGen进度讨论,以及React官方源码

目前RN的新架构正在紧张的重构中，比预定的时间表晚了一点，比较期待新框架的发布和表现。