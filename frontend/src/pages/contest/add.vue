<template>
  <NavBar>
    <NSpace justify="end" style="margin-bottom: 16px">
      <NButton :on-click="handleSumbit" type="primary">确认</NButton>
      <NButton :on-click="() => $router.back()">返回</NButton>
    </NSpace>
    <NForm
      :rules="{
        title: [{ required: true, trigger: ['blur'], message: '请输入标题' }],
        categoryId: [{ required: true, message: '请选择分类' }]
      }"
      :model="model"
    >
      <NFormItem path="title" label="标题" label-placement="left">
        <NInput maxlength="50" style="max-width: 500px" show-count v-model:value="model.title" />
      </NFormItem>
      <NFormItem path="categoryId" label="分类" label-placement="left">
        <CategoryInput
          maxlength="50"
          style="max-width: 500px"
          v-model:category-id="model.categoryId"
        />
      </NFormItem>
    </NForm>
    <NText style="margin-top: 16px">描述（支持Markdown格式）：</NText>
    <div id="vditor" style="margin-bottom: 16px"></div>
  </NavBar>
</template>

<script setup lang="ts">
import { apiContestAdd } from '@/api/contest'
import { APIError, getAPIErrorInfo } from '@/api/request'
import CategoryInput from '@/components/CategoryInput.vue'
import NavBar from '@/components/NavBar.vue'
import { NButton, NForm, NFormItem, NInput, NSpace, NText, useMessage } from 'naive-ui'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const $message = useMessage()
const $router = useRouter()

const model = ref<{ title: string; categoryId: string }>({ title: '', categoryId: '' })

const handleSumbit = async () => {
  try {
    if (!model.value.title) throw new APIError('标题不能为空')
    if (!model.value.categoryId) throw new APIError('分类不能为空')
    const contestId = await apiContestAdd({
      categoryId: model.value.categoryId,
      title: model.value.title,
      description: vditor.value.getValue()
    })
    $message.success('添加比赛成功')
    $router.replace(`/contest/edit/${contestId}`)
  } catch (e) {
    $message.error(getAPIErrorInfo(e))
  }
}

const vditor = ref<Vditor>(null as any)
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
    }
  })
})
</script>
