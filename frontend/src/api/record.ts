import request, { APIError, generateHeader } from './request'
import { checkBigInt } from './utils'

export async function apiRecordAdd(conf: {
  contestId: string | number
  data:
    | { playerId: string | number; score: number }[]
    | { playerId: string | number; score: number }
}) {
  const data = conf.data instanceof Array ? conf.data : [conf.data]
  if (!checkBigInt(conf.contestId)) throw new APIError('比赛ID非法')
  if (!data.every((x) => checkBigInt(x.playerId) && typeof x.score == 'number'))
    throw new APIError('记录形式错误')
  return (
    await request.post(
      '/record/add',
      { contestId: conf.contestId, data },
      { headers: generateHeader() ?? {} }
    )
  ).data.id as string
}

export async function apiRecordDelete(ids: (string | number)[] | string | number) {
  const recordId = ids instanceof Array ? ids : [ids]
  if (!recordId.every((x) => checkBigInt(x))) throw new APIError('记录ID非法')
  await request.delete('/record/delete', { data: { recordId }, headers: generateHeader() ?? {} })
  return
}

export async function apiRecordDeleteByContest(contestId: string | number) {
  if (!checkBigInt(contestId)) throw new APIError('比赛ID非法')
  await request.delete('/record/delete_by_contest', {
    data: { contestId },
    headers: generateHeader() ?? {}
  })
  return
}

export async function apiRecordModify(
  data:
    | { recordId: string | number; playerId?: string | number; score?: number }[]
    | { recordId: string | number; playerId?: string | number; score?: number }
) {
  data = data instanceof Array ? data : [data]
  if (
    !data.every(
      (x) =>
        (x.playerId == null || checkBigInt(x.playerId)) && (x.score == null || checkBigInt(x.score))
    )
  )
    throw new APIError('记录形式错误')
  await request.post('/record/modify', { data }, { headers: generateHeader() ?? {} })
  return
}

export async function apiRecordQuery(recordId: (string | number)[] | string | number) {
  recordId = recordId instanceof Array ? recordId : [recordId]
  if (!recordId.every((x) => checkBigInt(x))) throw new APIError('记录ID非法')
  return ((await request.get('/record/query', { data: { recordId } })).data.data as any[]).map(
    (x) => ({
      recordId: x.recordId as string,
      contestId: x.contestId as string,
      playerId: x.playerId as string,
      score: x.score as number
    })
  )
}

export async function apiRecordList(conf: {
  contestId?: string | number
  playerId?: string | number
  limit?: number
  offset?: number
  order?: string[]
}) {
  if (!checkBigInt(conf.contestId)) throw new APIError('比赛ID非法')
  const data = (await request.get('/record/list', { data: { conf } })).data
  return {
    count: data.count as number,
    data: (data.data as any[]).map((x) => ({
      recordId: x.recordId as string,
      contestId: x.contestId as string,
      playerId: x.playerId as string,
      score: x.score as number,
      playerNickname: x.playerNickname as string
    }))
  }
}
