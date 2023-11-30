import axios, { type AxiosRequestConfig } from 'axios'

export const CreateAxiosInstance = (config?: AxiosRequestConfig) => {
  const instance = axios.create({
    timeout: 3000,
    baseURL: '/api',
    ...config
  })

  instance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
  )

  instance.interceptors.response.use(
    (response) => {
      if (typeof response.data.code != 'number')
        return Promise.reject(new APIError({ code: -98, msg: '未知错误，请求损坏' }))
      if (response.data.code != 200) return Promise.reject(new APIError(response.data))
      return Promise.resolve(response)
    },
    (error) => Promise.reject(error)
  )

  return instance
}

const request = CreateAxiosInstance({})
export default request

// 从localStorage中读取登录信息并生成Header，如果未登录返回null
export function generateHeader() {
  const userid = localStorage.getItem('userid')
  const token = localStorage.getItem('token')
  if (userid == null || token == null) return null
  return { userid, token }
}

/**
 * API错误类，这应当来源于后端或前端的校验阶段。
 */
export class APIError extends Error {
  /**
   * 错误编码，前端自身的错误全部设置为-99
   */
  code: number
  /**
   * 错误信息，可用于输出
   */
  msg: string
  /**
   * 构造时的原始值或对象（一个例外是当以APIError构造时则指向原APIError的原始值或对象）
   */
  raw: any

  /**
   * 构造APIError类型。
   * @param raw 原始错误数据，期待接受字符串（前端自身错误）/后端错误/APIError本身，其余类型亦能接受。
   */
  constructor(raw: any) {
    if (typeof raw == 'string') {
      super(raw)
      this.code = -99
      this.msg = raw
    } else if (raw instanceof APIError) {
      super(raw.msg)
      this.code = raw.code
      this.msg = raw.msg
      this.raw = raw.raw
    } else if (typeof raw == 'object' && typeof raw.code == 'number') {
      const msg = raw.msg?.toString() ?? '未知错误'
      super(msg)
      this.code = raw.code
      this.msg = msg
      this.raw = raw
    } else { // 接受其余类型防止构造失败
      super(raw)
      this.code = -99
      this.msg = raw?.toString() ?? '未知错误'
      this.raw = raw
    }
  }
}

export function getAPIErrorInfo(x: any): string {
  if (x instanceof APIError) return x.msg
  else if (x instanceof Error) return x.message
  else if (typeof x == 'string') return x
  else return `未知错误： ${x}`
}
