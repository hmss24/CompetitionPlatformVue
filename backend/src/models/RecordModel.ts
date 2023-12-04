import { sequelize } from "@/utils/sql";
import { DataTypes, Model } from "sequelize";
import UserModel from "./UserModel";
import ContestModel from "./ContestModel";

class RecordModel extends Model {
  declare recordId: string; // 记录ID（自增）
  declare contestId: string; // 比赛ID

  declare playerId: string; // 记录对应的用户ID
  declare score: number; // 分数
}

RecordModel.init(
  {
    recordId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    contestId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    playerId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    score: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  },
  {
    tableName: "tb_data",
    sequelize,
  }
);

RecordModel.sync();
RecordModel.belongsTo(UserModel, { as: "userTable", foreignKey: "userId" });
export default RecordModel;
