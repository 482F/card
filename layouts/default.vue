<template>
  <v-app class="app">
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data() {
    return {}
  },
}
</script>

<style lang="scss">
body::-webkit-scrollbar {
  display: none;
}
</style>
<style lang="scss" scoped>
.app {
  ::v-deep(.container) {
    height: 100vh;
    width: 100vw;
    margin: auto;
    padding: 24px;
  }
}
</style>
