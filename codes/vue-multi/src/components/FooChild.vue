<template>
    <div>
        foo-child
        <router-view :key="key"></router-view>
    </div>
</template>

<script>
    export default {
        computed: {
            key() {
                return this.$router.path
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>