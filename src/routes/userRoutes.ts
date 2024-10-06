import { Router } from "express";
import {
  login,
  getUserById,
  register,
  updateUser,
  deleteUserById,
} from "../controllers/userControllers";

const router = Router();

// Ruta para registrar un nuevo usuario
router.post("/register", register);

// Ruta para iniciar sesión
router.post("/login", login);

// Ruta para obtener un usuario por ID
router.get("/user/:id", getUserById);

// Ruta para eliminar un usuario por ID
router.delete("/user/:id", deleteUserById);

// Ruta para actualizar un usuario
router.put("/user/:id", updateUser);

export default router;
