<template>
  <div>
    <NSpace style="padding: 16px">
      <NButton :on-click="handleGiveup">放弃修改</NButton>
      <NButton :on-click="handleRun">运行脚本</NButton>
      <NButton :on-click="handleSave">保存脚本</NButton>
      <NButton :on-click="() => $router.back()">返回</NButton>
    </NSpace>
    <NSpin
      :show="loadingState"
      style="height: calc(50% - 50px); padding-left: 16px; padding-right: 16px"
    >
      <div id="monaco" ref="monacoRef" style="width: 100%; height: 100%"></div>
    </NSpin>
    <ContestDataTable :contest-id="contestId" style="padding: 16px" ref="dataTableRef" />
  </div>
</template>

<script setup lang="ts">
import loader from '@monaco-editor/loader'
import { type editor } from 'monaco-editor'
import { NButton, NSpace, NSpin, useMessage } from 'naive-ui'
import { onMounted, ref, type VNodeRef } from 'vue'
import { apiContestModify, apiContestQuery } from '@/api/contest'
import { useRoute, useRouter } from 'vue-router'
import ContestDataTable from '@/components/ContestDataTable.vue'
import { getPluginError } from '@/api/plugin/Plugin'
import { getAPIErrorInfo } from '@/api/request'

const $route = useRoute()
const $router = useRouter()
const $messge = useMessage()
const contestId = $route.params['id'] as string

const loadingState = ref(true)
const monacoRef = ref<VNodeRef>(null as any)
const dataTableRef = ref<VNodeRef | null>(null)

let monacoEditor: editor.IStandaloneCodeEditor = null as any
let contestInfo: Awaited<ReturnType<typeof apiContestQuery>> = null as any

onMounted(async () => {
  const monaco = await loader.init()

  // 关闭语法验证
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false
  })

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowJs: true
  })

  try {
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      await (await window.fetch('/plugin/quickjs.d.ts')).text(),
      'quickjs.d.ts'
    )
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      await (await window.fetch('/plugin/plugin.d.ts')).text(),
      'plugin.d.ts'
    )
  } catch (e: any) {
    // do nothing
  }

  //monaco.editor.createModel(_quickjs_dts, 'typescript', monaco.Uri.parse("file:///quickjs.d.ts"))

  monacoEditor = monaco.editor.create(monacoRef.value, { automaticLayout: true })

  {
    const model =
      monaco.editor.getModel(monaco.Uri.parse('ts:try.js')) ??
      monaco.editor.createModel(
        await (await window.fetch('/plugin/template.js')).text(),
        'javascript',
        monaco.Uri.parse('ts:try.js')
      )

    monacoEditor.setModel(model)
  }

  {
    // Naive UI没有提供访问NSpin子节点样式的能力
    const elem = window.document.getElementsByClassName('n-spin-content')[0] as
      | HTMLElement
      | undefined
    if (elem != undefined) elem.style.height = '100%'
  }

  contestInfo = await apiContestQuery(contestId)
  monacoEditor.setValue(contestInfo.scriptContent ?? '')

  loadingState.value = false
})

const handleGiveup = () => {
  monacoEditor.setValue(contestInfo.scriptContent ?? '')
}
const handleRun = async () => {
  try {
    await dataTableRef?.value.refresh({ scriptContent: monacoEditor.getValue() })
  } catch (e) {
    $messge.error(getPluginError(e))
    console.log("hello")
    console.log(contestInfo.scriptContent)
    await dataTableRef?.value.refresh(contestInfo.scriptContent)
  }
}
const handleSave = async () => {
  try {
    await apiContestModify({
      contestId: contestInfo.contestId,
      scriptType: "JsV1",
      scriptContent: monacoEditor.getValue()
    })
    contestInfo.scriptContent = monacoEditor.getValue()
    $messge.success("保存成功")
  } catch (e) {
    $messge.error(getAPIErrorInfo(e))
  }
}
</script>
