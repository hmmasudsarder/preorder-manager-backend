import {
  handlePaymentIntentFailed,
  handlePaymentIntentSucceeded,
} from "../../utils/webhook";
import Stripe from "stripe";
import { httpStatus } from "../../utils/httpStatus";
import prisma from "../../utils/prisma";
import { stripe } from "../../utils/stripe";
import AppError from "../../errors/AppError";
import { Subscription } from "@prisma/client";
import QueryBuilder from "../../builder/QueryBuilder";

const createSubscription = async (userId: string, planId: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Verify user exists
    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // 2. Verify plan exists with all needed fields
    const plan = await tx.plan.findUnique({
      where: { id: planId },
    });
    if (!plan) {
      throw new AppError(httpStatus.NOT_FOUND, "Plan not found");
    }

    // 3. Calculate end date based on plan interval
    const startDate = new Date();
    let endDate: Date | null = null;

    if (plan.interval === "month") {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (plan.intervalCount || 1));
      // Handle month overflow (e.g., Jan 31 + 1 month)
      if (endDate.getDate() !== startDate.getDate()) {
        endDate.setDate(0); // Set to last day of previous month
      }
    }
    // Add other interval cases as needed (day, week, year)

    // 4. Create payment intent in Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(plan.amount * 100),
      currency: "usd",
      metadata: {
        userId: user.id,
        planId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // 5. Handle existing subscription
    const existingSubscription = await tx.subscription.findUnique({
      where: { userId: user.id },
    });

    let subscription;
    if (existingSubscription?.paymentStatus === "PENDING") {
      subscription = await tx.subscription.update({
        where: { userId: user.id },
        data: {
          planId,
          stripePaymentId: paymentIntent.id,
          startDate,
          amount: plan.amount,
          endDate: existingSubscription.endDate || endDate,
          paymentStatus: "PENDING",
        },
      });
    } else {
      // 6. Create new subscription with calculated endDate
      subscription = await tx.subscription.create({
        data: {
          userId: user.id,
          planId,
          startDate,
          amount: plan.amount,
          stripePaymentId: paymentIntent.id,
          paymentStatus: "PENDING",
          endDate, // Now includes the calculated endDate
        },
      });
    }

    return {
      subscription,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  });
};

const getAllSubscription = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.subscription, query);
  const subscription = await queryBuilder
    .search([""])
    .paginate()
    .fields()
    .include({
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePic: true,
          role: true,
          isSubscribed: true,
          planExpiration: true,
        },
      },
      plan: true,
    })
    .execute();

  const meta = await queryBuilder.countTotal();
  return { meta, data: subscription };
};

const getSingleSubscription = async (subscriptionId: string) => {
  const result = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          profilePic: true,
          email: true,
          role: true,
          isSubscribed: true,
          planExpiration: true,
        },
      },
      plan: true,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Subscription not found!");
  }

  return result;
};

const getMySubscription = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const result = await prisma.subscription.findFirst({
    where: { user: { id: userId } },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          profilePic: true,
          email: true,
          role: true,
          isSubscribed: true,
          planExpiration: true,
        },
      },
      plan: true,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Subscription not found!");
  }

  return result;
};

const updateSubscription = async (
  subscriptionId: string,
  data: Subscription
) => {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new AppError(httpStatus.NOT_FOUND, "Subscription not found");
  }

  const result = await prisma.subscription.update({
    where: { id: subscriptionId },
    data,
  });
  return result;
};

const deleteSubscription = async (subscriptionId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new AppError(httpStatus.NOT_FOUND, "Subscription not found");
  }

  return null;
};

const HandleStripeWebhook = async (event: Stripe.Event) => {
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  } catch (error) {
    console.error("Error handling Stripe webhook:", error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Webhook handling failed"
    );
  }
};

export const SubscriptionServices = {
  getMySubscription,
  createSubscription,
  getAllSubscription,
  updateSubscription,
  deleteSubscription,
  HandleStripeWebhook,
  getSingleSubscription,
};
