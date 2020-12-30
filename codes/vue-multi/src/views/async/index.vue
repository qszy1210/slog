<template>
  <div>
      <button @click="load('Comp1')">load1</button>
      <button @click="load('Comp2')">load2</button>
      <div>
          <async-load-comp :component="comp"></async-load-comp>
      </div>
  </div>
</template>

<script>
import config from './async-config'
import AsyncLoadComp from '@/components/AsyncLoadComp'
export default {
    components: {
        AsyncLoadComp
    },
    data() {
        return {
            comp: ()=>import('@/views/async/components/Comp1')
        }
    },
  computed: {
    key() {
      return this.$route.path;
    },
  },
  methods: {
      load(key) {
          this.comp = config[key]
      }
  },
};
</script>