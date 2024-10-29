// repositories/AccountRepository.ts
import Account from "../model/Account";

export class AccountRepository {
  findAll(arg0: { where: { userId: number; }; }): Account[] | PromiseLike<Account[]> {
    throw new Error("Method not implemented.");
  }
  findOne(arg0: { where: { nCuenta: number; }; }): Account | PromiseLike<Account | null> | null {
    throw new Error("Method not implemented.");
  }
  async findById(id: number): Promise<Account | null> {
    return Account.findByPk(id);
  }

  async findByUserId(userId: number): Promise<Account[]> {
    return Account.findAll({ where: { userId } });
  }

  async create(account: Account): Promise<void> {
    await account.save();
  }

  async update(account: Account): Promise<void> {
    await account.save();
  }

  async findByAccountNumber(nCuenta: number): Promise<Account | null> {
    return Account.findOne({ where: { nCuenta } });
  }

  async delete(id: number): Promise<void> {
    const account = await this.findById(id);
    if (account) {
      await account.destroy();
    }
  }
}
