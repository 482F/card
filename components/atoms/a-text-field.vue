<template>
  <v-text-field
    class="a-text-field"
    outlined
    dense
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script>
export default {
  name: 'ATextField',
}
</script>

<style lang="scss" scoped>
.a-text-field {
  ::v-deep(.v-text-field__details) {
    display: none;
  }
}
</style>