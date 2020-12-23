## node中遇到的一些问题以及解决记录

#### node-pre-gyp 尝试解决的方法

> 貌似看起来不大可行

sudo npm install -g node-sass --unsafe-perm

sudo npm install -g node-gyp --unsafe-perm

然后一个看起来比较可行的方法是 

全局安装 node-sass 和 node-gyp

然后在对应的安装包中执行 

npm link node-sass

npm link node-gyp