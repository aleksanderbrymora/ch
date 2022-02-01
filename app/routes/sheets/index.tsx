import { Prisma, SheetsOnTranslationGroups } from "@prisma/client";
import { Link, LoaderFunction, useLoaderData } from "remix";
import { distanceToNow } from "~/utils/dates";
import { db } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";

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
    orderBy: { updatedAt: "desc" },
    take: 10,
  });
};

const findPopularSheets = () => {
  return Prisma.validator<Prisma.SheetFindManyArgs>()({
    select: {
      points: true,
      id: true,
      title: true,
      updatedAt: true,
      translationGroups: true,
    },
    take: 10,
    orderBy: { points: "desc" },
  });
};

interface ProcessedSheet {
  id: string;
  title: string;
  points: number;
  updatedAt: Date;
  translationGroups: SheetsOnTranslationGroups[];
}

interface LoaderData {
  userSheets: ProcessedSheet[];
  topSheets: ProcessedSheet[];
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await getUserId(request);

  const userSheets = userId
    ? await db.sheet.findMany(findRecentUserSheets(userId))
    : [];
  const topSheets = await db.sheet.findMany(findPopularSheets());
  return { userSheets, topSheets };
};

export default () => {
  const { topSheets, userSheets } = useLoaderData<LoaderData>();

  return (
    <div className="grid grid-cols-1 gap-10">
      <Sheets title="Your Cheat Sheets" sheets={userSheets} />
      <Link to="/sheets/all" className="underline w-min whitespace-nowrap">
        See all of your Cheat Sheets
      </Link>
      <Sheets title="Popular Cheat Sheets" sheets={topSheets} />
    </div>
  );
};

const Sheets = ({
  sheets,
  title,
}: {
  sheets: ProcessedSheet[];
  title: string;
}) => {
  return sheets.length !== 0 ? (
    <>
      <h1 className="text-5xl font-bold">{title}</h1>
      <div className="grid grid-cols-6 gap-5">
        {sheets.map((s) => (
          <Link
            key={s.id}
            to={`/sheets/${s.id}`}
            className="p-3 text-black transition-all duration-200 bg-blue-100 shadow-lg rounded-xl hover:bg-blue-300 shadow-blue-500/50 hover:shadow-xl"
          >
            <h3 className="text-xl font-bold">{s.title}</h3>
            <p className="text-xs">{distanceToNow(s.updatedAt)}</p>
            <div className="flex justify-between">
              <p>Words: {s.translationGroups.length}</p>
              <p>{s.points}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  ) : null;
};
