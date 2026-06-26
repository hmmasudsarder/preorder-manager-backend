import { z } from "zod";

const IntervalEnum = z.enum(["day", "week", "month", "year"]);

export const planValidationSchema = z.object({
  body: z.object({
    planName: z.string().min(1, "Plan name is required"),
    description: z.string().max(500).optional(),
    amount: z.number().min(0, "Amount must be positive"),
    currency: z.string().length(3, "Currency must be 3-letter code"),
    interval: IntervalEnum.default("month"),
    intervalCount: z.number().int().positive("Interval count must be positive"),
    freeTrialDays: z.number().int().nonnegative().optional().default(0),
    active: z.boolean().default(true).optional(),
  }),
});
