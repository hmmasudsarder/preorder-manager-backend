import { Router } from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = Router();

router.get("/verify-email", AuthController.verifyEmail);

router.get("/verify-reset-password", AuthController.verifyResetPassLink);

router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login
);

router.put(
  "/change-password",
  auth(UserRole.USER, UserRole.ADMIN),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthController.changePassword
);

router.post(
  "/forgot-password",
  validateRequest(AuthValidation.forgotPasswordValidationSchema),
  AuthController.forgotPassword
);

router.post("/reset-password", AuthController.resetPassword);

router.post(
  "/resend-verification-link",
  validateRequest(AuthValidation.resendConfirmationLinkValidationSchema),
  AuthController.resendVerificationLink
);

router.post(
  "/resend-reset-pass-link",
  validateRequest(AuthValidation.resendConfirmationLinkValidationSchema),
  AuthController.resendResetPassLink
);

router.get("/me", auth(), AuthController.getMe);

router.post("/refresh-token", AuthController.refreshToken);

export const AuthRoutes = router;
