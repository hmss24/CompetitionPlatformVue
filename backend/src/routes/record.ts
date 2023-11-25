import ContestModel from "@/models/ContestModel";
import RecordModel from "@/models/RecordModel";
import { QUERY_MAX_LIMIT, errorcode, tips } from "@/utils/conf";
import {
  checkBigInt,
  checkPermission,
  getBigInt,
  makeInternelError,
} from "@/utils/utils";
import express from "express";

const router = express.Router();

export async function deleteRecordsByContest(
  contestId: string | number | BigInt
) {
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
  const _data: { playerId: string | BigInt | number; score: number }[] =
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
  const _recordIds: string | BigInt | number | (string | BigInt | number)[] =
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

router.delete("/delete_record_by_contest", async (request, response) => {
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
  const _modifies: any = request.body.modifies;
  const modifies: {
    recordId: string | BigInt | number;
    playerId: string | BigInt | number;
    score: number;
  }[] = _modifies instanceof Array ? _modifies : [_modifies];
  if (
    !modifies.every(
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
  const modifiesMap = new Map<
    string,
    [string | BigInt | number | null, number | null]
  >();
  for (let { recordId, playerId, score } of modifies) {
    if (modifiesMap.has(recordId.toString()))
      return response.json({
        code: errorcode.BAD_ARGUMENTS,
        msg: tips.BAD_ARGUMENTS,
      });
    modifiesMap.set(recordId.toString(), [playerId, score]);
  }

  try {
    const datas = await ContestModel.findAll({
      where: { recordId: modifies.map((x) => x.recordId) },
    });
    const userid = request.headers["userid"];
    if (!datas.every((x) => checkPermission(userid, x.userId)))
      return response.json({
        code: errorcode.NO_PERMISSION,
        msg: tips.NO_PERMISSION,
      });
    for (let x of datas) {
      const [playerId, score] = modifiesMap.get(x.contestId.toString());
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
  const _recordIds: string | BigInt | number | (string | BigInt | number)[] =
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
  const contestId = getBigInt(request.body.contestId);
  if (contestId == null)
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  try {
    const svalues = await RecordModel.findAll({ where: { contestId } });
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.RECORD_LIST_SUCCESS,
      data: svalues.map((x) => ({
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

router.get("/list_user", async (request, response) => {
  const playerId = getBigInt(request.body.playerId);
  if (playerId == null)
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
    const svalues = await RecordModel.findAll({
      where: { playerId },
      offset: start,
      limit: lim,
    });
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.RECORD_LIST_SUCCESS,
      data: svalues.map((x) => ({
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

router.get("/list_user_count", async (request, response) => {
  const playerId = getBigInt(request.body.playerId);
  if (playerId == null)
    return response.json({
      code: errorcode.BAD_ARGUMENTS,
      msg: tips.BAD_ARGUMENTS,
    });

  try {
    const count = await RecordModel.count({
      where: { playerId },
    });
    return response.json({
      code: errorcode.SUCCESS,
      msg: tips.RECORD_LIST_SUCCESS,
      count,
    });
  } catch (e) {
    return response.json(makeInternelError(e));
  }
});

export default router;
