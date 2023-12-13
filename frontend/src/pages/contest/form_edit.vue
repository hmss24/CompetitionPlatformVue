<template>
  <div>
    <NSpace>
      <NButton>12</NButton>
    </NSpace>
    <NSpin :show="loadingState" style="height: calc(100% - 50px)">
      <div id="monaco" ref="monacoRef" style="width: 100%; height: 100%"></div>
    </NSpin>
  </div>
</template>

<script setup lang="ts">
import loader from '@monaco-editor/loader'
import { type editor } from 'monaco-editor'
import { NButton, NSpace, NSpin } from 'naive-ui'
import { onMounted, ref, type VNodeRef } from 'vue'

const loadingState = ref(true)
const monacoRef = ref<VNodeRef>(null as any)

let monacoEditor: editor.IStandaloneCodeEditor | null = null

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
      monaco.editor.createModel(await (await window.fetch('/plugin/template.js')).text(),
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

  loadingState.value = false
})
</script>
