// controllers/AccountController.ts
import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { AccountService } from "../../domain/services/AccountService";
import {AccountRepository} from "../../domain/repositories/AccountRepository";
import Transaction from "../../domain/model/Transaction";
import Account from "../../domain/model/Account";

const accountService = new AccountService(new AccountRepository());

// Middleware for validating account data
const validateAccount = [
  body("userId").isNumeric().withMessage("El userId debe ser numérico."),
  body("balance").isNumeric().withMessage("El balance debe ser numérico."),
  body("nCuenta")
    .isNumeric()
    .withMessage("El número de cuenta debe ser numérico."),
];

// Create a new account
export const createAccount = [
  ...validateAccount,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = Number(req.body.userId);
    const balance = Number(req.body.balance);
    const nCuenta = Number(req.body.nCuenta);

    try {
      const existingAccount = await accountService.getAccountsByUserId(userId);
if (existingAccount) {
  return res.status(400).json({ message: "El número de cuenta ya existe." });
}


      const newAccount = await accountService.createAccount(
        userId,
        balance,
        nCuenta
      );
      return res.status(201).json({
        message: "Cuenta creada correctamente",
        account: newAccount,
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
];

export const manageAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params; // id de la cuenta
  const { amount, operation } = req.body; // monto y operación (deposit/withdraw)

  try {
    const account = await Account.findByPk(Number(id)); // Obtener la cuenta
    if (!account) {
      return res.status(404).json({ message: "Cuenta no encontrada." });
    }

    const parsedAmount = parseFloat(amount); // Convertir a número

    if (operation === "deposit") {
      account.balance += parsedAmount; // Aumentar el balance
      await account.save(); // Guardar cambios

      // Guardar la transacción
      await Transaction.create({
        originAcc: account.id,
        targetAcc: account.id, // Para depósitos, targetAcc es la misma cuenta
        amount: parsedAmount,
        type: "deposit",
      });

      return res.status(200).json({
        message: "Depósito realizado exitosamente.",
        balance: account.balance.toFixed(2), // Convertir a número y formatear
      });
    } else if (operation === "withdraw") {
      if (account.balance < parsedAmount) {
        return res.status(400).json({ message: "Fondos insuficientes." });
      }
      account.balance -= parsedAmount; // Disminuir el balance
      await account.save(); // Guardar cambios

      // Guardar la transacción
      await Transaction.create({
        originAcc: account.id,
        targetAcc: account.id, // Para retiros, targetAcc es la misma cuenta
        amount: parsedAmount,
        type: "withdraw",
      });

      return res.status(200).json({
        message: "Retiro realizado exitosamente.",
        balance: account.balance.toFixed(2), // Convertir a número y formatear
      });
    } else {
      return res.status(400).json({ message: "Operación no válida." });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Ha ocurrido un error inesperado." });
  }
};


// Get account by ID
export const getAccountById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const account = await accountService.getAccountById(Number(id));
    if (!account) {
      return res.status(404).json({ message: "Cuenta no encontrada" });
    }
    return res.status(200).json(account);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Delete account by ID, validating associated transactions
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
    console.error(err);
    next(err);
  }
};

// Get accounts by user ID
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
    console.error(err);
    next(err);
  }
};

// Exporting all methods
export default {
  createAccount,
  manageAccount,
  getAccountById,
  deleteAccountById,
  getAccountsByUserId,
};
