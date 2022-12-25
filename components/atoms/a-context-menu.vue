<template>
  <v-menu
    content-class="a-context-menu"
    :close-on-content-click="false"
    :position-x="positionX"
    :position-y="positionY"
    :value="_value"
    @input="updateValue"
    offset-x
    trabsition="v-fab-transition"
  >
    <v-list>
      <template v-for="(item, i) of clonedItems">
        <v-list-item
          class="item"
          ref="itemEls"
          :key="i"
          link
          :ripple="false"
          dense
          @mouseenter="openChildMenu(item, i)"
          @click="(e) => onItemClick(item, e)"
        >
          <component v-if="item.component" :is="item.component" />
          <span v-else>
            <span>{{ item.label }}</span>
            <i v-if="item.items" class="fas fa-play"></i>
          </span>
        </v-list-item>
        <a-context-menu
          v-if="item.items"
          :positionX="item.positionX"
          :positionY="item.positionY"
          :value="item.showChildren"
          @update:value="updateValue"
          :items="item.items"
        />
      </template>
    </v-list>
  </v-menu>
</template>

<script>
const lineHeight = 30

export default {
  name: 'AContextMenu',
  model: {
    prop: 'value',
    event: 'update:value',
  },
  computed: {
    _value: {
      get() {
        return this.value
      },
      set(newValue) {
        this.$emit('update:value', newValue)
      },
    },
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
    positionX: {
      type: Number,
    },
    positionY: {
      type: Number,
    },
    value: {
      type: Boolean,
    },
  },
  data() {
    return {
      clonedItems: [],
    }
  },
  watch: {
    'items.length': {
      immediate: true,
      handler() {
        this.clonedItems = this.items.map((item) => ({
          ...item,
          showChildren: false,
          positionX: 0,
          positionY: 0,
        }))
      },
    },
  },
  methods: {
    updateValue(newValue) {
      if (!newValue) {
        this.clonedItems.forEach((item) => {
          item.showChildren = false
        })
      }
      console.log({ newValue })
      this._value = newValue
    },
    openChildMenu(item, i) {
      this.clonedItems.forEach((item) => {
        item.showChildren = false
      })
      item.showChildren = true

      const el = this.$refs.itemEls[i].$el
      item.positionX = this.positionX + el.clientWidth
      item.positionY = this.positionY + lineHeight * i
    },
    closeChildMenu(item) {
      item.showChildren = false
    },
    onItemClick(item, e) {
      if (!item.handler) {
        return
      }
      item.handler(e)
      this.updateValue(false)
    },
  },
}
</script>

<style lang="scss">
.a-context-menu {
  background-color: lightblue;
  > .v-list {
    padding: 0;
    .item {
      cursor: default;

      padding: 0px 8px;
      min-height: 30px;
      min-width: 120px;
      > span {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }
    }
  }
}
</style>
