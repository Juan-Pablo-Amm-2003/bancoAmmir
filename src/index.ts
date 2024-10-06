import express from "express";
import userRoutes from "./routes/userRoutes";
import accountRoutes from "./routes/accountRoutes";
import transactionRoutes from "./routes/transactionRoutes"; // Importa las rutas de transaction

const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Ruta raíz
app.get("/", (req, res) => {
  res.send("Estamos ON");
});

// Usar las rutas de user
app.use("/api", userRoutes);

// Usar las rutas de account
app.use("/accounts", accountRoutes); 

// Usar las rutas de transaction
app.use("/transactions", transactionRoutes); 

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
