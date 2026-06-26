import { Request } from "express";
import config from "../../config";
import AppError from "../../errors/AppError";

const fileUpload = async (req: Request) => {
  if (!req.file) {
    throw new AppError(400, "No file provided");
  }

  const file = req.file;
  const fileUrl = `${config.url.file}/${file.filename}`;

  return { fileUrl };
};

const multipleFileUpload = async (req: Request) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new AppError(400, "No files provided");
  }

  const files = req.files as Express.Multer.File[];

  const fileUrls = files.map((file) => {
    return `${config.url.file}/${file.filename}`;
  });

  return { fileUrls };
};

export const FileUploadService = {
  fileUpload,
  multipleFileUpload,
};
