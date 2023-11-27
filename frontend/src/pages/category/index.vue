<template>
  <NavBar>
    <NSpace>
      <p>共 {{ tableData.length }} 条</p>
      <NButton>添加</NButton>
    </NSpace>
    <NDataTable :columns="tableColumns" :data="tableData" />
  </NavBar>
</template>

<script lang="ts">
import { apiCategoryList } from '@/api/category'
import NavBar from '@/components/NavBar.vue'
import { NButton, NDataTable, NSpace } from 'naive-ui'
import { defineComponent } from 'vue'

const tableColumns = [
  {
    title: '名称',
    key: 'name'
  },
  {
    title: '描述',
    key: 'description'
  }
]

const tableData = await apiCategoryList({});
console.log(tableData)

export default defineComponent({
  components: {
    NavBar,
    NDataTable,
    NSpace,
    NButton
},
  setup() {
    return {
      tableColumns,
      tableData
    }
  }
})
</script>
