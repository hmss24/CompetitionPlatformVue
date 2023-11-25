import { redisClient } from "./redis";
import { verifyToken } from "./token_util";

// 验证token
export async function tokenVerify(token: string, userid: string) {
  try {
    const reply = await redisClient.get(`${userid}\t${token}`);
    if (reply == null) throw { msg: "Not found" };
    await verifyToken(token);
    return true;
  } catch {
    throw { msg: "Error for Redis" };
  }
}

// 添加token
export async function tokenAdd(token: string, userid: string) {
  if (typeof token != "string" || typeof userid != "string") return null;
  return await redisClient.set(`${userid}\t${token}`, 1);
}

// 删除token
export async function tokenDelete(token: string, userid: string) {
  if (typeof token != "string" || typeof userid != "string") return 0;
  return await redisClient.del(`${userid}\t${token}`);
}
