import ContestModel from "@/models/ContestModel";
import RecordModel from "@/models/RecordModel";
import UserModel from "@/models/UserModel";
import { QUERY_MAX_LIMIT, errorcode, tips } from "@/utils/conf";
import {
  checkBigInt,
  checkLongString,
  checkPermission,
  getBigInt,
  getOrder,
  makeArgumentsError,
  makeInternelError,
} from "@/utils/utils";
import express from "express";
import { FindAndCountOptions } from "sequelize";

const router = express.Router();

export async function deleteRecordsByContest(contestId: string | number) {
  return await RecordModel.destroy({ where: { contestId: contestId } });
}

router.post("/add", async (request, response) => {
  const contestId = getBigInt(request.body.contestId);
  if (contestId == null)
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  const userId = request.headers["userid"];
  const _data: { playerId: string | number; score: number; content: string }[] =
    request.body.data;
  const data = _data instanceof Array ? _data : [_data];
  if (
    !data.every(
      (x) =>
        checkBigInt(x.playerId) &&
        typeof x.score == "number" &&
        checkLongString(x.content)
    )
  )
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  try {
    // 检查比赛ID是否合法，用户是否具有对它的权限
    {
      const svalue = await ContestModel.findOne({ where: { contestId } });
      if (svalue == null)
        return response.json({
          code: errorcode.NONEXISTING,
          msg: tips.NONEXISTING,
        });
      if (!checkPermission(userId, svalue.userId))
        return response.json({
          code: errorcode.NO_PERMISSION,
          msg: tips.NO_PERMISSION,
        });
    }

    const ids = new Array<string>();
    // 检查是否重复添加选手
    {
      const svalue = [];
      for (let x of data)
        svalue.push(
          await RecordModel.findAll({
            where: { contestId, playerId: x.playerId },
          })
        );
      if (svalue.length != 0)
        return response.json({
          code: errorcode.RECORD_ADD_ERROR,
          msg: tips.RECORD_ADD_FAILED_DUPLICATE,
        });
      const set = new Set<string>();
      for (let { playerId } of data) {
        const x = playerId.toString();
        if (set.has(x))
          return response.json({
            code: errorcode.RECORD_ADD_ERROR,
            msg: tips.RECORD_ADD_FAILED_DUPLICATE,
          });
        set.add(x);
      }
    }

    if (
      (await RecordModel.count({ where: { contestId } })) + data.length >
      QUERY_MAX_LIMIT
    ) {
      return response.json({
        code: errorcode.RECORD_ADD_ERROR,
        msg: tips.RECORD_LIST_FAILED_TOO_MANY,
      });
    }

    for (let x of data) {
      ids.push(
        (
          await RecordModel.create({
            contestId,
            playerId: x.playerId,
            score: x.score,
            content: x.content,
          })
        ).recordId
      );
    }
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.RECORD_ADD_SUCCESS,
      id: ids,
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.delete("/delete", async (request, response) => {
  const _recordIds: any = request.query.recordId;
  let recordIds = _recordIds instanceof Array ? _recordIds : [_recordIds];
  if (!recordIds.every((x) => checkBigInt(x)))
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  try {
    const datas = await RecordModel.findAll({
      where: { recordId: recordIds },
    });
    const contestDatas = await ContestModel.findAll({
      where: {
        contestId: Array.from(new Set(datas.map((x) => x.contestId))),
      },
    });
    const userid = request.headers["userid"];
    if (!contestDatas.every((x) => checkPermission(userid, x.userId)))
      return response.json({
        code: errorcode.NO_PERMISSION,
        msg: tips.NO_PERMISSION,
      });
    for (let x of datas) await x.destroy();
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.RECORD_DELETE_SUCCESS,
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.delete("/delete_by_contest", async (request, response) => {
  const contestId = getBigInt(request.query.contestId);
  if (contestId == null)
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  try {
    await deleteRecordsByContest(contestId);
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.RECORD_DELETE_SUCCESS,
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.post("/modify", async (request, response) => {
  const _data: any = request.body.data;
  const data: {
    recordId: string | number;
    playerId?: string | number;
    score?: number;
    content?: string;
  }[] = _data instanceof Array ? _data : [_data];

  // 检查格式是否合法
  if (
    !data.every(
      (x) =>
        x != null &&
        checkBigInt(x.recordId) &&
        (x.playerId == null || checkBigInt(x.playerId)) &&
        (x.score == null || typeof x.score == "number") &&
        (x.content == null || checkLongString(x.content))
    )
  )
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  // 检查是否存在重复项
  const dataMap = new Map<
    string,
    [string | number | null, number | null, string | null]
  >();
  for (let { recordId, playerId, score, content } of data) {
    if (dataMap.has(recordId.toString()))
      return response.json({
        code: errorcode.BAD_ARGUMENTS,
        msg: tips.BAD_ARGUMENTS,
      });
    dataMap.set(recordId.toString(), [playerId, score, content]);
  }

  try {
    const datas = await RecordModel.findAll({
      where: { recordId: data.map((x) => x.recordId) },
    });
    const userid = request.headers["userid"];

    // 检查是否具有修改权限
    {
      const contestMap = new Map<string, boolean>();
      for (let x of datas) {
        if (!contestMap.has(x.contestId)) {
          // 缓存结果，避免多次检索权限
          try {
            const svalue = await ContestModel.findOne({
              where: { contestId: x.contestId },
            });
            contestMap.set(
              x.contestId,
              checkPermission(userid, svalue != null && svalue.userId)
            );
          } catch (e) {
            contestMap.set(x.contestId, false);
          }
        }
        if (!contestMap.get(x.contestId))
          return response.json({
            code: errorcode.NO_PERMISSION,
            msg: tips.NO_PERMISSION,
          });
      }
    }

    for (let x of datas) {
      const [playerId, score, content] = dataMap.get(x.recordId.toString());
      if (playerId != null) x.set("playerId", playerId);
      if (score != null) x.set("score", score);
      if (content != null) x.set("content", content);
      await x.save();
    }
    return response.json({
      code: errorcode.SUCCESS,
      tips: tips.RECORD_MODIFY_SUCCESS,
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.get("/query", async (request, response) => {
  const _recordIds: any = request.query.recordId;
  let recordIds = _recordIds instanceof Array ? _recordIds : [_recordIds];
  if (!recordIds.every((x) => checkBigInt(x)))
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  try {
    const datas = await RecordModel.findAll({
      where: { recordId: recordIds },
      include: [
        {
          model: UserModel,
          as: "userTable",
          attributes: ["userId", "nickname"],
        },
      ],
    });
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.RECORD_QUERY_SUCCESS,
      data: datas.map((x) => ({
        recordId: x.recordId,
        contestId: x.contestId,
        playerId: x.playerId,
        score: x.score,
        content: x.content,
        playerNickname: ((x as any).userTable as UserModel)?.nickname,
      })),
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.get("/list", async (request, response) => {
  const { contestId, playerId, _limit, _offset, order } = request.query;
  const where: any = {};
  const opt: Omit<FindAndCountOptions<any>, "group"> = { where };

  if (contestId != null && checkBigInt(contestId)) where.contestId = contestId;
  if (playerId != null && checkBigInt(playerId)) where.playerId = playerId;
  if (where.contestId == null && where.playerId == null)
    return response.json(makeArgumentsError());

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
    {
      model: UserModel,
      as: "userTable",
      attributes: ["userId", "nickname"],
    },
  ];
  opt.order = getOrder(order)?.map((x) => {
    switch (x[0]) {
      case "playerNickname":
        return ["userTable", "nickname", x[1]];
      default:
        return x;
    }
  });

  try {
    const svalue = await RecordModel.findAndCountAll(opt);
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.RECORD_LIST_SUCCESS,
      count: svalue.count,
      data: svalue.rows.map((x) => ({
        recordId: x.recordId,
        contestId: x.contestId,
        playerId: x.playerId,
        score: x.score,
        content: x.content,
        playerNickname: ((x as any).userTable as UserModel)?.nickname,
      })),
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

export default router;
