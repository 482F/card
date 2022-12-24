<template>
  <div class="card-board">
    <single-card v-for="(card, i) of cards" :key="i" :card="card" />
  </div>
</template>

<script>
export default {
  name: 'CardBoard',
  props: {
    cards: {
      type: Array,
      required: true,
    },
  },
}
</script>