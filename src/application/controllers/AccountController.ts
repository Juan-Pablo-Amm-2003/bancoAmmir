import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { AccountService } from "../../domain/services/AccountService";
import { AccountRepository } from "../../domain/repositories/AccountRepository";
import ApiError from "../../utils/ApiError";

const accountService = new AccountService(new AccountRepository());

// Middleware para validar los datos de la cuenta
const validateAccount = [
  body("userId").isNumeric().withMessage("El userId debe ser numérico."),
  body("balance").isNumeric().withMessage("El balance debe ser numérico."),
  body("nCuenta")
    .isNumeric()
    .withMessage("El número de cuenta debe ser numérico."),
];

// Crear una nueva cuenta
export const createAccount = [
  ...validateAccount,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(ApiError.badRequest("Datos inválidos en la solicitud"));
    }

    const { userId, balance, nCuenta } = req.body;

    try {
      const existingAccount = await accountService.getAccountByAccountNumber(
        Number(nCuenta)
      );
      if (existingAccount) {
        return next(ApiError.badRequest("El número de cuenta ya existe."));
      }

      const newAccount = await accountService.createAccount(
        Number(userId),
        Number(balance),
        Number(nCuenta)
      );

      return res.status(201).json({
        message: "Cuenta creada correctamente",
        account: newAccount,
      });
    } catch (err) {
      next(err);
    }
  },
];

// Obtener cuenta por número de cuenta
export const getAccountByAccountNumber = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { nCuenta } = req.params;

  try {
    const account = await accountService.getAccountByAccountNumber(
      Number(nCuenta)
    );
    if (!account) {
      return next(ApiError.notFound("Cuenta no encontrada."));
    }
    return res.status(200).json(account);
  } catch (err) {
    next(err);
  }
};

// Gestionar cuenta (depósito o retiro)
export const manageAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { amount, operation } = req.body;

  try {
    // Obtener la cuenta
    const account = await accountService.getAccountById(Number(id));
    console.log("Account fetched:", account);

    if (!account) {
      return next(ApiError.notFound("Cuenta no encontrada."));
    }

    // Convertir balance a número, asegurando que sea correcto
    const balance = typeof account.balance === 'string' ? parseFloat(account.balance) : account.balance;
    console.log("Converted balance:", balance);

    // Validar el monto
    const parsedAmount = parseFloat(amount);
    console.log("Parsed amount:", parsedAmount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return next(ApiError.badRequest("El monto debe ser un número positivo."));
    }

    let newBalance: number;

    // Operación de depósito
    if (operation === "deposit") {
      console.log("Operation: deposit");
      newBalance = balance + parsedAmount; // Asegúrate de que balance y parsedAmount sean números
      console.log("New balance after deposit calculation:", newBalance);

      // Validar que newBalance es un número
      if (isNaN(newBalance)) {
        return next(ApiError.badRequest("El nuevo balance no es un número válido."));
      }

      await accountService.updateAccountBalance(account.id, newBalance);
      await accountService.createTransaction(
        account.id,
        parsedAmount,
        "deposit"
      );

      return res.status(200).json({
        message: "Depósito realizado exitosamente.",
        balance: newBalance.toFixed(2),
      });

    // Operación de retiro
    } else if (operation === "withdraw") {
      console.log("Operation: withdraw");
      if (balance < parsedAmount) {
        return next(ApiError.badRequest("Fondos insuficientes."));
      }

      newBalance = balance - parsedAmount;
      console.log("New balance after withdraw calculation:", newBalance);

      // Validar que newBalance es un número
      if (isNaN(newBalance)) {
        return next(ApiError.badRequest("El nuevo balance no es un número válido."));
      }

      await accountService.updateAccountBalance(account.id, newBalance);
      await accountService.createTransaction(
        account.id,
        parsedAmount,
        "withdraw"
      );

      return res.status(200).json({
        message: "Retiro realizado exitosamente.",
        balance: newBalance.toFixed(2),
      });

    } else {
      return next(ApiError.badRequest("Operación no válida."));
    }
  } catch (error) {
    console.error("Error occurred:", error);
    next(error);
  }
};



// Obtener cuenta por ID
export const getAccountById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const account = await accountService.getAccountById(Number(id));
    if (!account) {
      return next(ApiError.notFound("Cuenta no encontrada"));
    }
    return res.status(200).json(account);
  } catch (err) {
    next(err);
  }
};

// Eliminar cuenta por ID
export const deleteAccountById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    await accountService.deleteAccount(Number(id));
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// Obtener cuentas por ID de usuario
export const getAccountsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  try {
    const accounts = await accountService.getAccountsByUserId(Number(userId));
    return res.status(200).json(accounts);
  } catch (err) {
    next(err);
  }
};

export default {
  createAccount,
  manageAccount,
  getAccountById,
  deleteAccountById,
  getAccountsByUserId,
  getAccountByAccountNumber,
};
