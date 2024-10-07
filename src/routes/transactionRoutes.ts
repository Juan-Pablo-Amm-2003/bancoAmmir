import { Router } from "express";
import {
  createTransaction,
  getAllTransactions,
  getTransactionByNCuenta,
  deleteTransactionByNCuenta,
  getTransactionsByOriginAccount, 
} from "../controllers/transactionController"; 
import { authenticateToken } from "../middleware/authMiddleware";
const router = Router();

// Rutas para la gestión de transacciones
router.post("/", authenticateToken, createTransaction); 
router.get("/", authenticateToken, getAllTransactions); 
router.get("/:nCuenta", getTransactionByNCuenta);
router.delete("/:nCuenta", authenticateToken, deleteTransactionByNCuenta); 
router.get(
  "/origin/:originAcc",
  authenticateToken,
  getTransactionsByOriginAccount
); 

export default router;
