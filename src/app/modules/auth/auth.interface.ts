import { UserRole } from "@prisma/client";

export type RefreshPayload = {
	id: string;
	fullName: string;
	email: string;
	role: UserRole;
	iat: number;
	profilePic?: string;
	exp: number;
	isVerified: boolean;
};
