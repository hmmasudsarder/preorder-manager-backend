import { Router } from "express";
import { preorderController } from "./preorder.controller";

const router = Router();

// create preorder
router.post("/create", preorderController.createpreorder);

// get all preorder
router.get("/", preorderController.getAllpreorders);

// get single preorder by id
router.get("/:id", preorderController.getSinglepreorder);

// update preorder
router.put("/:id", preorderController.updatepreorder);

// delete preorder
router.delete("/:id", preorderController.deletepreorder);

export const preorderRoutes = router;
