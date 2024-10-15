import {
  UserAttributes,
  UserCreationAttributes,
} from "../../domain/model/User"; 
import User from "../../domain/model/User";

export class UserRepository {
  async findById(id: number): Promise<User | null> {
    return await User.findByPk(id);
  }

  async findByDNI(DNI: string): Promise<User | null> {
    return await User.findOne({ where: { DNI } });
  }

  async create(data: UserCreationAttributes): Promise<User> {
    return await User.create(data);
  }

  async update(id: number, user: User): Promise<void> {
    await User.update(user, { where: { id: user.id } });
  }

  async delete(id: number): Promise<void> {
    await User.destroy({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return await User.findAll();
  }
}
