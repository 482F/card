<template>
  <div
    class="card-board"
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
      class="single-card"
      v-for="(card, i) of cards"
      :key="i"
      :card-size="cardSize"
      :mode="mode"
      :card="card"
      :class="{
        selected: card.selected,
      }"
      :style="{
        '--x': card.coord.x - (card.selected ? 4 : 0) + 'px',
        '--y': card.coord.y - (card.selected ? 4 : 0) + 'px',
        '--angle': card.angle + 'deg',
        '--z-index': card.zIndex,
      }"
      @mousedown="(e) => onMoveStart(e, card)"
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
      }"
    />
  </div>
</template>

<script>
import SingleCard from '../components/card/single-card.vue'
import PlayerPositions from '../components/player-positions.vue'
const cardSizes = {
  uno: 120,
  trump: 120,
}
const boardSize = 800

export default {
  name: 'CardBoard',
  components: {
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
  },
  data() {
    return {
      dragging: false,
      selecting: false,
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
    boardSize: () => boardSize,
    cardSize() {
      return cardSizes[this.mode]
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

        const cardHeight = this.cardSize
        const cardWidth = Math.round(cardHeight * 0.714)
        const cardHalfHeight = Math.round(cardHeight / 2)
        const cardHalfWidth = Math.round(cardWidth / 2)

        const selector = {}
        selector.length = {
          width: this.selectCoords.max.x - this.selectCoords.min.x,
          height: this.selectCoords.max.y - this.selectCoords.min.y,
        }
        selector.center = {
          x: selector.length.width / 2 + this.selectCoords.min.x,
          y: selector.length.height / 2 + this.selectCoords.min.y,
        }

        this.tempSelecteds = [
          ...this.cards.filter((card, i) => {
            const cardCenter = {
              x: card.coord.x + cardHalfWidth,
              y: card.coord.y + cardHalfHeight,
            }
            const distance = {
              x: Math.abs(selector.center.x - cardCenter.x),
              y: Math.abs(selector.center.y - cardCenter.y),
            }
            const lengthSum = {
              x: cardWidth + selector.length.width,
              y: cardHeight + selector.length.height,
            }
            return distance.x < lengthSum.x / 2 && distance.y < lengthSum.y / 2
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
    getCoord(e) {
      if (e.target.matches('.single-card')) {
        return {
          x: e.offsetX + e.target.offsetLeft,
          y: e.offsetY + e.target.offsetTop,
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
      const coord = this.getCoord(e)

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
      const coord = this.getCoord(e)
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
        const changeObj = {}
        this.cards
          .filter((someCard) => card.zIndex < someCard.zIndex)
          .forEach((card) => {
            changeObj[`cards-${card.index}-zIndex`] = card.zIndex - 1
          })
        changeObj[`cards-${card.index}-zIndex`] = this.cards.length
        this.$emit('update', changeObj)
      }
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
  },
}
</script>

<style lang="scss" scoped>
.card-board {
  &.dragging,
  &.selecting {
    ::v-deep(*:not(.single-card)) {
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
  > .single-card {
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
    position: absolute;
    left: var(--start-x);
    top: var(--start-y);
    width: calc(var(--end-x) - var(--start-x));
    height: calc(var(--end-y) - var(--start-y));
    z-index: var(--z-index);
    border: 1px solid gray;
  }
}
</style>
