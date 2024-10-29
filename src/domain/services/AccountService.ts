import { AccountRepository } from "../repositories/AccountRepository";
import Account from "../model/Account";
import Transaction from "../model/Transaction";
import sequelize from "../../infrastructure/database/sqlconfig";

// Excepciones personalizadas
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
  private accountRepository: AccountRepository;

  constructor(accountRepository: AccountRepository = new AccountRepository()) {
    this.accountRepository = accountRepository;
  }

  // Método para obtener una cuenta por su número de cuenta
  async getAccountByAccountNumber(
    accountNumber: number
  ): Promise<Account | null> {
    return this.accountRepository.findByAccountNumber(accountNumber);
  }

  // Método para obtener todas las cuentas de un usuario específico
  async getAccountsByUserId(userId: number): Promise<Account[]> {
    return this.accountRepository.findByUserId(userId);
  }

  async createTransaction(
    id: number,
    parsedAmount: number,
    type: string,
    targetAcc: number | null = null
  ): Promise<void> {
    const transactionData = {
      originAcc: id,
      amount: parsedAmount,
      transactionDate: new Date(),
      type: type,
      targetAcc: targetAcc !== null ? targetAcc : id,
    };

    await Transaction.create(transactionData);
  }

  async createAccount(
    userId: number,
    initialBalance: number,
    nCuenta: number
  ): Promise<Account> {
    if (initialBalance < 0) {
      throw new Error("El saldo inicial no puede ser negativo.");
    }

    const account = await Account.create({
      userId,
      balance: initialBalance,
      nCuenta,
      creationDate: new Date(),
    });

    if (!account) {
      throw new Error("Error al crear la cuenta.");
    }

    return account;
  }

  async getAccountById(id: number): Promise<Account | null> {
    return this.accountRepository.findById(id);
  }

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

  async updateAccountBalance(id: number, newBalance: number): Promise<void> {
    const account = await this.getAccountById(id);
    if (!account) {
      throw new AccountNotFoundError("Cuenta no encontrada.");
    }
    account.balance = newBalance;
    await account.save();
  }

  async transferFunds(
    originAccId: number,
    targetAccId: number,
    amount: number
  ): Promise<void> {
    if (amount <= 0) {
      throw new Error("El monto debe ser mayor que cero.");
    }

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

    await sequelize.transaction(async (t) => {
      originAccount.balance -= amount;
      targetAccount.balance += amount;

      await originAccount.save({ transaction: t });
      await targetAccount.save({ transaction: t });

      // Crear transacción de transferencia
      await Transaction.create(
        {
          originAcc: originAccId,
          targetAcc: targetAccId,
          amount,
          transactionDate: new Date(),
          type: "transfer",
        },
        { transaction: t }
      );
    });
  }
}
