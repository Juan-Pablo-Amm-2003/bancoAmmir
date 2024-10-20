import User from "../../domain/model/User";
import bcrypt from "bcrypt";
import ApiError from "../../utils/ApiError"; // Asegúrate de usar la ruta correcta

class UserService {
  // Crear un nuevo usuario
  async createUser(username: string, DNI: string, pass: string) {
    const existingUser = await User.findOne({ where: { DNI } });
    if (existingUser) {
      throw ApiError.badRequest("El DNI ya está en uso."); // Lanza un ApiError
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const newUser = await User.create({
      username,
      DNI,
      pass: hashedPassword,
    });

    return newUser;
  }

  // Obtener un usuario por DNI
  async getUserByDNI(DNI: string) {
    const user = await User.findOne({ where: { DNI } });
    if (!user) {
      throw ApiError.notFound("Usuario no encontrado."); // Lanza un ApiError
    }
    return user;
  }

  // Actualizar un usuario
  async updateUser(id: number, username?: string, DNI?: string, pass?: string) {
    const user = await User.findByPk(id);
    if (!user) {
      throw ApiError.notFound("Usuario no encontrado."); // Lanza un ApiError
    }

    if (pass) {
      user.pass = await bcrypt.hash(pass, 10);
    }

    user.username = username ?? user.username;
    user.DNI = DNI ?? user.DNI;

    await user.save();
    return user;
  }

  // Eliminar un usuario
  async deleteUserById(id: number) {
    const user = await User.findByPk(id);
    if (!user) {
      throw ApiError.notFound("Usuario no encontrado."); // Lanza un ApiError
    }

    await user.destroy();
  }

  // Obtener todos los usuarios
  async getAllUsers() {
    const users = await User.findAll();
    return users;
  }
}

export default new UserService();
