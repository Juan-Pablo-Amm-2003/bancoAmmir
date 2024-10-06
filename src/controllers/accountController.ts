import { Request, Response, NextFunction } from "express";
import account from "../models/account"; 


// Crear una nueva cuenta
export const createAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, balance, nCuenta } = req.body;

  try {
    // Verificar si nCuenta es un número
    if (isNaN(Number(nCuenta))) {
      return res
        .status(400)
        .json({ message: "El número de cuenta debe ser numérico." });
    }

    // Verificar si el número de cuenta ya existe
    const existingAccount = await account.findOne({ where: { nCuenta } });
    if (existingAccount) {
      return res
        .status(400)
        .json({ message: "El número de cuenta ya existe." });
    }

    const newAccount = await account.create({
      userId,
      balance,
      nCuenta,
    });

    return res.status(201).json({
      message: "Cuenta creada correctamente",
      account: newAccount,
    });
  } catch (err: any) {
    next(err);
  }
};

// Obtener una cuenta por ID
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
  } catch (err: any) {
    next(err);
  }
};

// Actualizar una cuenta
export const updateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { balance, nCuenta } = req.body;

  try {
    const existingAccount = await account.findByPk(id);
    if (!existingAccount) {
      return res.status(404).json({ message: "Cuenta no encontrada" });
    }

    await existingAccount.update({
      balance: balance !== undefined ? balance : existingAccount.balance,
      nCuenta: nCuenta !== undefined ? nCuenta : existingAccount.nCuenta,
    });

    return res.status(200).json({
      message: "Cuenta actualizada correctamente",
      account: existingAccount,
    });
  } catch (err: any) {
    next(err);
  }
};

// Eliminar una cuenta
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
  } catch (err: any) {
    next(err);
  }
};

// Obtener todas las cuentas de un usuario
export const getAccountsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  try {
    const userAccounts = await account.findAll({ where: { userId } });
    return res.status(200).json(userAccounts);
  } catch (err: any) {
    next(err);
  }
};
