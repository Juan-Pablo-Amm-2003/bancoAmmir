import { AccountRepository } from "../repositories/AccountRepository";
import Account from "../model/Account";
import Transaction from "../model/Transaction";

// Excepciones personalizadas para la capa de dominio
class AccountNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountNotFoundError";
  }
}

class InsufficientFundsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientFundsError";
  }
}

class TransactionAssociatedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransactionAssociatedError";
  }
}

export class AccountService {
  constructor(private accountRepository: AccountRepository) {}

  // Crear una nueva cuenta con un saldo inicial
  async createAccount(
    userId: number,
    initialBalance: number,
    nCuenta: number
  ): Promise<Account> {
    const newAccount = await Account.create({
      userId: userId,
      balance: initialBalance,
      nCuenta: nCuenta,
      creationDate: new Date(),
    });

    return newAccount;
  }

  // Obtener una cuenta por su ID
  async getAccountById(id: number): Promise<Account | null> {
    return this.accountRepository.findById(id);
  }

  // Eliminar una cuenta por su ID (verificando transacciones asociadas)
  async deleteAccount(id: number): Promise<void> {
    const transactionsCount = await Transaction.count({
      where: { originAcc: id },
    });

    if (transactionsCount > 0) {
      throw new TransactionAssociatedError(
        "No se puede eliminar la cuenta porque tiene transacciones asociadas."
      );
    }

    const deletedCount = await Account.destroy({ where: { id } });

    if (deletedCount === 0) {
      throw new AccountNotFoundError("Cuenta no encontrada.");
    }
  }

  // Obtener todas las cuentas de un usuario por su ID de usuario
  async getAccountsByUserId(userId: number): Promise<Account[]> {
    return this.accountRepository.findByUserId(userId);
  }

  // Transferencia de fondos entre cuentas
  async transferFunds(
    originAccId: number,
    targetAccId: number,
    amount: number
  ): Promise<void> {
    const originAccount = await this.accountRepository.findById(originAccId);
    const targetAccount = await this.accountRepository.findById(targetAccId);

    if (!originAccount || !targetAccount) {
      throw new AccountNotFoundError(
        "Cuenta de origen o destino no encontrada."
      );
    }

    if (originAccount.balance < amount) {
      throw new InsufficientFundsError(
        "Fondos insuficientes en la cuenta de origen."
      );
    }

    originAccount.balance -= amount;
    targetAccount.balance += amount;

    await Transaction.create({
      originAcc: originAccId,
      targetAcc: targetAccId,
      amount: amount,
      transactionDate: new Date(),
      type: "transfer",
    });

    await originAccount.save();
    await targetAccount.save();
  }
}
