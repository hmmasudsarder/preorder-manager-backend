import config from "./app/config";
import { hashPassword } from "./app/helpers/hashPassword";
import prisma from "./app/utils/prisma";

export const seedSuperAdmin = async () => {
  const email = config.superAdmin.email!;
  const password = config.superAdmin.password!;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return;
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.create({
    data: {
      fullName: "Super Admin",
      email,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isVerified: true,
    },
  });

  console.log("✅ Super Admin Created successfully.");
};