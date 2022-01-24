import { FC } from "react";
import {
  ActionFunction,
  LoaderFunction,
  useCatch,
  useLoaderData,
  useTransition,
} from "remix";
import invariant from "tiny-invariant";
import SheetLanguageChange from "~/components/edit/SheetLanguageChange";
import SheetTitleChange from "~/components/edit/SheetTitleChange";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import { SheetActionValidator } from "~/utils/validators";

// Hate to have to extract this information into a separate type,
// but if I don't want to over-fetch then there is no other choice right now
interface LoaderData {
  sheet: {
    id: string;
    title: string;
    points: number;
    updatedAt: Date;
    from: { name: string };
    to: { name: string };
    translationGroups: Array<{
      translationGroupId: string;
      translationGroup: {
        tags: Array<{ tag: { name: string } }>;
        words: Array<{
          language: {
            name: string;
          };
          id: string;
          content: string;
        }>;
      };
    }>;
  };
  availableLanguages: string[];
}

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.sheetId, "Expected an id of the sheet");
  await requireUserId(request);
  const sheet = await db.sheet.findUnique({
    where: { id: params.sheetId },
    select: {
      updatedAt: true,
      id: true,
      title: true,
      points: true,
      from: { select: { name: true } },
      to: { select: { name: true } },
      translationGroups: {
        select: {
          translationGroupId: true,
          translationGroup: {
            select: {
              tags: { select: { tag: { select: { name: true } } } },
              words: { select: { language: true, id: true, content: true } },
            },
          },
        },
      },
    },
  });
  if (!sheet)
    throw new Response("There is no Cheat Sheet with this id :<", {
      status: 404,
    });

  const availableLanguages = (
    await db.language.findMany({ select: { name: true } })
  ).map((l) => l.name);

  const data: LoaderData = { sheet, availableLanguages };
  return data;
};

const updateTitle = async (id: string, title: string) => {
  await db.sheet.update({ where: { id }, data: { title } });
};

const updateLanguages = async (id: string, from: string, to: string) => {
  await db.sheet.update({
    where: { id },
    data: {
      from: { connect: { name: from } },
      to: { connect: { name: to } },
    },
  });
};

type Action = {};

export const action: ActionFunction = async ({ request, params }) => {
  const id = params.sheetId;
  invariant(id, "Something went wildly wrong");

  const formData = await request.formData();
  try {
    const sheetAction = SheetActionValidator.parse(formData.get("type"));
    console.log({ sheetAction });

    switch (sheetAction) {
      case "title.update":
        const title = formData.get("title")?.toString() || "";
        await updateTitle(id, title);
        break;

      case "languages.update":
        const from = formData.get("from-language")?.toString();
        const to = formData.get("to-language")?.toString();
        invariant(from, 'Expected "from" language');
        invariant(to, 'Expected "to" language');
        console.log({ from, to });
        await updateLanguages(id, from, to);
        break;

      default:
        break;
    }
    return null;
  } catch (error) {
    console.log({ error });
    return { status: 403, error };
  }
};

export default () => {
  const { sheet, availableLanguages } = useLoaderData<LoaderData>();
  const transition = useTransition();

  return (
    <div className="grid grid-cols-sheet">
      <div>
        {/* Input form */}
        {sheet.translationGroups.map((t) => (
          <Row
            key={t.translationGroupId}
            translationGroup={t}
            from={sheet.from.name}
            to={sheet.to.name}
          />
        ))}
      </div>
      <aside>
        <div className="h-min sticky top-10 bg-zinc-800 p-5 rounded-xl shadow-lg shadow-blue-500/20 flex-col flex gap-5">
          <p className="text-3xl font-bold">Actions</p>
          <SheetTitleChange
            id={sheet.id}
            title={sheet.title}
            transition={transition}
          />
          <SheetLanguageChange
            id={sheet.id}
            transition={transition}
            availableLanguages={availableLanguages}
            from={sheet.from.name}
            to={sheet.to.name}
          />
        </div>
      </aside>
    </div>
  );
};

export const CatchBoundary = () => {
  const caught = useCatch();

  if (caught.status === 404) {
    return <p>{caught.data}</p>;
  }
};

interface RowProps {
  from: LoaderData["sheet"]["from"]["name"];
  to: LoaderData["sheet"]["from"]["name"];
  translationGroup: LoaderData["sheet"]["translationGroups"][number];
}

const Row: FC<RowProps> = ({ translationGroup, from, to }) => {
  // return <pre>{JSON.stringify({ translationGroup, from, to }, null, 2)}</pre>;
  const wordFrom = translationGroup.translationGroup.words.find(
    (w) => w.language.name === from
  );
  const wordTo = translationGroup.translationGroup.words.find(
    (w) => w.language.name === to
  );
  return (
    <div className="flex gap-5">
      <p>{wordFrom?.content}</p>
      <span>-</span>
      <p>{wordTo?.content}</p>
    </div>
  );
};
