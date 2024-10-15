// src/domain/repositories/TransactionRepository.ts
import Transaction from "../model/Transaction";

export interface TransactionRepository {
  create(data: Transaction): Promise<Transaction>;
  findById(id: number): Promise<Transaction | null>;
  findByOriginAccount(originAcc: number): Promise<Transaction[]>;
  findAll(): Promise<Transaction[]>;
  update(transaction: Transaction): Promise<void>;
  delete(id: number): Promise<void>;
}
