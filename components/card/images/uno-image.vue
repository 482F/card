<template>
  <div
    class="uno"
    :class="{
      'has-underline': ['6', '9'].includes(this.char),
      selected: card.selected,
      front: isFront,
    }"
    :color="color"
    :style="{
      ...colors,
      '--color': colors[`--${isFront ? color : 'black'}`],
      '--height': cardSize + 'px',
    }"
  >
    <div class="uno-logo">UNO</div>
    <div class="ellipse"></div>
    <label-component
      class="label mini left-top"
      :char="char"
      position="corner"
    />
    <label-component
      class="label mini right-bottom"
      :char="char"
      position="corner"
    />
    <label-component class="label center" :char="char" position="center" />
  </div>
</template>

<script>
const LabelComponent = {
  props: {
    char: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    isFront: {
      type: Boolean,
      default: true,
    },
  },
  render(h) {
    return (
      <div char={this.char}>
        <div>
          {(() => {
            if (this.char === 'd') {
              return <i class="fas fa-ban" />
            } else if (this.char === 's') {
              if (this.position === 'center') {
                return <i class="fas fa-object-ungroup" />
              } else {
                return <span>+2</span>
              }
            } else if (this.char === 'r') {
              return <i class="fas fa-right-left" />
            } else if (this.char === 'w') {
              return undefined
            } else if (this.char === 'f') {
              if (this.position === 'center') {
                return (
                  <div>
                    <div class="card blue-color" />
                    <div class="card green-color" />
                    <div class="card red-color" />
                    <div class="card yellow-color" />
                  </div>
                )
              } else {
                return <span>+4</span>
              }
            } else {
              return <span>{this.char}</span>
            }
          })()}
        </div>
        {['6', '9'].includes(this.char) ? (
          <div class="underline">-</div>
        ) : undefined}
      </div>
    )
  },
}

export default {
  name: 'UnoImage',
  components: {
    LabelComponent,
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
  },
  computed: {
    char() {
      return this.card.text[0]
    },
    colors() {
      return {
        '--yellow': '#FBF54D',
        '--blue': '#404FF6',
        '--red': '#FF4012',
        '--green': '#47EC40',
        '--black': 'black',
      }
    },
    color() {
      return (
        {
          y: 'yellow',
          b: 'blue',
          r: 'red',
          g: 'green',
        }[this.card.text[1]] ?? 'black'
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.uno {
  --height: 120px;
  --width: calc(var(--height) * 0.714);
  z-index: 0;
  user-select: none;
  background-color: var(--color);
  width: var(--width);
  height: var(--height);
  border-radius: calc(var(--height) * 0.0674);
  position: relative;
  display: flex;
  justify-content: center;
  box-sizing: content-box;
  align-items: center;
  --ellipse-color: var(--red);
  &.front {
    --ellipse-color: white;
  }
  &.selected {
    border: 4px solid gray;
  }
  &.front > .uno-logo {
    display: none;
  }
  &:not(.front) > .label {
    display: none;
  }
  > .uno-logo {
    color: var(--yellow);
    font-weight: 900;
    font-size: calc(var(--height) * 0.25);
    --text-shadow: 0.02;
    text-shadow: calc(var(--height) * var(--text-shadow))
      calc(var(--height) * var(--text-shadow)) 0px black;
  }
  > .ellipse {
    z-index: -1;
    position: absolute;
    width: 100%;
    height: 100%;
    clip-path: ellipse(
      calc(var(--height) * 0.3146) calc(var(--height) * 0.427) at center
    );
    background-color: var(--ellipse-color);
    transform: rotateZ(36deg);
  }
  .label {
    display: flex;
    flex-direction: column;
    align-items: center;

    font-weight: 900;
    transform: skew(-10deg, 0deg);

    -webkit-text-stroke: calc(var(--height) * var(--text-stroke)) black;
    text-shadow: calc(var(--height) * var(--text-shadow-x))
      calc(var(--height) * var(--text-shadow-y)) 0px black;
    font-size: calc(var(--height) * var(--font-size));
    line-height: calc(var(--height) * var(--line-height));
    &.center {
      color: var(--color);
      --font-size: 0.574;
      --text-stroke: 0.02247;
      --text-shadow-x: 0.02247;
      --text-shadow-y: 0.02247;
      --line-height: 0.275;
    }
    &.mini {
      color: white;
      position: absolute;
      --font-size: 0.13483;
      --text-stroke: 0.011236;
      --text-shadow-x: 0.011236;
      --text-shadow-y: 0.011236;
      --line-height: 0.075;

      --x-offset: calc(var(--height) * 0.0337);
      --y-offset: calc(var(--height) * 0.05);
      &.left-top {
        left: var(--x-offset);
        top: var(--y-offset);
      }
      &.right-bottom {
        right: var(--x-offset);
        bottom: var(--y-offset);
      }
    }

    &[char='s'] {
      &.center {
        transform: rotateZ(111deg);
        --font-size: 0.474;
        --text-shadow-x: 0.02247;
        --text-shadow-y: -0.02247;
      }
    }
    &[char='r'] {
      transform: rotateZ(132deg);
      &.center {
        --font-size: 0.474;
        --text-shadow-x: 0.02247;
        --text-shadow-y: -0.02247;
      }
      &.mini {
        --text-shadow-x: 0.011236;
        --text-shadow-y: -0.011236;
      }
    }
    &[char='w'] {
      border-radius: 100%;
      transform: skew(-17deg, 0deg);
      height: calc(var(--height) * var(--inner-height));
      width: calc(var(--height) * var(--inner-width));
      &.mini {
        --inner-height: 0.1333;
        --inner-width: 0.1167;
      }
      &.center {
        --inner-height: 0.675;
        --inner-width: 0.5917;
      }
      background: conic-gradient(
        var(--yellow) 90deg,
        var(--red) 90deg 180deg,
        var(--blue) 180deg 270deg,
        var(--green) 270deg 0deg
      );
    }
    &[char='f'] {
      &.center {
        height: 100%;
        width: 100%;
        ::v-deep(.card) {
          position: absolute;
          width: calc(var(--height) * 0.2083);
          height: calc(var(--height) * 0.2083);
          transform: skew(-24deg, 0deg);
          border-radius: calc(var(--height) * 0.0333);
          box-shadow: calc(var(--height) * 0.0333) calc(var(--height) * 0.0333)
            0px black;

          top: calc(var(--height) * var(--top));
          left: calc(var(--height) * var(--left));
          &.blue-color {
            background-color: var(--blue);
            --top: 0.2167;
            --left: 0.275;
          }
          &.green-color {
            background-color: var(--green);
            --top: 0.3583;
            --left: 0.3667;
          }
          &.red-color {
            background-color: var(--red);
            --top: 0.4083;
            --left: 0.1083;
          }
          &.yellow-color {
            background-color: var(--yellow);
            --top: 0.5583;
            --left: 0.2333;
          }
        }
      }
    }
  }
  &.has-underline {
    .center {
      transform: skew(-14deg, 0deg) translate(0px, calc(var(--height) * 0.0667));
    }
    .mini.right-bottom {
      --y-offset: calc(var(--height) * 0.02);
    }
  }
  &[color='black'] {
    .label {
      -webkit-text-stroke: 0;
      text-shadow: none;
    }
  }
}
</style>
