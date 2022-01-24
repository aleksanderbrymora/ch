import { Transition } from "@remix-run/react/transition";
import { useAtom } from "jotai";
import { FC, useEffect, useRef } from "react";
import { Form } from "remix";
import { titleEditing } from "~/utils/sheetState";
import ActionInput from "./ActionInput";

const SheetTitleChange: FC<{
  title: string;
  id: string;
  transition: Transition;
}> = ({ title, id, transition }) => {
  const [isTitleEdited, setIsTitleEdited] = useAtom(titleEditing);
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
    <div>
      <h1 className="col-span-2 text-lg font-bold">Title</h1>
      <div className="flex justify-between items-center">
        {isTitleEdited ? (
          <>
            <Form
              method="post"
              className="flex justify-between items-center w-full"
              action={`/sheets/${id}`}
            >
              <ActionInput type="title.update" />
              <input
                type="text"
                aria-label="Title of this cheat sheet"
                defaultValue={title}
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
            <p className="text-md">{title}</p>
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
  );
};

export default SheetTitleChange;
