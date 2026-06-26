import { Prisma } from "@prisma/client";
import { IGenericErrorResponse } from "../interface/error";

const handleValidationError = (
  error: Prisma.PrismaClientValidationError
): IGenericErrorResponse => {
  const errors = [
    {
      path: "validation",
      message: error.message,
    },
  ];
  const statusCode = 400;

  return {
    statusCode,
    message: "Validation Error",
    errorMessages: errors,
  };
};

export default handleValidationError;
