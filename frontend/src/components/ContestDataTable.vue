<template>
  <NSpin :show="loadingState">
    <NDataTable
      :data="dataTable"
      :columns="tableColumns"
      @update:sorter="handleSorterUpdated"
      :row-props="rowProps"
    />
    <NDropdown
      v-if="editable"
      :x="dropdownX"
      :y="dropdownY"
      trigger="manual"
      placement="bottom-start"
      :options="dropdownOptions"
      :show="dropdownShow"
      :on-clickoutside="dropdownHandleClickOutside"
      @select="dropdownHandleSelect"
    />
    <template #description>
      <div v-text="loadingText"></div>
    </template>

    <NModal
      v-model:show="shouldShowModal"
      :auto-focus="false"
      :mask-closable="false"
      v-if="editable"
    >
      <NCard
        title="修改比赛数据"
        style="max-width: 60%; max-height: 80%"
        :bordered="false"
        preset="card"
        role="dialog"
      >
        <NSpace vertical>
          <NInput type="textarea" v-model:value="modalValue" />
          <NSpace justify="end">
            <NButton round type="primary" @click="handleModelSubmit">确认</NButton>
            <NButton round @click="handleModelCancel">取消</NButton>
          </NSpace>
        </NSpace>
      </NCard>
    </NModal>
  </NSpin>
</template>

<script setup lang="tsx">
import { apiRecordAdd, apiRecordDelete, apiRecordList, apiRecordModify } from '@/api/record'
import { asyncMap } from '@/api/utils'
import {
  NSpin,
  useMessage,
  NDataTable,
  NDropdown,
  NModal,
  NCard,
  NSpace,
  NButton,
  NInput
} from 'naive-ui'
import { type TableColumn } from 'naive-ui/es/data-table/src/interface'
import { onMounted, ref, nextTick } from 'vue'
import { apiCategoryQuery } from '@/api/category'
import { apiContestQuery } from '@/api/contest'
import {
  EmptyPlugin,
  getPluginError,
  type PluginInterface,
  type PluginRecordData,
  getSortedArray
} from '@/api/plugin/Plugin'
import PluginJsV1 from '@/api/plugin/JsV1'
import UserTag from './UserTag.vue'

const $message = useMessage()

const props = defineProps<{
  editable?: boolean
  contestId: string | number
}>()

/// 控制加载部分
const loadingState = ref(true)
const loadingText = ref('正在从远端拉取数据')

/// 表格列属性
const tableColumns = ref<any[]>([
  {
    title: '选手名称',
    key: 'playerNickname',
    sorter: true,
    resizable: true,
    render: (x: any) => <UserTag nickname={x.playerNickname} userId={x.playerId} />
  },
  { title: '量化分数', key: 'score', sorter: true, resizable: true }
])

/// 本地数据部分
let plugin: PluginInterface = null as any
const dataTable = ref<any[]>()

const handleSorterUpdated = async (sorter: any) => {
  if (sorter != null) {
    loadingState.value = true
    loadingText.value = '加载排序中'

    const key: string = sorter.columnKey
    const order: 'ascend' | 'descend' | false = sorter.order
    try {
      if (order == false) {
        dataTable.value?.sort((a, b) => a._id - b._id)
      } else if (key == 'playerNickname') {
        if (order == 'ascend')
          dataTable.value?.sort((a, b) =>
            (a.playerNickname as string).localeCompare(b.playerNickname)
          )
        else
          dataTable.value?.sort(
            (a, b) => -(a.playerNickname as string).localeCompare(b.playerNickname)
          )
      } else if (key == 'score') {
        if (order == 'ascend') dataTable.value?.sort((a, b) => a.score - b.score)
        else dataTable.value?.sort((a, b) => -(a.score - b.score))
      } else {
        dataTable.value!.sort((a, b) => a._id - b._id)
        dataTable.value = getSortedArray(
          dataTable.value!,
          await plugin.makeSort(parseInt(key), remoteData),
          order == 'descend'
        )
      }
      loadingState.value = false
    } catch (e) {
      $message.error(getPluginError(e))
    }
  }
}

/// 菜单部分
const dropdownX = ref(0)
const dropdownY = ref(0)
let dropdownRow: { _id: number } = null as any
const dropdownOptions = [
  { label: '编辑', key: 'edit' },
  { label: () => <span style="color: red;">删除</span>, key: 'delete' }
]
const dropdownShow = ref(false)
const dropdownHandleSelect = async (key: string) => {
  dropdownShow.value = false
  const record = remoteData[dropdownRow._id]
  try {
    switch (key) {
      case 'edit':
        shouldShowModal.value = true
        modalValue.value = modalOldValue = JSON.stringify(remoteData[dropdownRow._id].content)
        modalRecord = record
        break
      case 'delete':
        await apiRecordDelete(record.recordId)
        await refreshAll()
        break
    }
  } catch (e) {
    $message.error(getPluginError(e))
  }
}
const dropdownHandleClickOutside = () => {
  dropdownShow.value = false
}
const shouldShowModal = ref(false)
const modalValue = ref('')
let modalRecord: PluginRecordData = null as any
let modalOldValue = ''
const handleModelSubmit = async () => {
  if (modalValue.value != modalOldValue) {
    try {
      const content = JSON.parse(modalValue.value)
      const ins_content = plugin.process != null ? plugin.process(content) : content
      try {
        await apiRecordModify({
          recordId: modalRecord.recordId,
          content: JSON.stringify(ins_content),
          score: await plugin.getScore(ins_content)
        })
        await plugin.upload(remoteContestInfo.contestId, [modalRecord])
      } catch (e) {
        $message.error(getPluginError(e))
      }
    } catch (e) {
      $message.error('输入内容并非合法JSON')
    }
    await refreshAll()
  }
  shouldShowModal.value = false
}
const handleModelCancel = () => {
  shouldShowModal.value = false
}
const rowProps = (row: PluginRecordData) => {
  return {
    onContextmenu: props.editable
      ? (e: MouseEvent) => {
          e.preventDefault()
          dropdownShow.value = false
          nextTick().then(() => {
            dropdownShow.value = true
            dropdownX.value = e.clientX
            dropdownY.value = e.clientY
            dropdownRow = row as any
          })
        }
      : () => {
          dropdownShow.value = false
        }
  }
}

/// 远端数据部分
let remoteContestInfo: Awaited<ReturnType<typeof apiContestQuery>> = null as any
let remoteCategoryInfo: Awaited<ReturnType<typeof apiCategoryQuery>> = null as any
let remoteData: PluginRecordData[] = []

class TableError extends Error {
  constructor(msg: string) {
    super(msg)
  }
}

const _refreshAll = async () => {
  loadingText.value = '正在从远端拉取数据'
  remoteContestInfo = await apiContestQuery(props.contestId)
  remoteCategoryInfo = await apiCategoryQuery(remoteContestInfo.categoryId)
  remoteData = (await apiRecordList({ contestId: props.contestId })).data

  loadingText.value = '正在加载插件'
  switch (remoteContestInfo.scriptType) {
    case null:
    case '':
      plugin = new EmptyPlugin()
      break
    case 'JsV1':
      plugin = new PluginJsV1()
      break
    default:
      throw new TableError('未知插件类型')
  }
  plugin.load(remoteContestInfo, remoteCategoryInfo)
  if (plugin.process) for (let x of remoteData) x.content = plugin.process(JSON.parse(x.content))
  else for (let x of remoteData) x.content = JSON.parse(x.content)

  tableColumns.value.splice(
    2,
    Infinity,
    ...plugin.tableColumn.map(
      (x, idx): TableColumn => ({
        title: x.label,
        key: idx.toString(),
        sorter: x.sorter != null,
        resizable: true
      })
    )
  )

  loadingText.value = '正在加载自定义数据'
  const localeCustomData = await asyncMap(remoteData, (x) => plugin.makeData(x))
  dataTable.value = remoteData.map((x, i) => {
    const entry: any = {
      playerNickname: x.playerNickname,
      playerId: x.playerId,
      score: x.score,
      _id: i
    }
    localeCustomData[i].forEach((x, idx) => (entry[idx] = x))
    return entry
  })
}
const refreshAll = async () => {
  loadingState.value = true
  try {
    await _refreshAll()
    loadingState.value = false
  } catch (e) {
    $message.error(getPluginError(e))
  }
}

const add = async (playerId: string, content: string) => {
  let newContent = await plugin.process(content)
  let score = await plugin.getScore(newContent)
  await apiRecordAdd({
    contestId: props.contestId,
    data: { playerId, score, content: JSON.stringify(newContent) }
  })
  refreshAll()
}

const addMulti = async (datas: { playerId: string; content: string }[]) => {
  await apiRecordAdd({
    contestId: props.contestId,
    data: await asyncMap(datas, async (x) => {
      let newContent = await plugin.process(x.content)
      let score = await plugin.getScore(newContent)
      return { playerId: x.playerId, score, content: JSON.stringify(newContent) }
    })
  })
  refreshAll()
}

/// 导出函数

defineExpose({
  /** 刷新表格 */
  refresh: refreshAll,
  /** 添加数据（这将刷新表格） */
  add,
  /** 批量添加数据（这将刷新表格） */
  addMulti
})

onMounted(async () => {
  await refreshAll()
  loadingState.value = false
})

///
</script>
