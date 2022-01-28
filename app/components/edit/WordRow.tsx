import { FC, useEffect, useState } from "react";
import { Form, useTransition } from "remix";
import { match } from "ts-pattern";
import ActionInput from "~/components/edit/ActionInput";
import { Cancel, Confirm, Edit, Trash } from "~/components/icons";
import { WordListLoaderData } from "~/utils/validators";

export interface RowProps {
  from: WordListLoaderData["sheet"]["from"]["name"];
  to: WordListLoaderData["sheet"]["from"]["name"];
  translationGroup: WordListLoaderData["sheet"]["translationGroups"][number];
}

export const Row: FC<RowProps> = ({ translationGroup, from, to }) => {
  const transition = useTransition();

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
