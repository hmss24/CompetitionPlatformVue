import dayjs from 'dayjs'
import request, { APIError, generateHeader } from './request'
import { checkBigInt, checkLongString, checkShortString } from './utils'

export async function apiContestAdd(conf: {
  categoryId: string | number
  title: string
  description?: string
  scriptType?: string
  scriptContent?: string
  scriptCache?: string
}) {
  const { categoryId, title, description } = conf
  if (!checkBigInt(categoryId)) throw new APIError('类型ID非法')
  if (!checkShortString(title)) throw new APIError('标题非法')
  if (description != null && !checkLongString(description)) throw new APIError('描述非法')
  if (conf.scriptType != null) {
    if (!checkShortString(conf.scriptType)) throw new APIError('脚本类型非法')
    if (conf.scriptContent != null && !checkLongString(conf.scriptContent))
      throw new APIError('脚本内容非法')
  } else {
    if (conf.scriptContent != null) throw new APIError('存在脚本内容，但是却不存在脚本类型')
  }
  if (conf.scriptCache != null && !checkLongString(conf.scriptCache))
    throw new APIError('脚本缓存非法')

  return (await request.post('/contest/add', conf, { headers: generateHeader() ?? {} })).data
    .contestId as string
}

export async function apiContestDelete(contestId: number | string) {
  if (!checkBigInt(contestId)) throw new APIError('比赛ID非法')
  await request.delete('/contest/delete', {
    params: { contestId },
    headers: generateHeader() ?? {}
  })
  return
}

export async function apiContestModify(conf: {
  contestId: number | string
  categoryId?: number | string
  title?: string
  description?: string
  scriptType?: string
  scriptContent?: string
  scriptCache?: string
}) {
  if (!checkBigInt(conf.contestId)) throw new APIError('比赛ID非法')
  if (conf.categoryId != null && !checkBigInt(conf.categoryId)) throw new APIError('类别ID非法')
  if (conf.title != null && !checkShortString(conf.title)) throw new APIError('标题非法')
  if (conf.description != null && !checkLongString(conf.description)) throw new APIError('描述非法')
  if (conf.scriptType != null) {
    if (!checkShortString(conf.scriptType)) throw new APIError('脚本类型非法')
    if (conf.scriptContent != null && !checkLongString(conf.scriptContent))
      throw new APIError('脚本内容非法')
  } else {
    if (conf.scriptContent != null) throw new APIError('存在脚本内容，但是却不存在脚本类型')
  }
  if (conf.scriptCache != null && !checkLongString(conf.scriptCache))
    throw new APIError('脚本缓存非法')
  if (
    conf.categoryId == null &&
    conf.title == null &&
    conf.description == null &&
    conf.scriptType == null &&
    conf.scriptContent == null &&
    conf.scriptCache == null
  )
    return
  await request.post('/contest/modify', conf, { headers: generateHeader() ?? {} })
  return
}

export async function apiContestQuery(id: number | string) {
  if (!checkBigInt(id)) throw new APIError('比赛ID非法')
  const x = (await request.get('/contest/query', { params: { contestId: id } })).data
  return {
    contestId: x.contestId as string,
    userId: x.userId as string,
    categoryId: x.categoryId as string,
    title: x.title as string,
    description: x.description as string | null,
    scriptType: x.scriptType as string | null,
    scriptContent: x.scriptContent as string | null,
    scriptCache: x.scriptCache as string | null,
    createdTime: dayjs(x.createdTime),
    updatedTime: dayjs(x.updatedTime)
  }
}

export async function apiContestList(conf: {
  userId?: string | number
  categoryId?: string | number
  title?: string
  createdTime?: Date | string
  updatedTime?: Date | string
  offset?: number
  limit?: number
  order?: string[] | string
}) {
  if (conf.userId != null && !checkBigInt(conf.userId)) throw new APIError('用户ID非法')
  if (conf.categoryId != null && !checkBigInt(conf.categoryId)) throw new APIError('类别ID非法')
  if (conf.title != null && !checkShortString(conf.title)) throw new APIError('标题非法')
  const data = (await request.get('/contest/list', { params: conf })).data
  return {
    count: data.count as number,
    data: (data.data as any[]).map((x) => ({
      contestId: x.contestId as string,
      userId: x.userId as string,
      categoryId: x.categoryId as string,

      nickname: x.nickname as string,
      categoryName: x.categoryName as string,

      title: x.title as string,
      description: x.description as string | null,

      scriptType: x.scriptType as string | null,
      scriptContent: x.scriptContent as string | null,
      scriptCache: x.scriptCache as string | null,

      createdTime: dayjs(x.createdTime),
      updatedTime: dayjs(x.updatedTime)
    }))
  }
}
