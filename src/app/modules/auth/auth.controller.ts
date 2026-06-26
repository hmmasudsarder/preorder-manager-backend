import { httpStatus } from "../../utils/httpStatus";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import config from "../../config";

const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.query;

  await AuthService.verifyEmail(token as string);

  res.redirect(`${config.url.frontend}/success`);
});

const verifyResetPassLink = catchAsync(async (req, res) => {
  const { token } = req.query;

  await AuthService.verifyResetPassLink(token as string);

  res.redirect(`${config.url.frontend}/reset-password`);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const result = await AuthService.loginUser(email, password);

  const { accessToken, refreshToken } = result;

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // config.NODE_ENV === "production"
    sameSite: "lax", // config.NODE_ENV === "production" ? true : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User logged in successfully!",
    data: { accessToken },
  });
});

const changePassword = catchAsync(async (req, res) => {
  const email = req.user?.email as string;

  const { currentPassword, newPassword, confirmPassword } = req.body;

  await AuthService.changePassword(
    email,
    currentPassword,
    newPassword,
    confirmPassword
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User password changed successfully!",
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: result.message,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  const result = await AuthService.resetPassword(
    email,
    newPassword,
    confirmPassword
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: result.message,
  });
});

const resendVerificationLink = catchAsync(async (req, res) => {
  const { email } = req.body;

  const result = await AuthService.resendVerificationLink(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: result.message,
  });
});

const resendResetPassLink = catchAsync(async (req, res) => {
  const { email } = req.body;

  const result = await AuthService.resendResetPassLink(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: result.message,
  });
});

const getMe = catchAsync(async (req, res) => {
  const email = req.user?.email as string;

  const result = await AuthService.getMe(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User fetched successfully!",
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  const result = await AuthService.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Access token is retrieved successfully!",
    data: result,
  });
});

export const AuthController = {
  login,
  getMe,
  verifyEmail,
  refreshToken,
  resetPassword,
  forgotPassword,
  changePassword,
  verifyResetPassLink,
  resendResetPassLink,
  resendVerificationLink,
};
