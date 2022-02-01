import { LoaderFunction, redirect } from "remix";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const sheet = await db.sheet.create({
    data: {
      createdBy: { connect: { id: userId } },
      from: { connect: { name: "polish" } },
      to: { connect: { name: "english" } },
    },
  });
  return redirect(`/sheets/${sheet.id}`);
};
