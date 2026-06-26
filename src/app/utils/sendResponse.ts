import { Response } from "express";

type IMeta = {
	limit: number;
	page: number;
	total: number;
	totalPage: number;
};

type TResponse<T> = {
	statusCode: number;
	message: string;
	meta?: IMeta | null | undefined;
	data?: T | null | undefined;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
	res.status(data.statusCode).json({
		success: true,
		message: data.message,
		meta: data.meta || null || undefined,
		data: data?.data || null || undefined,
	});
};

export default sendResponse;
