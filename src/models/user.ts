import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sqlconfig";

class user extends Model {
  public id!: number;
  public username!: string;
  public pass!: string;
  public DNI!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

user.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    pass: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    DNI: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: "user",
    timestamps: false,
  }
);

export default user;
