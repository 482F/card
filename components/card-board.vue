<template>
  <div class="card-board">
    <single-card
      v-for="(card, i) of cards"
      :key="i"
      :mode="mode"
      :card="card"
    />
  </div>
</template>

<script>
import SingleCard from '../components/card/single-card.vue'

export default {
  name: 'CardBoard',
  components: {
    SingleCard,
  },
  props: {
    mode: {
      type: String,
      required: true,
    },
    cards: {
      type: Array,
      required: true,
    },
  },
}
</script>

<style>
.card-board {
}
</style>