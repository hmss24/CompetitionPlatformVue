import ContestModel from "@/models/ContestModel";
import RecordModel from "@/models/RecordModel";
import UserModel from "@/models/UserModel";
import { QUERY_MAX_LIMIT, errorcode, tips } from "@/utils/conf";
import {
  checkBigInt,
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
  const _data: { playerId: string | number; score: number }[] =
    request.body.data;
  const data = _data instanceof Array ? _data : [_data];
  if (!data.every((x) => checkBigInt(x.playerId) && typeof x.score == "number"))
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
    if (!checkPermission(userId, svalue.userId))
      return response.json({
        code: errorcode.NO_PERMISSION,
        msg: tips.NO_PERMISSION,
      });
    const ids = await data.map(
      async (x) =>
        (
          await RecordModel.create({
            contestId,
            playerId: x.playerId,
            score: x.score,
          })
        ).recordId
    );
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
  const _recordIds: string | number | (string | number)[] =
    request.body.recordId;
  let recordIds = _recordIds instanceof Array ? _recordIds : [_recordIds];
  if (!recordIds.every((x) => checkBigInt(recordIds)))
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
  const contestId = getBigInt(request.body.contestId);
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
    recordId?: string | number;
    playerId?: string | number;
    score: number;
  }[] = _data instanceof Array ? _data : [_data];
  if (
    !data.every(
      (x) =>
        checkBigInt(x.recordId) &&
        (x.playerId == null || checkBigInt(x.playerId)) &&
        (x.score == null || typeof x.score == "number")
    )
  )
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });
  const dataMap = new Map<string, [string | number | null, number | null]>();
  for (let { recordId, playerId, score } of data) {
    if (dataMap.has(recordId.toString()))
      return response.json({
        code: errorcode.BAD_ARGUMENTS,
        msg: tips.BAD_ARGUMENTS,
      });
    dataMap.set(recordId.toString(), [playerId, score]);
  }

  try {
    const datas = await ContestModel.findAll({
      where: { recordId: data.map((x) => x.recordId) },
    });
    const userid = request.headers["userid"];
    if (!datas.every((x) => checkPermission(userid, x.userId)))
      return response.json({
        code: errorcode.NO_PERMISSION,
        msg: tips.NO_PERMISSION,
      });
    for (let x of datas) {
      const [playerId, score] = dataMap.get(x.contestId.toString());
      if (playerId != null) x.set("playerId", playerId);
      if (score != null) x.set("score", score);
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
  const _recordIds: string | number | (string | number)[] =
    request.body.recordId;
  let recordIds = _recordIds instanceof Array ? _recordIds : [_recordIds];
  if (!recordIds.every((x) => checkBigInt(recordIds)))
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  try {
    const datas = await RecordModel.findAll({
      where: { recordId: recordIds },
    });
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.RECORD_QUERY_SUCCESS,
      data: datas.map((x) => ({
        recordId: x.recordId,
        contestId: x.contestId,
        playerId: x.playerId,
        score: x.score,
      })),
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

router.get("/list", async (request, response) => {
  const { contestId, playerId, limit, offset, order } = request.body;
  const where: any = {};
  const opt: Omit<FindAndCountOptions<any>, "group"> = { where };

  if (contestId != null && checkBigInt(contestId)) where.contestId = contestId;
  if (playerId != null && checkBigInt(playerId)) where.playerId = playerId;
  if (where.contestId == null && where.playerId == null)
    return response.json(makeArgumentsError());

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
      case "playerNickname":
        return ["userTable", "nickname", x[1]];
      default:
        return x;
    }
  });

  try {
    const svalue = await RecordModel.findAndCountAll({ where: { contestId } });
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.RECORD_LIST_SUCCESS,
      count: svalue.count,
      data: svalue.rows.map((x) => ({
        recordId: x.recordId,
        contestId: x.contestId,
        playerId: x.playerId,
        score: x.score,
        playerNickname: ((x as any).userTable as UserModel).nickname,
      })),
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

export default router;
