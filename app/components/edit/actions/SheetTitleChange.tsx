import { useRef } from "react";
import { match } from "ts-pattern";
import { Cancel, Confirm, Edit } from "~/components/icons";
import { useEditAction } from "~/utils/hooks/useEditAction";
import ActionInput from "../ActionInput";

const SheetTitleChange = () => {
  const titleRef = useRef<HTMLInputElement>(null);
  const { sheet, cancel, edit, Form, isEditing, optimisticProps } =
    useEditAction(["title"]);

  return (
    <Form method="post">
      <div className="flex gap-3 items-center">
        <legend className="text-lg font-bold">Title</legend>
        {match(isEditing)
          .with(true, () => (
            <div className="flex gap-1">
              <button
                type="submit"
                aria-label="Update title of this cheat sheet"
              >
                <Confirm />
              </button>
              <button
                type="button"
                onClick={cancel}
                aria-label="Cancel editing the title of this cheat sheet"
              >
                <Cancel />
              </button>
            </div>
          ))
          .with(false, () => (
            <button
              aria-label="Edit the title of this cheat sheet"
              onClick={edit}
              type="button"
            >
              <Edit />
            </button>
          ))
          .exhaustive()}
      </div>
      <ActionInput type="title.update" />
      {match(isEditing)
        .with(false, () => (
          <p className="py-1">{optimisticProps.title || sheet.title}</p>
        ))
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
