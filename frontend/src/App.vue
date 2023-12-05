<script setup lang="ts">
import { RouterView } from 'vue-router'
import { NDialogProvider, NMessageProvider } from 'naive-ui'
</script>

<template>
  <NMessageProvider>
    <NDialogProvider>
      <RouterView style="height: 100%" />
    </NDialogProvider>
  </NMessageProvider>
</template>

<style></style>
