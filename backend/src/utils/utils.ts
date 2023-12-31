import { errorcode, tips } from "@/utils/conf";
import { type } from "os";

export function getBigInt(num: any): string | number | null {
  if (typeof num == "bigint") return num.toString();
  else if (typeof num == "string") {
    try {
      return BigInt(num).toString();
    } catch {
      return null;
    }
  } else if (typeof num == "number") return Number.isInteger(num) ? num : null;
  return null;
}
export function checkBigInt(num: any) {
  // if (typeof num == "bigint") return true;
  if (typeof num == "string") {
    try {
      BigInt(num);
      return true;
    } catch {
      return false;
    }
  } else if (typeof num == "number") return Number.isInteger(num);
  return false;
}

export function checkUserName(username: string) {
  return (
    typeof username == "string" &&
    username.length >= 1 &&
    username.length <= 50 &&
    username.search(/[\p{C}\p{Z}\p{M}\p{P}\p{S}]/u) == -1
  );
}
export function checkPassword(password: string) {
  return (
    typeof password == "string" &&
    /^[!-~]{8,50}$/.test(password) &&
    password.search(/[A-Z]/) != -1 &&
    password.search(/[a-z]/) != -1 &&
    password.search(/[0-9]/) != -1
  );
}
export function checkEmail(email: string) {
  return (
    typeof email == "string" &&
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
      email
    ) &&
    email.length < 100
  );
}

export function checkShortString(s: any) {
  if (typeof s != "string") return false;
  return !(s.length < 1 || s.length > 50);
}
export function checkLongString(s: any) {
  if (typeof s != "string") return false;
  return s.length < 10000;
}

export function checkPermission(user: any, author: string) {
  return user == author;
}

export function makeInternelError(e: any) {
  console.log(e);
  return {
    code: errorcode.INTERNEL_ERROR,
    msg: tips.INTERNEL_ERROR,
  };
}
export function makeArgumentsError() {
  return { code: errorcode.BAD_ARGUMENTS, msg: tips.BAD_ARGUMENTS };
}

/**
 * 从request中获取排序要求
 * @returns 列表，或者null表示转化失败
 */
export function getOrder(order: any) {
  if (typeof order == "string") order = [order];
  if (order instanceof Array) {
    if (!order.every((x) => typeof x == "string")) return null;
    const set = new Set<string>();
    const ret: [string, string][] = [];
    for (let x of order as string[]) {
      if (x.length == 0) return null;
      if (x[0] == "-") {
        const key = x.substring(1);
        if (set.has(key)) return null;
        ret.push([key, "DESC"]);
      } else {
        const key = x[0] == "+" ? x.substring(1) : x;
        if (set.has(key)) return null;
        ret.push([key, "ASC"]);
      }
    }
    return ret;
  } else return [];
}
