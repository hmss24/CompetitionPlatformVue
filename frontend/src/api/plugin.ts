import Sandbox from '@nyariv/sandboxjs'
import { checkBigInt, checkEmptyObject, timeoutCall } from './utils'

const changedSymbol = Symbol()

export interface pluginRecordData {
  recordId: string
  playerId: string
  playerNickname: string
  score: number
  content: any
  [changedSymbol]?: boolean
}

// 具体含义参照plugin.d.ts
export interface pluginColumnInfo {
  label: string
  getter: (data: pluginRecordData) => string
  sorter?: (lhs: pluginRecordData, rhs: pluginRecordData) => number
  color?: (data: pluginRecordData) => string
  filter?: boolean | ((data: pluginRecordData) => string)
  setter?: (data: pluginRecordData, value: string) => void
}

export class pluginInfo {
  /**
   * 表格列
   */
  tableColumn: pluginColumnInfo[] = []

  /**
   * 分数计算器版本
   */
  scoreCalculatorVer: null | string = null
  /**
   * 分数计算器
   */
  scoreCalculator: null | ((x: pluginRecordData) => number) = null

  /**
   * 模板字符串
   */
  dataTemplate?: any

  /**
   * 模板字符串（JSON化）
   */
  dataTemplateJSON?: string
}

/**
 * 创建数据代理（监听设置和删除功能）
 * @param data 数据
 * @param editable 是否可以编辑
 * @returns
 */
export function proxyRecordData(data: pluginRecordData, editable: boolean = false) {
  return new Proxy(data, {
    set: editable
      ? (target, key, value) => {
          switch (key) {
            case 'playerId':
              if (!checkBigInt(value)) return false
              target[key] = value
              target[changedSymbol] = true
              return true
            case 'content':
              try {
                JSON.stringify(value)
              } catch {
                return false
              }
              target[key] = value
              target[changedSymbol] = true
              return true
            case 'score':
              if (!(typeof value == 'number')) return false
              target[key] = value
              target[changedSymbol] = true
              return true
            case changedSymbol:
              target[changedSymbol] = value
              return true
          }
          return false
        }
      : () => false,
    deleteProperty: () => false
  })
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

export class PluginError extends Error {
  constructor(msg: string) {
    super(msg)
  }
}

/**
 * JSON并压缩传入的原始模板。
 *
 * @param sample 原始模板
 * @param depth 深度（防止层数过多）
 * @returns 压缩后的JSON字符串
 */
export function makeDataFormJSON(sample: any, depth: number = 10): string {
  if (depth <= 0) throw new PluginError('模板层数过多，不予展开')
  if (sample == null) return ''
  switch (typeof sample) {
    case 'object':
      if (Array.isArray(sample)) {
        if (sample.length != 1) throw new PluginError('请为数组类型模板设置一个成员')
        return `[${makeDataFormJSON(sample[0], depth - 1)}]`
      } else {
        const table: string[] = []
        for (const k in sample) table.push(`${k}:${makeDataFormJSON(sample[k], depth - 1)}`)
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
  getCategoryInfo: () => any
}

export async function runUserCustomCode(code: string, config?: UserCustomCodeConfig) {
  const prototypeWhitelist = Sandbox.SAFE_PROTOTYPES
  const globals = { ...Sandbox.SAFE_GLOBALS }
  const sandbox = new Sandbox({ globals, prototypeWhitelist })

  const info = new pluginInfo()
  const columnLabelSet = new Set()
  globals['registerTableColumn'] = (config: pluginColumnInfo) => {
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
    if (config.color != undefined && typeof config.color != 'function')
      throw new PluginError('染色功能必须是函数类型')
    if (
      config.filter != undefined &&
      typeof config.filter != 'boolean' &&
      typeof config.filter != 'function'
    )
      throw new PluginError('筛选功能必须是布尔类型或者函数类型')
    if (config.setter != undefined && typeof config.setter != 'function')
      throw new PluginError('设置器必须是函数类型')

    info.tableColumn.push(config)
  }
  globals['registerScoreCalculator'] = (ver: string, fn: (x: pluginRecordData) => number) => {
    if (typeof ver != 'string') throw new PluginError('版本标识必须为字符串')
    if (typeof fn != 'function') throw new PluginError('更新函数必须是函数类型')
    if (info.scoreCalculatorVer != null) throw new PluginError('不能重复注册分数计算器')
    info.scoreCalculatorVer = ver
    info.scoreCalculator = fn
  }
  globals['getCategoryInfo'] =
    config?.getCategoryInfo ??
    function () {
      throw new PluginError('没有权限获取当前比赛分类')
    }
  globals['declareDataForm'] = (s: any) => {
    if (s == null) throw new PluginError('请传入正确的模板')
    info.dataTemplateJSON = makeDataFormJSON(s)
    info.dataTemplate = s
  }

  const fn = sandbox.compileAsync(code)
  await timeoutCall(3000, fn().run)
  return info
}
