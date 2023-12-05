<template>
  <NSelect
    filterable
    clearable
    remote
    :options="options"
    :loading="loadingState"
    placeholder="请选择类别"
    @search="handleSearch"
    value-field="categoryId"
    :value="categoryId"
    label-field="name"
    @update:value="handleUpdateValue"
    @blur="(e) => emit('blur', e)"
    :ref="selectRef"
    :disabled="props.disabled"
  />
</template>

<script setup lang="tsx">
import { apiCategoryList } from '@/api/category'
import { getAPIErrorInfo } from '@/api/request'
import { NSelect, useMessage } from 'naive-ui'
import { onMounted, ref, type Ref, type VNodeRef } from 'vue'
const $message = useMessage()
const props = defineProps<{ categoryId?: string; selectRef?: VNodeRef; disabled?: boolean }>()
const categoryIdProp = ref(props.categoryId ?? '')

const emit = defineEmits<{
  'update:categoryId': [id: number | string]
  blur: [e: FocusEvent]
}>()
const handleUpdateValue = (x: string) => {
  categoryIdProp.value = x
  emit('update:categoryId', x)
}

const loadingState = ref(false)
const options = ref<any[]>([])

const handleSearch = async (query: string) => {
  loadingState.value = true
  try {
    const data = (await apiCategoryList({ name: query, limit: 100 })).data
    options.value = data
  } catch (e) {
    $message.error(getAPIErrorInfo(e))
  }
  loadingState.value = false
}
onMounted(() => handleSearch(''))
</script>
