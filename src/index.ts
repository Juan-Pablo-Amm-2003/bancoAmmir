import express from "express";
import cors from "cors";
import userRoutes from "../src/application/routes/userRoutes";
import accountRoutes from "../src/application/routes/accountRoutes";
import transactionRoutes from "../src/application/routes/transactionRoutes";

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Use CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Allow only your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify the allowed methods
    credentials: true, // Include credentials if needed
  })
);

// Root route
app.get("/", (req, res) => {
  res.send("Estamos ON");
});

// Use user routes
app.use("/api", userRoutes);

// Use account routes
app.use("/accounts", accountRoutes);

// Use transaction routes
app.use("/transactions", transactionRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
