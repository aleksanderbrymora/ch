import { useEffect, useRef, useState } from "react";
import { Form, useFetcher, useLoaderData, useTransition } from "remix";
import { useSheetRouteWithSearchParams } from "~/utils/hooks/useSheetRouteWithSearchParams";
import { SheetAction, WordListLoaderData } from "~/utils/validators";
import ActionInput from "./ActionInput";

const WordInput = () => {
  const transition = useTransition();
  const fetcher = useFetcher();
  const { sheet } = useLoaderData<WordListLoaderData>();
  const path = useSheetRouteWithSearchParams();

  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const populateSuggestions = async () => {
    const word = fromInputRef.current?.value;
    if (!word) {
      setSuggestions([]);
      return;
    }
    const data: SheetAction = {
      type: "translation.find",
      word,
      from: sheet.from.name,
      to: sheet.to.name,
    };
    fetcher.submit(data, {
      method: "post",
      action: `/sheets/${sheet.id}`,
    });
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
    else if (newSuggestions.length === 0) setSuggestions([]);
  }, [fetcher.type === "done"]);

  useEffect(() => {
    toInputRef.current!.value = "";
    fromInputRef.current!.value = "";
    fromInputRef.current!.focus();
    setSuggestions([]);
  }, [transition.type === "actionSubmission"]);

  return (
    <Form
      method="post"
      action={path}
      className="grid grid-cols-word-row gap-x-3 rounded-xl bg-zinc-800 px-5 pt-5 items-center sticky top-10 mb-10 shadow-lg shadow-blue-500/20"
    >
      <ActionInput type="word.add" />
      <input
        className="font-bold p-3 w-full border-none bg-zinc-100 rounded-xl focus:outline-1 focus:outline-blue-400 placeholder:text-zinc-500"
        placeholder="Definition"
        ref={fromInputRef}
        type="text"
        name="from"
        defaultValue=""
        aria-label="Definition word"
        required
      />
      <p className="font-bold text-lg">-</p>
      <input
        className="font-bold p-3 w-full border-none bg-zinc-100 rounded-xl focus:outline-1 focus:outline-blue-400 placeholder:text-zinc-500"
        placeholder="Translation"
        ref={toInputRef}
        type="text"
        name="to"
        defaultValue=""
        aria-label="Translation word"
        required
        onFocus={populateSuggestions}
      />
      <button
        className="font-bold h-full w-full rounded-xl bg-zinc-100 text-zinc-800 hover:bg-zinc-200 transition-colors"
        type="submit"
      >
        Add
      </button>
      <div
        style={{ scrollbarWidth: "none" }}
        className="col-start-3 py-3 flex gap-1 w-full overflow-x-scroll overflow-y-hidden"
      >
        {suggestions.map((s, i) => (
          <button
            type="button"
            className="rounded-full border-blue-400 border px-3 py-1 font-bold text-xs hover:bg-zinc-700 transition-colors h-full whitespace-nowrap"
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
