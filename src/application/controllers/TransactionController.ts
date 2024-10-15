import { Request, Response, NextFunction } from "express";
import transactionService from "../../domain/services/TransactionService";

const isValidNumber = (value: string | number) => {
  return typeof value === "number" && value > 0;
};

// Crear una nueva transacción
export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { originAcc, targetAcc, amount } = req.body;

    // Verificar que los campos sean números válidos
    if (
      !isValidNumber(originAcc) ||
      !isValidNumber(targetAcc) ||
      !isValidNumber(amount)
    ) {
      return res.status(400).json({
        message:
          "Datos inválidos. Asegúrate de que los campos sean números positivos.",
      });
    }

    // Llamar al servicio de transacciones
    const result = await transactionService.createTransaction(
      originAcc,
      targetAcc,
      amount
    );

    return res.status(result.status).json(result.data);
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
  let { nCuenta } = req.params;
  let { originAcc, targetAcc, amount } = req.body;

  try {
    // Verificar y convertir a string si es necesario
    nCuenta = isValidNumber(nCuenta) ? String(nCuenta) : nCuenta;

    // Asegurar que 'originAcc' y 'targetAcc' sean válidos
    if (!isValidNumber(originAcc) || !isValidNumber(targetAcc)) {
      return res
        .status(400)
        .json({ message: "Las cuentas deben ser números válidos." });
    }

    // Asegurar que 'amount' sea numérico
    if (!isValidNumber(amount)) {
      return res
        .status(400)
        .json({ message: "El monto debe ser un número válido." });
    }

    const updatedTransaction = await transactionService.updateTransaction(
      nCuenta,
      { originAcc, targetAcc, amount: Number(amount) }
    );

    return res.status(200).json({
      message: "Transacción actualizada correctamente",
      transaction: updatedTransaction,
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar una transacción por número de cuenta
export const deleteTransactionByNCuenta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { nCuenta } = req.params;

  try {
    nCuenta = isValidNumber(nCuenta) ? String(nCuenta) : nCuenta;

    await transactionService.deleteTransactionByNCuenta(nCuenta);
    return res
      .status(200)
      .json({ message: "Transacción eliminada correctamente" });
  } catch (error) {
    next(error);
  }
};

// Obtener todas las transacciones por cuenta de origen
export const getTransactionsByOriginAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { originAcc } = req.params;

  try {
    // Verificar si originAcc está definido y es un número válido
    if (!isValidNumber(originAcc)) {
      return res
        .status(400)
        .json({ message: "La cuenta de origen debe ser un número válido." });
    }

    const accountNumber: number = Number(originAcc); // Convertir a número

    const transactions =
      await transactionService.getTransactionsByOriginAccount(accountNumber);
    if (transactions.length === 0) {
      return res.status(404).json({
        message: "No se encontraron transacciones para esta cuenta de origen.",
      });
    }
    return res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};





export const getTransactionHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { accountNumber } = req.params; // accountNumber es string por defecto
  let { startDate, endDate } = req.query;

  try {
    // Convertir accountNumber a número si es un string
    const accNum = Number(accountNumber);

    // Verificar si accountNumber es un número válido
    if (isNaN(accNum) || !isValidNumber(accNum)) {
      return res.status(400).json({ message: "Número de cuenta inválido." });
    }

    // Convertir startDate y endDate a string si no son undefined
    const startDateStr = typeof startDate === "string" ? startDate : undefined;
    const endDateStr = typeof endDate === "string" ? endDate : undefined;

    // Llamar al servicio de transacciones con los parámetros adecuados
    const transactions = await transactionService.getTransactionHistory(
      accNum, // Pasar el número convertido
      startDateStr,
      endDateStr
    );

    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron transacciones para esta cuenta." });
    }

    return res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};
