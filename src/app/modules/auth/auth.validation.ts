import { z } from "zod";

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    currentPassword: z
      .string({ required_error: "Current password is required" })
      .min(6, {
        message: "Current password must be at least 6 characters long",
      }),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(6, { message: "New password must be at least 6 characters long" }),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z
    .object({
      newPassword: z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match!",
      path: ["confirmPassword"],
    }),
});

const forgotPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Invalid email address" }),
  }),
});

const resendConfirmationLinkValidationSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Invalid email address" }),
  }),
});

export const AuthValidation = {
  loginValidationSchema,
  resetPasswordValidationSchema,
  changePasswordValidationSchema,
  forgotPasswordValidationSchema,
  resendConfirmationLinkValidationSchema,
};
