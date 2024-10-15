import { Router } from "express";
import {
  login,
  getUserByDni,
  register,
  updateUser,
  deleteUserById,
} from "../controllers/UserController";
import { authenticateToken } from "../../middleware/authMiddleware";
import { validateUserUpdate } from "../../middleware/validationMiddleware"; 

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Rutas protegidas
router.get("/user/:dni", getUserByDni);
router.put("/user/:id", validateUserUpdate, updateUser); 
router.delete("/user/:id", deleteUserById);

export default router;
