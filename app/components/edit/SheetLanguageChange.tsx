import { Transition } from "@remix-run/react/transition";
import { FC, useEffect, useState } from "react";
import { Form } from "remix";
import { capitalize } from "~/utils/textTransformation";
import { Cancel, Confirm, Edit } from "../icons";
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
          <fieldset className="flex gap-1 items-center">
            <button type="submit" aria-label="Update title of this cheat sheet">
              <Confirm />
            </button>
            <button
              type="button"
              aria-label="Cancel editing the title of this cheat sheet"
              onClick={() => setIsChangingLanguage(false)}
            >
              <Cancel />
            </button>
          </fieldset>
        ) : (
          <button
            aria-label="Edit the title of this cheat sheet"
            onClick={() => setIsChangingLanguage(true)}
            type="button"
          >
            <Edit />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {isChangingLanguage ? (
          <>
            <label htmlFor="from-language-select">From</label>
            <select
              name="from"
              className="text-black p-2 rounded-md"
              id="from-language-select"
              defaultValue={from}
            >
              {availableLanguages.map((l) => (
                <option key={`${l}-from`} value={l}>
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
              name="to"
              className="text-black p-2 rounded-md"
              id="to-language-select"
              defaultValue={to}
            >
              {availableLanguages.map((l) => (
                <option key={`${l}-to`} value={l}>
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
