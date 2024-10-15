// src/domain/repositories/SequelizeTransactionRepository.ts
import { TransactionRepository } from "../../domain/repositories/TransactionRepository";
import Transaction from "../../domain/model/Transaction";

export class SequelizeTransactionRepository implements TransactionRepository {
  async findById(id: number): Promise<Transaction | null> {
    return await Transaction.findByPk(id); // Encuentra una transacción por su ID
  }

  async findByOriginAccount(originAcc: number): Promise<Transaction[]> {
    // Busca transacciones por cuenta de origen
    return await Transaction.findAll({ where: { originAcc } });
  }

  async create(data: Transaction): Promise<Transaction> {
    return await Transaction.create(data); // Crea una nueva transacción
  }

  async update(transaction: Transaction): Promise<void> {
    await Transaction.update(transaction, { where: { id: transaction.id } }); // Actualiza una transacción existente
  }

  async delete(id: number): Promise<void> {
    await Transaction.destroy({ where: { id } }); // Elimina una transacción por su ID
  }

  async findAll(): Promise<Transaction[]> {
    return await Transaction.findAll(); // Devuelve todas las transacciones
  }
}
