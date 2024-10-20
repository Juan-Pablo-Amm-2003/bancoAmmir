import { Request, Response, NextFunction } from "express";
import UserService from "../../domain/services/UserService";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../../config/jwtConfig";
import ApiError from "../../utils/ApiError"; 

// Registrar un usuario
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, DNI, pass } = req.body;

  try {
    const newUser = await UserService.createUser(username, DNI, pass);
    return res.status(201).json({
      message: "Usuario registrado exitosamente.",
      user: {
        id: newUser.id,
        username: newUser.username,
        DNI: newUser.DNI,
      },
    });
  } catch (error) {
    next(error); // Pasa el error al middleware
  }
};

// Iniciar sesión
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { DNI, pass } = req.body;

  try {
    const user = await UserService.getUserByDNI(DNI);
    const isMatch = await bcrypt.compare(pass, user.pass);
    if (!isMatch) {
      return next(ApiError.unauthorized("Credenciales inválidas.")); // Usa ApiError para el manejo de errores
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      jwtSecret,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Inicio de sesión exitoso.",
      token,
      user: {
        id: user.id,
        username: user.username,
        DNI: user.DNI,
      },
    });
  } catch (error) {
    next(error); // Pasa el error al middleware
  }
};

// Obtener un usuario por DNI
export const getUserByDni = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { dni } = req.params;

  try {
    const user = await UserService.getUserByDNI(dni);
    return res.status(200).json({
      id: user.id,
      username: user.username,
      DNI: user.DNI,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    next(error); // Pasa el error al middleware
  }
};

// Actualizar un usuario
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { username, DNI, pass } = req.body;

  try {
    const updatedUser = await UserService.updateUser(
      Number(id),
      username,
      DNI,
      pass
    );
    return res.status(200).json({
      message: "Usuario actualizado correctamente",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        DNI: updatedUser.DNI,
      },
    });
  } catch (error) {
    next(error); // Pasa el error al middleware
  }
};

// Eliminar un usuario
export const deleteUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    await UserService.deleteUserById(Number(id));
    return res
      .status(200)
      .json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    next(error); // Pasa el error al middleware
  }
};
