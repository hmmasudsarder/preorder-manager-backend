import config from "../config";
import AppError from "../errors/AppError";
import jwt, { JwtPayload } from "jsonwebtoken";
import { httpStatus } from "../utils/httpStatus";

export const verifyToken = (
  token: string,
  secret = config.jwt.access.secret as string
): JwtPayload => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new AppError(httpStatus.UNAUTHORIZE, "JWT token is expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new AppError(httpStatus.UNAUTHORIZE, "Invalid JWT token");
    } else {
      throw new AppError(httpStatus.UNAUTHORIZE, "Failed to verify token");
    }
  }
};
