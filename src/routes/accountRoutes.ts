import { Router } from "express";
import {
  createAccount,
  getAccountById,
  updateAccount,
  deleteAccountById,
  getAccountsByUserId,
} from "../controllers/accountController"; 
import { authenticateToken } from "../middleware/authMiddleware";
const router = Router();

// Rutas para la gestión de cuentas
router.post("/", authenticateToken, createAccount); 
router.get("/:id", authenticateToken, getAccountById); 
router.put("/:id", authenticateToken, updateAccount); 
router.delete("/:id", authenticateToken, deleteAccountById);
router.get("/user/:userId", authenticateToken, getAccountsByUserId); 

export default router;
