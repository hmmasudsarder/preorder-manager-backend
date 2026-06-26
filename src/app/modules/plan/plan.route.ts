import { Router } from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { PlanController } from "./plan.controller";
import { planValidationSchema } from "./plan.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = Router();

router.post(
  "/create-plan",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(planValidationSchema),
  PlanController.createPlan
);

router.get("/", PlanController.getAllPlans);

router.get("/:planId", PlanController.getPlanById);

router.delete(
  "/:planId",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PlanController.deletePlan
);

export const PlanRoutes = router;
