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
        <v-select
          class="mode-select"
          :items="modes"
          :value="mode"
          @change="changePublic({ mode: $event })"
          outlined
          dense
        />
        <div class="angle-slider-outer">
          <v-slider
            class="angle-slider"
            max="360"
            min="0"
            vertical
            :value="players[id]?.angle"
            @input="changePublic({ [`players-${id}-angle`]: $event })"
          />
        </div>
        <div
          class="card-board-outer"
          :style="{
            '--outer-height':
              (Math.abs(Math.sin(radian * 2)) * (Math.sqrt(2) - 1) + 1) *
                boardSize *
                1.2 +
              'px',
            '--board-diagonal-size': boardDiagonalSize + 'px',
          }"
        >
          <card-board
            class="card-board"
            :board-size="boardSize"
            :mode="mode"
            :cards="cards"
            :angle="players[id]?.angle"
            :players="players"
            :id="id"
            @update="changePublic($event)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import EntranceForm from '../components/entrance-form.vue'
import CardBoard from '../components/card-board.vue'
import { cards } from '../components/card/single-card.vue'
import { angleToRadian } from '../utils/angles.js'

const modes = [
  { text: 'uno', value: 'uno' },
  { text: 'トランプ', value: 'trump' },
]
const boardSize = 1200

export default {
  name: 'Card',
  components: {
    EntranceForm,
    CardBoard,
  },
  computed: {
    modes: () => modes,
    boardSize: () => boardSize,
    boardDiagonalSize: () => Math.sqrt(2 * boardSize ** 2),
    radian() {
      return angleToRadian(this.players[this.id]?.angle)
    },
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
            x: 50,
            y: 50,
          },
          angle: 0,
          showers: {},
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
    async changeValue(obj, waitWatch = true) {
      const watchedKeys = [/^mode$/]
      if (waitWatch) {
        const waitObj = Object.fromEntries(
          Object.entries(obj).filter(([key]) =>
            watchedKeys.some((pattern) => key.match(pattern))
          )
        )
        await this.changeValue(waitObj, false)
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
      for (const [keys, value] of Object.entries(obj)) {
        const splittedKeys = keys.split('-')
        let targetObj = this
        splittedKeys.slice(0, -1).forEach((key, i) => {
          if (!targetObj[key]) {
            let defaultValue = null
            if (splittedKeys[i + 1].match(/^\d+$/)) {
              key = Number(key)
              defaultValue = []
            } else {
              defaultValue = {}
            }
            this.$set(targetObj, key, defaultValue)
          }
          targetObj = targetObj[key]
        })
        this.$set(targetObj, splittedKeys.at(-1), value)
      }
    },
    async changePublic(obj) {
      await this.changeValue(obj)
      this.send('changePublic', obj)
      if (obj.mode) {
        this.send('deleteChangeds', ['^cards'])
      }
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

      const initialObj = await new Promise(
        (resolve) => (this.initialize = resolve)
      )
      await this.changeValue(initialObj)

      if (!this.players[this.id]) {
        this.changePublic({
          [`players-${this.id}-angle`]: 0,
        })
      }
      this.changePublic({
        [`players-${this.id}-id`]: this.id,
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
  // overflow: hidden;
  height: 100%;
  width: 100%;
  .main {
    height: 100%;
    width: 100%;

    display: grid;
    grid-template-rows: 50px 1fr;
    grid-template-columns: 40px 1fr;
    // > * {
    //   overflow: hidden;
    // }

    .mode-select {
      background-color: white;
      grid-row: 1;
      grid-column: 1 / 3;
    }
    .angle-slider-outer {
      grid-row: 2;
      grid-column: 1;
      .angle-slider {
        position: sticky;
        top: 30px;

        --height: 83vh;
        > ::v-deep(.v-input__control) {
          height: var(--height);
          > .v-input__slot {
            height: var(--height);
            .v-slider {
              height: var(--height);
            }
          }
        }
      }
    }
    .card-board-outer {
      height: var(--outer-height);
      margin-top: calc(-1 * var(--outer-height) * 0.08);
      justify-self: center;
      align-self: center;
      grid-row: 2;
      grid-column: 2;

      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
