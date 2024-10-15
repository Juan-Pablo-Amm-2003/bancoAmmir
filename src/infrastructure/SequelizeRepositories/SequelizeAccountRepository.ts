import { AccountRepository } from "../../domain/repositories/AccountRepository";
import Account from "../../domain/model/Account";

export class SequelizeAccountRepository implements AccountRepository {
  async findById(id: number): Promise<Account | null> {
    return await Account.findByPk(id);
  }

  async findByUserId(userId: number): Promise<Account[]> {
    // Busca cuentas por el ID del usuario
    const accounts = await Account.findAll({ where: { userId } });
    return accounts; // Devuelve un array de cuentas
  }

  async create(account: Account): Promise<void> {
    await account.save();
  }

  async update(account: Account): Promise<void> {
    await account.save();
  }

  async delete(id: number): Promise<void> {
    await Account.destroy({ where: { id } });
  }
}
