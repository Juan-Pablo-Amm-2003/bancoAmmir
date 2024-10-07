// accountControllers.ts
import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import account from "../models/account";
import transaction from "../models/transaction";
import sequelize from "../config/sqlconfig";

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

    const { userId, balance, nCuenta } = req.body;

    try {
      const existingAccount = await account.findOne({ where: { nCuenta } });
      if (existingAccount) {
        return res
          .status(400)
          .json({ message: "El número de cuenta ya existe." });
      }

      const newAccount = await account.create({ userId, balance, nCuenta });
      return res.status(201).json({
        message: "Cuenta creada correctamente",
        account: newAccount,
      });
    } catch (err) {
      console.error(err); // Log the error for debugging
      next(err);
    }
  },
];

// Get account by ID
export const getAccountById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const existingAccount = await account.findByPk(id);
    if (!existingAccount) {
      return res.status(404).json({ message: "Cuenta no encontrada" });
    }
    return res.status(200).json(existingAccount);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Update an account
export const updateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { amount, operation } = req.body;

  try {
    const existingAccount = await account.findByPk(id);
    if (!existingAccount) {
      return res.status(404).json({ message: "Cuenta no encontrada" });
    }

    // Handle deposit and withdrawal
    if (amount !== undefined && operation) {
      if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ message: "Monto inválido." });
      }

      const currentBalance = Number(existingAccount.balance);

      // Withdrawal logic
      if (operation === "retiro") {
        if (currentBalance < amount) {
          return res.status(400).json({ message: "Saldo insuficiente." });
        }
        existingAccount.balance = parseFloat(
          (currentBalance - amount).toFixed(2)
        );
      }
      // Deposit logic
      else if (operation === "deposit") {
        existingAccount.balance = parseFloat(
          (currentBalance + amount).toFixed(2)
        );
      } else {
        return res.status(400).json({ message: "Operación inválida." });
      }

      // Save changes in a transaction
      await sequelize.transaction(async (t) => {
        await existingAccount.save({ transaction: t });

        await transaction.create(
          {
            originAcc: id,
            targetAcc: id,
            amount: operation === "retiro" ? -amount : amount,
          },
          { transaction: t }
        );
      });
    }

    return res.status(200).json({
      message: "Cuenta actualizada correctamente",
      account: existingAccount,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Delete account by ID
export const deleteAccountById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const existingAccount = await account.findByPk(id);
    if (!existingAccount) {
      return res.status(404).json({ message: "Cuenta no encontrada" });
    }

    await existingAccount.destroy();
    return res.status(200).json({ message: "Cuenta eliminada correctamente" });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Get all accounts for a user
export const getAccountsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  try {
    const userAccounts = await account.findAll({ where: { userId } });
    if (userAccounts.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron cuentas para este usuario." });
    }
    return res.status(200).json(userAccounts);
  } catch (err) {
    console.error(err);
    next(err);
  }
};
