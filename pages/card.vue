<template>
  <div>
    <entrance-form
      v-if="!loggined"
      :password="password"
      @update:password="onLogin"
      :name.sync="name"
    />
    <template v-else>
      <v-progress-circular v-if="!ready" interminate />
      <template v-else>
        <v-select
          :items="modes"
          :value="mode"
          @change="changePublic({ mode: $event })"
          outlined
          dense
        />
        <card-board :cards="cards" />
      </template>
    </template>
  </div>
</template>

<script>
import EntranceForm from '../components/entrance-form.vue'
import CardBoard from '../components/card-board.vue'
import { cards } from '../components/single-card.vue'

const modes = [
  { text: 'uno', value: 'uno' },
  { text: 'トランプ', value: 'trump' },
]

export default {
  name: 'Card',
  components: {
    EntranceForm,
    CardBoard,
  },
  computed: {
    modes: () => modes,
  },
  data() {
    const mode = modes[0].value

    const name = localStorage.getItem('card--name') ?? ''
    const password = localStorage.getItem('card--password') ?? ''
    return {
      loggined: false,
      ready: false,
      name,
      password,
      socket: null,
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
  mounted() {},
  methods: {
    send(key, value) {
      this.socket.send(key + '-' + JSON.stringify(value))
    },
    onMessage(e) {
      if (!e.data) {
        return
      }
      const [, key, , rawValue] = e.data.match(/^([^-]+)(-(.+))?$/)
      const value = rawValue === undefined ? undefined : JSON.parse(rawValue)
      this[key](value)
    },
    changeValue(obj) {
      Object.entries(obj).forEach(([keys, value]) => {
        const splittedKeys = keys.split('-')
        let targetObj = this
        splittedKeys.slice(0, -1).forEach((key) => {
          targetObj = targetObj[key]
        })
        targetObj[splittedKeys.at(-1)] = value
      })
    },
    changePublic(obj, broadcast = true) {
      this.changeValue(obj)
      if (broadcast) {
        this.send('changePublic', obj)
      }
    },
    async onLogin(password) {
      this.loggined = true
      this.password = password
      localStorage.setItem('card--name', this.name)
      localStorage.setItem('card--password', this.password)

      this.socket = new WebSocket('ws://localhost:18245')
      this.socket.onmessage = (e) => this.onMessage(e)
      await new Promise((resolve) => (this.socket.onopen = resolve))
      this.send('password', this.password)
      await new Promise((resolve) => (this.initialized = resolve))
      this.ready = true
    },
  },
}
</script>
