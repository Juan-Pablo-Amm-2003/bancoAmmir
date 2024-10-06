import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sqlconfig"; 
import User from "./user"; 

class account extends Model {
  public id!: number; 
  public userId!: number; 
  public balance!: number; 
  public nCuenta!: string;
  public readonly creationDate!: Date; 
}

account.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    nCuenta: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    creationDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Account",
    tableName: "account",
    timestamps: false,
  }
);


account.belongsTo(User, { foreignKey: "userId", as: "user" });

export default account;
