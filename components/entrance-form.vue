<template>
  <div class="entrance-form">
    <div class="inputs">
      <a-text-field
        class="name"
        v-model="tempName"
        placeholder="プレイヤー名"
      />
      <a-text-field
        class="password"
        v-model="tempPassword"
        placeholder="部屋パスワード"
      />
      <div class="icon">
        <a-text-field
          v-model="tempIcon"
          placeholder="アイコン"
          append-icon="mdi-magnify"
          @click:append="openFa"
        />
        <i :class="`fas fa-${tempIcon}`" />
      </div>
      <v-color-picker class="color" v-model="tempColor" hide-inputs />
    </div>
    <v-btn
      block
      depressed
      :disabled="!tempPassword || !tempName"
      @click="
        () => {
          $emit('update:name', tempName)
          $emit('update:password', tempPassword)
          $emit('update:icon', tempIcon)
          $emit('update:color', tempColor)
          $emit('loggined')
        }
      "
    >
      入室
    </v-btn>
  </div>
</template>

<script>
import ATextField from '../components/atoms/a-text-field.vue'
export default {
  name: 'EntranceForm',
  components: {
    ATextField,
  },
  props: {
    name: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'user',
    },
    color: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      tempName: this.name,
      tempPassword: this.password,
      tempIcon: this.icon,
      tempColor: this.color,
    }
  },
  methods: {
    openFa() {
      window.open('https://fontawesome.com/search?o=r&m=free')
    },
  },
}
</script>

<style lang="scss" scoped>
.entrance-form {
  .inputs {
    height: 100%;
    width: 100%;

    display: grid;
    grid-template-rows: 1fr 42px 42px 42px 1fr;
    grid-template-columns: 1fr 300px;
    gap: 8px;

    .name {
      grid-row: 2;
      grid-column: 1;
    }
    .password {
      grid-row: 3;
      grid-column: 1;
    }
    .icon {
      grid-row: 4;
      grid-column: 1;

      display: flex;
      align-items: center;
      gap: 8px;
      > i {
        height: 18px;
        width: 18px;
      }
    }
    .color {
      grid-row: 1 / 6;
      grid-column: 2;
    }
  }
}
</style>
