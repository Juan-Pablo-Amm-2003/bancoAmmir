import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/jwtConfig";


export interface UserPayload {
  id: number;
  username: string;
}


declare global {
  namespace Express {
    interface Request {
      user?: UserPayload; 
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.sendStatus(401); 
  }

  
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.sendStatus(403); 
    }
    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      return res.sendStatus(403); 
    }

   
    req.user = decoded as UserPayload; 
    next();
  });
};
