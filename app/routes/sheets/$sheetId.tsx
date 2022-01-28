import { Transition } from "@remix-run/react/transition";
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
import { z } from "zod";
import SheetLanguageChange from "~/components/edit/SheetLanguageChange";
import SheetTitleChange from "~/components/edit/SheetTitleChange";
import WordInput from "~/components/edit/WordInput";
import WordList from "~/components/edit/WordList";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import {
  addWords,
  deleteTranslationGroup,
  editTranslationGroup,
  findTranslations,
  updateLanguages,
  updateTitle,
} from "~/utils/sheetActions";
import { WordListLoaderData, SheetAction } from "~/utils/validators";
import { Row } from "../../components/edit/WordRow";

// Hate to have to extract this information into a separate type,
// but if I don't want to over-fetch then there is no other choice right now

interface ActionData {
  words?: string[];
}

const orderDetails = (link: string) => {
  const url = new URL(link);
  const orderDirection = url.searchParams.get("orderDir");

  const orderDirSchema = z.enum(["asc", "desc"]).optional();
  const orderDirValidation = orderDirSchema.safeParse(orderDirection);
  return orderDirValidation.success ? orderDirValidation.data : undefined;
};

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

  const orderDir = orderDetails(request.url);

  return match(orderDir)
    .with(undefined, () => {
      console.log({ orderDir });
      const data: WordListLoaderData = { sheet, availableLanguages };
      return data;
    })
    .with("asc", (dir) => {
      // sheet.translationGroups.sort((a, b) => {
      //   const first = a.translationGroup.words.find(
      //     (w) => w.language.name === sheet.from.name
      //   );

      //   const second = b.translationGroup.words.find(
      //     (w) => w.language.name === sheet.from.name
      //   );

      //   return first!.content.localeCompare(second!.content);
      // });
      const data: WordListLoaderData = { sheet, availableLanguages };
      return data;
    })
    .with("desc", (dir) => {
      const data: WordListLoaderData = { sheet, availableLanguages };
      return data;
    });
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
  const data = useActionData<ActionData>();
  const { sheet, availableLanguages } = useLoaderData<WordListLoaderData>();
  const transition = useTransition();

  return (
    <div className="grid grid-cols-sheet gap-10">
      <div>
        <WordInput
          sheetId={sheet.id}
          from={sheet.from.name}
          to={sheet.to.name}
        />
        <WordList sheet={sheet} transition={transition} />
      </div>
      <aside>
        <div className="h-min sticky top-10 bg-zinc-800 p-5 rounded-xl shadow-lg shadow-blue-500/20 flex-col flex gap-5">
          <p className="text-3xl font-bold">Actions</p>
          <SheetTitleChange />
          <SheetLanguageChange />
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

export interface RowProps {
  from: WordListLoaderData["sheet"]["from"]["name"];
  to: WordListLoaderData["sheet"]["from"]["name"];
  translationGroup: WordListLoaderData["sheet"]["translationGroups"][number];
  transition: Transition;
}
