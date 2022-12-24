<template>
  <div
    class="card-board"
    :style="{ '--size': size + 'px' }"
    ref="cardBoard"
    @mousemove="
      (e) => {
        if (!dragging) return
        onMove(e)
      }
    "
    @mouseup="
      (e) => {
        onMoveEnd(e)
      }
    "
    @wheel="
      (e) => {
        onWheel(e)
      }
    "
  >
    <single-card
      class="single-card"
      v-for="(card, i) of cards"
      :key="i"
      :mode="mode"
      :card="card"
      :class="{
        selected: card.selected,
      }"
      :style="{
        '--x': card.coord.x - (card.selected ? 4 : 0) + 'px',
        '--y': card.coord.y - (card.selected ? 4 : 0) + 'px',
        '--angle': card.angle + 'deg',
      }"
      @mousedown="(e) => onMoveStart(e, card)"
    />
  </div>
</template>

<script>
import SingleCard from '../components/card/single-card.vue'
const size = 800

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
  data() {
    return {
      dragging: false,
      startCoord: {
        x: 0,
        y: 0,
      },
      selecteds: [],
    }
  },
  computed: {
    size: () => size,
  },
  methods: {
    getCoord(e) {
      return {
        x: e.clientX - this.$refs.cardBoard.offsetLeft,
        y: e.clientY - this.$refs.cardBoard.offsetTop,
      }
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
      this.selecteds.forEach((selected) => {
        selected.originalCoord = { ...selected.coord }
      })
      this.dragging = true
      this.startCoord = this.getCoord(e)
    },
    onMove(e) {
      const coord = this.getCoord(e)
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
  width: var(--size);
  height: var(--size);
  background-color: lightgray;
  position: relative;
  > .single-card {
    position: absolute;
    left: var(--x);
    top: var(--y);
    transform: rotate(var(--angle));
  }
}
</style>
