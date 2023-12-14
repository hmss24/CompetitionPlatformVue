export function getBigInt(num: any): string | number | null {
  if (typeof num == 'bigint') return num.toString()
  else if (typeof num == 'string') {
    try {
      return BigInt(num).toString()
    } catch {
      return null
    }
  } else if (typeof num == 'number') return Number.isInteger(num) ? num : null
  return null
}
export function checkBigInt(num: any) {
  // if (typeof num == 'bigint') return true;
  if (typeof num == 'string') {
    try {
      BigInt(num)
      return true
    } catch {
      return false
    }
  } else if (typeof num == 'number') return Number.isInteger(num)
  return false
}

export function checkUserName(username: string) {
  return (
    typeof username == 'string' &&
    username.length >= 1 &&
    username.length <= 50 &&
    username.search(/[\p{C}\p{Z}\p{M}\p{P}\p{S}]/u) == -1
  )
}
export function checkPassword(password: string) {
  return (
    typeof password == 'string' &&
    /^[!-~]{8,50}$/.test(password) &&
    password.search(/[A-Z]/) != -1 &&
    password.search(/[a-z]/) != -1 &&
    password.search(/[0-9]/) != -1
  )
}
export function checkEmail(email: string) {
  return (
    typeof email == 'string' &&
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
      email
    ) &&
    email.length < 100
  )
}

export function checkShortString(s: string) {
  if (typeof s != 'string') return false
  return !(s.length < 1 || s.length > 50)
}
export function checkLongString(s: string) {
  if (typeof s != 'string') return false
  return s.length < 10000
}
export function checkEmptyObject(x: object) {
  if (typeof x != 'object' && x != null) return false
  for (const v in x) return false
  return true
}

export function checkPermission(user: any, author: string) {
  return user == author
}

export class TimeCallExceedError extends Error {
  constructor(msg: string = '函数执行超时') {
    super(msg)
  }
}

/**
 * 执行函数，超时则抛出TimeCallExceedError。
 *
 * @param timeout 时限（毫秒为单位）
 * @param fn 函数
 * @param thisArg this目标（默认设置为undefined）
 * @param args 函数参数
 * @returns 包裹原函数返回值的Promise
 */
export async function timeoutCall<ReturnT>(
  timeout: number,
  fn: (...args: any) => ReturnT,
  thisArg: any = undefined,
  ...args: any
): Promise<ReturnT> {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new TimeCallExceedError()), timeout)
    try {
      const ret = fn.call(thisArg, ...args)
      resolve(ret)
    } catch (e) {
      reject(e)
    }
  })
}

export async function asyncMap<ValueT, ReturnT>(
  array: Iterable<ValueT>,
  fn: (value: ValueT) => Promise<ReturnT>
): Promise<ReturnT[]> {
  const ret: ReturnT[] = []
  for (const x of array) ret.push(await fn(x))
  return ret
}
export async function asyncMapNonull<ValueT, ReturnT>(
  array: Iterable<ValueT>,
  fn: (value: ValueT) => Promise<ReturnT>
): Promise<NonNullable<ReturnT>[]> {
  const ret: NonNullable<ReturnT>[] = []
  for (const x of array) {
    const fn_ret = await fn(x)
    if (fn_ret != null) ret.push(fn_ret)
  }
  return ret
}
export function mapNonull<ValueT, ReturnT>(
  array: Iterable<ValueT>,
  fn: (value: ValueT) => ReturnT
): NonNullable<ReturnT>[] {
  const ret: NonNullable<ReturnT>[] = []
  for (const x of array) {
    const fn_ret = fn(x)
    if (fn_ret != null) ret.push(fn_ret)
  }
  return ret
}
