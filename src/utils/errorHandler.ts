import { Response } from "express";

export const handleError = (res: Response, error: any) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Error interno del servidor.";
  return res.status(statusCode).json({ error: message });
};
