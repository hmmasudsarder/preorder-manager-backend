import config from "../config";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import AppError from "../errors/AppError";
import { ErrorRequestHandler } from "express";
import { httpStatus } from "../utils/httpStatus";
import { TokenExpiredError } from "jsonwebtoken";
import handleZodError from "../errors/handleZodError";
import { IGenericErrorMessage } from "../interface/error";
import handleClientError from "../errors/handleClientError";
import handleValidationError from "../errors/handleValidationError";

const GlobalErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong!";
  let errorMessages: IGenericErrorMessage[] = [];

  // Prisma validation error
  if (error instanceof Prisma.PrismaClientValidationError) {
    const simplifiedError = handleValidationError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  }

  // Zod error
  else if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  }

  // JWT expired
  else if (error instanceof TokenExpiredError) {
    statusCode = 401;
    message = "Your session has expired. Please log in again.";
    errorMessages = [
      {
        path: "token",
        message: `Token expired at ${error.expiredAt.toISOString()}`,
      },
    ];
  }

  // Prisma known request error
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const simplifiedError = handleClientError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  }

  // Custom AppError
  else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errorMessages = [
      {
        path: "app",
        message: error.message,
      },
    ];
  }

  // JavaScript/Node native errors
  else if (error instanceof SyntaxError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Syntax error in request.";
    errorMessages = [{ path: "syntax", message }];
  } else if (error instanceof TypeError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Type error in application.";
    errorMessages = [{ path: "type", message }];
  } else if (error instanceof ReferenceError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Reference error in application.";
    errorMessages = [{ path: "reference", message }];
  }

  // Prisma internal errors
  else if (error instanceof Prisma.PrismaClientInitializationError) {
    message = "Prisma Client Initialization Failed";
    errorMessages = [{ path: "prisma", message }];
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    message = "Critical error in Prisma engine";
    errorMessages = [{ path: "prisma", message }];
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    message = "Unknown error from Prisma Client";
    errorMessages = [{ path: "prisma", message }];
  }

  // Default unknown error
  else if (error instanceof Error) {
    message = error.message;
    errorMessages = [{ path: "unknown", message }];
  }

  // Log errors in development
  if (config.NODE_ENV !== "production") {
    console.error("❌ Global Error:", error);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorMessages,
    stack: config.NODE_ENV !== "production" ? error.stack : undefined,
  });
};

export default GlobalErrorHandler;
