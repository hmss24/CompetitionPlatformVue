import { sequelize } from "@/utils/sql";
import { DataTypes, Model } from "sequelize";
import UserModel from "./UserModel";

class RecordModel extends Model {
  declare recordId: string; // 记录ID（自增）
  declare contestId: string; // 比赛ID

  declare playerId: string; // 记录对应的用户ID
  declare score: number; // 分数
  declare content: string; // 内容
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
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "tb_record",
    sequelize,
  }
);

RecordModel.sync();
RecordModel.belongsTo(UserModel, {
  as: "userTable",
  foreignKey: "playerId",
  targetKey: "userId",
});
export default RecordModel;
