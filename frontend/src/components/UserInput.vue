<template>
  <NSelect
    filterable
    clearable
    remote
    :options="options"
    :loading="loadingState"
    placeholder="请选择用户"
    @search="handleSearch"
    value-field="userId"
    :value="userId"
    @update:value="handleUpdateValue"
    :render-label="renderLabel"

    @blur="(e) => emit('blur', e)"
    :ref="selectRef"
  />
</template>

<script setup lang="tsx">
import { getAPIErrorInfo } from '@/api/request'
import { apiUserList } from '@/api/user'
import { NSelect, useMessage } from 'naive-ui'
import { onMounted, ref, type VNodeRef } from 'vue'
import UserTagVue from './UserTag.vue'
const $message = useMessage()
const props = defineProps<{ userId?: string, selectRef?: VNodeRef }>()
const userId = ref<string>(props.userId ?? '')

const emit = defineEmits<{
  'update:userId': [id: number | string]
  blur: [e: FocusEvent]
}>()
const handleUpdateValue = (x: string) => {
  userId.value = x
  emit('update:userId', x)
}

const loadingState = ref(false)
const options = ref<any[]>([])

const renderLabel = (option: any) => {
  return <UserTagVue userId={option.userId} nickname={option.nickname} />
}

const handleSearch = async (query: string) => {
  loadingState.value = true
  try {
    const data = (await apiUserList({ nickname: query, limit: 100 })).data
    options.value = data
  } catch (e) {
    $message.error(getAPIErrorInfo(e))
  }
  loadingState.value = false
}
onMounted(() => handleSearch(''))
</script>
