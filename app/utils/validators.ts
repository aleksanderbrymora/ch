import { z } from "zod";

export const signupSchema = z.object({
  username: z.string().min(3),
  password: z
    .string()
    .min(8)
    .refine((val) => /[0-9]/.test(val), {
      message: "Should contain at least one number",
    })
    .refine((val) => /[a-z]/.test(val), {
      message: "Should contain at least one lowercase letter",
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Should contain at least one uppercase letter",
    }),
});
