import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { AccountService } from "../../domain/services/AccountService";
import { AccountRepository } from "../../domain/repositories/AccountRepository";
import Transaction from "../../domain/model/Transaction";
import Account from "../../domain/model/Account";
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
      const existingAccount = await accountService.getAccountsByUserId(
        Number(userId)
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

// Gestionar cuenta (depósito o retiro)
export const manageAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { amount, operation } = req.body;

  try {
    const account = await Account.findByPk(Number(id));
    if (!account) {
      return next(ApiError.notFound("Cuenta no encontrada."));
    }

    const parsedAmount = parseFloat(amount);

    if (operation === "deposit") {
      account.balance += parsedAmount;
      await account.save();

      // Guardar la transacción
      await Transaction.create({
        originAcc: account.id,
        targetAcc: account.id,
        amount: parsedAmount,
        type: "deposit",
      });

      return res.status(200).json({
        message: "Depósito realizado exitosamente.",
        balance: account.balance.toFixed(2),
      });
    } else if (operation === "withdraw") {
      if (account.balance < parsedAmount) {
        return next(ApiError.badRequest("Fondos insuficientes."));
      }
      account.balance -= parsedAmount;
      await account.save();

      // Guardar la transacción
      await Transaction.create({
        originAcc: account.id,
        targetAcc: account.id,
        amount: parsedAmount,
        type: "withdraw",
      });

      return res.status(200).json({
        message: "Retiro realizado exitosamente.",
        balance: account.balance.toFixed(2),
      });
    } else {
      return next(ApiError.badRequest("Operación no válida."));
    }
  } catch (error) {
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

// Exportar todos los métodos
export default {
  createAccount,
  manageAccount,
  getAccountById,
  deleteAccountById,
  getAccountsByUserId,
};
