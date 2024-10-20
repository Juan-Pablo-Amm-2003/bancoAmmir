import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../infrastructure/database/sqlconfig";
import Account from "./Account";

interface TransactionAttributes {
  id: number;
  originAcc: number;
  targetAcc: number;
  amount: number;
  transactionDate: Date;
  type: string;
}

interface TransactionCreationAttributes
  extends Optional<TransactionAttributes, "id" | "transactionDate"> {}

class Transaction extends Model<
  TransactionAttributes,
  TransactionCreationAttributes
> {
  public id!: number;
  public originAcc!: number;
  public targetAcc!: number;
  public amount!: number;
  public transactionDate!: Date;
  public type!: string;
  public balance!: number;
  status: any;
}

Transaction.init(
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
        model: Account,
        key: "id",
      },
    },
    targetAcc: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Account,
        key: "id",
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Transaction",
    tableName: "transaction",
    timestamps: false,
  }
);

// Definir las asociaciones al final
Transaction.belongsTo(Account, {
  foreignKey: "originAcc",
  targetKey: "id",
  as: "originAccount",
});
Transaction.belongsTo(Account, {
  foreignKey: "targetAcc",
  targetKey: "id",
  as: "targetAccount",
});

export default Transaction;
