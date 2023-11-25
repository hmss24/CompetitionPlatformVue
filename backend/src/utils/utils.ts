import { errorcode, tips } from "@/utils/conf";

export function getBigInt(num: any): BigInt | number | null {
  if (num instanceof BigInt) return num;
  else if (typeof num == "string") {
    try {
      return BigInt(num);
    } catch {
      return null;
    }
  } else if (typeof num == "number") return Number.isInteger(num) ? num : null;
  return null;
}
export function checkBigInt(num: any) {
  if (num instanceof BigInt) return true;
  else if (typeof num == "string") {
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
    username == "string" &&
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

export function checkShortString(s: string) {
  if (typeof s != "string") return false;
  return !(s.length < 1 || s.length > 50);
}
export function checkLongString(s: string) {
  if (typeof s != "string") return false;
  return s.length < 1024;
}

export function checkPermission(user: any, author: string) {
  return user == author;
}

export function makeInternelError(e: Error) {
  return {
    code: errorcode.INTERNEL_ERROR,
    msg: tips.INTERNEL_ERROR,
  };
}
