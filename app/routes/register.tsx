import {
  ActionFunction,
  Form,
  json,
  Link,
  LinksFunction,
  MetaFunction,
  useActionData,
} from "remix";
import type { z, ZodError } from "zod";
import { db } from "~/utils/db.server";
import { createUserSession, register } from "~/utils/session.server";
import { signUpSchema } from "~/utils/validators";
import style from "~/styles/authForms.css";
import { useState } from "react";
import clsx from "clsx";
import { formatZodError } from "~/utils/formatZodError";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: style }];

// ---- Meta tags
export const meta: MetaFunction = () => {
  return {
    title: "Cheat Sheets | Register",
    description: "Sign up to create your own Cheat Sheets",
  };
};

// ---- Types
type Fields = z.infer<typeof signUpSchema>;
type ActionData = Partial<{
  formError: string;
  fields: Fields;
  fieldErrors: Partial<Fields>;
}>;

// ---- Helper function for returning form submission info
const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const formPayload = Object.fromEntries(await request.formData());

  try {
    // ---- Validating passed params
    const { password, username } = signUpSchema.parse(formPayload);
    const fields = { username, password };

    // ---- Username check
    const usernameTaken = await db.user.findFirst({
      where: {
        username: username,
      },
    });

    if (usernameTaken) {
      return badRequest({
        fields,
        formError: `Username ${username} already taken`,
      });
    }

    // ---- Registering user
    const user = await register({ username, password });
    if (!user) {
      return badRequest({
        fields,
        formError: "Something went wrong when trying to create a new user",
      });
    }
    return createUserSession(user.id, "/");
  } catch (error) {
    console.error({ error });

    // Casting the error to be Zod Error as it's the only thing that can throw (prisma won't)
    const e = error as ZodError<typeof signUpSchema>;

    const fieldErrors = formatZodError(e);

    return {
      fields: formPayload,
      fieldErrors,
    };
  }
};
export default function Login() {
  const actionData = useActionData<ActionData>();
  const [focusUsername, setFocusUsername] = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);

  return (
    <div className="w-1/3 p-5 mx-auto mt-20">
      <h1 className="mb-5 text-4xl font-bold whitespace-nowrap">
        Sign up to Cheat Sheets
      </h1>
      <p className="mb-5">
        <span>Already have an account? </span>
        <Link className="text-blue-400" to="/login">
          Sign in
        </Link>
      </p>
      <Form
        method="post"
        aria-describedby={
          actionData?.formError ? "form-error-message" : undefined
        }
        className="grid grid-cols-2 gap-5"
      >
        <div>
          <div
            className={clsx(
              `bg-zinc-800 pt-1 pb-3 px-4 rounded-xl border-2`,
              focusUsername ? "border-blue-400" : "border-transparent"
            )}
          >
            <label htmlFor="username-input" className="w-full text-xs">
              Username
            </label>
            <input
              type="text"
              id="username-input"
              name="username"
              defaultValue={actionData?.fields?.username}
              aria-invalid={Boolean(actionData?.fieldErrors?.username)}
              aria-describedby={
                actionData?.fieldErrors?.username ? "username-error" : undefined
              }
              onFocus={() => setFocusUsername(true)}
              onBlur={() => setFocusUsername(false)}
              className="w-full mt-1 font-bold text-white bg-transparent border-none rounded form-input focus:outline-none"
            />
          </div>
          {actionData?.fieldErrors?.username ? (
            <p
              role="alert"
              id="username-error"
              className="px-4 mt-3 text-xs text-blue-400"
            >
              {actionData?.fieldErrors.username}
            </p>
          ) : null}
        </div>
        <div>
          <div
            className={clsx(
              `bg-zinc-800 pt-1 pb-3 px-4 rounded-xl border-2`,
              focusPassword ? "border-blue-400" : "border-transparent"
            )}
          >
            <label htmlFor="password-input" className="w-full text-xs">
              Password
            </label>
            <input
              id="password-input"
              name="password"
              defaultValue={actionData?.fields?.password}
              type="password"
              aria-invalid={
                Boolean(actionData?.fieldErrors?.password) || undefined
              }
              aria-describedby={
                actionData?.fieldErrors?.password ? "password-error" : undefined
              }
              onFocus={() => setFocusPassword(true)}
              onBlur={() => setFocusPassword(false)}
              className="w-full mt-1 font-bold text-white bg-transparent border-none rounded form-input focus:outline-none"
            />
          </div>
          {actionData?.fieldErrors?.password ? (
            <p
              className="px-4 mt-3 text-xs text-blue-400"
              role="alert"
              id="password-error"
            >
              {actionData?.fieldErrors.password}
            </p>
          ) : null}
        </div>
        <div id="form-error-message" className="col-span-2">
          {actionData?.formError ? (
            <p role="alert">{actionData?.formError}</p>
          ) : null}
        </div>
        <div className="col-span-2">
          <button
            type="submit"
            className="px-16 py-3 font-bold rounded-full bg-zinc-800"
          >
            Submit
          </button>
        </div>
      </Form>
    </div>
  );
}
