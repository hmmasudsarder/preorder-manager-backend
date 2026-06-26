import config from "../config";
import prisma from "../utils/prisma";
import { UserRole } from "@prisma/client";
import AppError from "../errors/AppError";
import catchAsync from "../utils/catchAsync";
import jwt, { JwtPayload } from "jsonwebtoken";
import { httpStatus } from "../utils/httpStatus";

const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req, _res, next) => {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer")) {
      token = req.headers.authorization?.split(" ")[1].trim();
    }

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZE, "You are not authorized");
    }

    // Check if the token is valid
    const verifiedUser = jwt.verify(
      token,
      config.jwt.access.secret as string
    ) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: {
        email: verifiedUser.email,
      },
    });

    // Checking if the user is exist
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found!");
    }

    if (
      requiredRoles &&
      requiredRoles.length > 0 &&
      !requiredRoles.includes(user.role)
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You don't have permission to access this resource"
      );
    }

    req.user = verifiedUser;

    next();
  });
};

export default auth;
