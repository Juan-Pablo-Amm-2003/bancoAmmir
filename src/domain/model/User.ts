import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../infrastructure/database/sqlconfig";

// Definición de la interfaz de atributos para el modelo User
export interface UserAttributes {
  id: number;
  username: string;
  pass: string;
  DNI: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interfaz para la creación de nuevos usuarios
export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "createdAt" | "updatedAt"> {}

class User extends Model<UserAttributes, UserCreationAttributes> {
  public id!: number;
  public username!: string;
  public pass!: string;
  public DNI!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
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
    modelName: "User", // Cambia a "User" por convención
    tableName: "user",
    timestamps: true, // Cambia a true para usar timestamps
  }
);

export default User;
