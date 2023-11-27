import dayjs from 'dayjs'
import request, { generateHeader, throwAPIError } from './request'
import {
  checkBigInt,
  checkEmail,
  checkLongString,
  checkPassword,
  checkShortString,
  checkUserName
} from './utils'

export async function apiUserSignup(data: {
  username: string
  nickname: string
  password: string
  email?: string
  description?: string
}) {
  const { username, nickname, password, email, description } = data
  if (!checkUserName(username)) throwAPIError('用户名非法')
  if (!checkShortString(nickname)) throwAPIError('昵称非法')
  if (!checkPassword(password)) throwAPIError('密码非法')
  if (email != null && !checkEmail(email)) throwAPIError('邮箱非法')
  if (description != null && !checkLongString(description)) throwAPIError('描述非法')
  await request.get('/user/signup', { data: { username, nickname, password, email, description } })
}

export async function apiUserLogin(data: { username: string; password: string }) {
  const { username, password } = data
  if (!checkUserName(username)) throwAPIError('用户名非法')
  if (!checkPassword(password)) throwAPIError('密码非法')
  const res = await request.post('/user/login', { username, password })
  return {
    token: res.headers['token'] as string,
    userid: res.headers['userid'] as string,
    username: res.headers['username'] as string,
    nickname: res.headers['nickname'] as string
  }
}

export async function apiUserLogout() {
  await request.delete('/user/logout', { headers: generateHeader() ?? {} })
}

export async function apiUserModify(data: {
  description?: string
  email?: string
  nickname?: string
}) {
  const { description, email, nickname } = data
  if (description != null && !checkLongString(description)) throwAPIError('描述非法')
  if (email != null && checkEmail(email)) throwAPIError('邮箱非法')
  if (nickname != null && checkShortString(nickname)) throwAPIError('昵称非法')
  if (description == null && email == null && nickname == null) return
  await request.post(
    '/user/modify',
    { description, email, nickname },
    {
      headers: generateHeader() ?? {}
    }
  )
}

export async function apiUserQuery(data: { username?: string; userId?: string | number }) {
  const { username, userId } = data
  if ((username == null) == (userId == null)) throwAPIError('用户ID和用户名不能同时存在或同时为空')
  if (username != null && !checkUserName(username)) throwAPIError('用户名非法')
  if (userId != null && !checkBigInt(userId)) throwAPIError('用户ID非法')
  const res = await request.get('/user/query', {
    data: { username, userId }
  })
  return {
    userId: res.data.userId as string,
    username: res.data.username as string,
    nickname: res.data.nickname as string,
    email: res.data.email as string | null,
    description: res.data.description as string | null,
    createdTime: dayjs(res.data.createdTime).toDate(),
    updatedTime: dayjs(res.data.updatedTime).toDate()
  }
}

export async function apiUserQueryId(id: (string | number)[] | string | number) {
  const _id = id instanceof Array ? id : [id]
  if (!_id.every((x) => checkBigInt(x))) throwAPIError('需要整数')
  const res = await request.get('/user/query_id', {
    data: { userId: _id }
  })
  return res.data.data.map((x: any) => ({
    userId: x.userId as string,
    username: x.username as string,
    nickname: x.nickname as string,
    email: x.email as string,
    description: x.description as string,
    createdTime: dayjs(x.createdTime).toDate(),
    updatedTime: dayjs(x.updatedTime).toDate()
  }))
}

export async function apiUserSearch(nickname: string) {
  if (!checkShortString(nickname)) throwAPIError('昵称非法')
  const res = await request.get('/user/search', {
    data: { nickname }
  })
  return (res.data.data as any[]).map((x: any) => ({
    userId: x.userId as string,
    username: x.username as string,
    nickname: x.nickname as string,
    email: x.email as string | null,
    description: x.description as string | null,
    createdTime: dayjs(x.createdTime).toDate(),
    updatedTime: dayjs(x.updatedTime).toDate()
  }))
}
