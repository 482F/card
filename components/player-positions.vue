<template>
  <div
    class="player-positions"
    :style="{
      '--current-angle': currentAngle + 'deg',
    }"
  >
    <div
      class="player"
      v-for="[id, player] of Object.entries(players)"
      :key="id"
      :style="{
        '--color': player.color,
        '--x': halfSize + Math.cos(getRadian(player.angle)) * halfSize + 'px',
        '--y': halfSize + Math.sin(getRadian(player.angle)) * halfSize + 'px',
      }"
    >
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <i class="fas fa-user" v-bind="attrs" v-on="on" />
        </template>
        {{ player.name }}
      </v-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerPositions',
  props: {
    currentAngle: {
      type: Number,
      required: 0,
    },
    players: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      size: 0,
    }
  },
  mounted() {
    this.size = this.$el.clientHeight
  },
  methods: {
    getRadian(angle) {
      return ((this.currentAngle - angle + 90) * Math.PI) / 180
    },
  },
  computed: {
    halfSize() {
      return this.size / 2
    },
  },
}
</script>

<style lang="scss" scoped>
.player-positions {
  position: relative;
  transform: rotate(calc(-1 * var(--current-angle)));
  .player {
    font-size: 24px;
    position: absolute;
    color: var(--color);
    left: var(--x);
    top: var(--y);
  }
}
</style>
