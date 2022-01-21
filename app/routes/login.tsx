import clsx from "clsx";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ActionFunction, Form, json, MetaFunction, useActionData } from "remix";
import { z, ZodError } from "zod";
import { createUserSession, login } from "~/utils/session.server";
import { signInSchema } from "~/utils/validators";

export const meta: MetaFunction = () => {
  return {
    title: "Cheat Sheets | Login",
    description: "Login to create your own Cheat Sheets",
  };
};

type Fields = z.infer<typeof signInSchema>;
type ActionData = Partial<{
  formError: string;
  fields: Fields;
  fieldErrors: Partial<Fields>;
}>;

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const formPayload = Object.fromEntries(await request.formData());

  try {
    const { username, password } = signInSchema.parse(formPayload);
    const fields = { username, password };
    const user = await login({ username, password });
    console.log({ user });
    if (!user) {
      return badRequest({
        fields,
        formError: "Not implemented",
      });
    }
    return createUserSession(user.id, "/");
  } catch (error) {
    console.error(error);

    const e = error as ZodError<typeof signInSchema>;

    // converting zod errors to useful format
    // will only apply one error per input field
    const fieldErrors = e.issues.reduce(
      (acc, c) => ({
        ...acc,
        [c.path[0]]: c.message,
      }),
      {}
    );

    console.log({ fieldErrors });

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
      <h1 className="text-4xl font-bold whitespace-nowrap mb-5">
        Login to Cheat Sheets
      </h1>
      <p className="mb-5">
        <span>Dont't have an account yet? </span>
        <Link className="text-blue-400" to={"/register"}>
          Sign up
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
            <label htmlFor="username-input" className="text-xs w-full">
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
              className="form-input w-full bg-transparent border-none font-bold rounded mt-1 text-white focus:outline-none"
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
            <label htmlFor="password-input" className="text-xs w-full">
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
              className="form-input w-full bg-transparent border-none font-bold rounded mt-1 text-white focus:outline-none"
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
            className="rounded-full bg-zinc-800 py-3 px-16 font-bold"
          >
            Submit
          </button>
        </div>
      </Form>
    </div>
  );
}
