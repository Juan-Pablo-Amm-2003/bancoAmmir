// middleware/validationMiddleware.ts
import { body } from "express-validator";

export const validateUserUpdate = [
  body("username")
    .optional() // Permitir que no se envíe si no se va a actualizar
    .isString()
    .withMessage("El nombre de usuario debe ser una cadena."),
  body("DNI")
    .optional() // Permitir que no se envíe si no se va a actualizar
    .isLength({ min: 1 })
    .withMessage("El DNI no puede estar vacío."),
  body("pass")
    .optional() // Permitir que no se envíe si no se va a actualizar
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres."),
];
