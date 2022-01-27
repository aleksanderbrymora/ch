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

export type SheetAction =
  | { type: "title.update"; title: string }
  | { type: "languages.update"; from: string; to: string }
  | { type: "translationGroup.delete"; translationGroupId: string }
  | {
      type: "word.update";
      from: string;
      to: string;
      fromId: string;
      toId: string;
    }
  | { type: "translation.find"; word: string; from: string; to: string }
  | { type: "word.add"; from: string; to: string };
