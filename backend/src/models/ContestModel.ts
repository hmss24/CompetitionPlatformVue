import { sequelize } from "@/utils/sql";
import { DataTypes, Model } from "sequelize";

class ContestModel extends Model {
  declare contestId: string; // 比赛ID（自增）
  declare userId: string; // 用户ID
  declare categoryId: string; // 类别ID

  declare title: string; // 标题
  declare description?: string; // 描述

  declare createdTime: Date; // 创建时间
  declare updatedTime: Date; // 修改时间
}

ContestModel.init(
  {
    contestId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    createdTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "tb_context",
    sequelize,
  }
);

ContestModel.sync();
export default ContestModel;
