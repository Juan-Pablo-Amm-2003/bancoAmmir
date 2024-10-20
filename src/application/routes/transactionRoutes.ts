import { Router } from "express";
import {
  createTransaction,
  deleteTransactionByNCuenta,
  getTransactionHistory,
} from "../controllers/TransactionController";
import { authenticateToken } from "../../middleware/authMiddleware";
import errorHandler from "../../middleware/errorHandler"; 

const router = Router();

// Rutas para la gestión de transacciones
router.post("/", authenticateToken, createTransaction);
router.delete("/:nCuenta", authenticateToken, deleteTransactionByNCuenta);

// Obtener el historial de transacciones por número de cuenta y fechas
router.get("/history/:accountNumber", authenticateToken, getTransactionHistory);

// Manejo de errores
router.use(errorHandler); // Agrega el manejador de errores

export default router;
