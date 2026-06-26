import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { UserValidation } from "./user.validation";
import { UserController } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";

const router = Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.getAllUser
);

router.get(
  "/:userId",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.getSingleUserById
);

router.post(
  "/register",
  validateRequest(UserValidation.createUserValidationSchema),
  UserController.createUser
);

router.patch(
  "/update",
  auth(),
  validateRequest(UserValidation.updateUserValidationSchema),
  UserController.updateUser
);

router.delete(
  "/:userId",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.deleteUser
);

export const UserRoutes = router;
