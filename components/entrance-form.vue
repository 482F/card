<template>
  <div>
    <a-text-field v-model="tempName" placeholder="プレイヤー名" />
    <a-text-field v-model="tempPassword" placeholder="password" />
    <v-btn
      block
      depressed
      :disabled="!tempPassword || !tempName"
      @click="
        () => {
          $emit('update:name', tempName)
          $emit('update:password', tempPassword)
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
  },
  data() {
    return {
      tempName: this.name,
      tempPassword: this.password,
    }
  },
}
</script>
