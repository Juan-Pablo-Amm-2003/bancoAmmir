import { Router } from "express";
import {
  createTransaction,
  getAllTransactions,
  getTransactionByNCuenta,
  deleteTransactionByNCuenta,
  getTransactionsByOriginAccount, // Asegúrate de que el método correcto esté aquí
} from "../controllers/transactionController"; // Asegúrate de que la ruta al controlador sea correcta

const router = Router();

// Rutas para la gestión de transacciones
router.post("/", createTransaction); // Crear una nueva transacción
router.get("/", getAllTransactions); // Obtener todas las transacciones
router.get("/:nCuenta", getTransactionByNCuenta); // Obtener transacciones por número de cuenta
router.delete("/:nCuenta", deleteTransactionByNCuenta); // Eliminar transacciones por número de cuenta
router.get("/origin/:originAcc", getTransactionsByOriginAccount); // Obtener transacciones por cuenta de origen

export default router;
