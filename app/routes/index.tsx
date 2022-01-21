import { User } from "@prisma/client";
import { Link, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import Nav from "~/components/Nav";
import { getUser, getUserId } from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return {
    title: "Remix: So great, it's funny!",
    description: "Remix jokes app. Learn Remix and laugh at the same time!",
  };
};

type LoaderData = {
  userId: string | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  const data: LoaderData = { userId };
  return data;
};

export default function Index() {
  const { userId } = useLoaderData<LoaderData>();

  return (
    <>
      <Nav userId={userId} />
    </>
  );
}
