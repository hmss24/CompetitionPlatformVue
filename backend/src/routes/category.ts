import CategoryModel from "@/models/CategoryModel";
import ContestModel from "@/models/ContestModel";
import UserModel from "@/models/UserModel";
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
import { FindAndCountOptions, Op, ValidationError, or } from "sequelize";

const router = express.Router();

router.get("/query", async (request, response) => {
  const categoryId: string | number = request.body.categoryId;
  const name: string = request.body.name;
  if (!checkBigInt(categoryId) && request.body.categoryId != null)
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });
  if (!checkShortString(name) && request.body.name != null)
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });
  if (categoryId == null && name == null)
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  try {
    const svalue = await CategoryModel.findOne({
      where: categoryId != null ? { categoryId } : { name },
    });
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
        createdTime: svalue.createdTime,
        updatedTime: svalue.updatedTime,
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
    if (
      (await UserModel.findOne({
        where: { userId: request.headers["userid"] },
      })) == null
    )
      return response.json({
        code: errorcode.NONEXISTING,
        msg: tips.NONEXISTING,
      });
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

router.delete("/delete", async (request, response) => {
  const categoryId = getBigInt(request.body.categoryId);
  if (categoryId == null)
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  try {
    if ((await ContestModel.findOne({ where: { categoryId } })) != null)
      return response.json({
        code: errorcode.CATEGORY_DELETE_ERROR,
        msg: tips.CATEGORY_DELETE_FAILED_OCCUPIED,
      });
    const svalue = await CategoryModel.findOne({ where: { categoryId } });
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
    await svalue.destroy();
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.CATEGORY_DELETE_SUCCESS,
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
  const where: any = {};
  const opt: Omit<FindAndCountOptions<any>, "group"> = { where };
  const { userId, name, createdTime, updatedTime, offset, limit, order } =
    request.body;

  if (userId == null) {
  } else if (checkBigInt(userId)) where.userId = userId;
  else return response.json(makeArgumentsError());

  if (name == null) {
  } else if (checkShortString(name)) where.name = { [Op.like]: `%${name}%` };
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
        where.createdTime = { [Op.like]: dayjs(createdTime[0]).toDate() };
        break;
      case 2:
        where.createdTime = {
          [Op.gte]: dayjs(createdTime[0]).toDate(),
          [Op.lte]: dayjs(createdTime[1]).toDate(),
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
        where.updatedTime = { [Op.like]: dayjs(updatedTime[0]).toDate() };
        break;
      case 2:
        where.updatedTime = {
          [Op.gte]: dayjs(updatedTime[0]).toDate(),
          [Op.lte]: dayjs(updatedTime[1]).toDate(),
        };
        break;
    }
  } else return response.json(makeArgumentsError());

  if (typeof limit == "number") {
    if (limit > QUERY_MAX_LIMIT || limit < 0)
      return response.json(makeArgumentsError());
    opt.limit = limit;
  } else if (limit == null) opt.limit = 100;
  else return response.json(makeArgumentsError());

  if (typeof offset == "number") {
    if (offset < 0) return response.json(makeArgumentsError());
    opt.offset = offset;
  } else if (offset == null) opt.offset = 0;
  else return response.json(makeArgumentsError());

  opt.include = [{ model: UserModel, as: "userTable" }];
  opt.order = getOrder(order)?.map((x) => {
    switch (x[0]) {
      case "nickname":
        return ["userTable", ...x];
      default:
        return x;
    }
  });

  try {
    const svalue = await CategoryModel.findAndCountAll(opt);
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.CATEGORY_LIST_SUCCESS,
      count: svalue.count,
      data: svalue.rows.map((x) => ({
        categoryId: x.categoryId,
        userId: x.userId,
        name: x.name,
        description: x.description,
        createdTime: x.createdTime,
        updatedTime: x.updatedTime,
        nickname: ((x as any).userTable as UserModel).nickname,
      })),
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

export default router;
