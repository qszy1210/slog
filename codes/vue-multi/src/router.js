import VueRouter from 'vue-router'
import Foo from './components/Foo'
import FooChild from './components/FooChild'
import Bar from './components/Bar'
import Async from '@/views/async/index'

const router = new VueRouter({
    routes: [
        {path: '/foo',  component: Foo,  children: [
            {
                path: '/foo/foo-child',
                component: FooChild
            }
        ]},
        {path: '/bar', component: Bar},
        {path: '/async', component: Async},
    ]
})

export {
    router
}