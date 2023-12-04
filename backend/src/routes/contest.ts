import CategoryModel from "@/models/CategoryModel";
import ContestModel from "@/models/ContestModel";
import { QUERY_MAX_LIMIT, errorcode, tips } from "@/utils/conf";
import {
  checkBigInt,
  checkLongString,
  checkPermission,
  checkShortString,
  getBigInt,
  getOrder,
  makeArgumentsError,
  makeInternelError,
} from "@/utils/utils";
import dayjs from "dayjs";
import express from "express";
import { FindAndCountOptions, Op } from "sequelize";
import { deleteRecordsByContest } from "./record";
import UserModel from "@/models/UserModel";

const router = express.Router();

router.post("/add", async (request, response) => {
  const categoryId = getBigInt(request.body.categoryId);
  const title: string = request.body.title;
  const description: string | null = request.body.description;

  if (
    categoryId == null ||
    !checkShortString(title) ||
    !checkLongString(description)
  )
    return response.json(makeArgumentsError());

  const userId = request.headers["userid"] as string;
  try {
    if ((await CategoryModel.findOne({ where: { categoryId } })) != null)
      return response.json({
        code: errorcode.NONEXISTING,
        msg: tips.NONEXISTING,
      });
    if ((await UserModel.findOne({ where: { userId } })) != null)
      return response.json({
        code: errorcode.NONEXISTING,
        msg: tips.NONEXISTING,
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
  const contestId = request.query.contestId;
  if (!checkBigInt(contestId)) return response.json(makeArgumentsError());

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
    await deleteRecordsByContest(contestId as any);
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

  if (!checkBigInt(contestId)) return response.json(makeArgumentsError());
  if (categoryId == null && request.body.categoryId != null)
    return response.json(makeArgumentsError());
  if (title != null && !checkShortString(title))
    return response.json(makeArgumentsError());
  if (description != null && !checkLongString(description))
    return response.json(makeArgumentsError());

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
  const contestId = request.query.contestId;
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
      contestId: svalue.contestId,
      userId: svalue.userId,
      categoryId: svalue.categoryId,

      title: svalue.title,
      description: svalue.description,

      createdTime: svalue.createdTime,
      updatedTime: svalue.updatedTime,
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.get("/list", async (request, response) => {
  const {
    userId,
    categoryId,
    title,
    createdTime,
    updatedTime,
    _offset,
    _limit,
    order,
  } = request.query;
  const where: any = {};
  const opt: Omit<FindAndCountOptions<any>, "group"> = { where };

  if (userId == null) {
  } else if (checkBigInt(userId)) where.userId = userId;
  else return response.json(makeArgumentsError());

  if (categoryId == null) {
  } else if (checkBigInt(categoryId)) where.categoryId = categoryId;
  else return response.json(makeArgumentsError());

  if (title == null) {
  } else if (checkShortString(title)) where.title = { [Op.like]: `%${title}%` };
  else return response.json(makeArgumentsError());

  if (createdTime == null) {
  } else if (
    createdTime instanceof Array &&
    createdTime.every((x) => typeof x == "string" || typeof x == "number")
  ) {
    switch (createdTime.length) {
      case 0:
        break; // ignore
      case 1:
        where.createdTime = {
          [Op.like]: dayjs(createdTime[0] as any).toDate(),
        };
        break;
      case 2:
        where.createdTime = {
          [Op.gte]: dayjs(createdTime[0] as any).toDate(),
          [Op.lte]: dayjs(createdTime[1] as any).toDate(),
        };
        break;
    }
  } else return response.json(makeArgumentsError());

  if (updatedTime == null) {
  } else if (
    updatedTime instanceof Array &&
    updatedTime.every((x) => typeof x == "string" || typeof x == "number")
  ) {
    switch (updatedTime.length) {
      case 0:
        break; // ignore
      case 1:
        where.updatedTime = {
          [Op.like]: dayjs(updatedTime[0] as any).toDate(),
        };
        break;
      case 2:
        where.updatedTime = {
          [Op.gte]: dayjs(updatedTime[0] as any).toDate(),
          [Op.lte]: dayjs(updatedTime[1] as any).toDate(),
        };
        break;
    }
  } else return response.json(makeArgumentsError());

  if (typeof _limit == "number" || typeof _limit == "string") {
    const limit = +_limit;
    if (limit > QUERY_MAX_LIMIT || limit < 0 || isNaN(limit))
      return response.json(makeArgumentsError());
    opt.limit = limit;
  } else if (_limit == null) opt.limit = 100;
  else return response.json(makeArgumentsError());

  if (typeof _offset == "number" || typeof _offset == "string") {
    const offset = +_offset;
    if (offset < 0 || isNaN(offset)) return response.json(makeArgumentsError());
    opt.offset = offset;
  } else if (_offset == null) opt.offset = 0;
  else return response.json(makeArgumentsError());

  opt.include = [
    { model: UserModel, as: "userTable" },
    { model: CategoryModel, as: "categoryTable" },
  ];
  opt.order = getOrder(order)?.map((x) => {
    switch (x[0]) {
      case "nickname":
        return ["userTable", ...x];
      case "categoryName":
        return ["categoryTable", ...x];
      default:
        return x;
    }
  });

  try {
    const svalue = await ContestModel.findAndCountAll(opt);
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.CONTEST_LIST_SUCCESS,
      count: svalue.count,
      data: svalue.rows.map((x) => ({
        contestId: x.contestId,
        userId: x.userId,
        categoryId: x.categoryId,

        nickname: ((x as any).userTable as UserModel).nickname,
        categoryName: ((x as any).categoryTable as CategoryModel).name,

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

export default router;
