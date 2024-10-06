import { Request, Response, NextFunction } from "express";
import transaction from "../models/transaction"; // Ajusta la ruta según tu estructura de proyecto
import account from "../models/account"; // Ajusta la ruta según tu estructura de proyecto

// Crear una nueva transacción
export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { originAcc, targetAcc, amount } = req.body;

  try {
    // Verificar si el monto es un número
    if (isNaN(Number(amount))) {
      return res.status(400).json({ message: "El monto debe ser numérico." });
    }

    const newTransaction = await transaction.create({
      originAcc,
      targetAcc,
      amount,
    });

    return res.status(201).json({
      message: "Transacción creada correctamente",
      transaction: newTransaction,
    });
  } catch (err: any) {
    next(err);
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
  } catch (err: any) {
    next(err);
  }
};

// Obtener una transacción por ID
export const getTransactionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const existingTransaction = await transaction.findByPk(id, {
      include: [
        { model: account, as: "originAccount" },
        { model: account, as: "targetAccount" },
      ],
    });

    if (!existingTransaction) {
      return res.status(404).json({ message: "Transacción no encontrada" });
    }

    return res.status(200).json(existingTransaction);
  } catch (err: any) {
    next(err);
  }
};

//preguntar
// Actualizar una transacción
export const updateTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { originAcc, targetAcc, amount } = req.body;

  try {
    const existingTransaction = await transaction.findByPk(id);
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
  } catch (err: any) {
    next(err);
  }
};

// Eliminar una transacción
export const deleteTransactionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const existingTransaction = await transaction.findByPk(id);
    if (!existingTransaction) {
      return res.status(404).json({ message: "Transacción no encontrada" });
    }

    await existingTransaction.destroy();

    return res
      .status(200)
      .json({ message: "Transacción eliminada correctamente" });
  } catch (err: any) {
    next(err);
  }
};

// Obtener todas las transacciones por cuenta de origen
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
  } catch (err: any) {
    next(err);
  }
};
