<template>
    <i class="iconfont" :class="`${iconfont}`"></i>
</template>

<script lang='ts' setup>

  defineProps<{
    iconfont:string
  }>()
    
</script>

<style scoped>
i,em{   
  font-style:none;
}
</style>