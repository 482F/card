<template>
  <div>
    <v-select
      :items="modes"
      :value="mode"
      @change="changePublic('mode', $event)"
      outlined
      dense
    />
    <card-board :cards="cards" />
  </div>
</template>

<script>
import CardBoard from '../components/card-board.vue'
import { cards } from '../components/single-card.vue'

const modes = [
  { text: 'uno', value: 'uno' },
  { text: 'トランプ', value: 'trump' },
]

export default {
  name: 'Card',
  components: {
    CardBoard,
  },
  computed: {
    modes: () => modes,
  },
  data() {
    const mode = modes[0].value
    return {
      socket: new WebSocket('ws://localhost:18245'),
      mode,
      cards: [],
    }
  },
  watch: {
    mode: {
      immediate: true,
      handler() {
        this.cards = cards[this.mode].map((card) => ({
          text: card,
          r: 0,
          theta: 0,
          angle: 0,
          showers: [],
        }))
      },
    },
  },
  mounted() {
    this.socket.onmessage = (e) => this.onMessage(e)
  },
  methods: {
    send(value) {
      this.socket.send(JSON.stringify(value))
    },
    onMessage(e) {
      if (!e.data) {
        return
      }
      const { keys, value } = JSON.parse(e.data)
      this.changePublic(keys, value, false)
    },
    changePublic(keys, value, broadcast = true) {
      const splittedKeys = keys.split('-')
      let targetObj = this
      splittedKeys.slice(0, -1).forEach((key) => {
        targetObj = targetObj[key]
      })
      targetObj[splittedKeys.at(-1)] = value
      if (broadcast) {
        this.send({ keys, value })
      }
    },
  },
}
</script>
