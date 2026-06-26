import { PlanServices } from "./plan.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { httpStatus } from "../../utils/httpStatus";

// // Create Plan
const createPlan = catchAsync(async (req, res) => {
  const result = await PlanServices.createPlan(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Plan created successfully!",
    data: result,
  });
});

// // Get All Plans
const getAllPlans = catchAsync(async (req, res) => {
  const result = await PlanServices.getAllPlans();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Plans fetched successfully!",
    data: result,
  });
});

// // Get Plan by ID
const getPlanById = catchAsync(async (req, res) => {
  const result = await PlanServices.getPlanById(req.params.planId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Plan fetched successfully!",
    data: result,
  });
});

// Delete Plan
const deletePlan = catchAsync(async (req, res) => {
  const result = await PlanServices.deletePlan(req.params.planId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Plan deleted successfully!",
    data: result,
  });
});

export const PlanController = {
  createPlan,
  getAllPlans,
  getPlanById,
  deletePlan,
};
