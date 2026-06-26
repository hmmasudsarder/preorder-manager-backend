import { z } from "zod";

const SubscriptionValidationSchema = z.object({
  body: z.object({
    planId: z.string(),
  }),
});

export const SubscriptionValidation = {
  SubscriptionValidationSchema,
};
