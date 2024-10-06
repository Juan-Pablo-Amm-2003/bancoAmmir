import { Router } from "express";
import {
  createAccount,
  getAccountById,
  updateAccount,
  deleteAccountById,
  getAccountsByUserId,
} from "../controllers/accountController";

const router = Router();

router.post("/", createAccount); 
router.get("/:id", getAccountById); 
router.put("/:id", updateAccount); 
router.delete("/:id", deleteAccountById); 
router.get("/user/:userId", getAccountsByUserId);


export default router;
