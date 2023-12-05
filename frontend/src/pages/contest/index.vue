<template>
  <NavBar>
    <NSpace justify="space-between" align="center">
    <NH1>
      比赛列表
    </NH1>
    <NSpace justify="end" style="margin-bottom: 16px">
      <NButton color="#5d5cde" round @click="() => $router.push(`/contest/add`)">添加</NButton>
      <NButton color="#4caf50" round @click="() => doRefresh()">刷新</NButton>
    </NSpace>

    </NSpace>
    <NDataTable
      :columns="tableColumns"
      :data="data"
      :pagination="paginationReactive"
      :loading="loadingState"
      @update:page="handlePageChange"
      @update:sorter="handleSorterChange"
      @update:page-size="handlePageSizeChange"
    />
  </NavBar>
</template>

<script setup lang="tsx">
import { apiContestDelete, apiContestList } from '@/api/contest'
import { getAPIErrorInfo } from '@/api/request'
import NavBar from '@/components/NavBar.vue'
import UserTag from '@/components/UserTag.vue'
import router from '@/router'
import {
  NButton,
  NDataTable,
  NSpace,
  useDialog,
  useMessage,
  type DataTableSortState,
  type PaginationProps,
NH1
} from 'naive-ui'
import { type SortOrder, type TableBaseColumn } from 'naive-ui/es/data-table/src/interface'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
const $message = useMessage()
const $dialog = useDialog()
const $router = useRouter()

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
  loadingState.value = true
  try {
    if (page == undefined) page = paginationReactive.page as number
    if (pageSize == undefined) pageSize = paginationReactive.pageSize as number
    const ret = await apiContestList({
      limit: pageSize,
      offset: page * pageSize,
      order
    })
    data.value = ret.data
    paginationReactive.page = page
    paginationReactive.pageSize = pageSize
    paginationReactive.itemCount = Math.ceil(ret.count / pageSize)
    if (newColumns != null) tableColumns.value = newColumns
  } catch (e) {
    $message.error(getAPIErrorInfo(e))
  }
  loadingState.value = false
}

const loadingState = ref(true)
onMounted(() => doRefresh())
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
      tableColumns.value.map((x) => {
        const col = Object.assign({}, x)
        if (col.key == sorter.columnKey) col.sortOrder = sorter.order
        else col.sortOrder = false
        return col
      })
    )
  }
}

const tableColumns = ref<TableBaseColumn[]>([
  {
    title: '标题',
    key: 'title',
    resizable: true,
    width: 100,
    minWidth: 75,
    sorter: true,
    sortOrder: false
  },
  {
    title: '类别',
    key: 'categoryName',
    resizable: true,
    minWidth: 75
  },
  {
    title: '描述',
    key: 'description',
    resizable: true,
    minWidth: 75,
    ellipsis: { tooltip: true }
  },
  {
    title: '创建者',
    key: '<creator>',
    resizable: true,
    render: (x) => <UserTag userId={x.userId as any} nickname={x.nickname as any} />
  },
  {
    title: '操作',
    key: '<operation>',
    width: 150,
    render: (x) => {
      const handleDelete = async () => {
        const dialog = $dialog.warning({
          title: '你正在删除比赛',
          content: '删除比赛后，所有比赛描述与比赛成绩将会被移除，是否确认删除？',
          positiveText: '确认删除',
          negativeText: '取消删除',
          onPositiveClick: async () => {
            dialog.loading = true
            try {
              await apiContestDelete(x.contestId as any)
              $message.success('成功删除比赛')
              $router.back()
            } catch (e) {
              $message.error(getAPIErrorInfo(e))
            }
          },
          onNegativeClick: () => {}
        })
      }

      return (
        <NSpace>
          <NButton
            onClick={() => {
              if (x.userId == localStorage.getItem('userid'))
                router.push(`/contest/edit/${x.contestId}`)
              else router.push(`/contest/view/${x.contestId}`)
            }}
          >
            {x.userId == localStorage.getItem('userid') ? '编辑' : '查看'}
          </NButton>
          <NButton
            type="error"
            disabled={localStorage.getItem('userid') != x.userId}
            onClick={() => handleDelete()}
          >
            删除
          </NButton>
        </NSpace>
      )
    }
  }
])

const data = ref<Awaited<ReturnType<typeof apiContestList>>['data']>([])
</script>
