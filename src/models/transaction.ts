import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sqlconfig";
import account from "./account";

class transaction extends Model {
  public id!: number;
  public originAcc!: number;
  public targetAcc!: number;
  public amount!: number;
  public readonly transactionDate!: Date;
}

transaction.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    originAcc: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: account,
        key: "id", // Cambiado a id para coincidir con la tabla
      },
    },
    targetAcc: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: account,
        key: "id", // Cambiado a id para coincidir con la tabla
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    transactionDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "transaction",
    tableName: "transaction",
    timestamps: false,
  }
);

transaction.belongsTo(account, {
  foreignKey: "originAcc",
  targetKey: "id", // Cambiado a id para coincidir con la tabla
  as: "originAccount",
});
transaction.belongsTo(account, {
  foreignKey: "targetAcc",
  targetKey: "id", // Cambiado a id para coincidir con la tabla
  as: "targetAccount",
});

export default transaction;
