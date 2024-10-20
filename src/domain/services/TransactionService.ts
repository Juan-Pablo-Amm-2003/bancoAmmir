import transactionModel from "../../domain/model/Transaction";
import accountModel from "../../domain/model/Account";
import sequelize from "../../infrastructure/database/sqlconfig";
import { Op, Transaction } from "sequelize";
import ApiError from "../../utils/ApiError";

// Validar si el número es positivo
const isValidNumber = (num: number) => typeof num === "number" && num > 0;

// Función para validar cuentas
const validateAccounts = async (originAcc: number, targetAcc: number) => {
  const [cuentaOrigen, cuentaDestino] = await Promise.all([
    accountModel.findOne({ where: { nCuenta: originAcc } }),
    accountModel.findOne({ where: { nCuenta: targetAcc } }),
  ]);

  if (!cuentaOrigen) {
    throw new ApiError(404, `La cuenta de origen ${originAcc} no existe.`);
  }
  if (!cuentaDestino) {
    throw new ApiError(404, `La cuenta de destino ${targetAcc} no existe.`);
  }

  return [cuentaOrigen, cuentaDestino];
};

// Crear una nueva transacción
const createTransaction = async (
  originAcc: number,
  targetAcc: number,
  amount: number
) => {
  if (![originAcc, targetAcc, amount].every(isValidNumber)) {
    throw new ApiError(
      400,
      "Datos inválidos. Asegúrate de que los campos sean números positivos."
    );
  }

  const [cuentaOrigen, cuentaDestino] = await validateAccounts(
    originAcc,
    targetAcc
  );

  if (cuentaOrigen.id === cuentaDestino.id) {
    throw new ApiError(400, "No puedes enviarte dinero a ti mismo.");
  }

  const transactionLimit = 10000;
  if (amount > transactionLimit) {
    throw new ApiError(
      400,
      `La cantidad no puede exceder ${transactionLimit}.`
    );
  }

  if (cuentaOrigen.balance < amount) {
    throw new ApiError(400, "Saldo insuficiente en la cuenta de origen.");
  }

  try {
    await sequelize.transaction(async (t) => {
      cuentaOrigen.balance -= amount;
      cuentaDestino.balance += amount;

      await Promise.all([
        cuentaOrigen.save({ transaction: t }),
        cuentaDestino.save({ transaction: t }),
        transactionModel.create(
          {
            originAcc: cuentaOrigen.id,
            targetAcc: cuentaDestino.id,
            amount,
            type: "transfer",
          },
          { transaction: t }
        ),
      ]);
    });

    return {
      status: 200,
      data: { message: "Transacción completada con éxito." },
    };
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Error al procesar la transacción.");
  }
};

// Obtener todas las transacciones
const getAllTransactions = async () => {
  return await transactionModel.findAll({
    include: [
      { model: accountModel, as: "originAccount" },
      { model: accountModel, as: "targetAccount" },
    ],
  });
};

// Actualizar una transacción
const updateTransaction = async (transactionId: number, updateData: any) => {
  const existingTransaction = await transactionModel.findByPk(transactionId);

  if (!existingTransaction) {
    throw new ApiError(404, "Transacción no encontrada.");
  }

  return await existingTransaction.update(updateData);
};

// Eliminar una transacción
const deleteTransactionById = async (transactionId: number) => {
  const existingTransaction = await transactionModel.findByPk(transactionId);

  if (!existingTransaction) {
    throw new ApiError(404, "Transacción no encontrada.");
  }

  await existingTransaction.destroy();
};

// Obtener transacciones por cuenta origen o destino
const getTransactionsByAccount = async (nCuenta: number) => {
  const transactions = await transactionModel.findAll({
    where: {
      [Op.or]: [{ originAcc: nCuenta }, { targetAcc: nCuenta }],
    },
    include: [
      { model: accountModel, as: "originAccount" },
      { model: accountModel, as: "targetAccount" },
    ],
  });

  if (!transactions.length) {
    throw new ApiError(
      404,
      `No se encontraron transacciones para la cuenta ${nCuenta}.`
    );
  }

  return {
    status: 200,
    data: transactions,
  };
};

const getTransactionHistory = async (
  cuentaNum: number,
  startDate?: string,
  endDate?: string
): Promise<transactionModel[]> => {
  // Cambia aquí a TransactionModel
  const whereConditions: any = {
    [Op.or]: [{ originAcc: cuentaNum }, { targetAcc: cuentaNum }],
  };

  if (startDate) {
    whereConditions.createdAt = { [Op.gte]: new Date(startDate) };
  }
  if (endDate) {
    whereConditions.createdAt = { [Op.lte]: new Date(endDate) };
  }

  return await transactionModel.findAll({
    // Asegúrate de usar TransactionModel
    where: whereConditions,
    include: [
      { model: accountModel, as: "originAccount" },
      { model: accountModel, as: "targetAccount" },
    ],
  });
};

export {
  createTransaction,
  getAllTransactions,
  updateTransaction,
  deleteTransactionById,
  getTransactionsByAccount,
  getTransactionHistory,
};
