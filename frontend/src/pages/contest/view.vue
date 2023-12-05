<template>
  <NavBar>
    <NSpace justify="end">
      <NButton type="info">分析</NButton>
      <NButton :on-click="handleBack">返回</NButton>
    </NSpace>
    <NSpin :show="infoLoading">
      <template #description> 正在获取数据 </template>
      <NH1>
        <div style="flex-grow: 1" v-text="title"></div>
      </NH1>
      <div ref="vditor" style="margin-bottom: 16px" class="vditor" />
      <!-- <NText style="margin-top: 16px">比赛数据：</NText> -->
      <ContestDataTableVue :contest-id="contestId" />
    </NSpin>
  </NavBar>
</template>

<script setup lang="ts">
import { apiContestQuery } from '@/api/contest'
import { getAPIErrorInfo } from '@/api/request'
import ContestDataTableVue from '@/components/ContestDataTable.vue'
import NavBar from '@/components/NavBar.vue'
import { NButton, NH1, NSpace, NSpin, useMessage } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// Vditor渲染的文件命名存在问题的，考虑到其位于node_modules下，缺少修补方案，目前直接使用any
// @ts-ignore
import VditorPreview from 'vditor/dist/method.min'
//import VditorPreview from 'vditor/dist/method'

const $router = useRouter()
const $route = useRoute()
const $message = useMessage()
const vditor = ref<HTMLDivElement>()
const contestId = $route.params['id'] as string

const infoLoading = ref(true)
const title = ref('')
const description = ref('')

onMounted(async () => {
  try {
    const res = await apiContestQuery(contestId)
    title.value = res.title
    description.value = res.description ?? ''
    infoLoading.value = false
    VditorPreview.preview(vditor.value!, description.value, {
      mode: 'light',
      theme: {
        current: 'vscode-light',
        path: `/theme`
      }
    })
  } catch (e) {
    $message.error(getAPIErrorInfo(e))
  }
})

const handleBack = () => {
  $router.back()
}
</script>

<script lang="ts"></script>

<style scoped>
.vditor {
  border-color: #d0d7de;
  border-style: solid;
  padding: 16px;
}

.vditor-reset {
  color: #000000;
  background-color: #ffffff;
}

.vditor-reset h1,
.vditor-reset h2 {
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}
.vditor-reset hr {
  background-color: #eaecef;
}
.vditor-reset blockquote {
  color: #000000;
  border-left: 0.25em solid #78b5de;
}
.vditor-reset iframe {
  border: 1px solid #d1d5da;
}
.vditor-reset table tr {
  border-top: 1px solid #c6cbd1;
  background-color: transparent;
}
.vditor-reset code:not(.hljs):not(.highlight-chroma) {
  background-color: rgba(27, 31, 35, 0.05);
}
.vditor-reset kbd {
  color: #24292e;
  background-color: #fafbfc;
  border: 1px solid #d1d5da;
  box-shadow: inset 0 -1px 0 #d1d5da;
}
.vditor-speech {
  background-color: #f6f8fa;
  border: 1px solid #d1d5da;
  color: #586069;
}
.vditor-speech--current,
.vditor-speech:hover {
  color: #000080;
}
.vditor-linkcard a {
  background-color: #f6f8fa;
}
.vditor-linkcard a:visited .vditor-linkcard__abstract {
  color: rgba(88, 96, 105, 0.36);
}
.vditor-linkcard__title {
  color: #24292e;
}
.vditor-linkcard__abstract {
  color: #586069;
}
.vditor-linkcard__site {
  color: #4285f4;
}
.vditor-linkcard__image {
  background-color: rgba(88, 96, 105, 0.36);
}
</style>
