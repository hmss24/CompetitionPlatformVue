<template>
  <div class="user">
    <div v-text="props.nickname"></div>
    <small class="useridTag" v-text="props.userId" v-if="userId"></small>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ nickname?: string; userId?: string | number }>()
</script>

<style scoped>
.user {
  display: flex;
  align-items: center;
  font-size: 14px;
}
.useridTag {
  color: white;
  margin-left: 5px;
  background-color: grey;
  min-width: 8px;
  text-align: center;
  border-radius: 12px;
  box-sizing: 14px;
  padding-left: 8px;
  padding-right: 8px;
}
</style>
