import catchAsync from "../../utils/catchAsync";
import { httpStatus } from "../../utils/httpStatus";
import sendResponse from "../../utils/sendResponse";
import { FileUploadService } from "./fileUpload.service";

const uploadFile = catchAsync(async (req, res) => {
  const result = await FileUploadService.fileUpload(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "File uploaded successfully!",
    data: result,
  });
});

const uploadMultipleFiles = catchAsync(async (req, res) => {
  const result = await FileUploadService.multipleFileUpload(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Files uploaded successfully!",
    data: result,
  });
});

export const FileUploadController = {
  uploadFile,
  uploadMultipleFiles,
};
