<template>
  <NDataTable
    remote
    :columns="columns"
    :data="data"
    :loading="loadingState"
    :pagination="paginationReactive"
    @update:page="handlePageChange"
    @update:sorter="handleSorterChange"
    @update:page-size="handlePageSizeChange"
  />
</template>

<script setup lang="tsx">
import { apiRecordDelete, apiRecordList, apiRecordModify } from '@/api/record'
import { APIError, getAPIErrorInfo } from '@/api/request'
import { checkBigInt } from '@/api/utils'
import UserInput from '@/components/UserInput.vue'
import {
  NDataTable,
  NInput,
  useMessage,
  type DataTableSortState,
  type PaginationProps
} from 'naive-ui'
import { type SortOrder, type TableColumn } from 'naive-ui/es/data-table/src/interface'
import { defineComponent, nextTick, onMounted, reactive, ref, type VNodeRef } from 'vue'
import UserTag from './UserTag.vue'

const props = defineProps<{
  editable?: boolean
  contestId: string | number
}>()
const editable = props.editable ?? false
const data = ref<Awaited<ReturnType<typeof apiRecordList>>['data']>([]);



const $message = useMessage()
let order: ReturnType<typeof makeOrder> = undefined
const makeOrder = (key: string, order: SortOrder) => {
  switch (order) {
    case 'ascend':
      return '+' + key
    case 'descend':
      return '-' + key
    default:
      return undefined
  }
}
const doRefresh = async (page?: number, pageSize?: number, newColumns?: any) => {
  try {
    if (page == undefined) page = paginationReactive.page as number
    if (pageSize == undefined) pageSize = paginationReactive.pageSize as number
    const ret = await apiRecordList({
      contestId: props.contestId,
      limit: pageSize,
      offset: page * pageSize,
      order
    })
    data.value = ret.data
    paginationReactive.page = page
    paginationReactive.pageSize = pageSize
    paginationReactive.itemCount = Math.ceil(ret.count / pageSize)
    if (newColumns != null) columns.value = newColumns
    loadingState.value = false
  } catch (e) {
    $message.error(getAPIErrorInfo(e))
  }
}

defineExpose({
  refresh: () => doRefresh()
})

const loadingState = ref(true)
onMounted(() => doRefresh())

const columnPlayerNickName: TableColumn = {
  title: '选手名称',
  key: 'playerNickname',
  sorter: true,
  sortOrder: false,
  resizable: true,
  render: editable
    ? (rowData) => {
        const Componet = defineComponent({
          setup() {
            const isEdit = ref(false)
            const hold = ref<(typeof data.value)[0]>(rowData as any)
            const inputRef = ref<VNodeRef | null>(null)
            const inputValue = ref(rowData.playerId as string)
            const handleOnClick = () => {
              isEdit.value = true
              nextTick(() => inputRef.value?.focusInput())
            }
            const handleChange = async () => {
              const playerId = inputValue.value
              TRY_MODIFY: try {
                if (!checkBigInt(playerId)) {
                  inputValue.value = hold.value.playerId.toString()
                  break TRY_MODIFY
                }
                if (playerId == hold.value.playerId) break TRY_MODIFY
                loadingState.value = true
                await apiRecordModify({ recordId: hold.value.recordId, playerId })
                hold.value.playerId = playerId
                loadingState.value = false
              } catch (e) {
                $message.error(getAPIErrorInfo(e))
                inputValue.value = hold.value.playerId.toString()
              }
              isEdit.value = false
            }
            return () => (
              <div style="min-height: 22px" onClick={handleOnClick}>
                {isEdit.value ? (
                  <UserInput
                    selectRef={inputRef}
                    userId={inputValue.value}
                    onUpdate:userId={(x: any) => (inputValue.value = x)}
                    onBlur={handleChange}
                  />
                ) : (
                  <UserTag userId={hold.value.playerId} nickname={hold.value.playerNickname} />
                )}
              </div>
            )
          }
        })
        return <Componet />
      }
    : (rowData) => (
        <UserTag userId={rowData.playerId as any} nickname={rowData.playerNickname as any} />
      )
}
const columnScore: TableColumn = {
  title: '成绩',
  key: 'score',
  sorter: true,
  sortOrder: false,
  resizable: true,
  render: editable
    ? (rowData) => {
        const Componet = defineComponent({
          setup() {
            const isEdit = ref(false)
            const hold = ref<(typeof data.value)[0]>(rowData as any)
            const inputRef = ref<VNodeRef | null>(null)
            const inputValue = ref(rowData.score as string)
            const handleOnClick = () => {
              isEdit.value = true
              nextTick(() => inputRef.value?.focus())
            }
            const handleChange = async () => {
              try {
                if (inputValue.value == '') {
                  loadingState.value = true
                  await apiRecordDelete(hold.value.recordId)
                  doRefresh()
                } else {
                  const score = +inputValue.value
                  if (isNaN(score)) throw new APIError('请输入合法值')
                  if (score != hold.value.score) {
                    loadingState.value = true
                    await apiRecordModify({ recordId: hold.value.recordId, score })
                    hold.value.score = score
                    loadingState.value = false
                  }
                }
              } catch (e) {
                $message.error(getAPIErrorInfo(e))
                inputValue.value = hold.value.score.toString()
              }
              isEdit.value = false
              loadingState.value = false
            }
            return () => (
              <div style="min-height: 22px" onClick={handleOnClick}>
                {isEdit.value ? (
                  <NInput
                    ref={inputRef}
                    value={inputValue.value.toString()}
                    onUpdateValue={(x) => {
                      if (x == '' || !isNaN(+x)) inputValue.value = x
                    }}
                    placeholder="留空以删除记录"
                    onChange={handleChange}
                    onBlur={handleChange}
                  />
                ) : (
                  hold.value.score
                )}
              </div>
            )
          }
        })
        return <Componet />
      }
    : undefined
}
const columns = ref([columnPlayerNickName, columnScore])

const paginationReactive = reactive<PaginationProps>({
  page: 1,
  pageCount: 1,
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
      value: 50
    },
    {
      label: '100 条 / 页',
      value: 100
    }
  ],
  prefix({ itemCount }) {
    return `共 ${itemCount} 条`
  }
})
const handlePageChange = async (currentPage: number) => {
  if (!loadingState.value) {
    loadingState.value = true
    await doRefresh(currentPage)
  }
}
const handlePageSizeChange = async (pageSize: number) => {
  if (!loadingState.value) {
    loadingState.value = true
    await doRefresh(0, pageSize)
  }
}

const handleSorterChange = async (sorter: DataTableSortState | null) => {
  if (sorter != null) {
    loadingState.value = true
    order = makeOrder(sorter.columnKey as string, sorter.order)
    await doRefresh(
      undefined,
      undefined,
      columns.value.map((x) => {
        const col = Object.assign({}, x)
        if (col.key == sorter.columnKey) col.sortOrder = sorter.order
        else col.sortOrder = false
        return col
      })
    )
  }
}
</script>
