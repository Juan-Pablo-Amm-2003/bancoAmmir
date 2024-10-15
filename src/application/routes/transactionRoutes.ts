import { Router } from "express";
import {
  createTransaction,
  deleteTransactionByNCuenta,
  getTransactionHistory
} from "../controllers/TransactionController";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

// Rutas para la gestión de transacciones
router.post("/", authenticateToken, createTransaction);
router.delete("/:nCuenta", authenticateToken, deleteTransactionByNCuenta);


// Obtener el historial de transacciones por número de cuenta y fechas
router.get("/history/:accountNumber", authenticateToken, getTransactionHistory);

export default router;
