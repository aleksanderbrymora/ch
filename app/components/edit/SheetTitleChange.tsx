import { useRef } from "react";
import { Form, Link, useLoaderData, useTransition } from "remix";
import { match } from "ts-pattern";
import { useSearchParamsAction } from "~/utils/useSearchParamsAction";
import { WordListLoaderData } from "~/utils/validators";
import { Cancel, Confirm, Edit } from "../icons";
import ActionInput from "./ActionInput";

const SheetTitleChange = () => {
  const titleRef = useRef<HTMLInputElement>(null);
  const transition = useTransition();
  const { sheet } = useLoaderData<WordListLoaderData>();
  const { cancel, edit, isChanging } = useSearchParamsAction("title");

  return (
    <Form method="post">
      <div className="flex gap-3 items-center">
        <legend className="text-lg font-bold">Title</legend>
        {match(isChanging)
          .with(true, () => (
            <div className="flex gap-1">
              <button
                type="submit"
                aria-label="Update title of this cheat sheet"
              >
                <Confirm />
              </button>
              <Link
                to={cancel}
                aria-label="Cancel editing the title of this cheat sheet"
              >
                <Cancel />
              </Link>
            </div>
          ))
          .with(false, () => (
            <Link aria-label="Edit the title of this cheat sheet" to={edit}>
              <Edit />
            </Link>
          ))
          .exhaustive()}
      </div>
      <ActionInput type="title.update" />
      {match(isChanging)
        .with(false, () => <p className="py-1">{sheet.title}</p>)
        .with(true, () => (
          <input
            type="text"
            aria-label="Title of this cheat sheet"
            defaultValue={sheet.title}
            className="w-full p-1"
            ref={titleRef}
            name="title"
            placeholder="Title for this cheat sheet"
            required
          />
        ))
        .exhaustive()}
    </Form>
  );
};

export default SheetTitleChange;
