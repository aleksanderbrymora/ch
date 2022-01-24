import { Transition } from "@remix-run/react/transition";
import { FC, useEffect, useState } from "react";
import { Form } from "remix";
import { capitalize } from "~/utils/textTransformation";
import ActionInput from "./ActionInput";

const SheetLanguageChange: FC<{
  availableLanguages: string[];
  from: string;
  to: string;
  id: string;
  transition: Transition;
}> = ({ availableLanguages, from, to, id, transition }) => {
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  useEffect(() => {
    if (transition.state === "idle") setIsChangingLanguage(false);
  }, [transition.state === "idle"]);

  return (
    <Form method="post" action={`/sheets/${id}`}>
      <ActionInput type="languages.update" />
      <div className="flex gap-3 items-center">
        <p className="text-lg font-bold items-center">Languages</p>
        {isChangingLanguage ? (
          <fieldset className="flex gap-3">
            <button type="submit" aria-label="Update title of this cheat sheet">
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
              onClick={() => setIsChangingLanguage(false)}
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
          </fieldset>
        ) : (
          <button
            aria-label="Edit the title of this cheat sheet"
            onClick={() => setIsChangingLanguage(true)}
            type="button"
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
        )}
      </div>
      <div className="flex flex-col gap-1">
        {isChangingLanguage ? (
          <>
            <label htmlFor="from-language-select">From</label>
            <select
              name="from-language"
              className="text-black p-2 rounded-md"
              id="from-language-select"
            >
              {availableLanguages.map((l) => (
                <option value={l} selected={l === from}>
                  {capitalize(l)}
                </option>
              ))}
            </select>
          </>
        ) : (
          <div>From - {capitalize(from)}</div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {isChangingLanguage ? (
          <>
            <label htmlFor="from-language-select">To</label>
            <select
              name="to-language"
              className="text-black p-2 rounded-md"
              id="to-language-select"
            >
              {availableLanguages.map((l) => (
                <option value={l} selected={l === to}>
                  {capitalize(l)}
                </option>
              ))}
            </select>
          </>
        ) : (
          <div>To - {capitalize(to)}</div>
        )}
      </div>
    </Form>
  );
};

export default SheetLanguageChange;
