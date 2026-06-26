import { z } from "zod";

export const preorderSchema = z.object({
    body: z.object({
        name: z.string(),
        email: z.string().email(),
    }),
});
