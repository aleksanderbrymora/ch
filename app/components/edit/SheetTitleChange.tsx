import { Transition } from "@remix-run/react/transition";
import { FC, useEffect, useRef, useState } from "react";
import { Form } from "remix";
import { match } from "ts-pattern";
import { Cancel, Confirm, Edit } from "../icons";
import ActionInput from "./ActionInput";

const SheetTitleChange: FC<{
  title: string;
  id: string;
  transition: Transition;
}> = ({ title, id, transition }) => {
  const [isTitleEdited, setIsTitleEdited] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // turning off editing after update to the title's been done
  useEffect(() => {
    if (transition.state === "idle") setIsTitleEdited(false);
  }, [transition.state === "idle"]);

  const editTitle = () => {
    setIsTitleEdited(true);
    setTimeout(() => titleRef.current?.select(), 1);
  };

  return (
    <Form method="post">
      <div className="flex gap-3 items-center">
        <legend className="text-lg font-bold">Title</legend>
        {match(isTitleEdited)
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
                aria-label="Cancel editing the title of this cheat sheet"
                onClick={() => setIsTitleEdited(false)}
              >
                <Cancel />
              </button>
            </div>
          ))
          .with(false, () => (
            <button
              aria-label="Edit the title of this cheat sheet"
              onClick={editTitle}
            >
              <Edit />
            </button>
            // -----
          ))
          .exhaustive()}
      </div>
      <ActionInput type="title.update" />
      {match(isTitleEdited)
        .with(false, () => <p className="py-1">{title}</p>)
        .with(true, () => (
          <input
            type="text"
            aria-label="Title of this cheat sheet"
            defaultValue={title}
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
