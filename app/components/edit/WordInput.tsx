import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import { Form, useFetcher, useSubmit, useTransition } from "remix";
import { SheetAction } from "~/utils/validators";
import ActionInput from "./ActionInput";

const WordInput: FC<{
  sheetId: string;
  from: string;
  to: string;
  words?: string[];
}> = ({ sheetId, to, from }) => {
  const fromInput = useRef<HTMLInputElement>(null);
  const toInput = useRef<HTMLInputElement>(null);
  const transition = useTransition();
  const fetcher = useFetcher();
  const [suggestions, setSuggestions] = useState<string[]>();

  // potentially won't work as fetcher.data might be an array
  useEffect(() => {
    console.log(fetcher.data);
    if (fetcher.data?.words) setSuggestions(fetcher.data.words);
  }, [fetcher.data, fetcher.state === "idle"]);

  const findTranslationsFor = (e: ChangeEvent<HTMLInputElement>) => {
    const word = e.target.value;
    if (word !== "") {
      const data: SheetAction = { type: "translation.find", word, from, to };
      fetcher.submit(data, { method: "post", action: `/sheets/${sheetId}` });
    } else {
      setSuggestions([]);
    }
  };

  const populateTranslationWithSuggestion = (word: string) => {
    toInput.current!.value = word;
    toInput.current!.focus();
  };

  useEffect(() => {
    toInput.current!.value = "";
    fromInput.current!.value = "";
    fromInput.current!.focus();
  }, [transition.state === "idle"]);

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
        ref={fromInput}
        type="text"
        name="from"
        defaultValue=""
        aria-label="Definition word"
        required
        onChange={findTranslationsFor}
      />
      <p>-</p>
      <input
        className="p-2 w-full border-none"
        placeholder="Translation"
        ref={toInput}
        type="text"
        name="to"
        defaultValue=""
        aria-label="Translation word"
        required
      />
      <button className="font-bold h-full w-full" type="submit">
        Add
      </button>
      <div className="col-start-3 py-3 h-[50px] flex gap-1">
        {suggestions?.map((s) => (
          <button
            type="button"
            className="rounded-full border-blue-400 border px-3 py-1 font-bold text-xs hover:bg-zinc-700 transition-colors h-full"
            onClick={() => populateTranslationWithSuggestion(s)}
            key={s}
          >
            {s}
          </button>
        ))}
      </div>
    </Form>
  );
};

export default WordInput;
