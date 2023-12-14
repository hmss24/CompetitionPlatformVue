import Sandbox from '@nyariv/sandboxjs'
import { asyncMapNonull, checkBigInt, checkEmptyObject, timeoutCall } from '@/api/utils'
import {
  PluginError,
  type PluginInterface,
  type PluginRecordData,
  type ContestInfo,
  type RecordDataProxy,
  type CategoryInfo,
  makeItoa
} from './Plugin'
import { apiRecordModify } from '../record'
import { apiContestModify } from '../contest'

export type ColumnConfig = {
  label: string
  getter: (data: RecordDataProxy) => string
  sorter?: (lhs: RecordDataProxy, rhs: RecordDataProxy) => number
}

/**
 * 创建只读数据
 * @param data 数据
 * @returns
 */
export function proxyRecordData(data: RecordDataProxy) {
  return { ...data }
}

/**
 * 根据模板标准化原数据。
 *
 * @param data 原始数据
 * @param sample 模板数据
 * @returns 标准化后的数据（深拷贝）
 */
export function standardizingDataForm(data: any, sample: any): any {
  if (sample == null) return undefined
  switch (typeof sample) {
    case 'object':
      if (Array.isArray(sample)) {
        // 模板是数组
        if (data == null) return []
        if (['number', 'string', 'boolean'].includes(typeof data)) return [data]
        if (Array.isArray(data)) return data.map((x) => standardizingDataForm(x, sample[0]))
      } else {
        // 模板是对象
        if (data == null) return {}
        if (typeof data == 'object') {
          const ret: any = {}
          for (const x in sample) ret[x] = standardizingDataForm(data[x], sample[x])
          return ret
        }
      }
      break
    case 'boolean':
      if (data == null) return false
      if (['number', 'string', 'boolean'].includes(typeof data)) return !!data
      if (Array.isArray(data)) return data.length != 0
      if (typeof data == 'object') return !checkEmptyObject(data)
      break
    case 'string':
      if (data == null) return ''
      if (['number', 'string', 'boolean'].includes(typeof data)) return data.toString()
      if (Array.isArray(data) && ['number', 'string', 'boolean'].includes(data[0]))
        return data[0].toString()
      break
    case 'number':
      if (data == null) return 0
      if (['number', 'string', 'boolean'].includes(typeof data)) {
        const ret = +data
        if (!isNaN(ret)) return ret
      }
      if (Array.isArray(data) && ['number', 'string', 'boolean'].includes(data[0])) {
        const ret = +data[0]
        if (!isNaN(ret)) return ret
      }
  }
  throw new PluginError('原数据无法被转化为与模板相同格式')
}

/**
 * JSON并压缩传入的原始模板。
 *
 * @param sample 原始模板
 * @param depth 深度（防止层数过多）
 * @returns 压缩后的JSON字符串
 */
export function makeTemplateString(sample: any, depth: number = 10): string {
  if (depth <= 0) throw new PluginError('模板层数过多，不予展开')
  if (sample == null) return ''
  switch (typeof sample) {
    case 'object':
      if (Array.isArray(sample)) {
        if (sample.length != 1) throw new PluginError('请为数组类型模板设置一个成员')
        return `[${makeTemplateString(sample[0], depth - 1)}]`
      } else {
        const table: string[] = []
        for (const k in sample) table.push(`${k}:${makeTemplateString(sample[k], depth - 1)}`)
        return `{${table.sort().join(',')}}`
      }
      break
    case 'number':
      return '0'
    case 'boolean':
      return 'false'
    case 'string':
      return '""'
  }
  throw new PluginError('模板类型非法，设置失败')
}

export interface UserCustomCodeConfig {
  getcontestInfo: () => any
}

export default class PluginJsV1 implements PluginInterface {
  timeout: number = 3000
  tableColumn: ColumnConfig[] = []

  dataTemplate: any = 0
  dataTemplateString: string = ''

  scoreCalculator: ((x: RecordDataProxy) => number) | null = null

  cache: {
    dataTemplateString?: string
  } = {}

  async load(contestInfo: ContestInfo, categoryInfo: CategoryInfo) {
    const prototypeWhitelist = Sandbox.SAFE_PROTOTYPES
    const globals = { ...Sandbox.SAFE_GLOBALS }
    const columnLabelSet = new Set()

    if (contestInfo.scriptCache != null)
      try {
        const obj = JSON.parse(contestInfo.scriptCache)
        this.cache.dataTemplateString = obj.dataTemplateString
        if (obj.dataTemplateString != null && typeof obj.dataTemplateString != 'string')
          throw new PluginError('缓存格式错误')
      } catch {
        /* do nothing */
      }

    globals['registerTableColumn'] = (config: ColumnConfig) => {
      if (config.label == undefined) throw new PluginError('配置必须包括表头名称')
      else if (typeof config.label != 'string') throw new PluginError('表头名称必须是字符串类型')
      else if (columnLabelSet.has(config.label)) throw new PluginError('表头名称必须唯一')
      else {
        columnLabelSet.add(config.label)
      }

      if (config.getter == undefined) throw new PluginError('配置必须包括获取器')
      else if (typeof config.getter != 'function') throw new PluginError('获取器必须是函数类型')

      if (config.sorter != undefined && typeof config.sorter != 'function')
        throw new PluginError('排序功能必须是函数类型')

      this.tableColumn.push(config)
    }

    globals['registerScoreCalculator'] = (fn: typeof this.scoreCalculator) => {
      if (typeof fn != 'function') throw new PluginError('更新函数必须是函数类型')
      if(this.scoreCalculator != null)throw new PluginError("不能重复设置分数计算器")
      this.scoreCalculator = fn
    }

    globals['getcontestInfo'] = () => ({
      id: categoryInfo.categoryId,
      title: categoryInfo.name,
      description: categoryInfo.description
    })

    globals['declareDataForm'] = (s: any) => {
      if (s == null) throw new PluginError('请传入正确的模板')
      this.dataTemplate = s
      this.dataTemplate = makeTemplateString(s)
    }

    const sandbox = new Sandbox({ globals, prototypeWhitelist })
    const fn = sandbox.compileAsync(contestInfo.scriptContent ?? '')
    await timeoutCall(this.timeout, fn().run)
  }

  async upload(contestId: string, datas: PluginRecordData[]) {
    if (this.scoreCalculator != null) {
      // 分数计算
      const modifies = await timeoutCall(this.timeout, () =>
        asyncMapNonull(datas, async (x) => {
          const _x = proxyRecordData(x)
          const score = this.scoreCalculator!(_x)
          if (typeof score != 'number') throw new PluginError('分数计算器应当返回数字类型')
          if (score !== x.score) return { recordId: x.recordId, score }
          else return undefined
        })
      )
      console.log(modifies)
      if (modifies.length != 0) await apiRecordModify(modifies)
    }
    await apiContestModify({
      contestId,
      scriptType: 'JsV1',
      scriptCache: JSON.stringify({
        dataTemplateString: this.dataTemplateString
      })
    })
  }

  process(x: any) {
    if (this.dataTemplateString == this.cache.dataTemplateString) return x
    else return standardizingDataForm(x, this.dataTemplate)
  }

  async getScore(x: PluginRecordData) {
    if(this.scoreCalculator == null) return x.score;
    return await timeoutCall(this.timeout, ()=> this.scoreCalculator!(x))
  }

  async makeData(x: PluginRecordData) {
    const _x = proxyRecordData(x)
    return this.tableColumn.map((col) => {
      const fn_ret = col.getter(_x)
      if (typeof fn_ret != 'string') throw new PluginError('获取器应当返回字符串')
      return fn_ret
    })
  }

  async makeSort(idx: number, datas: PluginRecordData[]) {
    const _datas = datas.map((x) => proxyRecordData(x))
    const sorter = this.tableColumn[idx]!.sorter!
    const orders = await timeoutCall(this.timeout, () =>
      makeItoa(datas.length).sort((li, ri) => sorter(_datas[li], _datas[ri]))
    )
    return orders
  }
}
