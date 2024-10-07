import { Router } from "express";
import {
  login,
  getUserById,
  register,
  updateUser,
  deleteUserById,
} from "../controllers/userControllers";
import { authenticateToken } from "../middleware/authMiddleware"
const router = Router();


router.post("/register", register);
router.post("/login", login);
router.get("/user/:id", authenticateToken ,getUserById);
router.delete("/user/:id", authenticateToken, deleteUserById);
router.put("/user/:id", updateUser);

export default router;
