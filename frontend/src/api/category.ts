import dayjs from 'dayjs'
import request, { APIError, generateHeader } from './request'
import { checkBigInt, checkLongString, checkShortString } from './utils'

export async function apiCategoryQuery(categoryId: number | string) {
  if (!checkBigInt(categoryId)) throw new APIError('类别ID非法')
  const x = (
    await request.get('/category/query', {
      params: { categoryId }
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
  if (!checkShortString(name)) throw new APIError('名称非法')
  if (description != null && !checkLongString(description)) throw new APIError('描述非法')
  const res = await request.post('/category/add', conf, {
    headers: generateHeader() ?? {}
  })
  return res.data.categoryId as string
}

export async function apiCategoryModify(conf: {
  categoryId: string | number
  name?: string
  description?: string
}) {
  const { categoryId, name, description } = conf
  if (!checkBigInt(categoryId)) throw new APIError('类别ID非法')
  if (name != null && !checkShortString(name)) throw new APIError('名称非法')
  if (description != null && !checkLongString(description)) throw new APIError('描述非法')
  await request.post('/category/modify', conf, {
    headers: generateHeader() ?? {}
  })
  return
}

export async function apiCategoryDelete(categoryId: string | number) {
  if (!checkBigInt(categoryId)) throw new APIError('类别ID非法')
  await request.delete('/category/delete', {
    params: { categoryId },
    headers: generateHeader() ?? {}
  })
  return
}

export async function apiCategoryList(conf: {
  userId?: string | number
  name?: string
  createdTime?: Date | string
  updatedTime?: Date | string
  offset?: number
  limit?: number
  order?: string[] | string
}) {
  if (conf.userId != null && !checkBigInt(conf.userId)) throw new APIError('用户ID非法')
  const data = (await request.get('/category/list', { params: conf })).data
  return {
    count: data.count as number,
    data: (data.data as any[]).map((x) => ({
      categoryId: x.categoryId as string,
      userId: x.userId as string,
      name: x.name as string,
      nickname: x.nickname as string,
      description: x.description as string | null,
      createdTime: dayjs(x.createdTime),
      updatedTime: dayjs(x.updatedTime)
    }))
  }
}
