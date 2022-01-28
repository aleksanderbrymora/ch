import { FC, useEffect, useRef, useState } from "react";
import { Form, useFetcher, useTransition } from "remix";
import { findTranslations } from "~/utils/sheetActions";
import { SheetAction } from "~/utils/validators";
import ActionInput from "./ActionInput";

const WordInput: FC<{
  sheetId: string;
  from: string;
  to: string;
  words?: string[];
}> = ({ sheetId, to, from }) => {
  const transition = useTransition();
  const fetcher = useFetcher();

  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const populateSuggestions = async () => {
    const word = fromInputRef.current?.value;
    console.log({ word });
    if (!word) return;
    const data: SheetAction = { type: "translation.find", word, from, to };
    fetcher.submit(data, { method: "post", action: `/sheets/${sheetId}` });
  };

  const populateTranslationWithSuggestion = (word: string) => {
    toInputRef.current!.value = word;
    toInputRef.current!.focus();
  };

  useEffect(() => {
    const newSuggestions: string[] = fetcher.data?.words ?? [];
    const suggestionsSame =
      newSuggestions.every((s, i) => suggestions[i] === s) &&
      suggestions.length !== 0;

    if (!suggestionsSame) setSuggestions(newSuggestions);
  }, [fetcher.type === "done"]);

  useEffect(() => {
    toInputRef.current!.value = "";
    fromInputRef.current!.value = "";
    fromInputRef.current!.focus();
  }, [transition.type === "actionSubmission"]);

  return (
    <Form
      method="post"
      action={`/sheets/${sheetId}`}
      className="grid grid-cols-word-row gap-x-3 rounded-xl bg-zinc-800 px-5 pt-5 items-center sticky top-10 mb-10 shadow-lg shadow-blue-500/20"
    >
      <ActionInput type="word.add" />
      <input
        className="p-2 w-full border-none"
        placeholder="Definition"
        ref={fromInputRef}
        type="text"
        name="from"
        defaultValue=""
        aria-label="Definition word"
        required
      />
      <p>-</p>
      <input
        className="p-2 w-full border-none"
        placeholder="Translation"
        ref={toInputRef}
        type="text"
        name="to"
        defaultValue=""
        aria-label="Translation word"
        required
        onFocus={populateSuggestions}
      />
      <button className="font-bold h-full w-full" type="submit">
        Add
      </button>
      <div className="col-start-3 py-3 h-[50px] flex gap-1">
        {suggestions.map((s, i) => (
          <button
            type="button"
            className="rounded-full border-blue-400 border px-3 py-1 font-bold text-xs hover:bg-zinc-700 transition-colors h-full"
            onClick={() => populateTranslationWithSuggestion(s)}
            key={s + i}
          >
            {s}
          </button>
        ))}
      </div>
    </Form>
  );
};

export default WordInput;
