import { z } from "zod";

const createUserValidationSchema = z.object({
  body: z.object({
    fullName: z.string({
      required_error: "Full name is required.",
      invalid_type_error: "Full name must be a string.",
    }),
    email: z
      .string({ required_error: "Email is required." })
      .email("Invalid email address"),
    password: z
      .string({
        required_error: "Password is required.",
        invalid_type_error: "Password must be a string.",
      })
      .min(6, "Password must be at least 6 characters long."),
  }),
});

const updateUserValidationSchema = z.object({
  body: z.object({
    fullName: z
      .string({
        invalid_type_error: "Full name must be a string.",
      })
      .optional(),
    userName: z
      .string({
        required_error: "Username is required.",
        invalid_type_error: "Username must be a string.",
      })
      .optional(),
  }),
});

export const UserValidation = {
  createUserValidationSchema,
  updateUserValidationSchema,
};
