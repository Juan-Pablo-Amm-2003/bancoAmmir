import { Router } from "express";
import {
  createAccount,
  getAccountById,
  updateAccount,
  deleteAccountById,
  getAccountsByUserId,
} from "../controllers/accountController"; // Asegúrate de que la ruta al controlador sea correcta

const router = Router();

// Rutas para la gestión de cuentas
router.post("/", createAccount); // Crear una nueva cuenta
router.get("/:id", getAccountById); // Obtener cuenta por ID
router.put("/:id", updateAccount); // Actualizar cuenta por ID
router.delete("/:id", deleteAccountById); // Eliminar cuenta por ID
router.get("/user/:userId", getAccountsByUserId); // Obtener todas las cuentas de un usuario

export default router;
