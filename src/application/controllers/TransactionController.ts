import { Request, Response, NextFunction } from "express";
import * as transactionService from "../../domain/services/TransactionService"; // Cambia aquí si es necesario
import ApiError from "../../utils/ApiError";
import logger from "../../utils/logger"; // Importa el logger
import Transaction from "../../domain/model/Transaction";

const isValidNumber = (value: any): value is number => {
  return typeof value === "number" && value > 0;
};

// Crear una nueva transacción
export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { originAcc, targetAcc, amount } = req.body;

    if (
      !isValidNumber(originAcc) ||
      !isValidNumber(targetAcc) ||
      !isValidNumber(amount)
    ) {
      return next(
        new ApiError(
          400,
          "Datos inválidos. Asegúrate de que los campos sean números positivos."
        )
      );
    }

    const result = await transactionService.createTransaction(
      originAcc,
      targetAcc,
      amount
    );

    if (!result || typeof result.status !== "number") {
      return next(
        new ApiError(500, "Error inesperado al crear la transacción.")
      );
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    logger.error("Error en createTransaction:", error);
    return next(new ApiError(500, "Error inesperado."));
  }
};

// Actualizar una transacción
export const updateTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nCuenta } = req.params;
    const { originAcc, targetAcc, amount } = req.body;

    const cuentaNum = Number(nCuenta);
    if (!isValidNumber(cuentaNum)) {
      return next(new ApiError(400, "Número de cuenta inválido."));
    }

    if (
      !isValidNumber(originAcc) ||
      !isValidNumber(targetAcc) ||
      !isValidNumber(amount)
    ) {
      return next(
        new ApiError(
          400,
          "Los campos originAcc, targetAcc y amount deben ser números válidos."
        )
      );
    }

    const updatedTransaction = await transactionService.updateTransaction(
      cuentaNum,
      { originAcc, targetAcc, amount }
    );

    if (!updatedTransaction || typeof updatedTransaction.status !== "number") {
      return next(
        new ApiError(500, "Error inesperado al actualizar la transacción.")
      );
    }

    return res.status(200).json({
      message: "Transacción actualizada correctamente",
      transaction: updatedTransaction,
    });
  } catch (error) {
    logger.error("Error en updateTransaction:", error);
    return next(new ApiError(500, "Error inesperado."));
  }
};

// Eliminar una transacción por número de cuenta
export const deleteTransactionByNCuenta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nCuenta } = req.params;
    const cuentaNum = Number(nCuenta);

    if (!isValidNumber(cuentaNum)) {
      return next(new ApiError(400, "Número de cuenta inválido."));
    }

    const result = await transactionService.deleteTransactionById(cuentaNum);

    if (result !== undefined) {
      return next(
        new ApiError(500, "Error inesperado al eliminar la transacción.")
      );
    }

    return res
      .status(200)
      .json({ message: "Transacción eliminada correctamente" });
  } catch (error) {
    logger.error("Error en deleteTransactionByNCuenta:", error);
    return next(new ApiError(500, "Error inesperado."));
  }
};

// Obtener todas las transacciones por cuenta de origen
export const getTransactionsByOriginAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { originAcc } = req.params;
    const cuentaNum = Number(originAcc);

    if (!isValidNumber(cuentaNum)) {
      return next(
        new ApiError(400, "La cuenta de origen debe ser un número válido.")
      );
    }

    const result = await transactionService.getTransactionsByAccount(cuentaNum);

    if (!result || typeof result.status !== "number") {
      return next(
        new ApiError(500, "Error inesperado al obtener transacciones.")
      );
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    logger.error("Error en getTransactionsByOriginAccount:", error);
    return next(new ApiError(500, "Error inesperado."));
  }
};

// Obtener historial de transacciones
export const getTransactionHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { accountNumber } = req.params;
    const { startDate, endDate } = req.query;

    // Convertir accountNumber a número
    const cuentaNum = Number(accountNumber);
    if (!isValidNumber(cuentaNum)) {
      return next(new ApiError(400, "Número de cuenta inválido."));
    }

    // Llamar al servicio para obtener el historial de transacciones
    const transactions: Transaction[] =
      await transactionService.getTransactionHistory(
        cuentaNum,
        startDate ? String(startDate) : undefined,
        endDate ? String(endDate) : undefined
      );

    // Verificar si se encontraron transacciones
    if (!transactions || transactions.length === 0) {
      return res.status(404).json({
        message: "No se encontraron transacciones para esta cuenta.",
      });
    }

    return res.status(200).json(transactions);
  } catch (error) {
    logger.error("Error en getTransactionHistory:", error);
    return next(new ApiError(500, "Error inesperado al obtener el historial."));
  }
};