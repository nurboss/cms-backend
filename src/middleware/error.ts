import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../utils/error-handler";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  errorHandler(err, req, res, next);
};
