import { User } from "@prisma/client";
import { Link, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import Nav from "~/components/Nav";
import { getUser } from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return {
    title: "Remix: So great, it's funny!",
    description: "Remix jokes app. Learn Remix and laugh at the same time!",
  };
};

type LoaderData = {
  user: Pick<User, "username" | "id"> | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const data: LoaderData = { user };
  return data;
};

export default function Index() {
  const { user } = useLoaderData<LoaderData>();

  return (
    <>
      <Nav user={user} />
    </>
  );
}
