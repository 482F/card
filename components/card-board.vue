<template>
  <div
    class="card-board"
    @contextmenu="
      (e) => {
        e.preventDefault()
        if (!e.target.closest('.single-card')) return
        this.contextE = e
        menu.show = true
        menu.x = e.clientX + 2
        menu.y = e.clientY + 2
      }
    "
    :class="{
      dragging,
      selecting,
    }"
    :style="{
      '--board-size': boardSize + 'px',
      '--board-angle': angle + 'deg',
    }"
    ref="cardBoard"
    @mousedown="(e) => onSelectStart(e)"
    @mousemove="
      (e) => {
        if (dragging) {
          onMove(e)
        } else if (selecting) {
          onSelect(e)
        }
      }
    "
    @mouseup="(e) => onMoveEnd(e)"
    @wheel="(e) => onWheel(e)"
  >
    <single-card
      v-for="(card, i) of cards"
      :key="i"
      class="single-card"
      :card-size="cardHeight"
      :mode="mode"
      :card="card"
      :is-front="card.showers[id]"
      :class="{
        selected: card.selected,
      }"
      :style="{
        '--x': card.coord.x - (card.selected ? 3 : 0) + 'px',
        '--y': card.coord.y - (card.selected ? 3 : 0) + 'px',
        '--angle': card.angle + 'deg',
        '--z-index': card.zIndex,
      }"
      @mousedown="(e) => onMoveStart(e, card)"
      @dblclick="() => setCardSide(selecteds, true, [players[id]])"
    />
    <player-positions
      class="player-positions"
      :style="{
        '--z-index': cards.length + 1,
      }"
      :board-size="boardSize"
      :current-angle="angle"
      :players="players"
    />
    <div
      class="selector"
      v-if="selecting"
      :style="{
        '--start-x': selectCoords.min.x + 'px',
        '--start-y': selectCoords.min.y + 'px',
        '--end-x': selectCoords.max.x + 'px',
        '--end-y': selectCoords.max.y + 'px',
        '--z-index': cards.length + 1,
        '--angle': angle + 'deg',
      }"
    >
      <div class="selector-inner" />
    </div>
    <a-context-menu
      :position-x="menu.x"
      :position-y="menu.y"
      v-model="menu.show"
      :items="menuItems"
    />
  </div>
</template>

<script>
import AContextMenu from '../components/atoms/a-context-menu.vue'
import SingleCard from '../components/card/single-card.vue'
import PlayerPositions from '../components/player-positions.vue'
import { isRectangleCollide } from '../utils/vectors.js'
const cardSizes = {
  uno: 120,
  trump: 120,
}
const boardSize = 800

export default {
  name: 'CardBoard',
  components: {
    AContextMenu,
    SingleCard,
    PlayerPositions,
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
    angle: {
      type: Number,
      default: 0,
    },
    players: {
      type: Object,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      contextE: null,
      dragging: false,
      selecting: false,
      menu: {
        x: 0,
        y: 0,
        show: false,
      },
      startCoord: {
        x: 0,
        y: 0,
      },
      selectCoords: {
        start: {},
        end: {},
        min: {
          x: 0,
          y: 0,
        },
        max: {
          x: 0,
          y: 0,
        },
      },
      additionalSelect: false,
      tempSelecteds: [],
      selecteds: [],
    }
  },
  computed: {
    sortedPlayers() {
      return [
        this.players[this.id],
        ...Object.entries(this.players)
          .filter(([id]) => this.id !== id)
          .map(([, player]) => player),
      ]
    },
    menuItems() {
      return [
        {
          label: '並べる',
          items: [
            // {
            //   label: '扇状に並べる',
            //   handler: () => this.lineUp(this.selecteds, this.contextE, 'fan'),
            // },
            {
              label: '水平に並べる',
              handler: () =>
                this.lineUp(this.selecteds, this.contextE, 'horizon'),
            },
            {
              label: '重ねる',
              handler: () => this.lineUp(this.selecteds, this.contextE, 'pile'),
            },
          ],
        },
        {
          label: '全て裏にする',
          items: [
            ...this.sortedPlayers.map((player) => ({
              label: player.name,
              color: player.color,
              icon: player.icon,
              handler: () => this.setCardSide(this.selecteds, false, [player]),
            })),
            {
              label: '全員',
              handler: () => this.setCardSide(this.selecteds, false),
            },
          ],
        },
        {
          label: '全て表にする',
          items: [
            ...this.sortedPlayers.map((player) => ({
              label: player.name,
              color: player.color,
              icon: player.icon,
              handler: () => this.setCardSide(this.selecteds, true, [player]),
            })),
            {
              label: '全員',
              handler: () => this.setCardSide(this.selecteds, true),
            },
          ],
        },
        {
          label: 'シャッフルする',
          handler: () => this.shuffleCards(this.selecteds),
        },
        {
          label: '分割する',
          items: [
            (() => {
              let leftNum = 0
              const that = this
              const component = {
                data() {
                  return {
                    value: 0,
                  }
                },
                render(h) {
                  return (
                    <div
                      style={{
                        width: '300px',
                        display: 'flex',
                        'flex-direction': 'column',
                        'justify-ontent': 'center',
                        'align-items': 'center',
                      }}
                      vOn:click={(e) => this.$emit('click', e)}
                    >
                      {this.value}
                      <v-slider
                        style={{
                          width: '100%',
                        }}
                        min={0}
                        max={that.selecteds.length}
                        dense
                        value={this.value}
                        vOn:input={(newValue) => {
                          this.value = newValue
                          leftNum = newValue
                        }}
                      />
                    </div>
                  )
                },
              }

              return {
                label: '',
                component,
                handler: () => {
                  this.separateCards(this.selecteds, leftNum, this.contextE)
                },
              }
            })(),
          ],
        },
      ]
    },
    boardSize: () => boardSize,
    boardHalfSize: () => boardSize / 2,
    cardHeight() {
      return cardSizes[this.mode]
    },
    cardWidth() {
      return Math.round(this.cardHeight * 0.714)
    },
    cardHalfHeight() {
      return Math.round(this.cardHeight / 2)
    },
    cardHalfWidth() {
      return Math.round(this.cardWidth / 2)
    },
  },
  watch: {
    selectCoords: {
      deep: true,
      handler() {
        this.tempSelecteds.forEach((card) => {
          card.selected = false
        })

        const originalSelecteds = this.additionalSelect ? this.selecteds : []

        const selector = {}
        selector.length = {
          width: this.selectCoords.max.x - this.selectCoords.min.x,
          height: this.selectCoords.max.y - this.selectCoords.min.y,
        }
        selector.center = {
          x: selector.length.width / 2 + this.selectCoords.min.x,
          y: selector.length.height / 2 + this.selectCoords.min.y,
        }

        const selectRect = [
          { x: this.selectCoords.max.x, y: this.selectCoords.max.y },
          { x: this.selectCoords.min.x, y: this.selectCoords.max.y },
          { x: this.selectCoords.min.x, y: this.selectCoords.min.y },
          { x: this.selectCoords.max.x, y: this.selectCoords.min.y },
        ].map((p) => {
          const x = p.x - this.boardHalfSize
          const y = p.y - this.boardHalfSize
          const r = Math.sqrt(x ** 2 + y ** 2)
          const theta = Math.atan2(y, x) - (this.angle / 180) * Math.PI
          return {
            // sin と cos が逆に見えるがなぜか動h
            x: Math.cos(theta) * r + this.boardHalfSize,
            y: Math.sin(theta) * r + this.boardHalfSize,
          }
        })
        const r = Math.sqrt(this.cardHalfWidth ** 2 + this.cardHalfHeight ** 2)

        this.tempSelecteds = [
          ...this.cards.filter((card) => {
            const cardCenter = {
              x: card.coord.x + this.cardHalfWidth,
              y: card.coord.y + this.cardHalfHeight,
            }

            const deltaRadian = (card.angle * Math.PI) / 180
            const radians = [
              Math.atan2(this.cardHalfHeight, this.cardHalfWidth) + deltaRadian,
              Math.atan2(this.cardHalfWidth, this.cardHalfHeight) + deltaRadian,
            ]
            const deltas = radians.map((radian) => ({
              x: Math.cos(radian) * r,
              y: Math.sin(radian) * r,
            }))

            const cardRect = [
              { x: cardCenter.x + deltas[0].x, y: cardCenter.y + deltas[0].y },
              { x: cardCenter.x - deltas[1].y, y: cardCenter.y + deltas[1].x },
              { x: cardCenter.x - deltas[0].x, y: cardCenter.y - deltas[0].y },
              { x: cardCenter.x + deltas[1].y, y: cardCenter.y - deltas[1].x },
            ]
            return isRectangleCollide(selectRect, cardRect)
          }),
          ...originalSelecteds,
        ]
        this.tempSelecteds.forEach((card) => {
          card.selected = true
        })
      },
    },
  },
  methods: {
    getSelectCoord(e) {
      return {
        x: e.clientX - this.$refs.cardBoard.offsetLeft,
        y: e.clientY - this.$refs.cardBoard.offsetTop,
      }
    },
    getAngledCoord(e) {
      const rawCoord = this.getSelectCoord(e)
      const coord = (() => {
        const x = rawCoord.x - this.boardHalfSize
        const y = rawCoord.y - this.boardHalfSize
        const r = Math.sqrt(x ** 2 + y ** 2)
        const theta = Math.atan2(y, x) - (this.angle * Math.PI) / 180
        return {
          x: Math.cos(theta) * r + this.boardHalfSize,
          y: Math.sin(theta) * r + this.boardHalfSize,
        }
      })()
      return coord
    },
    getCoord(e) {
      if (e.target.matches('.single-card')) {
        const angle = Number(
          e.target.style.getPropertyValue('--angle').match(/\d+/)[0]
        )
        const x = e.offsetX - this.cardHalfWidth
        const y = e.offsetY - this.cardHalfHeight
        const r = Math.sqrt(x ** 2 + y ** 2)
        const theta = Math.atan2(y, x) + (angle * Math.PI) / 180
        return {
          x:
            Math.round(Math.cos(theta) * r) +
            e.target.offsetLeft +
            this.cardHalfWidth,
          y:
            Math.round(Math.sin(theta) * r) +
            e.target.offsetTop +
            this.cardHalfHeight,
        }
      } else {
        return {
          x: e.offsetX,
          y: e.offsetY,
        }
      }
    },
    onSelectStart(e) {
      if (e.target !== this.$refs.cardBoard) {
        return
      }
      this.selecting = true
      const coord = this.getSelectCoord(e)

      this.selectCoords.start = { ...coord }
      this.selectCoords.end = { ...coord }
      this.selectCoords.min = { ...coord }
      this.selectCoords.max = { ...coord }
      this.additionalSelect = e.ctrlKey
      if (!this.additionalSelect) {
        this.selecteds.forEach((card) => {
          card.selected = false
        })
        this.selecteds = []
      }
    },
    onSelect(e) {
      const coord = this.getSelectCoord(e)
      this.selectCoords.end = { ...coord }
      this.selectCoords.min.x = Math.min(
        this.selectCoords.start.x,
        this.selectCoords.end.x
      )
      this.selectCoords.min.y = Math.min(
        this.selectCoords.start.y,
        this.selectCoords.end.y
      )
      this.selectCoords.max.x = Math.max(
        this.selectCoords.start.x,
        this.selectCoords.end.x
      )
      this.selectCoords.max.y = Math.max(
        this.selectCoords.start.y,
        this.selectCoords.end.y
      )
    },
    placeToTop(cards) {
      const changeObj = {}
      cards.forEach((card) => {
        this.cards
          .filter((someCard) => card.zIndex < someCard.zIndex)
          .forEach((card) => {
            changeObj[`cards-${card.index}-zIndex`] ??= card.zIndex
            changeObj[`cards-${card.index}-zIndex`] -= 1
            card.zIndex -= 1
          })
        changeObj[`cards-${card.index}-zIndex`] = this.cards.length
        card.zIndex = this.cards.length
      })
      this.$emit('update', changeObj)
    },
    onMoveStart(e, card) {
      if (!this.selecteds.includes(card)) {
        if (e.ctrlKey) {
          this.selecteds.push(card)
        } else {
          this.selecteds.forEach((card) => {
            card.selected = false
          })
          this.selecteds = [card]
        }
        card.selected = true
      }
      this.placeToTop([card])

      this.selecteds.forEach((selected) => {
        selected.originalCoord = { ...selected.coord }
      })
      this.dragging = true
      this.startCoord = undefined
    },
    onMove(e) {
      const coord = this.getCoord(e)
      this.startCoord ??= coord
      const coordDiff = {
        x: coord.x - this.startCoord.x,
        y: coord.y - this.startCoord.y,
      }
      const changeObj = {}
      this.selecteds.forEach((selected) => {
        changeObj[`cards-${selected.index}-coord-x`] =
          selected.originalCoord.x + coordDiff.x
        changeObj[`cards-${selected.index}-coord-y`] =
          selected.originalCoord.y + coordDiff.y
      })
      this.$emit('update', changeObj)
    },
    onMoveEnd() {
      this.dragging = false
      if (this.selecting) {
        this.selecteds.forEach((card) => {
          card.selected = false
        })
        this.selecteds = this.tempSelecteds
        this.selecteds.forEach((card) => {
          card.selected = true
        })
        this.tempSelecteds = []
      }
      this.selecting = false
    },
    onWheel(e) {
      if (this.dragging) {
        this.rotateSelecteds(e.deltaY / 100)
      }
    },
    rotateSelecteds(sign) {
      const changeObj = {}
      this.selecteds.forEach((selected) => {
        changeObj[`cards-${selected.index}-angle`] = selected.angle + 30 * sign
      })
      this.$emit('update', changeObj)
    },
    lineUp(cards, e, mode) {
      const coord = this.getAngledCoord(e)
      if (mode === 'horizon') {
        const delta = 24
        const lineNum = 24
        const deltas = Object.fromEntries(
          [
            ['x', -this.angle],
            ['y', -this.angle + 90],
          ].map(([label, angle]) => {
            const radian = (angle * Math.PI) / 180
            return [
              label,
              {
                x: Math.cos(radian) * delta,
                y: Math.sin(radian) * delta,
              },
            ]
          })
        )
        cards.forEach((card, i) => {
          const col = (i % lineNum) + Math.floor(i / lineNum) / 2
          const row = Math.floor(i / lineNum)
          card.coord.x = Math.round(
            coord.x + col * deltas.x.x + row * deltas.y.x
          )
          card.coord.y = Math.round(
            coord.y + col * deltas.x.y + row * deltas.y.y
          )
        })
      } else if (mode === 'fan') {
        console.log('fan')
      } else if (mode === 'pile') {
        cards.forEach((card) => {
          card.coord.x = coord.x
          card.coord.y = coord.y
        })
      }
      cards.forEach((card) => {
        card.angle = (-this.angle + 360) % 360
      })
      this.placeToTop(cards)
    },
    setCardSide(cards, isFront, players) {
      players ??= this.sortedPlayers
      const changeObj = {}
      cards.forEach((card) => {
        players.forEach((player) => {
          if (card.showers[player.id] !== isFront) {
            changeObj[`cards-${card.index}-showers-${player.id}`] = isFront
          }
        })
      })
      this.$emit('update', changeObj)
    },
    shuffleCards(cards) {
      const shuffled = [...cards]
        .sort((a, b) => Math.random() - 0.5)
        .map((card) => ({ ...card.coord, zIndex: card.zIndex }))
      for (let i = 0; i < cards.length; i++) {
        cards[i].coord.x = shuffled[i].x
        cards[i].coord.y = shuffled[i].y
        cards[i].zIndex = shuffled[i].zIndex
      }
    },
    separateCards(cards, leftNum, e) {
      const left = cards.slice(0, leftNum)
      const right = cards.slice(leftNum)
      this.lineUp(left, { clientX: e.clientX, clientY: e.clientY }, 'horizon')
      this.lineUp(
        right,
        { clientX: e.clientX, clientY: e.clientY + 300 },
        'horizon'
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.card-board {
  &.dragging,
  &.selecting {
    ::v-deep(*) {
      pointer-events: none !important;
    }
  }
  width: var(--board-size);
  height: var(--board-size);
  transform: rotate(var(--board-angle));
  background-color: lightgray;
  // border-radius: 20%;
  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;
  .single-card {
    position: absolute;
    left: var(--x);
    top: var(--y);
    transform: rotate(var(--angle));
    z-index: var(--z-index);
  }
  > .player-positions {
    height: 80%;
    width: 80%;
    z-index: var(--z-index);
  }
  > .selector {
    transform: rotate(calc(-1 * var(--angle)));
    height: 100%;
    width: 100%;
    position: absolute;
    > .selector-inner {
      position: absolute;
      left: var(--start-x);
      top: var(--start-y);
      width: calc(var(--end-x) - var(--start-x));
      height: calc(var(--end-y) - var(--start-y));
      z-index: var(--z-index);
      border: 1px solid gray;
    }
  }
}
</style>
