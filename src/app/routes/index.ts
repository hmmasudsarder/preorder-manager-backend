import { Router } from "express";
import { FileUploadRoutes } from "../modules/FileUpload/fileUpload.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.routes";
import { preorderRoutes } from "../modules/preorder/preorder.route";

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
    path: "/preorder",
    route: preorderRoutes,
  },

  {
    path: "/files",
    route: FileUploadRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
