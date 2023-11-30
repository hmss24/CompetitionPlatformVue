import dayjs from 'dayjs'
import request, { APIError, generateHeader } from './request'
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
  if (!checkUserName(username)) throw new APIError('用户名非法\n，必须在1-50个字符以内')
  if (!checkShortString(nickname)) throw new APIError('昵称非法')
  if (!checkPassword(password)) throw new APIError('密码非法\n长度8-50，必须至少含有1个大写字母，1个小写字母和1个数字')
  if (email != null && !checkEmail(email)) throw new APIError('邮箱非法')
  if (description != null && !checkLongString(description)) throw new APIError('描述非法')
  await request.get('/user/signup', { data: { username, nickname, password, email, description } })
}

export async function apiUserLogin(data: { username: string; password: string }) {
  const { username, password } = data
  if (!checkUserName(username)) throw new APIError('用户名非法')
  if (!checkPassword(password)) throw new APIError('密码非法\n长度8-50，必须至少含有1个大写字母，1个小写字母和1个数字')
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
  if (description != null && !checkLongString(description)) throw new APIError('描述非法')
  if (email != null && checkEmail(email)) throw new APIError('邮箱非法')
  if (nickname != null && checkShortString(nickname)) throw new APIError('昵称非法')
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
  if ((username == null) == (userId == null)) throw new APIError('用户ID和用户名不能同时存在或同时为空')
  if (username != null && !checkUserName(username)) throw new APIError('用户名非法')
  if (userId != null && !checkBigInt(userId)) throw new APIError('用户ID非法')
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
  if (!_id.every((x) => checkBigInt(x))) throw new APIError('需要整数')
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
  if (!checkShortString(nickname)) throw new APIError('昵称非法')
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
