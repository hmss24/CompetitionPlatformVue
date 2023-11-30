<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <NavBar>
    <div style="display: flex; justify-content: space-between">
      <NSpace>
        <p>共 {{ tableData.length }} 条</p>
        <NInput
          placeholder="按回车查找"
          v-model:value="searchText"
          clearable
          @keyup="handleSearchKeyup"
        />
      </NSpace>
      <NSpace style="margin-right: 0">
        <NButton color="#5d5cde" round @click="showAddModal">添加</NButton>
        <NButton color="#4caf50" round @click="handleRefreshClick">刷新</NButton>
      </NSpace>
    </div>
    <NDataTable :columns="tableColumns" :data="tableData" :pagination="paginationProp" />

    <NModal v-model:show="shouldShowModal" :auto-focus="false" :mask-closable="false">
      <NCard
        :title="modelTitle"
        style="max-width: 60%; max-height: 80%"
        :bordered="false"
        preset="card"
        role="dialog"
      >
        <NForm
          label-placement="left"
          :label-width="80"
          :rules="formRules"
          v-model:model="modelForm"
        >
          <NFormItem label="类别名称" path="name">
            <NInput placeholder="请输入类别名称" maxlength="50" v-model:value="modelForm.name" />
          </NFormItem>
          <NFormItem label="描述" path="description">
            <NInput
              type="textarea"
              placeholder="请输入描述"
              maxlength="10000"
              show-count
              v-model:value="modelForm.description"
            />
          </NFormItem>
        </NForm>
        <NSpace justify="end">
          <NButton round type="primary" @click="handleModelSubmit">确认</NButton>
          <NButton round @click="handleModelCancel">取消</NButton>
        </NSpace>
      </NCard>
    </NModal>
  </NavBar>
</template>

<script setup lang="tsx">
import NavBar from '@/components/NavBar.vue'
import {
  NButton,
  NDataTable,
  NInput,
  NSpace,
  useMessage,
  type DataTableColumns,
  NModal,
  NCard,
  NForm,
  NFormItem,
  type FormRules,
  type PaginationProps
} from 'naive-ui'

const $message = useMessage()

const paginationProp = reactive<PaginationProps>({
  pageSize: 10,
  showSizePicker: true,
  showQuickJumper: true,
  pageSizes: [
    {
      label: '10 条 / 页',
      value: 10
    },
    {
      label: '20 条 / 页',
      value: 20
    },
    {
      label: '50 条 / 页',
      value: 30
    },
    {
      label: '100 条 / 页',
      value: 40
    }
  ],
  onUpdatePageSize(pageSize) {
    paginationProp.pageSize = pageSize;
    paginationProp.page = 1;
  }
})

const shouldShowModal = ref(false)
const modelForm = ref({ name: '', description: '' })
const modelTitle = ref('新增分类')
const handleRefreshClick = async () => {
  try {
    rawtableData = await apiCategoryList({})
    tableData.value = rawtableData.filter((x) => x.name.includes(searchText.value))
    $message.success('刷新成功')
  } catch (e) {
    if (e instanceof APIError) $message.error(e.msg)
    else {
      console.log(e)
      $message.error('未知错误')
    }
  }
}

type modelType = { categoryId: string; name: string; description: string }
let modelSource: modelType | null = null
const formRules: FormRules = {
  name: {
    required: true,
    message: '请输入类别名称',
    trigger: 'blur'
  }
}
const handleModelSubmit = async () => {
  try {
    if (modelForm.value.name == '') throw new APIError('请输入类别名称')
    if (modelSource == null) {
      await apiCategoryAdd(modelForm.value)
      $message.success('添加类别成功')
    } else {
      if (
        modelForm.value.name != modelSource.name ||
        modelForm.value.description != modelSource.description
      ) {
        await apiCategoryModify({
          categoryId: modelSource.categoryId,
          name: modelForm.value.name,
          description: modelForm.value.description
        })
        $message.success('修改类别成功')
      }
    }
    shouldShowModal.value = false
    modelSource = null
    handleRefreshClick()
  } catch (e) {
    $message.error(getAPIErrorInfo(e))
  }
}
const handleModelCancel = () => {
  shouldShowModal.value = false
}

const showAddModal = () => {
  modelTitle.value = '新增分类'
  modelForm.value = { name: '', description: '' }
  modelSource = null
  shouldShowModal.value = true
}
const showEditModal = (entry: modelType) => {
  modelSource = entry
  modelTitle.value = '编辑分类'
  modelForm.value = { name: entry.name, description: entry.description }
  modelSource = entry
  shouldShowModal.value = true
}

const tableColumns: DataTableColumns = [
  {
    title: '名称',
    key: 'name',
    resizable: true,
    width: 100,
    minWidth: 75,
    sorter: (a, b) => (a.name as string).localeCompare(b.name as string)
  },
  {
    title: '描述',
    key: 'description',
    resizable: true,
    ellipsis: { tooltip: true }
  },
  {
    title: '操作',
    key: '<operation>',
    width: 80,
    render: (x, _) => {
      return (
        <NSpace>
          <NButton
            disabled={localStorage.getItem('userid') != x.userId}
            onClick={() => showEditModal(x as any)}
          >
            编辑
          </NButton>
        </NSpace>
      )
    }
  }
]

const searchText = ref<string>('')
const tableData = ref<typeof rawtableData>([])
apiCategoryList({})
  .then((x) => {
    rawtableData = x
    tableData.value = rawtableData.filter((x) => x.name.includes(searchText.value))
    $message.success('获取数据成功')
  })
  .catch((e) => {
    if (e instanceof APIError) $message.error(e.msg)
    else {
      console.log(e)
      $message.error('未知错误')
    }
  })
const handleSearchKeyup = async (x: KeyboardEvent) => {
  if (x.key == 'Enter') {
    tableData.value = rawtableData.filter((x) => x.name.includes(searchText.value))
  }
}
</script>

<script lang="tsx">
import { apiCategoryAdd, apiCategoryList, apiCategoryModify } from '@/api/category'
import { reactive, ref } from 'vue'
import { APIError, getAPIErrorInfo } from '@/api/request'

let rawtableData: Awaited<ReturnType<typeof apiCategoryList>> = []
</script>
