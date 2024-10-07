import { Request, Response, NextFunction } from "express";
import transaction from "../models/transaction";
import account from "../models/account";
import sequelize from "../config/sqlconfig";

// Crear una nueva transacción
export const createTransaction = async (req: Request, res: Response) => {
  const { originAcc, targetAcc, amount } = req.body;

  // Validaciones iniciales
  if (
    typeof originAcc !== "number" ||
    typeof targetAcc !== "number" ||
    typeof amount !== "number" ||
    amount <= 0
  ) {
    return res.status(400).json({
      message:
        "Datos inválidos. Asegúrate de que los campos sean números positivos.",
    });
  }

  // Buscar las cuentas origen y destino
  const [cuentaOrigen, cuentaDestino] = await Promise.all([
    account.findOne({ where: { nCuenta: originAcc } }),
    account.findOne({ where: { nCuenta: targetAcc } }),
  ]);

  // Validar que ambas cuentas existen
  if (!cuentaOrigen || !cuentaDestino) {
    return res.status(404).json({ message: "Una o ambas cuentas no existen." });
  }

  // Verificar que el usuario no se envíe dinero a sí mismo
  if (cuentaOrigen.id === cuentaDestino.id) {
    return res
      .status(400)
      .json({ message: "No puedes enviarte dinero a ti mismo." });
  }

  // Verificar límite de transacción
  const transactionLimit = 10000; // Ejemplo de límite
  if (amount > transactionLimit) {
    return res
      .status(400)
      .json({ message: `La cantidad no puede exceder ${transactionLimit}.` });
  }

  // Convertir balances a números y verificar su tipo
  const balanceOrigen = Number(cuentaOrigen.balance);
  const balanceDestino = Number(cuentaDestino.balance);

  // Verificar saldo suficiente
  if (balanceOrigen < amount) {
    return res
      .status(400)
      .json({ message: "Saldo insuficiente en la cuenta de origen." });
  }

  try {
    // Imprimir balances antes de la transacción
    console.log(
      `Saldo antes de la transacción: Origen: ${balanceOrigen}, Destino: ${balanceDestino}`
    );

    // Iniciar una transacción
    await sequelize.transaction(async (t) => {
      // Resta el monto de la cuenta de origen
      cuentaOrigen.balance = parseFloat((balanceOrigen - amount).toFixed(2));
      // Suma el monto a la cuenta de destino
      cuentaDestino.balance = parseFloat((balanceDestino + amount).toFixed(2));

      // Guardar los cambios
      await Promise.all([
        cuentaOrigen.save({ transaction: t }),
        cuentaDestino.save({ transaction: t }),
        transaction.create(
          {
            originAcc: cuentaOrigen.id,
            targetAcc: cuentaDestino.id,
            amount: amount,
          },
          { transaction: t }
        ),
      ]);
    });

    // Imprimir balances después de la transacción
    console.log(
      `Transacción completada: Origen: ${cuentaOrigen.balance}, Destino: ${cuentaDestino.balance}`
    );

    return res
      .status(200)
      .json({ message: "Transacción completada con éxito." });
  } catch (error) {
    console.error(error); // Log del error
    return res.status(500).json({
      message: "Error al procesar la transacción.",
    });
  }
};


// Obtener todas las transacciones
export const getAllTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transactions = await transaction.findAll({
      include: [
        { model: account, as: "originAccount" },
        { model: account, as: "targetAccount" },
      ],
    });
    return res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};

// Obtener una transacción por nCuenta
export const getTransactionByNCuenta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { nCuenta } = req.params;

  try {
    const existingTransaction = await transaction.findOne({
      where: { originAcc: nCuenta },
      include: [
        { model: account, as: "originAccount" },
        { model: account, as: "targetAccount" },
      ],
    });

    if (!existingTransaction) {
      return res.status(404).json({ message: "Transacción no encontrada" });
    }

    return res.status(200).json(existingTransaction);
  } catch (error) {
    next(error);
  }
};

// Actualizar una transacción
export const updateTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { nCuenta } = req.params; // Cambiar id por nCuenta
  const { originAcc, targetAcc, amount } = req.body;

  try {
    const existingTransaction = await transaction.findOne({
      where: { originAcc: nCuenta },
    });

    if (!existingTransaction) {
      return res.status(404).json({ message: "Transacción no encontrada" });
    }

    await existingTransaction.update({
      originAcc:
        originAcc !== undefined ? originAcc : existingTransaction.originAcc,
      targetAcc:
        targetAcc !== undefined ? targetAcc : existingTransaction.targetAcc,
      amount: amount !== undefined ? amount : existingTransaction.amount,
    });

    return res.status(200).json({
      message: "Transacción actualizada correctamente",
      transaction: existingTransaction,
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar una transacción
export const deleteTransactionByNCuenta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { nCuenta } = req.params; // Cambiar id por nCuenta

  try {
    const existingTransaction = await transaction.findOne({
      where: { originAcc: nCuenta },
    });

    if (!existingTransaction) {
      return res.status(404).json({ message: "Transacción no encontrada" });
    }

    await existingTransaction.destroy();

    return res
      .status(200)
      .json({ message: "Transacción eliminada correctamente" });
  } catch (error) {
    next(error);
  }
};

// Obtener todas las transacciones por cuenta de origen (usando nCuenta)
export const getTransactionsByOriginAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { originAcc } = req.params;

  try {
    const transactions = await transaction.findAll({
      where: { originAcc },
      include: [
        { model: account, as: "originAccount" },
        { model: account, as: "targetAccount" },
      ],
    });

    if (transactions.length === 0) {
      return res
        .status(404)
        .json({
          message:
            "No se encontraron transacciones para esta cuenta de origen.",
        });
    }

    return res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};

export default createTransaction;
