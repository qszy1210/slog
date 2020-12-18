<template>
  <div @clickdiv="dosomething">
    <slot name="header" :data="{ data: headerData, evt: callback }">
      <inner-slot>
        <div slot="inner" slot-scope="{data, evt}">
          {{ data + ':' + evt}}
        </div>
      </inner-slot>
    </slot>
    <slot name="body"></slot>
    <slot name="footer"></slot>
  </div>
</template>

<script>
import InnerSlot from "./InnerSlot";
export default {
  components: {
    InnerSlot,
  },
  data() {
    return {
      headerData: {
        pos: "header",
      },
    };
  },
  methods: {
    dosomething() {
      console.log("dosomething");
    },
    callback(param) {
      console.log("callback", param);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>