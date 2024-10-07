import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/jwtConfig"; 


// Middleware para validar el cuerpo de la solicitud
const validateUser = [
  body("username")
    .isString()
    .withMessage("El nombre de usuario debe ser una cadena."),
  body("DNI").isLength({ min: 1 }).withMessage("El DNI no puede estar vacío."),
  body("pass")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres."),
];

// Registrar un nuevo usuario
export const register = [
  ...validateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, DNI, pass } = req.body;

    try {
      const existingUser = await User.findOne({ where: { DNI } });
      if (existingUser) {
        return res.status(400).json({ message: "El DNI ya está en uso." });
      }

      const hashedPassword = await bcrypt.hash(pass, 10);
      const newUser = await User.create({
        username,
        DNI,
        pass: hashedPassword,
      });

      return res.status(201).json({
        message: "Usuario creado correctamente",
        user: {
          id: newUser.id,
          username: newUser.username,
          DNI: newUser.DNI,
        },
      });
    } catch (err) {
      next(err);
    }
  },
];

// Iniciar sesión
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { DNI, pass } = req.body;

  try {
    // Busca al usuario en la base de datos usando el DNI
    const user = await User.findOne({ where: { DNI } });
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    // Verifica la contraseña
    const isMatch = await bcrypt.compare(pass, user.pass);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    // Generar un token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username }, // Carga útil del token
      jwtSecret, // Usa la clave secreta del archivo de configuración
      { expiresIn: "1h" } // Expiración del token
    );

    // Respuesta exitosa al cliente
    return res.status(200).json({
      message: "Inicio de sesión exitoso.",
      token, // Devuelve el token al cliente
      user: {
        id: user.id,
        username: user.username,
        DNI: user.DNI,
      },
    });
  } catch (err) {
    // Manejo de errores
    next(err);
  }
};
// Obtener un usuario por ID
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    return res.status(200).json({
      id: user.id,
      username: user.username,
      DNI: user.DNI,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    next(err);
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
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (pass) {
      user.pass = await bcrypt.hash(pass, 10);
    }

    user.username = username !== undefined ? username : user.username;
    user.DNI = DNI !== undefined ? DNI : user.DNI;

    await user.save();

    return res.status(200).json({
      message: "Usuario actualizado correctamente",
      user: {
        id: user.id,
        username: user.username,
        DNI: user.DNI,
      },
    });
  } catch (err) {
    next(err);
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
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    await user.destroy();
    return res
      .status(200)
      .json({ message: "Usuario eliminado correctamente." });
  } catch (err) {
    next(err);
  }
};

// Obtener todos los usuarios
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.findAll();
    return res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};
