import type { apiCategoryQuery } from '../category'
import type { apiContestQuery } from '../contest'
import type { apiRecordQuery } from '../record'

export class PluginError extends Error {
  constructor(msg: string) {
    super(msg)
  }
}

export type PluginRecordData = Awaited<ReturnType<typeof apiRecordQuery>>[0] & { content: any }
/** 被代理的RecordData */
export type RecordDataProxy = PluginRecordData
export type ContestInfo = Awaited<ReturnType<typeof apiContestQuery>>
export type CategoryInfo = Awaited<ReturnType<typeof apiCategoryQuery>>

// 配置中的函数不应当直接调用
export type ColumnConfig = {
  label: string
  getter: Function
  sorter?: Function
}

export interface PluginInterface {
  timeout: number
  tableColumn: ColumnConfig[]

  load: (contestInfo: ContestInfo, categoryInfo: CategoryInfo) => Promise<void>
  upload: (contestId: string, datas: PluginRecordData[]) => Promise<void>

  process?: (oldContent: any) => any
  getScore: (x: PluginRecordData)=> Promise<number>

  makeData: (x: PluginRecordData) => Promise<string[]>
  makeSort: (idx: number, datas: PluginRecordData[]) => Promise<number[]>
}

export class EmptyPlugin implements PluginInterface {
  timeout = 0
  tableColumn = []

  load = () => Promise.resolve()
  upload = () => Promise.resolve()

  getScore = (x: PluginRecordData)=> Promise.resolve(x.score)

  makeData = () => Promise.resolve([])
  makeSort = () => Promise.resolve([])
}

export function getPluginError(e: any) {
  if (e instanceof PluginError) return '脚本错误：' + e.message
  else if (e instanceof Error) return e.message
  else return '未知错误：' + (e as any).toString()
}

/**
 * 使用对应的顺序表来排序数组。
 * @param raw 待排序的数组
 * @param ids 顺序表（从0开始）
 * @returns 排序后的数组
 */
export function getSortedArray<T>(raw: T[], ids: number[], reverse: boolean = false) {
  if (raw.length != ids.length) throw new PluginError('无法执行排序，数量不对')
  const ret = new Array<T>(ids.length)
  const n = ret.length
  if (reverse) for (let i = 0; i < n; ++i) ret[n - ids[i] - 1] = raw[i]
  else for (let i = 0; i < n; ++i) ret[ids[i]] = raw[i]
  return ret
}

export function makeItoa(num: number, start: number = 0, step: number = 1) {
  const ret = new Array<number>(num)
  for (let i = 0; i < num; ++i) {
    ret[i] = start
    start += step
  }
  return ret
}
