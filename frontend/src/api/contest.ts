import dayjs from 'dayjs'
import request, { generateHeader, throwAPIError } from './request'
import { checkBigInt, checkLongString, checkShortString } from './utils'


/*
  添加比赛
  传入：
    类别ID
    标题
    描述
  传回：
    比赛ID
*/
export async function apiContestAdd(conf: {
  categoryId: string | number
  title: string
  description?: string
}) {
  const { categoryId, title, description } = conf
  if (!checkBigInt(categoryId)) throwAPIError('类型ID非法')
  if (!checkShortString(title)) throwAPIError('标题非法')
  if (description != null && !checkLongString(description)) throwAPIError('描述非法')
  return (
    await request.post(
      '/contest/add',
      { categoryId, title, description },
      { headers: generateHeader() ?? {} }
    )
  ).data.contestId as string
}

export async function apiContestDelete(contestId: number | string) {
  if (!checkBigInt(contestId)) throwAPIError('比赛ID非法')
  await request.delete('/contest/delete', { data: { contestId }, headers: generateHeader() ?? {} })
  return
}

export async function apiContestModify(conf: {
  contestId: number | string
  categoryId?: number | string
  title?: string
  description?: string
}) {
  if (!checkBigInt(conf.contestId)) throwAPIError('比赛ID非法')
  if (conf.categoryId != null && !checkBigInt(conf.categoryId)) throwAPIError('类别ID非法')
  if (conf.title != null && !checkShortString(conf.title)) throwAPIError('标题非法')
  if (conf.description != null && !checkLongString(conf.description)) throwAPIError('描述非法')
  if (conf.categoryId == null && conf.title == null && conf.description == null) return
  await request.post(
    '/contest/modify',
    {
      contestId: conf.contestId,
      categoryId: conf.categoryId,
      title: conf.title,
      description: conf.description
    },
    { headers: generateHeader() ?? {} }
  )
  return
}

export async function apiContestQuery(id: number | string) {
  if (!checkBigInt(id)) throwAPIError('比赛ID非法')
  const x = (await request.get('/contest/query', {})).data
  return {
    contestId: x.contestId as string,
    userId: x.userId as string,
    categoryId: x.categoryId as string,
    title: x.title as string,
    description: x.description as string | null,
    createdTime: dayjs(x.createdTime).toDate(),
    updatedTime: dayjs(x.updatedTime).toDate()
  }
}

export async function apiContestList(conf: {
  userId?: string | number
  categoryId?: string | number
  title?: string
  start?: number
  lim?: number
}) {
  if (conf.userId != null && !checkBigInt(conf.userId)) throwAPIError('用户ID非法')
  if (conf.categoryId != null && !checkBigInt(conf.categoryId)) throwAPIError('类别ID非法')
  if (conf.title != null && !checkShortString(conf.title)) throwAPIError('标题非法')
  return (
    (
      await request.get('/contest/list', {
        data: {
          userId: conf.userId,
          categoryId: conf.categoryId,
          title: conf.title,
          start: conf.start,
          lim: conf.lim
        }
      })
    ).data.data as any[]
  ).map((x) => ({
    contestId: x.contestId as string,
    userId: x.userId as string,
    categoryId: x.categoryId as string,
    title: x.title as string,
    description: x.description as string | null,
    createdTime: dayjs(x.createdTime).toDate(),
    updatedTime: dayjs(x.updatedTime).toDate()
  }))
}

export async function apiContestListCount(conf: {
  userId?: string | number
  categoryId?: string | number
  title?: string
  start?: number
  lim?: number
}) {
  if (conf.userId != null && !checkBigInt(conf.userId)) throwAPIError('用户ID非法')
  if (conf.categoryId != null && !checkBigInt(conf.categoryId)) throwAPIError('类别ID非法')
  if (conf.title != null && !checkShortString(conf.title)) throwAPIError('标题非法')
  return (
    await request.get('/contest/list_count', {
      data: {
        userId: conf.userId,
        categoryId: conf.categoryId,
        title: conf.title,
        start: conf.start,
        lim: conf.lim
      }
    })
  ).data.count as number
}
