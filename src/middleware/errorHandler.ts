import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import logger from "../utils/logger";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Ha ocurrido un error inesperado.";

  if (!(err instanceof ApiError)) {
    statusCode = 500;
    message = "Ha ocurrido un error inesperado en el servidor.";

    // Log unhandled error
    logger.error("Unhandled error:", err); // Proporcionar un mensaje junto al error
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
