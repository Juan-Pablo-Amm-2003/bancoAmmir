import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../infrastructure/database/sqlconfig";
import User from "./User";

// Definir los atributos de Account
interface AccountAttributes {
  id: number;
  userId: number;
  balance: number;
  nCuenta: number;
  creationDate: Date;
}

// Definir los atributos opcionales para la creación
interface AccountCreationAttributes
  extends Optional<AccountAttributes, "id" | "creationDate"> {}

// Definir el modelo Account usando Sequelize
class Account
  extends Model<AccountAttributes, AccountCreationAttributes>
  implements AccountAttributes
{
  public id!: number;
  public userId!: number;
  public balance!: number;
  public nCuenta!: number;
  public readonly creationDate!: Date;

  // timestamps son opcionales
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Inicializar el modelo Account
Account.init(
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
      type: DataTypes.INTEGER.UNSIGNED,
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

// Definir las asociaciones
Account.belongsTo(User, { foreignKey: "userId", as: "user" });

export default Account;
