import config from "../../config";
import prisma from "../../utils/prisma";
import AppError from "../../errors/AppError";
import { RefreshPayload } from "./auth.interface";
import { sendEmail } from "../../utils/sendEmail";
import { httpStatus } from "../../utils/httpStatus";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import { hashPassword } from "../../helpers/hashPassword";
import { passwordCompare } from "../../helpers/comparePasswords";

const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  const isPasswordMatched = await passwordCompare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZE, "Password is incorrect!");
  }

  const jwtPayload = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePic,
    role: user.role,
    isVerified: user.isVerified,
  };

  // Check if user is not active
  if (!user.isVerified) {
    const accessToken = jwtHelpers.createToken(
      jwtPayload,
      config.jwt.access.secret as string,
      config.jwt.resetPassword.expiresIn as string
    );

    const confirmedLink = `${config.verify.email}?token=${accessToken}`;

    await sendEmail(user.email, undefined, confirmedLink);

    throw new AppError(
      httpStatus.UNAUTHORIZE,
      "Your account is not verified! We have sent a confirmation email to your email address. Please check your inbox."
    );
  }

  const accessToken = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.access.secret as string,
    config.jwt.access.expiresIn as string
  );

  const refreshToken = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.refresh.secret as string,
    config.jwt.refresh.expiresIn as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const verifyEmail = async (token: string) => {
  const verifiedToken = jwtHelpers.verifyToken(
    token,
    config.jwt.access.secret as string
  );

  const user = await prisma.user.findUnique({
    where: { email: verifiedToken.email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (user.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already verified!");
  }

  await prisma.user.update({
    where: {
      email: verifiedToken.email,
    },
    data: {
      isVerified: true,
    },
  });

  return null;
};

const verifyResetPassLink = async (token: string) => {
  const verifiedToken = jwtHelpers.verifyToken(
    token,
    config.jwt.access.secret as string
  );

  const user = await prisma.user.findUnique({
    where: { email: verifiedToken.email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  await prisma.user.update({
    where: { email: verifiedToken.email },
    data: {
      isResetPassword: false,
      canResetPassword: true,
    },
  });

  return null;
};

const changePassword = async (
  email: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (!newPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, "New password is required!");
  }

  if (!confirmPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, "Confirm password is required!");
  }

  if (newPassword !== confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "New password and confirm password do not match!"
    );
  }

  const isPasswordMatch = await passwordCompare(currentPassword, user.password);

  if (!isPasswordMatch) {
    throw new AppError(
      httpStatus.UNAUTHORIZE,
      "Current password is incorrect!"
    );
  }

  const hashedNewPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { email },
    data: {
      password: hashedNewPassword,
      passwordChangedAt: new Date(),
    },
  });

  return null;
};

const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (!user.isVerified) {
    throw new AppError(httpStatus.UNAUTHORIZE, "User account is not verified!");
  }

  // Step 2: Save OTP in DB
  await prisma.user.update({
    where: { email },
    data: {
      isResetPassword: true,
      canResetPassword: false,
    },
  });

  const jwtPayload = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePic,
    role: user.role,
    isVerified: user.isVerified,
  };

  const accessToken = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.access.secret as string,
    config.jwt.access.expiresIn as string
  );

  const resetPassLink = `${config.verify.resetPassLink}?token=${accessToken}`;

  await sendEmail(user.email, resetPassLink);

  // Step 4: Return response
  return {
    message:
      "We have sent a Reset Password link to your email address. Please check your inbox.",
  };
};

const resetPassword = async (
  email: string,
  newPassword: string,
  confirmPassword: string
) => {
  if (newPassword !== confirmPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, "Passwords do not match!");
  }

  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (!user.canResetPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User is not eligible for password reset!"
    );
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { email: email },
    data: {
      password: hashedPassword,
      isResetPassword: false,
      canResetPassword: false,
    },
  });

  return {
    message: "Password reset successfully!",
  };
};

const resendVerificationLink = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (user.isVerified) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User account already verified!"
    );
  }

  const jwtPayload = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePic,
    role: user.role,
    isVerified: user.isVerified,
  };

  const accessToken = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.access.secret as string,
    config.jwt.access.expiresIn as string
  );

  const confirmedLink = `${config.verify.email}?token=${accessToken}`;

  await sendEmail(user.email, undefined, confirmedLink);

  return {
    message:
      "New verification link has been sent to your email. Please check your inbox.",
  };
};

const resendResetPassLink = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  const jwtPayload = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePic,
    role: user.role,
    isVerified: user.isVerified,
  };

  await prisma.user.update({
    where: { email: user.email },
    data: {
      isResetPassword: true,
    },
  });

  const accessToken = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.access.secret as string,
    config.jwt.access.expiresIn as string
  );

  const resetPassLink = `${config.verify.resetPassLink}?token=${accessToken}`;

  await sendEmail(user.email, resetPassLink);

  return {
    message:
      "New Reset Password link has been sent to your email. Please check your inbox.",
  };
};

const getMe = async (email: string) => {
  const result = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      fullName: true,
      email: true,
      profilePic: true,
      role: true,
      isVerified: true,
      isSubscribed: true,
      planExpiration: true,
    },
  });

  return result;
};

export const refreshToken = async (token: string) => {
  const decoded = jwtHelpers.verifyToken(
    token,
    config.jwt.refresh.secret as string
  ) as RefreshPayload;

  const { email, iat } = decoded;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      profilePic: true,
      isVerified: true,
      passwordChangedAt: true,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  /* Reject if password changed after token was issued */
  if (
    user.passwordChangedAt &&
    /* convert both to seconds since epoch */
    Math.floor(user.passwordChangedAt.getTime() / 1000) > iat
  ) {
    throw new AppError(
      httpStatus.UNAUTHORIZE,
      "Password was changed after this token was issued"
    );
  }

  const jwtPayload = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    profilePic: user?.profilePic,
    isVerified: user.isVerified,
  };

  const accessToken = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.refresh.secret as string,
    config.jwt.refresh.expiresIn as string
  );

  return { accessToken };
};

export const AuthService = {
  getMe,
  loginUser,
  verifyEmail,
  refreshToken,
  resetPassword,
  changePassword,
  forgotPassword,
  verifyResetPassLink,
  resendResetPassLink,
  resendVerificationLink,
};
