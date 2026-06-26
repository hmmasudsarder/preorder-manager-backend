import { Prisma } from "@prisma/client";
import { IGenericErrorMessage } from "../interface/error";

const handleClientError = (error: Prisma.PrismaClientKnownRequestError) => {
  let errors: IGenericErrorMessage[] = [];
  let message = "Something went wrong";
  const statusCode = 400;

  switch (error.code) {
    case "P2025":
      message = (error.meta?.cause as string) || "Record not found!";
      errors = [{ path: "query", message }];
      break;

    case "P2003":
      if (error.message.includes("delete()` invocation:")) {
        message = "Delete failed due to foreign key constraint.";
        errors = [{ path: "delete", message }];
      } else {
        message = "Foreign key constraint failed.";
        errors = [{ path: "foreignKey", message }];
      }
      break;

    case "P2002":
      const target = (error.meta?.target as string[])?.join(", ") || "field";
      message = `${target} already exists.`;
      errors = [{ path: target, message }];
      break;

    case "P2000":
      message = "Input value is too long for the column.";
      errors = [{ path: "input", message }];
      break;

    case "P2001":
      message = "The record searched for does not exist.";
      errors = [{ path: "query", message }];
      break;

    case "P2011":
      message = "Null constraint violation: a required field is missing.";
      errors = [{ path: "input", message }];
      break;

    case "P2014":
      message = "Invalid input for relation or where clause.";
      errors = [{ path: "query", message }];
      break;

    case "P2015":
      message = "Related record not found.";
      errors = [{ path: "relation", message }];
      break;

    default:
      message = error.message || "Unexpected Prisma Client error.";
      errors = [{ path: "unknown", message }];
      break;
  }

  return {
    statusCode,
    message,
    errorMessages: errors,
  };
};

export default handleClientError;
