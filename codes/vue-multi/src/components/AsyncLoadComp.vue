<script>
// 动态加载组件支持
export default {
  name: 'AsyncLoadComp',
  props: {
    // 可以传递动态加载组件的路径名称, 如果传递了, 那么 component 将不生效
    fullPath: {
      type: String,
      default: ''
    },
    // 也可以直接传递组件引用
    component: {
      type: Function,
      default: null
    },
    prop: {
      type: Object,
      default: null
    }
  },
  render(h) {
    const componentHandler = this.fullPath ? require(`${this.fullPath}.vue`) : this.component
    return h(componentHandler, {
      props: {
        prop: this.prop
      }
    })
  }
}
</script>
<style></style>
