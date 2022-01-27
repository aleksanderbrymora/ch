import { Transition } from "@remix-run/react/transition";
import { FC, useEffect, useState } from "react";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  useActionData,
  useCatch,
  useLoaderData,
  useTransition,
} from "remix";
import invariant from "tiny-invariant";
import { match, select } from "ts-pattern";
import ActionInput from "~/components/edit/ActionInput";
import SheetLanguageChange from "~/components/edit/SheetLanguageChange";
import SheetTitleChange from "~/components/edit/SheetTitleChange";
import WordInput from "~/components/edit/WordInput";
import { Cancel, Confirm, Edit, Trash } from "~/components/icons";
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
import { SheetAction } from "~/utils/validators";

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
        id: string;
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

interface ActionData {
  words?: string[];
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

  const data: LoaderData = { sheet, availableLanguages };
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
  const { sheet, availableLanguages } = useLoaderData<LoaderData>();
  const transition = useTransition();

  return (
    <div className="grid grid-cols-sheet gap-10">
      <div>
        <WordInput
          sheetId={sheet.id}
          from={sheet.from.name}
          to={sheet.to.name}
        />
        {sheet.translationGroups.map((t) => (
          <Row
            key={t.translationGroupId}
            translationGroup={t}
            from={sheet.from.name}
            to={sheet.to.name}
            transition={transition}
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
  transition: Transition;
}

const Row: FC<RowProps> = ({ translationGroup, from, to, transition }) => {
  // return <pre>{JSON.stringify({ translationGroup, from, to }, null, 2)}</pre>;
  const wordFrom = translationGroup.translationGroup.words.find(
    (w) => w.language.name === from
  );
  const wordTo = translationGroup.translationGroup.words.find(
    (w) => w.language.name === to
  );

  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    if (transition.state === "idle") setIsEdited(false);
  }, [transition.state === "idle"]);

  return match(isEdited)
    .with(false, () => (
      <Form
        method="post"
        className="group grid items-center grid-cols-word-row gap-10 w-2/3 mx-auto hover:bg-zinc-800 transition-all py-2"
      >
        <ActionInput type="translationGroup.delete" />
        <input
          hidden
          aria-hidden="true"
          name="translationGroupId"
          defaultValue={translationGroup.translationGroupId}
        />
        <p className="text-center">{wordFrom?.content}</p>
        <span>-</span>
        <p className="text-center">{wordTo?.content}</p>
        <div className="group-hover:visible invisible flex gap-3 items-center h-full">
          <button type="button" onClick={() => setIsEdited(true)}>
            <Edit />
          </button>
          <button type="submit">
            <Trash />
          </button>
        </div>
      </Form>
    ))
    .with(true, () => (
      <Form
        method="post"
        className="group grid items-center grid-cols-word-row gap-10 w-2/3 mx-auto hover:bg-zinc-800 transition-all py-2"
      >
        <ActionInput type="word.update" />
        <input hidden name="fromId" defaultValue={wordFrom?.id} readOnly />
        <input hidden name="toId" defaultValue={wordTo?.id} readOnly />
        <input
          className="text-center"
          defaultValue={wordFrom?.content}
          name="from"
          aria-label="Definition"
        />
        <span>-</span>
        <input
          className="text-center"
          defaultValue={wordTo?.content}
          name="to"
          aria-label="Definition"
        />
        <div className="flex gap-3">
          <button type="submit">
            <Confirm />
          </button>
          <button type="button" onClick={() => setIsEdited(false)}>
            <Cancel />
          </button>
        </div>
      </Form>
    ))
    .exhaustive();
};
