import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import user from "../models/user";

// Registro de nuevo usuario
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, pass, DNI } = req.body;

  try {
    // Verifica si el DNI ya está registrado
    const existingUser = await user.findOne({ where: { DNI } });
    if (existingUser) {
      return res.status(400).json({ message: "El DNI ya está registrado" });
    }

    // Hashear contraseña
    const hashedPass = await bcrypt.hash(pass, 10);

    // Crear usuario
    const newUser = await user.create({
      username,
      pass: hashedPass,
      DNI,
    });

    return res
      .status(201)
      .json({ message: "Usuario registrado exitosamente", user: newUser });
  } catch (err: any) {
    next(err); // Manejar errores con un middleware de errores
  }
};

// Login de usuario
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { DNI, pass } = req.body;

  try {
    // Buscar usuario por DNI
    const existingUser = await user.findOne({ where: { DNI } });
    if (!existingUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Comparar la contraseña ingresada con la almacenada
    const validPass = await bcrypt.compare(pass, existingUser.pass);
    if (!validPass) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    return res
      .status(200)
      .json({ message: "Login exitoso", user: existingUser });
  } catch (err: any) {
    next(err); // Manejar errores con un middleware de errores
  }
};

// Obtener usuario por ID
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const existingUser = await user.findByPk(id);
    if (!existingUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ user: existingUser });
  } catch (err: any) {
    next(err); // Manejar errores con un middleware de errores
  }
};

// Eliminar usuario por ID
export const deleteUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const existingUser = await user.findByPk(id);
    if (!existingUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await existingUser.destroy();

    return res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (err: any) {
    next(err); // Manejar errores con un middleware de errores
  }
};

// Actualizar usuario
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { username, pass, DNI } = req.body;

  try {
    const existingUser = await user.findByPk(id);
    if (!existingUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si se proporciona una nueva contraseña, hashearla
    let hashedPass = existingUser.pass;
    if (pass) {
      hashedPass = await bcrypt.hash(pass, 10);
    }

    // Actualizar campos del usuario
    await existingUser.update({
      username: username || existingUser.username,
      pass: hashedPass,
      DNI: DNI || existingUser.DNI,
    });

    return res.status(200).json({
      message: "Usuario actualizado correctamente",
      user: existingUser,
    });
  } catch (err: any) {
    next(err); // Manejar errores con un middleware de errores
  }
};
