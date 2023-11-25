import CategoryModel from "@/models/CategoryModel";
import ContestModel from "@/models/ContestModel";
import { QUERY_MAX_LIMIT, errorcode, tips } from "@/utils/conf";
import {
  checkBigInt,
  checkLongString,
  checkPermission,
  checkShortString,
  getBigInt,
  makeInternelError,
} from "@/utils/utils";
import dayjs from "dayjs";
import express from "express";
import { Op } from "sequelize";
import { deleteRecordsByContest } from "./record";

const router = express.Router();

router.post("/add", async (request, response) => {
  const categoryId = getBigInt(request.body.categoryId);
  const title: string = request.body.title;
  const description: string | null = request.body.description;

  if (categoryId == null)
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });
  if (!checkShortString(title))
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });
  if (!checkLongString(description))
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  const userId = request.headers["userid"] as string;
  try {
    if ((await CategoryModel.findOne({ where: { categoryId } })) != null)
      return response.json({
        code: errorcode.BAD_ARGUMENTS,
        msg: tips.BAD_ARGUMENTS,
      });
    const svalue = await ContestModel.create({
      userId,
      categoryId,
      title,
      description,
      createdTime: new Date(),
      updatedTime: new Date(),
    });
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.CONTEST_ADD_SUCCESS,
      contestId: svalue.contestId,
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.delete("/delete", async (request, response) => {
  const contestId = request.body.contestId;
  if (!checkBigInt(contestId))
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  try {
    const svalue = await ContestModel.findOne({ where: { contestId } });
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
    await deleteRecordsByContest(contestId);
    await svalue.destroy();
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.CONTEST_DELETE_SUCCESS,
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.post("/modify", async (request, response) => {
  const contestId: string = request.body.contestId;
  const categoryId = getBigInt(request.body.categoryId);
  const title: string | null = request.body.title;
  const description: string | null = request.body.description;

  if (!checkBigInt(contestId))
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });
  if (categoryId == null && request.body.categoryId != null)
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });
  if (title != null && !checkShortString(title))
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
    if (
      categoryId != null &&
      (await CategoryModel.count({ where: { categoryId } })) < 1
    )
      return response.json({
        code: errorcode.NONEXISTING,
        msg: tips.NONEXISTING,
      });
    const svalue = await ContestModel.findOne({ where: { contestId } });
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
    if (categoryId != null) svalue.set("categoryId", categoryId);
    if (title != null) svalue.set("title", title);
    if (description != null) svalue.set("description", description);
    svalue.set("updatedTime", new Date());
    await svalue.save();
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.CONTEST_MODIFY_SUCCESS,
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.get("/query", async (request, response) => {
  const contestId = request.body.contestId;
  if (!checkBigInt(contestId))
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  try {
    const svalue = await ContestModel.findOne({ where: { contestId } });
    if (svalue == null)
      return response.json({
        code: errorcode.NONEXISTING,
        msg: tips.NONEXISTING,
      });
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.CONTEST_QUERY_SUCCESS,
      data: {
        contestId: svalue.contestId,
        userId: svalue.userId,
        categoryId: svalue.categoryId,

        title: svalue.title,
        description: svalue.description,

        createdTime: dayjs(svalue.createdTime).format(),
        updatedTime: dayjs(svalue.updatedTime).format(),
      },
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.get("/list", async (request, response) => {
  const userId: string | null = request.body.userId;
  const categoryId: string | null = request.body.categoryId;
  const title: string | null = request.body.title;
  if (
    (userId != null && typeof userId != "string") ||
    (categoryId != null && typeof categoryId != "string") ||
    (title != null && typeof title != "string")
  )
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
  if (lim > QUERY_MAX_LIMIT) {
    return response.json({
      code: errorcode.CONTEST_LIST_ERROR,
      msg: tips.CONTEST_LIST_FAILED_TOO_MANY,
    });
  }

  try {
    const where: any = {};
    if (userId != null) where.userId = userId;
    if (categoryId != null) where.categoryId = categoryId;
    if (title != null) where.title = { [Op.like]: `%${title}%` };

    const svalue = await ContestModel.findAll({
      where,
      offset: start,
      limit: lim,
      order: [["contestId", "DESC"]],
    });
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.CONTEST_LIST_SUCCESS,
      data: svalue.map((x) => ({
        contestId: x.contestId,
        userId: x.userId,
        categoryId: x.categoryId,

        title: x.title,
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
  const userId: string | null = request.body.userId;
  const categoryId: string | null = request.body.categoryId;
  const title: string | null = request.body.title;
  if (
    (userId != null && typeof userId != "string") ||
    (categoryId != null && typeof categoryId != "string") ||
    (title != null && typeof title != "string")
  )
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
    const where: any = {};
    if (userId != null) where.userId = userId;
    if (categoryId != null) where.categoryId = categoryId;
    if (title != null) where.title = { [Op.like]: `%${title}%` };

    const count = await ContestModel.count({ where });
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.CONTEST_LIST_SUCCESS,
      count: count,
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

export default router;
