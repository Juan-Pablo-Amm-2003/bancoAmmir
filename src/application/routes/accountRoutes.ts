import { Router } from "express";
import AccountController from "../controllers/AccountController"; // Asegúrate de que el nombre sea correcto
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

// Instanciamos el controlador de cuentas
const accountController = AccountController; // Utiliza el objeto exportado

// Rutas para la gestión de cuentas
router.post("/", authenticateToken, accountController.createAccount);
router.get("/:id", authenticateToken, accountController.getAccountById);
router.put("/:id", authenticateToken, accountController.manageAccount);
router.delete("/:id", authenticateToken, accountController.deleteAccountById);
router.get(
  "/accounts/number/:nCuenta",
  accountController.getAccountByAccountNumber
);

router.get(
  "/user/:userId",
  authenticateToken,
  accountController.getAccountsByUserId
);

export default router;
