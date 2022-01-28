import { z } from "zod";
import { capitalize } from "./textTransformation";

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

export interface WordListLoaderData {
  sheet: {
    id: string;
    title: string;
    points: number;
    updatedAt: Date;
    from: { name: string };
    to: { name: string };
    translationGroups: Array<{
      translationGroupId: string;
      translationGroup: {
        id: string;
        tags: Array<{ tag: { name: string } }>;
        words: Array<{
          language: {
            name: string;
          };
          id: string;
          content: string;
        }>;
      };
    }>;
  };
  availableLanguages: string[];
}

export const changeActionString = (action: string) =>
  `change${capitalize(action)}`;
