import config from "../../config";
import { UserService } from "./user.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { httpStatus } from "../../utils/httpStatus";

const createUser = catchAsync(async (req, res) => {
  const result = await UserService.createUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: result.message,
  });
});

const getAllUser = catchAsync(async (req, res) => {
  const result = await UserService.getAllUserFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Users are retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const userId = req.user.id;

  if (req.file) {
    req.body.profilePic = `${config.url.image}/uploads/${req.file.filename}`;
  }

  const result = await UserService.updateUserIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User updated successfully!",
    data: result,
  });
});

const getSingleUserById = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const result = await UserService.getSingleUserByIdFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User retrieved successfully!",
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { userId } = req.params;

  await UserService.deleteUserFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User deleted successfully!",
  });
});

export const UserController = {
  createUser,
  getAllUser,
  updateUser,
  deleteUser,
  getSingleUserById,
};
