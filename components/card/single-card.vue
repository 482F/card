<template>
  <div v-on="$listeners">
    <card-image
      class="card-image"
      :card-size="cardSize"
      :mode="mode"
      :card="card"
      :is-front="isFront"
      :is-front-all="isFrontAll"
    />
  </div>
</template>

<script>
import CardImage from './images/card-image.vue'

export default {
  name: 'SingleCard',
  components: {
    CardImage,
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
      default: false,
    },
    isFrontAll: {
      type: Boolean,
      default: false,
    },
  },
}
export const cards = {
  uno: (() => {
    const nums = Array(10)
      .fill(0)
      .map((_, i) => i.toString())
    const coloredSpecials = [
      'd', // ドロー2
      's', // スキップ
      'r', // リバース
    ]
    const colors = ['y', 'b', 'r', 'g']

    return [
      ...[...nums, ...coloredSpecials].flatMap((char) =>
        colors.flatMap((color) => {
          const card = char + color
          const repeatNum = char === '0' ? 1 : 2
          return Array(repeatNum).fill(card)
        })
      ),
      ...['ww', 'ww', 'ww', 'ww'], // ワイルド
      ...['fw', 'fw', 'fw', 'fw'], // ワイルドドロー4
    ]
  })(),
  trump: (() => {
    const suits = ['h', 'c', 'd', 's']
    const nums = [
      ...Array(9)
        .fill(0)
        .map((_, i) => (i + 1).toString()),
      't',
      'J',
      'Q',
      'K',
    ]
    return [...nums.flatMap((num) => suits.map((suit) => num + suit)), 'jj', 'jj']
  })(),
}
</script>

<style lang="scss" scoped>
.card-image {
}
</style>
