import CategoryModel from "@/models/CategoryModel";
import { QUERY_MAX_LIMIT, errorcode, tips } from "@/utils/conf";
import {
  checkLongString,
  checkPermission,
  checkShortString,
  getBigInt,
  makeInternelError,
} from "@/utils/utils";
import dayjs from "dayjs";
import express from "express";
import { ValidationError } from "sequelize";

const router = express.Router();

router.get("/query", async (request, response) => {
  const categoryId = getBigInt(request.body.categoryId);
  if (categoryId == null)
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  try {
    const svalue = await CategoryModel.findOne({ where: { categoryId } });
    if (svalue == null)
      return response.json({
        code: errorcode.NONEXISTING,
        msg: tips.NONEXISTING,
      });
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.CATEGORY_QUERY_SUCCESS,
      data: {
        categoryId: svalue.categoryId,
        userId: svalue.userId,
        name: svalue.name,
        description: svalue.description,
        createdTime: dayjs(svalue.createdTime).format(),
        updatedTime: dayjs(svalue.updatedTime).format(),
      },
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.post("/add", async (request, response) => {
  const name: string = request.body.name;
  const description: string | null = request.body.description;
  if (!checkShortString(name))
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });
  if (description != null && !checkLongString(description))
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  try {
    const svalue = await CategoryModel.create({
      userId: request.headers["userid"],
      name,
      description,
      createdTime: new Date(),
      updatedTime: new Date(),
    });
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.CATEGORY_ADD_SUCCESS,
      categoryId: svalue.categoryId,
    });
  } catch (e) {
    if (e instanceof ValidationError)
      if (e.errors.some((x) => x.type == "unique violation"))
        return response.json({
          code: errorcode.CATEGORY_ADD_ERROR,
          msg: tips.CATEGORY_ADD_FAILED_NAME_EXISTING,
        });
    return response.json(makeInternelError(e));
  }
});

router.post("/modify", async (request, response) => {
  const categoryId = getBigInt(request.body.categoryId);
  const name: string | null = request.body.name;
  const description: string | null = request.body.description;
  if (categoryId == null)
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });
  if (description != null && !checkLongString(description))
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });
  if (name != null && !checkShortString(name))
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  try {
    const svalue = await CategoryModel.findOne({
      where: { categoryId },
    });
    if (svalue == null)
      return response.json({
        code: errorcode.NONEXISTING,
        msg: tips.NONEXISTING,
      });
    if (!checkPermission(request.headers["userid"], svalue.userId))
      return response.json({
        code: errorcode.NO_PERMISSION,
        msg: tips.NO_PERMISSION,
      });
    if (name != null) svalue.set("name", name);
    if (description != null) svalue.set("description", description);
    svalue.set("updatedTime", new Date());
    await svalue.save();
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.CATEGORY_MODIFY_SUCCESS,
    });
  } catch (e) {
    if (e instanceof ValidationError)
      if (e.errors.some((x) => x.type == "unique violation"))
        return response.json({
          code: errorcode.CATEGORY_MODIFY_ERROR,
          msg: tips.CATEGORY_MODIFY_FAILED_NAME_EXISTING,
        });
    return response.json(makeInternelError(e));
  }
});

router.get("/list", async (request, response) => {
  const userId = getBigInt(request.body.userId);
  if (userId == null && request.body.userId != null)
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  let start: number, lim: number;
  try {
    if (request.body.start) {
      start = parseInt(request.body.start);
      if (!Number.isInteger(start)) throw TypeError("integer desired");
    } else start = 0;
    if (request.body.lim) {
      lim = parseInt(request.body.lim);
      if (!Number.isInteger(lim)) throw TypeError("integer desired");
    } else lim = QUERY_MAX_LIMIT;
  } catch (e) {
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });
  }
  if (lim > QUERY_MAX_LIMIT)
    return response.json({
      code: errorcode.CATEGORY_LIST_ERROR,
      msg: tips.CATEGORY_LIST_FAILED_TOO_MANY,
    });

  try {
    const svalue = await CategoryModel.findAll({
      where: userId ? { userId } : undefined,
      offset: start,
      limit: lim,
      order: [["categoryId", "DESC"]],
    });
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.CATEGORY_LIST_SUCCESS,
      data: svalue.map((x) => ({
        categoryId: x.categoryId,
        userId: x.userId,
        name: x.name,
        description: x.description,
        createdTime: dayjs(x.createdTime).format(),
        updatedTime: dayjs(x.updatedTime).format(),
      })),
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.get("/list_count", async (request, response) => {
  const userId = getBigInt(request.body.userId);
  if (userId == null && request.body.userId != null)
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  try {
    const count = await CategoryModel.count({ where: { userId } });
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.CATEGORY_LIST_SUCCESS,
      count: count,
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

export default router;
