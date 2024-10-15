// repositories/AccountRepository.ts
import Account from "../model/Account";

export class AccountRepository {
  async findById(id: number): Promise<Account | null> {
    return Account.findByPk(id);
  }

  async findByUserId(id: number): Promise<Account[]> {
    return Account.findAll({ where: { id } });
  }

  async create(account: Account): Promise<void> {
    await account.save();
  }

  async update(account: Account): Promise<void> {
    await account.save();
  }

  async delete(id: number): Promise<void> {
    const account = await this.findById(id);
    if (account) {
      await account.destroy();
    }
  }
}
