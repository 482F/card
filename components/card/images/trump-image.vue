<template>
  <div
    class="trump"
    :class="{
      selected: card.selected,
      front: isFront,
      'front-all': isFrontAll,
    }"
    :color="color"
    :style="{
      ...colors,
      '--color': colors[`--${isFront ? color : 'black'}`],
      '--height': cardSize + 'px',
    }"
  >
    <div class="trump-back" />
    <mini-component class="mini left-top" :icon="icon" :char="char" />
    <mini-component class="mini right-bottom" :icon="icon" :char="char" />
    <div
      class="center"
      :class="{
        single: ['1', 'J', 'Q', 'K', 'j'].includes(char),
      }"
      :number="number"
      :suit="card.text[1]"
    >
      <template v-if="number">
        <i
          :class="['mdi', `mdi-${icon}`]"
          :i="i"
          v-for="i of number"
          :key="i"
        />
      </template>
      <template v-else>
        <i v-if="char === 'J'" class="fas fa-chess-knight" />
        <i v-else-if="char === 'Q'" class="fas fa-chess-queen" />
        <i v-else-if="char === 'K'" class="fas fa-chess-king" />
        <i v-else-if="char === 'j'" class="fas fa-hat-wizard" />
      </template>
    </div>
  </div>
</template>

<script>
const MiniComponent = {
  props: {
    icon: {
      required: true,
    },
    char: {
      type: String,
      required: true,
    },
  },
  render(h) {
    return (
      <div char={this.char}>
        <span>{{ t: 10, j: 'JOKER' }[this.char] ?? this.char}</span>
        <i class={`mdi mdi-${this.icon}`} />
      </div>
    )
  },
}

export default {
  name: 'TrumpImage',
  components: {
    MiniComponent,
  },
  props: {
    cardSize: {
      type: Number,
      required: true,
    },
    card: {
      type: Object,
      required: true,
    },
    isFront: {
      type: Boolean,
      default: true,
    },
    isFrontAll: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    icon() {
      return {
        h: 'cards-heart',
        d: 'cards-diamond',
        c: 'cards-club',
        s: 'cards-spade',
      }[this.card.text[1]]
    },
    number() {
      return Number(this.char === 't' ? 10 : this.char)
    },
    char() {
      return this.card.text[0]
    },
    colors() {
      return {
        '--red': '#FF4012',
        '--black': 'black',
      }
    },
    color() {
      return (
        {
          h: 'red',
          d: 'red',
          c: 'black',
          s: 'black',
        }[this.card.text[1]] ?? 'black'
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.trump {
  --height: 120px;
  --width: calc(var(--height) * 0.714);
  z-index: 0;
  user-select: none;
  background-color: white;
  width: var(--width);
  height: var(--height);
  border-radius: calc(var(--height) * 0.0674);
  position: relative;
  display: flex;
  justify-content: center;
  box-sizing: content-box;
  align-items: center;
  border: 1px solid gray;
  &.front {
    &:not(.front-all) {
      &::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: #00000022;
      }
    }
  }
  &.selected {
    border: 4px solid gray;
  }
  &.front > .trump-back {
    display: none;
  }
  &:not(.front) > :not(.trump-back) {
    display: none;
  }
  font-weight: 900;
  .center {
    color: var(--color);
    display: grid;
    width: 60%;
    height: 90%;
    justify-items: center;
    align-items: center;
    line-height: calc(var(--height) * 0.104);
    i {
      width: 12px;
      display: flex;
      justify-content: center;
    }

    font-size: calc(var(--height) * 0.134);
    &.single {
      font-size: calc(var(--height) * 0.374);
    }
    &:not(.single)[suit='d'] {
      font-size: calc(var(--height) * 0.164);
    }
    &[number='2'] {
      grid-template-rows: 1fr 1fr;
      grid-template-columns: 1fr;
      > i[i='1'] {
        grid-row: 1;
      }
      > i[i='2'] {
        grid-row: 2;
      }
    }
    &[number='3'] {
      grid-template-rows: 1fr 1fr 1fr;
      grid-template-columns: 1fr 1fr 1fr;
      > i[i='1'] {
        grid-row: 1;
        grid-column: 1;
      }
      > i[i='2'] {
        grid-row: 2;
        grid-column: 2;
      }
      > i[i='3'] {
        grid-row: 3;
        grid-column: 3;
      }
    }
    &[number='4'] {
      grid-template-rows: 1fr 1fr;
      grid-template-columns: 1fr 1fr;
      > i[i='1'] {
        grid-row: 1;
        grid-column: 1;
      }
      > i[i='2'] {
        grid-row: 1;
        grid-column: 2;
      }
      > i[i='3'] {
        grid-row: 2;
        grid-column: 1;
      }
      > i[i='4'] {
        grid-row: 2;
        grid-column: 2;
      }
    }
    &[number='5'] {
      grid-template-rows: 1fr 1fr 1fr;
      grid-template-columns: 1fr 1fr 1fr;
      > i[i='1'] {
        grid-row: 1;
        grid-column: 1;
      }
      > i[i='2'] {
        grid-row: 1;
        grid-column: 3;
      }
      > i[i='3'] {
        grid-row: 2;
        grid-column: 2;
      }
      > i[i='4'] {
        grid-row: 3;
        grid-column: 1;
      }
      > i[i='5'] {
        grid-row: 3;
        grid-column: 3;
      }
    }
    &[number='6'] {
      grid-template-rows: 1fr 1fr 1fr;
      grid-template-columns: 1fr 1fr;
      > i[i='1'] {
        grid-row: 1;
        grid-column: 1;
      }
      > i[i='2'] {
        grid-row: 1;
        grid-column: 2;
      }
      > i[i='3'] {
        grid-row: 2;
        grid-column: 1;
      }
      > i[i='4'] {
        grid-row: 2;
        grid-column: 2;
      }
      > i[i='5'] {
        grid-row: 3;
        grid-column: 1;
      }
      > i[i='6'] {
        grid-row: 3;
        grid-column: 2;
      }
    }
    &[number='7'] {
      grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
      grid-template-columns: 1fr 1fr 1fr;
      > i[i='1'] {
        grid-row: 1;
        grid-column: 1;
      }
      > i[i='2'] {
        grid-row: 1;
        grid-column: 3;
      }
      > i[i='3'] {
        grid-row: 2;
        grid-column: 2;
      }
      > i[i='4'] {
        grid-row: 3;
        grid-column: 1;
      }
      > i[i='5'] {
        grid-row: 3;
        grid-column: 3;
      }
      > i[i='6'] {
        grid-row: 5;
        grid-column: 1;
      }
      > i[i='7'] {
        grid-row: 5;
        grid-column: 3;
      }
    }
    &[number='8'] {
      grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
      grid-template-columns: 1fr 1fr 1fr;
      > i[i='1'] {
        grid-row: 1;
        grid-column: 1;
      }
      > i[i='2'] {
        grid-row: 1;
        grid-column: 3;
      }
      > i[i='3'] {
        grid-row: 2;
        grid-column: 2;
      }
      > i[i='4'] {
        grid-row: 3;
        grid-column: 1;
      }
      > i[i='5'] {
        grid-row: 3;
        grid-column: 3;
      }
      > i[i='6'] {
        grid-row: 4;
        grid-column: 2;
      }
      > i[i='7'] {
        grid-row: 5;
        grid-column: 1;
      }
      > i[i='8'] {
        grid-row: 5;
        grid-column: 3;
      }
    }
    &[number='9'] {
      grid-template-rows: 1fr 1fr 1fr 1fr;
      grid-template-columns: 1fr 1fr 1fr;
      > i[i='1'] {
        grid-row: 1;
        grid-column: 1;
      }
      > i[i='2'] {
        grid-row: 1;
        grid-column: 3;
      }
      > i[i='3'] {
        grid-row: 2;
        grid-column: 1;
      }
      > i[i='4'] {
        grid-row: 2;
        grid-column: 3;
      }
      > i[i='5'] {
        grid-row: 2 / 4;
        grid-column: 2;
      }
      > i[i='6'] {
        grid-row: 3;
        grid-column: 1;
      }
      > i[i='7'] {
        grid-row: 3;
        grid-column: 3;
      }
      > i[i='8'] {
        grid-row: 4;
        grid-column: 1;
      }
      > i[i='9'] {
        grid-row: 4;
        grid-column: 3;
      }
    }
    &[number='10'] {
      grid-template-rows: 1fr 1fr 1fr 1fr;
      grid-template-columns: 1fr 1fr 1fr;
      > i[i='1'] {
        grid-row: 1;
        grid-column: 1;
      }
      > i[i='2'] {
        grid-row: 1;
        grid-column: 3;
      }
      > i[i='3'] {
        grid-row: 1 / 3;
        grid-column: 2;
      }
      > i[i='4'] {
        grid-row: 2;
        grid-column: 1;
      }
      > i[i='5'] {
        grid-row: 2;
        grid-column: 3;
      }
      > i[i='6'] {
        grid-row: 3;
        grid-column: 1;
      }
      > i[i='7'] {
        grid-row: 3;
        grid-column: 3;
      }
      > i[i='8'] {
        grid-row: 3 / 5;
        grid-column: 2;
      }
      > i[i='9'] {
        grid-row: 4;
        grid-column: 1;
      }
      > i[i='10'] {
        grid-row: 4;
        grid-column: 3;
      }
    }
  }

  > .trump-back {
    width: 80%;
    height: 85%;
    background-color: #ff9191;
    border-radius: 8%;
  }
  .mini {
    color: var(--color);
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    &[char='j'] {
      writing-mode: vertical-rl;
    }
    --font-size: 0.13483;

    --line-height: 0.12;
    --x-offset: calc(var(--height) * 0.0137);
    --y-offset: calc(var(--height) * 0.05);

    line-height: calc(var(--height) * var(--line-height));
    &.left-top {
      left: var(--x-offset);
      top: var(--y-offset);
    }
    &.right-bottom {
      right: var(--x-offset);
      bottom: var(--y-offset);
      transform: rotate(180deg);
    }
  }
}
</style>
