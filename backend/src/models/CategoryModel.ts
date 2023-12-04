import { sequelize } from "@/utils/sql";
import { DataTypes, Model } from "sequelize";
import UserModel from "./UserModel";

class CategoryModel extends Model {
  declare categoryId: string; // 比赛ID（自增）
  declare userId: string; // 用户ID

  declare name: string; // 名称
  declare description?: string; // 描述
  declare createdTime: Date; // 创建时间
  declare updatedTime: Date; // 修改时间
}

CategoryModel.init(
  {
    categoryId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
    tableName: "tb_category",
    sequelize,
  }
);

CategoryModel.sync();
CategoryModel.belongsTo(UserModel, { as: "userTable", foreignKey: "userId" });
export default CategoryModel;
