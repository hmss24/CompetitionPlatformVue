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

export class APIError extends Error {
  code: number
  msg: string
  raw: any
  constructor(raw: any) {
    super(raw.msg as string)
    this.code = raw.code as number
    this.msg = raw.msg as string
    this.raw = raw
  }
}

export function throwAPIError(msg: string) {
  throw new APIError({ code: -99, msg })
}
