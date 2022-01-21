import type { ZodError } from "zod";

export const formatZodError = (e: ZodError) => {
  const fieldErrors: {
    [key: string]: string;
  } = {};

  e.issues.forEach((er) => {
    if (er.path[0] in fieldErrors) fieldErrors[er.path[0]] += `, ${er.message}`;
    else fieldErrors[er.path[0]] = `Should have at least ${er.message}`;
  });

  return fieldErrors;
};
