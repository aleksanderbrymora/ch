import { Prisma, SheetsOnTranslationGroups } from "@prisma/client";
import { Link, LoaderFunction, useLoaderData } from "remix";
import { distanceToNow } from "~/utils/dates";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

const findRecentUserSheets = (userId: string) => {
  return Prisma.validator<Prisma.SheetFindManyArgs>()({
    select: {
      translationGroups: true,
      points: true,
      title: true,
      updatedAt: true,
      id: true,
    },
    where: { createdBy: { id: userId } },
    orderBy: { updatedAt: "asc" },
  });
};

interface ProcessedSheet {
  id: string;
  title: string;
  points: number;
  updatedAt: Date;
  translationGroups: SheetsOnTranslationGroups[];
}

type LoaderData = ProcessedSheet[];

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const userSheets = await db.sheet.findMany(findRecentUserSheets(userId));
  const data: LoaderData = userSheets;
  return data;
};

export default () => {
  const sheets = useLoaderData<LoaderData>();
  return (
    <div>
      <h1>All user sheets</h1>
      <div>
        {sheets.map((s) => (
          <Link to={`/sheets/${s.id}`} key={s.id} className="my-3">
            <p className="text-3xl font-bold">{s.title}</p>
            <p>{distanceToNow(s.updatedAt)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};
