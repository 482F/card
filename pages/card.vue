<template>
  <div class="outer">
    <entrance-form
      v-if="!loggined"
      :password.sync="password"
      :name.sync="name"
      :icon.sync="icon"
      :color.sync="color"
      @loggined="onLogin"
    />
    <div v-else class="main">
      <v-progress-circular v-if="!ready" indeterminate />
      <template v-else>
        <card-board
          class="card-board"
          :mode="mode"
          :cards="cards"
          :angle="players[id]?.angle"
          :players="players"
          @update="changePublic($event)"
        />
        <v-select
          class="mode-select"
          :items="modes"
          :value="mode"
          @change="changePublic({ mode: $event })"
          outlined
          dense
        />
        <v-slider
          class="angle-slider"
          max="360"
          min="0"
          vertical
          :value="players[id]?.angle"
          @input="changePublic({ [`players-${id}-angle`]: $event })"
        />
      </template>
    </div>
  </div>
</template>

<script>
import EntranceForm from '../components/entrance-form.vue'
import CardBoard from '../components/card-board.vue'
import { cards } from '../components/card/single-card.vue'

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

    const storedValues = Object.fromEntries(
      Object.entries({
        id: Math.random(),
        name: '',
        password: '',
        icon: 'user',
        color: '#FF0000',
      }).map(([key, defaultValue]) => [
        key,
        localStorage.getItem(`card--${key}`) ?? defaultValue,
      ])
    )

    localStorage.setItem('card--id', storedValues.id)

    return {
      ...storedValues,
      loggined: false,
      ready: false,
      socket: null,
      mode,
      cards: [],
      players: {},
    }
  },
  watch: {
    mode: {
      immediate: true,
      handler() {
        this.cards = cards[this.mode].map((card, i) => ({
          index: i,
          zIndex: i,
          selected: false,
          text: card,
          coord: {
            x: 0,
            y: 0,
          },
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
          let defaultValue = null
          if (key.match(/^\d+$/)) {
            key = Number(key)
            defaultValue = []
          } else {
            defaultValue = {}
          }

          if (!targetObj[key]) {
            this.$set(targetObj, key, defaultValue)
          }
          targetObj = targetObj[key]
        })
        this.$set(targetObj, splittedKeys.at(-1), value)
      })
    },
    changePublic(obj) {
      this.changeValue(obj)
      this.send('changePublic', obj)
    },
    async onLogin() {
      this.loggined = true
      localStorage.setItem('card--name', this.name)
      localStorage.setItem('card--password', this.password)
      localStorage.setItem('card--icon', this.icon)
      localStorage.setItem('card--color', this.color)

      this.socket = new WebSocket('ws://localhost:18245')
      this.socket.onmessage = (e) => this.onMessage(e)
      await new Promise((resolve) => (this.socket.onopen = resolve))
      this.send('login', { password: this.password, id: this.id })
      await new Promise((resolve) => (this.initialized = resolve))

      if (!this.players[this.id]) {
        this.changePublic({
          [`players-${this.id}-angle`]: 0,
        })
      }
      this.changePublic({
        [`players-${this.id}-name`]: this.name,
        [`players-${this.id}-icon`]: this.icon,
        [`players-${this.id}-color`]: this.color,
      })
      this.ready = true
    },
  },
}
</script>

<style lang="scss" scoped>
.outer {
  overflow: hidden;
  height: 100%;
  width: 100%;
  .main {
    height: 100%;
    width: 100%;

    display: grid;
    grid-template-rows: 50px 1fr;
    grid-template-columns: 40px 1fr;
    > * {
      overflow: hidden;
    }

    .mode-select {
      background-color: white;
      grid-row: 1;
      grid-column: 1 / 3;
    }
    .angle-slider {
      grid-row: 2;
      grid-column: 1;

      > ::v-deep(.v-input__control) {
        height: 99%;
        > .v-input__slot {
          height: 99%;
          .v-slider {
            height: 99%;
          }
        }
      }
    }
    .card-board {
      justify-self: center;
      align-self: center;
      grid-row: 2;
      grid-column: 2;
    }
  }
}
</style>
