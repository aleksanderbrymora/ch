import { useAtom } from "jotai";
import { FC, useEffect, useRef } from "react";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  useCatch,
  useLoaderData,
  useTransition,
} from "remix";
import invariant from "tiny-invariant";
import { z } from "zod";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import { titleEditing } from "~/utils/sheetState";

// Hate to have to extract this information into a separate type,
// but if I don't want to over-fetch then there is no other choice right now
interface LoaderData {
  sheet: {
    // lookedAtTimes: number;
    // containsProfanity: boolean;
    // createdAt: string;
    // createdByUserId: string;
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

export const CatchBoundary = () => {
  const caught = useCatch();

  if (caught.status === 404) {
    return <p>{caught.data}</p>;
  }
};

// ---- Important
// type describing different actions that can happen when editing the sheet
// passed through a hidden input field
const SheetActionValidator = z.enum(["title.update"]);
type SheetAction = z.infer<typeof SheetActionValidator>;

// ---- Helper functions for updating the cheat sheet data
const updateTitle = async (id: string, title: string) => {
  await db.sheet.update({ where: { id }, data: { title } });
};

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const id = url.pathname.replace("/sheets/", "");
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

  // turning off editing after update to the title's been done
  useEffect(() => {
    if (transition.state === "idle") setIsTitleEdited(false);
  }, [transition.state === "idle"]);

  const [isTitleEdited, setIsTitleEdited] = useAtom(titleEditing);
  const titleRef = useRef<HTMLInputElement>(null);

  const editTitle = () => {
    setIsTitleEdited(true);
    setTimeout(() => titleRef.current?.select(), 1);
  };

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
        {/* <pre>{JSON.stringify(sheet, null, 2)}</pre> */}
      </div>
      <aside>
        <div className="h-min sticky top-10 bg-zinc-800 p-5 rounded-xl shadow-lg shadow-blue-500/20">
          <p className="text-3xl font-bold mb-6">Actions</p>
          {/* Changing title */}
          <div>
            <div className="flex justify-between items-center">
              {isTitleEdited ? (
                <>
                  <Form
                    method="post"
                    className="flex justify-between items-center w-full"
                  >
                    <ActionInput type="title.update" />
                    <input
                      type="text"
                      aria-label="Title of this cheat sheet"
                      defaultValue={sheet.title}
                      className="bg-transparent text-white"
                      ref={titleRef}
                      name="title"
                      placeholder="Title for this cheat sheet"
                      required
                    />
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        aria-label="Update title of this cheat sheet"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label="Cancel editing the title of this cheat sheet"
                        onClick={() => setIsTitleEdited(false)}
                      >
                        <svg
                          aria-hidden="true"
                          focusable="false"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </Form>
                </>
              ) : (
                <>
                  <p className="text-md">{sheet.title}</p>
                  <button
                    aria-label="Edit the title of this cheat sheet"
                    onClick={editTitle}
                  >
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path
                        fillRule="evenodd"
                        d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
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

/** Used to pass a parameter to an action to tell it what to do */
const ActionInput: FC<{ type: SheetAction }> = ({ type }) => (
  <input type="hidden" name="type" value={type} />
);
