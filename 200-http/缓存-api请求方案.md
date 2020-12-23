## 前端 api 请求缓存的 5 种方案，减少性能损耗！

在开发 web 应用程序时，性能都是必不可少的话题。

对于webpack打包的单页面应用程序而言，我们可以采用很多方式来对性能进行优化，比方说 tree-shaking、模块懒加载、利用 extrens 网络cdn 加速这些常规的优化。

甚至在vue-cli 项目中我们可以使用 --modern 指令生成新旧两份浏览器代码来对程序进行优化。

而事实上，缓存一定是提升web应用程序有效方法之一，尤其是用户受限于网速的情况下。提升系统的响应能力，降低网络的消耗。当然，内容越接近于用户，则缓存的速度就会越快，缓存的有效性则会越高。

以客户端而言，我们有很多缓存数据与资源的方法，例如 标准的浏览器缓存 以及 目前火热的 Service worker。但是，他们更适合静态内容的缓存。例如 html，js，css以及图片等文件。而缓存系统数据，我采用另外的方案。

那我现在就对我应用到项目中的各种 api 请求缓存方案，从简单到复杂依次介绍一下。



### webpack打包的单页面应用程序-缓存方案

tree-shaking、

模块懒加载、

利用 extrens 网络cdn 加速

vue-cli 项目中我们可以使用 --modern 指令生成新旧两份浏览器代码来对程序进行优化

### 更适合静态内容的缓存

Service worker, 例如 html，js，css以及图片等文件

### 各种 api 请求缓存方案

#### 数据缓存

第一次请求时候获取数据，之后便使用数据，不再请求后端api

```js
const dataCache = new Map()

async getWares() {
    let key = 'wares'
    // 从data 缓存中获取 数据
    let data = dataCache.get(key)
    if (!data) {
        // 没有数据请求服务器
        const res = await request.get('/getWares')

        // 其他操作
        ...
        data = ...

        // 设置数据缓存
        dataCache.set(key, data)

    }
    return data
} 
```

>  使用了 es6以上的 Map

调用方式：

```js
getWares().then( ... )
// 第二次调用 取得先前的data
getWares().then( ... )
```

#### promise 缓存

```js
const promiseCache = new Map()

getWares() {
    const key = 'wares'
    let promise = promiseCache.get(key);
    // 当前promise缓存中没有 该promise
    if (!promise) {
        promise = request.get('/getWares').then(res => {
            // 对res 进行操作
            ...
        }).catch(error => {
            // 在请求回来后，如果出现问题，把promise从cache中删除 以避免第二次请求继续出错S
            promiseCache.delete(key)
            return Promise.reject(error)
        })
    }
    // 返回promise
    return promise
}
```

> 通过对 promise存储在闭包中的map中进行实现

