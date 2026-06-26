import { Router } from "express";
import { uploadFile } from "../../middlewares/uploadFile";
import { FileUploadController } from "./fileUpload.controller";

const router = Router();

// Upload single file
router.post(
  "/upload",
  uploadFile.single("file"),
  FileUploadController.uploadFile
);

// Upload multiple files
router.post(
  "/upload-multiple",
  uploadFile.array("file", 20),
  FileUploadController.uploadMultipleFiles
);

export const FileUploadRoutes = router;
