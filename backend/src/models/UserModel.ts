import { sequelize } from "@/utils/sql";
import { DataTypes, Model } from "sequelize";

// 用户表模型
class UserModel extends Model {
  declare userId: string; // 用户ID（自增）
  declare username: string; // 用户名（唯一）

  declare nickname: string; // 用户昵称
  declare password: string; // 密码
  declare email?: string; // 邮箱
  declare description?: string; // 描述
  declare extra?: string; // 冗余字段

  declare createdTime: Date; // 创建时间
  declare updatedTime: Date; // 修改时间
}

UserModel.init(
  {
    userId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    extra: {
      type: DataTypes.TEXT
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
    tableName: "tb_users",
    sequelize,
  }
);

UserModel.sync();
export default UserModel;
