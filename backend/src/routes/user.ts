import UserModel from "@/models/UserModel";
import { errorcode, tips } from "@/utils/conf";
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
  makeInternelError,
} from "@/utils/utils";
import dayjs from "dayjs";
import express from "express";
import { Op } from "sequelize";

const router = express.Router();

router.post("/signup", async (request, response) => {
  const username: string = request.body.username;
  const nickname: string = request.body.nickname;
  const password: string = request.body.password;
  const email: string | null = request.body.email;
  const description: string | null = request.body.description;

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
  if (email != null || !checkEmail(email))
    return response.json({
      code: errorcode.USER_REGISTER_FAILED,
      msg: tips.REGISTER_FAILED_EMAIL_ILLEGAL,
    });
  if (description != null || !checkLongString(description))
    return response.json({
      code: errorcode.USER_REGISTER_FAILED,
      msg: tips.REGISTER_FAILED_DESCRIPTION_ILLEGAL,
    });

  try {
    if ((await UserModel.findOne({ where: { username: username } })) != null) {
      return response.json({
        code: errorcode.USER_REGISTER_EXIST,
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
      description,
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
    response.setHeader(
      "Access-Control-Expose-Headers",
      `token,username,userid`
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

  try {
    const value = await UserModel.findOne({
      where: { userId: request.headers["userid"] },
    });
    if (description != null) value.set("description", description);
    if (email != null) value.set("email", email);
    if (nickname != null) value.set("nickname", nickname);
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
  const username: string = request.body.username;
  const userId =
    getBigInt(request.body.userId) ??
    (request.body.userId ? request.headers["userid"].toString() : null);
  if (userId == null && request.body.userId != null)
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });
  if (!checkUserName(username))
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
      createdTime: dayjs(svalue.createdTime).format(),
      updatedTime: dayjs(svalue.updatedTime).format(),
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.get("/query_id", async (request, response) => {
  const _userIds = request.body.userId;
  const userIds = _userIds instanceof Array ? _userIds : [_userIds];
  if (!userIds.every((x) => checkBigInt(x)))
    return response.json({
      code: errorcode.USER_QUERY_ERROR,
      msg: tips.USER_QUERY_FAILED_BAD_FORMAT,
    });
  try {
    const datas = await UserModel.findAll({ where: { userId: [userIds] } });
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.USER_QUERY_SUCCESS,
      data: datas.map((x) => ({
        userId: x.userId,
        username: x.username,
        nickname: x.nickname,
        email: x.email,
        description: x.description,
        createdTime: dayjs(x.createdTime).format(),
        updatedTime: dayjs(x.updatedTime).format(),
      })),
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.get("/search", async (request, response) => {
  const nickname: string = request.body.nickname;
  if (!checkShortString(nickname))
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });
  try {
    const svalue = await UserModel.findAll({
      where: { nickname: { [Op.like]: `%${nickname}%` } },
    });
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.USER_SEARCH_SUCCESS,
      data: svalue.map((x) => ({
        userId: x.userId,
        username: x.username,
        nickname: x.nickname,
        email: x.email,
        description: x.description,
        createdTime: dayjs(x.createdTime).format(),
        updatedTime: dayjs(x.updatedTime).format(),
      })),
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

export default router;
