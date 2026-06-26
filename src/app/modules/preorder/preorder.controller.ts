import { Request, Response } from "express";
import { preorderService } from "./preorder.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { httpStatus } from "../../utils/httpStatus";

const createpreorder = catchAsync(async (req: Request, res: Response) => {
    const result = await preorderService.createpreorder(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "preorder created successfully",
        data: result,
    });
});

const getAllpreorders = catchAsync(async (req: Request, res: Response) => {
    const results = await preorderService.getAllpreorders(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "preorders retrieved successfully",
        data: results,
    });
});

const getSinglepreorder = catchAsync(async (req: Request, res: Response) => {
    const result = await preorderService.getSinglepreorder((req.params.id));
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "preorder retrieved successfully",
        data: result,
    });
});

const updatepreorder = catchAsync(async (req: Request, res: Response) => {
    const result = await preorderService.updatepreorder((req.params.id), req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "preorder updated successfully",
        data: result,
    });
});

const deletepreorder = catchAsync(async (req: Request, res: Response) => {
    const result = await preorderService.deletepreorder((req.params.id));
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "preorder deleted successfully",
        data: result,
    });
});

export const preorderController = {
    createpreorder,
    getAllpreorders,
    getSinglepreorder,
    updatepreorder,
    deletepreorder,
};
