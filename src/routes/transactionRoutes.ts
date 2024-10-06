import { Router } from "express";
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  deleteTransactionById,
  getTransactionsByOriginAccount,
} from "../controllers/transactionController"; 

const router = Router();

router.post("/", createTransaction);
router.get("/", getAllTransactions);
router.get("/:id", getTransactionById);
router.delete("/:id", deleteTransactionById);
router.get("/origin/:originAcc", getTransactionsByOriginAccount); 

export default router;
