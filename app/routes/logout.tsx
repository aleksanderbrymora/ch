import { ActionFunction, LoaderFunction, redirect } from "remix";
import { logout } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => logout(request);

export const loader: LoaderFunction = async () => redirect("/");
