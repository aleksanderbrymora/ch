import { z } from "zod";

export const signUpSchema = z.object({
  username: z.string().min(3),
  password: z
    .string()
    .min(8, { message: "8 characters" })
    .refine((val) => /[0-9]/.test(val), {
      message: "one number",
    })
    .refine((val) => /[a-z]/.test(val), {
      message: "one lowercase letter",
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: "one uppercase letter",
    }),
});

export const signInSchema = z.object({
  username: z.string().nonempty(),
  password: z.string().nonempty(),
});

export const SheetActionValidator = z.enum([
  "title.update",
  "languages.update",
]);
export type SheetAction = z.infer<typeof SheetActionValidator>;
