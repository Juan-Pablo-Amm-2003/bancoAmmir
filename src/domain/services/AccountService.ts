// services/AccountService.ts
import { AccountRepository } from "../repositories/AccountRepository";
import Account from "../model/Account";
import Transaction from "../model/Transaction"; 

export class AccountService {
  constructor(private accountRepository: AccountRepository) {}

  // Crear una nueva cuenta con un saldo inicial
  async createAccount(
    userId: number,
    initialBalance: number,
    nCuenta: number
  ): Promise<Account> {
    // Crear una nueva cuenta directamente usando el método create
    const newAccount = await Account.create({
      userId: userId, // Asociar el ID de usuario
      balance: initialBalance,
      nCuenta: nCuenta,
      creationDate: new Date(), // Registrar la fecha de creación
    });

    return newAccount; // Retornar la nueva cuenta creada
  }

  // Obtener una cuenta por su ID
  async getAccountById(id: number): Promise<Account | null> {
    return this.accountRepository.findById(id);
  }

  // Eliminar una cuenta por su ID (verificando transacciones asociadas)
  async deleteAccount(id: number): Promise<void> {
    // Verificar si la cuenta tiene transacciones asociadas
    const transactionsCount = await Transaction.count({
      where: { originAcc: id },
    });

    if (transactionsCount > 0) {
      throw new Error(
        "No se puede eliminar la cuenta porque tiene transacciones asociadas."
      );
    }

    const deletedCount = await Account.destroy({ where: { id } });

    if (deletedCount === 0) {
      throw new Error("Cuenta no encontrada.");
    }
  }

  // Obtener todas las cuentas de un usuario por su ID de usuario
  async getAccountsByUserId(userId: number): Promise<Account[]> {
    return this.accountRepository.findByUserId(userId);
  }

  async transferFunds(
    originAccId: number,
    targetAccId: number,
    amount: number
  ): Promise<void> {
    const originAccount = await this.accountRepository.findById(originAccId);
    const targetAccount = await this.accountRepository.findById(targetAccId);

    if (!originAccount || !targetAccount) {
      throw new Error("Cuenta de origen o destino no encontrada.");
    }

    if (originAccount.balance < amount) {
      throw new Error("Fondos insuficientes en la cuenta de origen.");
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
