<template>
  <div>
    <component :is="component" :card="card" />
  </div>
</template>

<script>
import uno from './uno-image.vue'
import trump from './trump-image.vue'

const components = { uno, trump }

export default {
  name: 'CardImage',
  computed: {
    component() {
      return components[this.mode]
    },
  },
  props: {
    mode: {
      type: String,
      required: true,
    },
    card: {
      type: Object,
      required: true,
    },
  },
}
</script>
