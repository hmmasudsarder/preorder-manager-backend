import { ZodError } from "zod";
import {
  IGenericErrorMessage,
  IGenericErrorResponse,
} from "../interface/error";

const handleZodError = (error: ZodError): IGenericErrorResponse => {
  const errors: IGenericErrorMessage[] = error.issues.map((issue) => ({
    path: issue.path.join(".") || "zod",
    message: issue.message,
  }));

  return {
    statusCode: 400,
    message: "Validation Error",
    errorMessages: errors,
  };
};

export default handleZodError;
