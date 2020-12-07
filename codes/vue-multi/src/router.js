import VueRouter from 'vue-router'
import Foo from './components/Foo'
import Bar from './components/Bar'

const router = new VueRouter({
    routes: [
        {path: '/foo', component: Foo},
        {path: '/bar', component: Bar},
    ]
})

export {
    router
}