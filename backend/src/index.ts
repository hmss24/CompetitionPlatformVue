import { errorcode, tips, white_list } from "@/utils/conf";
import { redisClient } from "@/utils/redis";
import { tokenVerify } from "@/utils/token";
import { cookieInstance } from "@/utils/token_util";
import cors from "cors";
import express from "express";
import * as path from "path";
const app = express();

// Redis服务器
redisClient.connect().catch((error) => {
  console.log("Cannot open redis, quiting...");
  process.exit(1);
});
process.on("exit", () => redisClient.quit());

app.use(cookieInstance); // 配置cookie
app.use(express.urlencoded({ extended: false })); // 接受post请求数据
app.use(express.json());

// 资源配置
app.use("/source", express.static(path.resolve(__dirname, "../", "public")));

// 跨域配置
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:8080"],
    credentials: true,
  })
);

// 全局拦截检查Token，白名单中的路由可以直接放行，其余的需要检查登录信息
async function tokenRouteChecker(
  req: express.Request,
  resp: express.Response,
  next: express.NextFunction
) {
  const { baseUrl } = req;
  if (white_list.includes(baseUrl) || baseUrl.startsWith("/source"))
    return next();
  const { userid, token } = req.headers;
  if (userid == null || token == null)
    return resp.json({
      code: errorcode.TOKEN_FAILED,
      msg: tips.TOKEN_UNDEFINED,
    });
  try {
    if (token instanceof Array || userid instanceof Array) {
      return resp.json({
        code: errorcode.TOKEN_FAILED,
        msg: tips.UNKNOWN_ERROR,
      });
    }
    await tokenVerify(token, userid);
    next();
  } catch (e) {
    switch (e.msg) {
      case "TokenExpiredError":
        return resp.json({
          code: errorcode.TOKEN_OUTDATED,
          msg: tips.TOKEN_OUTDATE,
        });
      case "JsonWebTokenError":
        return resp.json({
          code: errorcode.TOKEN_FAILED,
          msg: tips.TOKEN_UNDEFINED,
        });
    }
    return resp.json({ code: errorcode.UNKNOWN, msg: tips.UNKNOWN_ERROR });
  }
}
// app.use("*", tokenRouteChecker);

import categoryRouter from "@/routes/category";
import contestRouter from "@/routes/contest";
import recordRouter from "@/routes/record";
import userRouter from "@/routes/user";
app.use("/user", userRouter);
app.use("/category", categoryRouter);
app.use("/contest", contestRouter);
app.use("/record", recordRouter);

app.listen(9001);
