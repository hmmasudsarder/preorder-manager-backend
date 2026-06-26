import { Plan } from "@prisma/client";
import prisma from "../../utils/prisma";
import { stripe } from "../../utils/stripe";
import AppError from "../../errors/AppError";
import { httpStatus } from "../../utils/httpStatus";

const createPlan = async (payload: Plan) => {
  const result = await prisma.$transaction(async (tx) => {
    // Step 1: Create Product in Stripe
    const product = await stripe.products.create({
      name: payload.planName,
      description: payload.description!,
      active: true,
    });

    if (!product) {
      throw new AppError(httpStatus.BAD_REQUEST, "Product not created!");
    }

    // Step 2: Create Price in Stripe
    const recurringData: any = {
      interval: payload.interval,
      interval_count: payload.intervalCount,
    };

    const price = await stripe.prices.create({
      currency: "usd",
      unit_amount: Math.round(payload.amount * 100),
      active: true,
      recurring: recurringData,
      product: product.id,
    });

    if (!price) {
      throw new AppError(httpStatus.BAD_REQUEST, "Price not created!");
    }

    // Step 3: Create Plan Record in Database
    const dbPlan = await tx.plan.create({
      data: {
        amount: payload.amount || 0,
        planName: payload.planName,
        currency: "usd",
        interval: payload.interval,
        intervalCount: payload.intervalCount,
        productId: product.id,
        priceId: price.id,
        active: payload.active,
        description: payload.description,
        features: payload.features || [],
      },
    });

    return dbPlan;
  });
  return result;
};

// Get All Plans
const getAllPlans = async () => {
  const plans = await prisma.plan.findMany();
  return plans;
};

// Get a Single Plan by ID
const getPlanById = async (planId: string) => {
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new AppError(httpStatus.NOT_FOUND, "Plan not found!");
  }

  return plan;
};

// // Delete Plan
const deletePlan = async (planId: string) => {
  return await prisma.$transaction(async (tx) => {
    // Step 1: Find the plan record in the database
    const plan = await tx.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        `Plan with ID: ${planId} not found`
      );
    }

    // Step 2: Deactivate the price in Stripe
    await stripe.prices.update(plan.priceId, { active: false });

    // Step 3: Deactivate the product in Stripe
    await stripe.products.update(plan.productId, { active: false });

    // Step 4: Delete the plan record in the database
    await tx.plan.delete({
      where: { id: planId },
    });

    return {
      message: `${plan.planName} archived and deleted successfully`,
    };
  });
};

export const PlanServices = {
  createPlan,
  getAllPlans,
  getPlanById,
  deletePlan,
};
