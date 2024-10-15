import transaction from "../../domain/model/Transaction";
import account from "../../domain/model/Account";
import sequelize from "../../config/sqlconfig";
import { Op } from "sequelize"; // Asegúrate de importar Op para usar operadores

const createTransaction = async (
  originAcc: number,
  targetAcc: number,
  amount: number
) => {
  if (
    typeof originAcc !== "number" ||
    typeof targetAcc !== "number" ||
    typeof amount !== "number" ||
    amount <= 0
  ) {
    return {
      status: 400,
      data: {
        message:
          "Datos inválidos. Asegúrate de que los campos originAcc y targetAcc sean números y amount sea positivo.",
      },
    };
  }

  const [cuentaOrigen, cuentaDestino] = await Promise.all([
    account.findOne({ where: { nCuenta: originAcc } }),
    account.findOne({ where: { nCuenta: targetAcc } }),
  ]);

  if (!cuentaOrigen) {
    return {
      status: 404,
      data: { message: `La cuenta de origen ${originAcc} no existe.` },
    };
  }
  if (!cuentaDestino) {
    return {
      status: 404,
      data: { message: `La cuenta de destino ${targetAcc} no existe.` },
    };
  }

  if (cuentaOrigen.id === cuentaDestino.id) {
    return {
      status: 400,
      data: { message: "No puedes enviarte dinero a ti mismo." },
    };
  }

  const transactionLimit = 10000;
  if (amount > transactionLimit) {
    return {
      status: 400,
      data: { message: `La cantidad no puede exceder ${transactionLimit}.` },
    };
  }

  const balanceOrigen = Number(cuentaOrigen.balance);
  const balanceDestino = Number(cuentaDestino.balance);

  if (balanceOrigen < amount) {
    return {
      status: 400,
      data: { message: "Saldo insuficiente en la cuenta de origen." },
    };
  }

  try {
    await sequelize.transaction(async (t) => {
      cuentaOrigen.balance = parseFloat((balanceOrigen - amount).toFixed(2));
      cuentaDestino.balance = parseFloat((balanceDestino + amount).toFixed(2));

      await Promise.all([
        cuentaOrigen.save({ transaction: t }),
        cuentaDestino.save({ transaction: t }),
        transaction.create(
          {
            originAcc: cuentaOrigen.id,
            targetAcc: cuentaDestino.id,
            amount: amount,
            type: "transfer", // Agrega el tipo de transacción aquí
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
    return {
      status: 500,
      data: { message: "Error al procesar la transacción." },
    };
  }
};


// Obtener todas las transacciones
const getAllTransactions = async () => {
  return await transaction.findAll({
    include: [
      { model: account, as: "originAccount" },
      { model: account, as: "targetAccount" },
    ],
  });
};


// Actualizar una transacción
const updateTransaction = async (nCuenta: string, updateData: any) => {
  const existingTransaction = await transaction.findOne({
    where: { originAcc: nCuenta },
  });

  if (!existingTransaction) {
    throw new Error("Transacción no encontrada");
  }

  return await existingTransaction.update(updateData);
};

// Eliminar una transacción
const deleteTransactionByNCuenta = async (nCuenta: string) => {
  const existingTransaction = await transaction.findOne({
    where: { originAcc: nCuenta },
  });

  if (!existingTransaction) {
    throw new Error("Transacción no encontrada");
  }

  await existingTransaction.destroy();
};

// Obtener todas las transacciones por cuenta de origen
const getTransactionsByOriginAccount = async (originAcc: number) => {
  return await transaction.findAll({
    where: { originAcc },
    include: [
      { model: account, as: "originAccount" },
      { model: account, as: "targetAccount" },
    ],
  });
};

// Obtener el historial de transacciones
const getTransactionHistory = async (
  accountNumber: number | string, // Permitir tanto number como string
  startDate?: string,
  endDate?: string
) => {
  // Convertir accountNumber a number si es un string
  const accNum =
    typeof accountNumber === "string" ? Number(accountNumber) : accountNumber;

  const query: any = {
    where: {
      originAcc: accNum,
    },
  };

  // Agregar filtros de fecha si están definidos
  if (startDate) {
    query.where.createdAt = { [Op.gte]: new Date(startDate) };
  }
  if (endDate) {
    query.where.createdAt = {
      ...query.where.createdAt,
      [Op.lte]: new Date(endDate),
    };
  }

  return await transaction.findAll({
    ...query,
    include: [
      { model: account, as: "originAccount" },
      { model: account, as: "targetAccount" },
    ],
  });
};

export default {
  createTransaction,
  getAllTransactions,
  updateTransaction,
  deleteTransactionByNCuenta,
  getTransactionsByOriginAccount,
  getTransactionHistory, 
};
