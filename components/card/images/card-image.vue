<template>
  <div>
    <component :is="component" :card-size="cardSize" :card="card" :is-front="isFront"/>
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
    cardSize: {
      type: Number,
      required: true,
    },
    mode: {
      type: String,
      required: true,
    },
    card: {
      type: Object,
      required: true,
    },
    isFront: {
      type: Boolean,
      default: true,
    }
  },
}
</script>
