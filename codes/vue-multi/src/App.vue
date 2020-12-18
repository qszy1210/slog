<template>
  <div id="app">
    <router-link to="/foo">Go to Foo</router-link>
    <br/>
    <router-link to="/foo/foo-child">Go to Foo-Child</router-link>
    <br/>
    <router-link to="/bar">Go to Bar</router-link>

    <div>
      <router-view :key="key"></router-view>
    </div>

    <div>
      <has-slot>
        <div slot="header" slot-scope="{data}" >header, {{ data.data + data.evt }}
          <div @click="data.evt('outer')">
            inner click
          </div>
        </div>
        <div slot="body">body</div>
        <div slot="footer">footer</div>
      </has-slot>
    </div>
  </div>
</template>

<script>
import HasSlot from './components/HasSlot'
export default {
  name: 'App',
  components: {
    HasSlot,
  },
   computed: {
      key() {
          return this.$router.path
      }
  },
  methods: {
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
