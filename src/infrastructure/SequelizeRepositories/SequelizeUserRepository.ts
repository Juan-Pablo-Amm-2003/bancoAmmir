import User from "../../domain/model/User";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { UserCreationAttributes } from "../../domain/model/User"; // Asegúrate de que esté correctamente importado

class SequelizeUserRepository implements UserRepository {
  findByDNI(DNI: string): Promise<User | null> {
      throw new Error("Method not implemented.");
  }
  async create(userData: UserCreationAttributes): Promise<User> {
    return User.create(userData);
  }

  async findById(id: number): Promise<User | null> {
    return User.findByPk(id);
  }

  async update(id: number, userData: Partial<User>): Promise<void> {
    // Cambiado a Promise<void>
    const user = await User.findByPk(id);
    if (user) {
      await user.update(userData);
    } else {
      throw new Error("Usuario no encontrado");
    }
  }

  async delete(id: number): Promise<void> {
    const user = await User.findByPk(id);
    if (user) {
      await user.destroy();
    } else {
      throw new Error("Usuario no encontrado");
    }
  }

  async findAll(): Promise<User[]> {
    return User.findAll();
  }
}

export default SequelizeUserRepository;
