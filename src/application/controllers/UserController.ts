import { Request, Response, NextFunction } from "express";
import User from "../../domain/model/User";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../../config/jwtConfig";

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

export const register = async (req: Request, res: Response) => {
  const { username, DNI, pass } = req.body;

  try {
    // Verificar si el DNI ya está registrado
    const existingUser = await User.findOne({ where: { DNI } });
    if (existingUser) {
      return res.status(400).json({ message: "DNI ya registrado." });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(pass, 10);

    // Crear un nuevo usuario con la contraseña hasheada
    const newUser = await User.create({ username, DNI, pass: hashedPassword });

    return res.status(201).json({
      message: "Usuario creado exitosamente.",
      user: {
        id: newUser.id,
        username: newUser.username,
        DNI: newUser.DNI,
      },
    });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};
// Iniciar sesión

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.body); // Para depurar

  const { DNI, pass } = req.body;

  // Verifica que los datos requeridos estén presentes
  if (!DNI || !pass) {
    return res
      .status(400)
      .json({ message: "Por favor, proporciona DNI y contraseña." });
  }

  try {
    // Busca al usuario por DNI
    const user = await User.findOne({ where: { DNI } });
    console.log("Usuario encontrado:", user); // Para depurar

    // Verifica si el usuario existe
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    // Compara la contraseña proporcionada con la almacenada
    const isMatch = await bcrypt.compare(pass, user.pass);
    console.log("Coincidencia de contraseña:", isMatch); // Para depurar

    // Si las contraseñas no coinciden, devuelve un error
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    // Crea un token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      jwtSecret,
      { expiresIn: "1h" }
    );

    // Responde con el token y la información del usuario
    return res.status(200).json({
      message: "Inicio de sesión exitoso.",
      token,
      user: {
        id: user.id,
        username: user.username,
        DNI: user.DNI,
      },
    });
  } catch (err) {
    console.error("Error en el inicio de sesión:", err); // Registro de errores
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};


export const getUserByDni = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Depuramos el parámetro 'dni'
  console.log(req.params);

  // Extraemos el DNI del parámetro de la solicitud y lo limpiamos
  const { dni } = req.params;
  const cleanedDni = dni.trim(); // Limpia el DNI

  if (!cleanedDni) {
    return res.status(400).json({ message: "DNI es requerido." });
  }

  try {
    // Buscamos el usuario en la base de datos usando el DNI limpio
    const user = await User.findOne({ where: { DNI: cleanedDni } });

    // Si no se encuentra el usuario, devolvemos un error 404
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Devolvemos los datos del usuario
    return res.status(200).json({
      id: user.id,
      username: user.username,
      DNI: user.DNI,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    // Manejo de errores
    console.error(err); // Log del error para depuración
    next(err); // Pasa el error al middleware de manejo de errores
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

