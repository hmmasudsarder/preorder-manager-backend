import { Router } from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { PlanRoutes } from "../modules/Plan/plan.route";
import { UserRoutes } from "../modules/User/user.routes";
import { FileUploadRoutes } from "../modules/FileUpload/fileUpload.route";
import { SubscriptionRoutes } from "../modules/Subscription/subscription.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/plans",
    route: PlanRoutes,
  },
  {
    path: "/subscriptions",
    route: SubscriptionRoutes,
  },
  {
    path: "/files",
    route: FileUploadRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
