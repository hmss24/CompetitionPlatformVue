import dayjs from 'dayjs'
import request, { generateHeader, throwAPIError } from './request'
import { checkBigInt, checkLongString, checkShortString } from './utils'

export async function apiCategoryQuery(categoryId: number | string) {
  if (!checkBigInt(categoryId)) throwAPIError('类别ID非法')
  const x = (
    await request.get('/category/query', {
      data: { categoryId }
    })
  ).data
  return {
    categoryId: x.categoryId as string,
    userId: x.userId as string,
    name: x.name as string,
    description: x.description as string | null,
    createdTime: dayjs(x.createdTime).toDate(),
    updatedTime: dayjs(x.updatedTime).toDate()
  }
}

export async function apiCategoryAdd(conf: { name: string; description?: string }) {
  const { name, description } = conf
  if (!checkShortString(name)) throwAPIError('名称非法')
  if (description != null && !checkLongString(description)) throwAPIError('描述非法')
  const res = await request.post(
    '/category/add',
    { name, description },
    {
      headers: generateHeader() ?? {}
    }
  )
  return res.data.categoryId as string
}

export async function apiCategoryModify(conf: {
  categoryId: string | number
  name?: string
  description?: string
}) {
  const { categoryId, name, description } = conf
  if (!checkBigInt(categoryId)) throwAPIError('类别ID非法')
  if (name != null && !checkShortString(name)) throwAPIError('名称非法')
  if (description != null && !checkLongString(description)) throwAPIError('描述非法')
  await request.post(
    '/category/modify',
    { categoryId, name, description },
    {
      headers: generateHeader() ?? {}
    }
  )
  return
}

export async function apiCategoryList(conf: {
  userId?: string | number
  start?: number
  lim?: number
}) {
  const { userId, start, lim } = conf
  if (userId != null && !checkBigInt(userId)) throwAPIError('用户ID非法')
  const x = (await request.get('/category/list', { data: { userId, start, lim } })).data.data
  return (x as any[]).map((x) => ({
    categoryId: x.categoryId as string,
    userId: x.userId as string,
    name: x.name as string,
    description: x.description as string | null,
    createdTime: dayjs(x.createdTime).toDate(),
    updatedTime: dayjs(x.updatedTime).toDate()
  }))
}

export async function apiCategoryListCount(userId: string | number | undefined) {
  if (userId != null && !checkBigInt(userId)) throwAPIError('用户ID非法')
  const x = (await request.get('/category/list', { data: { userId } })).data
  return x.count as number
}
