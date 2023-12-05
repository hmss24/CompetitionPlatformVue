import UserModel from "@/models/UserModel";
import { QUERY_MAX_LIMIT, errorcode, tips } from "@/utils/conf";
import { tokenAdd, tokenDelete } from "@/utils/token";
import { decryptAES, encryptAES, generateToken } from "@/utils/token_util";
import {
  checkBigInt,
  checkEmail,
  checkLongString,
  checkPassword,
  checkShortString,
  checkUserName,
  getBigInt,
  makeArgumentsError,
  makeInternelError,
} from "@/utils/utils";
import dayjs from "dayjs";
import express, { response } from "express";
import { FindAndCountOptions, Op, or } from "sequelize";

const router = express.Router();

router.post("/signup", async (request, response) => {
  const username: string = request.body.username;
  const nickname: string = request.body.nickname ?? username;
  const password: string = request.body.password;
  const email: string | null = request.body.email;

  if (!checkUserName(username))
    return response.json({
      code: errorcode.USER_REGISTER_FAILED,
      msg: tips.REGISTER_FAILED_USERNAME_ILLEGAL,
    });
  if (!checkPassword(password))
    return response.json({
      code: errorcode.USER_REGISTER_FAILED,
      msg: tips.REGISTER_FAILED_PASSWORD_ILLEGAL,
    });
  if (!checkShortString(nickname))
    return response.json({
      code: errorcode.USER_REGISTER_FAILED,
      msg: tips.REGISTER_FAILED_NICKNAME_ILLEGAL,
    });
  if (email != null && !checkEmail(email))
    return response.json({
      code: errorcode.USER_REGISTER_FAILED,
      msg: tips.REGISTER_FAILED_EMAIL_ILLEGAL,
    });

  try {
    if ((await UserModel.findOne({ where: { username: username } })) != null) {
      return response.json({
        code: errorcode.USER_REGISTER_EXISTING,
        msg: tips.REGISTER_FAILED_USERNAME_EXISTING,
      });
    }
  } catch (e) {
    return response.json(makeInternelError(e));
  }

  const encryptedPassword = encryptAES(password);
  try {
    await UserModel.create({
      username,

      nickname,
      password: encryptedPassword,
      email,
      createdTime: new Date(),
      updatedTime: new Date(),
    });
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.REGISTER_SUCCESS,
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.post("/login", async (request, response) => {
  const username: string = request.body.username;
  const password: string = request.body.password;

  if (!checkUserName(username))
    return response.json({
      code: errorcode.USER_LOGIN_ERROR,
      msg: tips.LOGIN_FAILED_USERNAME_ILLEGAL,
    });
  if (!checkPassword(password))
    return response.json({
      code: errorcode.USER_LOGIN_ERROR,
      msg: tips.LOGIN_FAILED_PASSWORD_ILLEGAL,
    });

  try {
    const svalue = await UserModel.findOne({ where: { username } });
    if (svalue == null)
      return response.json({
        code: errorcode.NONEXISTING,
        msg: tips.NONEXISTING,
      });
    if (decryptAES(svalue.password) != password)
      return response.json({
        code: errorcode.USER_LOGIN_ERROR,
        msg: tips.LOGIN_FAILED_PASSWORD_INCORRECT,
      });
    const token = await generateToken({ username }, "3d");
    response.setHeader("token", token.toString());
    response.setHeader("userid", svalue.userId.toString());
    response.setHeader("username", username.toString());
    response.setHeader("nickname", svalue.nickname.toString());
    response.setHeader(
      "Access-Control-Expose-Headers",
      "token,username,userid"
    );
    tokenAdd(token, svalue.userId);
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.LOGIN_SUCCESS,
      nickname: svalue.nickname,
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.delete("/logout", async (request, response) => {
  try {
    await tokenDelete(request.get("token"), request.get("userid"));
    return response.json({ code: errorcode.SUCCESS, msg: tips.LOGOUT_SUCCESS });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.post("/modify", async (request, response) => {
  const description: string | null = request.body.description;
  const email: string | null = request.body.email;
  const nickname: string | null = request.body.nickname;
  const extra: string | null = request.body.extra;

  if (description != null && !checkLongString(description))
    return response.json({
      code: errorcode.USER_MODIFY_ERROR,
      msg: tips.USER_MODIFY_FAILED_DESCRIPTION_ILLEGAL,
    });
  if (email != null && !checkEmail(email))
    return response.json({
      code: errorcode.USER_MODIFY_ERROR,
      msg: tips.USER_MODIFY_FAILED_EMAIL_ILLEGAL,
    });
  if (nickname != null && !checkShortString(nickname))
    return response.json({
      code: errorcode.USER_MODIFY_ERROR,
      msg: tips.USER_MODIFY_FAILED_NICKNAME_ILLEGAL,
    });
  if (extra != null && !checkLongString(extra))
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  try {
    const value = await UserModel.findOne({
      where: { userId: request.headers["userid"] },
    });
    if (description != null) value.set("description", description);
    if (email != null) value.set("email", email);
    if (nickname != null) value.set("nickname", nickname);
    if (extra != null) value.set("extra", extra);
    value.set("updatedTime", new Date());
    await value.save();
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.USER_MODIFY_SUCCESS,
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.get("/query", async (request, response) => {
  const username = request.query.username as string;
  const userId =
    getBigInt(request.query.userId) ??
    (request.query.userId ? request.headers["userid"].toString() : null);
  if (userId == null && request.query.userId != null)
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });
  if (userId == null && !checkUserName(username))
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  try {
    const svalue = await UserModel.findOne({
      where: userId != null ? { userId } : { username },
    });
    if (svalue == null)
      return response.json({
        code: errorcode.NONEXISTING,
        msg: tips.NONEXISTING,
      });
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.USER_QUERY_SUCCESS,
      userId: svalue.userId,
      username: svalue.username,
      nickname: svalue.nickname,
      email: svalue.email,
      description: svalue.description,
      extra: svalue.extra,
      createdTime: dayjs(svalue.createdTime).format(),
      updatedTime: dayjs(svalue.updatedTime).format(),
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.get("/list", async (request, response) => {
  const opt: Omit<FindAndCountOptions<any>, "group"> = {};
  const { nickname, _offset, _limit } = request.query;

  if (typeof nickname == "string") {
    if (nickname.length > 1 && !checkShortString(nickname)) return response.json(makeArgumentsError());
    opt.where = { nickname: { [Op.like]: `%${nickname}%` } };
  } else if (nickname != null) return response.json(makeArgumentsError());
  
  if (typeof _limit == "number" || typeof _limit == 'string') {
    const limit = +_limit;
    if (limit > QUERY_MAX_LIMIT || limit < 0 || isNaN(limit))
      return response.json(makeArgumentsError());
    opt.limit = limit;
  } else if (_limit == null) opt.limit = 100;
  else return response.json(makeArgumentsError());

  if (typeof _offset == "number" || typeof _offset == 'string') {
    const offset = +_offset;
    if (offset < 0 || isNaN(offset)) return response.json(makeArgumentsError());
    opt.offset = offset;
  } else if (_offset == null) opt.offset = 0;
  else return response.json(makeArgumentsError());

  try {
    const svalue = await UserModel.findAndCountAll(opt);
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.USER_LIST_SUCCESS,
      count: svalue.count,
      data: svalue.rows.map((x) => ({
        userId: x.userId,
        username: x.username,
        nickname: x.nickname,
        email: x.email,
        description: x.description,
        extra: x.extra,
        createdTime: dayjs(x.createdTime).format(),
        updatedTime: dayjs(x.updatedTime).format(),
      })),
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

export default router;
