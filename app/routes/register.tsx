import {
  ActionFunction,
  Form,
  json,
  Link,
  MetaFunction,
  useActionData,
} from "remix";
import type { z, ZodError } from "zod";
import { db } from "~/utils/db.server";
import { createUserSession, register } from "~/utils/session.server";
import { signupSchema } from "~/utils/validators";

// ---- Meta tags
export const meta: MetaFunction = () => {
  return {
    title: "Cheat Sheets | Register",
    description: "Sign up to create your own Cheat Sheets",
  };
};

// ---- Types
type Fields = z.infer<typeof signupSchema>;
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
    const { password, username } = signupSchema.parse(formPayload);
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
    const e = error as ZodError<typeof signupSchema>;

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
  console.log(actionData);

  return (
    <div>
      <div>
        <h1>Login</h1>
        <Form
          method="post"
          aria-describedby={
            actionData?.formError ? "form-error-message" : undefined
          }
        >
          <div>
            <label htmlFor="username-input">Username</label>
            <input
              type="text"
              id="username-input"
              name="username"
              defaultValue={actionData?.fields?.username}
              aria-invalid={Boolean(actionData?.fieldErrors?.username)}
              aria-describedby={
                actionData?.fieldErrors?.username ? "username-error" : undefined
              }
            />
            {actionData?.fieldErrors?.username ? (
              <p
                className="form-validation-error"
                role="alert"
                id="username-error"
              >
                {actionData?.fieldErrors.username}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              name="password"
              defaultValue={actionData?.fields?.password || "Chicken123"}
              type="password"
              aria-invalid={
                Boolean(actionData?.fieldErrors?.password) || undefined
              }
              aria-describedby={
                actionData?.fieldErrors?.password ? "password-error" : undefined
              }
            />
            {actionData?.fieldErrors?.password ? (
              <p
                className="form-validation-error"
                role="alert"
                id="password-error"
              >
                {actionData?.fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div id="form-error-message">
            {actionData?.formError ? (
              <p className="form-validation-error" role="alert">
                {actionData?.formError}
              </p>
            ) : null}
          </div>
          <button type="submit" className="button">
            Submit
          </button>
        </Form>
      </div>
      <div className="links">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/jokes">Jokes</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
