<template>
  <div
    class="player-positions"
    :style="{
      '--current-angle': currentAngle + 'deg',
    }"
  >
    <v-tooltip bottom v-for="[id, player] of Object.entries(players)" :key="id">
      <template v-slot:activator="{ on, attrs }">
        <div
          v-bind="attrs"
          v-on="on"
          class="player"
          :style="{
            '--color': player.color,
            '--x':
              halfSize + Math.cos(getRadian(player.angle)) * halfSize + 'px',
            '--y':
              halfSize + Math.sin(getRadian(player.angle)) * halfSize + 'px',
          }"
        >
          <i class="fas fa-user" />
        </div>
      </template>
      {{ player.name }}
    </v-tooltip>
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
    background-color: white;
    border-radius: 100%;
    border: 2px solid lightgray;
    width: 36px;
    height: 36px;

    font-size: 24px;
    position: absolute;
    color: var(--color);
    left: var(--x);
    top: var(--y);

    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
