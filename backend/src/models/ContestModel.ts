import { sequelize } from "@/utils/sql";
import { DataTypes, Model } from "sequelize";
import UserModel from "./UserModel";
import CategoryModel from "./CategoryModel";

class ContestModel extends Model {
  declare contestId: string; // 比赛ID（自增）
  declare userId: string; // 用户ID
  declare categoryId: string; // 类别ID

  declare title: string; // 标题
  declare description?: string; // 描述
  declare scriptType?: string; // 脚本类型
  declare scriptContent?: string; // 脚本内容
  declare scriptCache?: string; // 脚本缓存

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
    scriptType: {
      type: DataTypes.STRING,
    },
    scriptContent: {
      type: DataTypes.TEXT,
    },
    scriptCache: {
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
    tableName: "tb_contest",
    sequelize,
  }
);

ContestModel.sync();
ContestModel.belongsTo(UserModel, { as: "userTable", foreignKey: "userId" });
ContestModel.belongsTo(CategoryModel, {
  as: "categoryTable",
  foreignKey: "categoryId",
});
export default ContestModel;
