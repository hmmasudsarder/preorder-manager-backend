import config from "../../config";
import prisma from "../../utils/prisma";
import AppError from "../../errors/AppError";
import { User, UserRole } from "@prisma/client";
import { sendEmail } from "../../utils/sendEmail";
import { httpStatus } from "../../utils/httpStatus";
import QueryBuilder from "../../builder/QueryBuilder";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import { hashPassword } from "../../helpers/hashPassword";

const createUserIntoDB = async (payload: User) => {
  const isUserExistByEmail = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (isUserExistByEmail) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `User with this email: ${payload.email} already exists!`
    );
  }

  const hashedPassword = await hashPassword(payload.password);

  const userData = {
    ...payload,
    password: hashedPassword,
    isVerified: false,
  };

  const jwtPayload = {
    fullName: payload.fullName,
    email: payload.email,
    role: UserRole.USER,
    profilePic: payload?.profilePic || "",
    isVerified: false,
  };

  const accessToken = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.access.secret as string,
    config.jwt.resetPassword.expiresIn as string
  );

  const result = await prisma.user.create({ data: userData });
  const confirmedLink = `${config.verify.email}?token=${accessToken}`;

  await sendEmail(result.email, undefined, confirmedLink);

  return {
    message:
      "We have sent a confirmation email to your email address. Please check your inbox.",
  };
};

const getAllUserFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(prisma.user, query)
    .search(["fullName", "email"])
    .select(["-password"])
    .paginate();

  const [result, meta] = await Promise.all([
    userQuery.execute(),
    userQuery.countTotal(),
  ]);

  if (!result.length) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  // Remove password from each user
  const data = result.map((user: User) => {
    const { password, ...rest } = user;
    return rest;
  });

  return {
    meta,
    data,
  };
};

const updateUserIntoDB = async (userId: string, payload: Partial<User>) => {
  const isUserExist = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!isUserExist) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `User with this ID: ${userId} not found!`
    );
  }

  if (!payload.profilePic && isUserExist.profilePic) {
    payload.profilePic = isUserExist.profilePic;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: payload.fullName,
      profilePic: payload.profilePic || "",
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      profilePic: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

const getSingleUserByIdFromDB = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `User with this ID: ${userId} not found!`
    );
  }

  const { password, ...rest } = user;

  return rest;
};

const deleteUserFromDB = async (userId: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!isUserExist) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `User with this ID: ${userId} not found!`
    );
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return null;
};

export const UserService = {
  createUserIntoDB,
  getAllUserFromDB,
  updateUserIntoDB,
  deleteUserFromDB,
  getSingleUserByIdFromDB,
};
