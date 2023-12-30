<template>
  <NavBar>
    <NSpace justify="end">
      <NButton type="info">分析</NButton>
      <NButton type="error" :on-click="handleDelete">删除</NButton>
      <NButton :on-click="handleBack">返回</NButton>
    </NSpace>
    <NSpin :show="infoLoading">
      <template #description> 正在获取数据 </template>
      <div
        style="
          display: flex;
          max-width: 500px;
          align-items: center;
          margin-top: 16px;
          margin-bottom: 16px;
        "
      >
        <NText style="">标题：</NText>
        <NText style="color: red">*</NText>
        <div style="flex-grow: 1">
          <NInput
            maxlength="50"
            show-count
            :on-blur="handleSaveTitle"
            v-model:value="title"
            :disabled="titleDisabled"
          />
        </div>
      </div>
      <div
        style="
          display: flex;
          max-width: 500px;
          align-items: center;
          margin-top: 16px;
          margin-bottom: 16px;
        "
      >
        <NText style="">标签：</NText>
        <NText style="color: red">*</NText>
        <div style="flex-grow: 1">
          <CategoryInput
            v-model:categoryId="categoryId"
            :disabled="categoryDisabled"
            :on-blur="handleSaveCategory"
          />
        </div>
      </div>

      <NText style="margin-top: 16px">描述（支持Markdown格式）：</NText>
      <div id="vditor" style="margin-bottom: 16px"></div>

      <NSpace justify="space-between" align="center" style="margin-bottom: 16px">
        <NText style="margin-top: 16px">比赛数据：</NText>
        <NSpace>
          <NButton :on-click="handleScriptModify">修改比赛数据形式</NButton>
          <NDropdown :options="[{ label: '从文件导入', key: 'importFromFile' }]">
            <NButton :onclick="handleAddRecord">添加记录</NButton>
          </NDropdown>
        </NSpace>
      </NSpace>
      <ContestDataTableVue :contest-id="contestId" editable ref="tableRef" />
    </NSpin>

    <NModal v-model:show="shouldShowModal" :auto-focus="false" :mask-closable="false">
      <NCard
        title="添加记录"
        style="max-width: 500px; max-height: 80%"
        :bordered="false"
        preset="card"
        role="dialog"
      >
        <NForm
          label-placement="left"
          :label-width="80"
          :rules="addRecordColumns"
          v-model:model="modelForm"
        >
          <NFormItem label="选手" path="playerId">
            <UserInput v-model:user-id="modelForm.playerId" />
          </NFormItem>
          <NFormItem label="内容" path="content">
            <NInput v-model:value="modelForm.content" />
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

<script setup lang="ts">
import { apiContestDelete, apiContestModify, apiContestQuery } from '@/api/contest'
import { APIError, getAPIErrorInfo } from '@/api/request'
import CategoryInput from '@/components/CategoryInput.vue'
import ContestDataTableVue from '@/components/ContestDataTable.vue'
import NavBar from '@/components/NavBar.vue'
import UserInput from '@/components/UserInput.vue'
import {
  NButton,
  NDropdown,
  NInput,
  NSpace,
  NSpin,
  NText,
  useDialog,
  useMessage,
  NModal,
  NCard,
  NForm,
  NFormItem,
  type FormRules
} from 'naive-ui'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { onMounted, ref, type VNodeRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const vditor = ref<Vditor>(null as any)

const $router = useRouter()
const $route = useRoute()
const $message = useMessage()
const $dialog = useDialog()

const titleDisabled = ref(false)
const categoryDisabled = ref(false)
const contestId = $route.params['id'] as string

const infoLoading = ref(true)
let rawTitle = ''
const title = ref('')
let rawDescription = ''
const categoryId = ref('')
let rawCategoryId = ''

const handleDelete = async () => {
  const dialog = $dialog.warning({
    title: '你正在删除比赛',
    content: '删除比赛后，所有比赛描述与比赛成绩将会被移除，是否确认删除？',
    positiveText: '确认删除',
    negativeText: '取消删除',
    onPositiveClick: async () => {
      dialog.loading = true
      try {
        await apiContestDelete(contestId)
        $message.success('成功删除比赛')
        $router.back()
      } catch (e) {
        $message.error(getAPIErrorInfo(e))
      }
    },
    onNegativeClick: () => {}
  })
}

const handleSaveTitle = async () => {
  if (!title.value) title.value = rawTitle
  if (title.value != rawTitle) {
    titleDisabled.value = true
    try {
      await apiContestModify({ contestId, title: title.value })
      rawTitle = title.value
    } catch (e) {
      $message.error(getAPIErrorInfo(e))
      title.value = rawTitle
    }
    titleDisabled.value = false
  }
}
const handleSaveCategory = async () => {
  if (!categoryId.value) categoryId.value = rawCategoryId
  if (categoryId.value != rawCategoryId) {
    categoryDisabled.value = true
    try {
      await apiContestModify({ contestId, categoryId: categoryId.value })
      rawCategoryId = categoryId.value
    } catch (e) {
      $message.error(getAPIErrorInfo(e))
      categoryId.value = rawCategoryId
    }
    categoryDisabled.value = false
  }
}

const tableRef = ref<VNodeRef | null>(null)
const shouldShowModal = ref(false)
const addRecordColumns: FormRules = {
  playerId: { required: true, message: '请选择用户', trigger: 'blur' },
  content: { required: true }
}
const modelForm = ref({ playerId: '', content: '' })
const handleAddRecord = () => {
  console.log(tableRef.value)
  shouldShowModal.value = true
}
const handleModelSubmit = async () => {
  try {
    if (!modelForm.value.playerId) throw new APIError('请选择合法的参赛者ID')
    await tableRef.value?.add(modelForm.value.playerId, modelForm.value.content)
    $message.success('添加记录成功')
    await tableRef.value?.refresh()
    shouldShowModal.value = false
  } catch (e) {
    $message.error(getAPIErrorInfo(e))
  }
}
const handleModelCancel = () => {
  shouldShowModal.value = false
  modelForm.value = { playerId: '', content: '' }
}

const handleScriptModify = ()=> {
  $router.push(`/contest/form_edit/${contestId}`)
}

onMounted(async () => {
  vditor.value = new Vditor('vditor', {
    cache: { enable: false },
    mode: 'wysiwyg',
    theme: 'classic',
    toolbar: [
      'undo',
      'redo',
      'insert-before',
      'insert-after',
      '|',

      'headings',
      'bold',
      'italic',
      'strike',
      '|',

      'list',
      'ordered-list',
      'check',
      'outdent',
      'indent',
      '|',

      'table',
      'quote',
      'link',
      'code',
      'line',
      '|',

      'edit-mode',
      'export',
      'fullscreen'
    ],
    counter: {
      enable: true,
      max: 10000
    },
    preview: {
      hljs: {
        lineNumber: true
      },
      actions: ['desktop', 'tablet', 'mobile']
    },
    resize: {
      enable: true
    },
    async blur(value: string) {
      if (rawDescription == value) return
      try {
        await apiContestModify({ contestId, description: value })
        rawDescription = value
      } catch (e) {
        $message.error(getAPIErrorInfo(e))
        vditor.value.setValue(rawDescription)
      }
    },
    async after() {
      try {
        const res = await apiContestQuery(contestId)
        rawTitle = title.value
        title.value = res.title

        categoryId.value = res.categoryId
        rawCategoryId = res.categoryId

        rawDescription = res.description ?? ''
        vditor.value.setValue(res.description ?? '')

        infoLoading.value = false
      } catch (e) {
        $message.error(getAPIErrorInfo(e))
      }
    }
  })
})

const handleBack = () => {
  $router.back()
}
</script>

<script lang="ts"></script>
