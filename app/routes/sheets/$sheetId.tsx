import {
  ActionFunction,
  LoaderFunction,
  useActionData,
  useCatch,
  useLoaderData,
  useTransition,
} from "remix";
import invariant from "tiny-invariant";
import { match, select } from "ts-pattern";
import SheetLanguageChange from "~/components/edit/SheetLanguageChange";
import SheetTitleChange from "~/components/edit/SheetTitleChange";
import SortChange from "~/components/edit/SortChange";
import WordInput from "~/components/edit/WordInput";
import WordList from "~/components/edit/WordList";
import { db } from "~/utils/db.server";
import { processSheet } from "~/utils/processSheet";
import { requireUserId } from "~/utils/session.server";
import {
  addWords,
  deleteTranslationGroup,
  editTranslationGroup,
  findTranslations,
  updateLanguages,
  updateTitle,
} from "~/utils/sheetActions";
import { SheetAction, WordListLoaderData } from "~/utils/validators";

interface ActionData {
  words?: string[];
}

export const loader: LoaderFunction = async ({
  request,
  params,
}): Promise<WordListLoaderData> => {
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
              id: true,
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

  const data: WordListLoaderData = {
    sheet: processSheet(sheet, request.url),
    availableLanguages,
  };
  return data;
};

export const action: ActionFunction = async ({ request, params }) => {
  const sheetId = params.sheetId;
  invariant(sheetId, "Something went wildly wrong");

  const formData = await request.formData();
  const values = Object.fromEntries(formData) as SheetAction;
  console.log({ formData: values });

  try {
    const actionResult = await match(values)
      .with(
        { type: "languages.update", from: select("from"), to: select("to") },
        async ({ from, to }) => {
          invariant(from, 'Expected "from" language');
          invariant(to, 'Expected "to" language');
          await updateLanguages(sheetId, from, to);
        }
      )
      .with({ type: "title.update", title: select() }, async (title) => {
        invariant(title, "Expected a title");
        await updateTitle(sheetId, title);
      })
      .with(
        { type: "word.add", from: select("from"), to: select("to") },
        async ({ from, to }) => {
          invariant(from, "Expected a word definition");
          invariant(to, "Expected a word translation");
          await addWords(sheetId, from, to);
        }
      )
      .with(
        {
          type: "word.update",
          from: select("from"),
          to: select("to"),
          fromId: select("fromId"),
          toId: select("toId"),
        },
        async ({ from, to, fromId, toId }) => {
          await editTranslationGroup({ from, to, fromId, toId });
        }
      )
      .with(
        { type: "translationGroup.delete", translationGroupId: select() },
        async (translationGroupId) => {
          await deleteTranslationGroup(translationGroupId, sheetId);
        }
      )
      .with(
        {
          type: "translation.find",
          from: select("from"),
          to: select("to"),
          word: select("word"),
        },
        async (wordData) => {
          console.log({ wordData });
          const words = await findTranslations(wordData);
          console.log({ words });
          const data: ActionData = { words };
          return data;
        }
      )
      .exhaustive();
    return actionResult ? actionResult : { ok: true };
  } catch (error) {
    console.log({ error });
    return { status: 403, error };
  }
};

export default () => {
  return (
    <div className="grid grid-cols-sheet gap-10">
      <div>
        <WordInput />
        <WordList />
      </div>
      <aside>
        <div className="h-min sticky top-10 bg-zinc-800 p-5 rounded-xl shadow-lg shadow-blue-500/20 flex-col flex gap-5">
          <p className="text-3xl font-bold">Actions</p>
          <SheetTitleChange />
          <SheetLanguageChange />
          <SortChange />
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
