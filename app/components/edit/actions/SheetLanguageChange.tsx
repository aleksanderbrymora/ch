import { Form, Link, useLoaderData, useSearchParams } from "remix";
import { match } from "ts-pattern";
import { useSearchParamsAction } from "~/utils/hooks/useSearchParamsAction";
import { useSheetRouteWithSearchParams } from "~/utils/hooks/useSheetRouteWithSearchParams";
import { capitalize } from "~/utils/textTransformation";
import { WordListLoaderData } from "~/utils/validators";
import { Cancel, Confirm, Edit } from "../icons";
import ActionInput from "./ActionInput";

const SheetLanguageChange = () => {
  const { sheet, availableLanguages } = useLoaderData<WordListLoaderData>();
  const { cancel, edit, isChanging } = useSearchParamsAction("languages");

  return (
    <Form method="post" action={cancel}>
      <ActionInput type="languages.update" />
      <div className="flex gap-3 items-center">
        <p className="text-lg font-bold items-center">Languages</p>
        {match(isChanging)
          .with(true, () => (
            <fieldset className="flex gap-1 items-center">
              <button
                type="submit"
                aria-label="Update title of this cheat sheet"
              >
                <Confirm />
              </button>
              <Link
                aria-label="Cancel editing the title of this cheat sheet"
                type="button"
                to={cancel}
              >
                <Cancel />
              </Link>
            </fieldset>
          ))
          .with(false, () => (
            <Link
              aria-label="Edit the title of this cheat sheet"
              to={edit}
              type="button"
            >
              <Edit />
            </Link>
          ))
          .exhaustive()}
      </div>
      <div className="flex flex-col gap-1">
        {match(isChanging)
          .with(true, () => (
            <>
              <label htmlFor="from-language-select">From</label>
              <select
                name="from"
                className="text-black p-2 rounded-md"
                id="from-language-select"
                defaultValue={sheet.from.name}
              >
                {availableLanguages.map((l) => (
                  <option key={`${l}-from`} value={l}>
                    {capitalize(l)}
                  </option>
                ))}
              </select>
            </>
          ))
          .with(false, () => (
            <div>
              <span>Definitions - </span>
              <span className="font-bold">{capitalize(sheet.from.name)}</span>
            </div>
          ))
          .exhaustive()}
      </div>
      <div className="flex flex-col gap-1">
        {match(isChanging)
          .with(true, () => (
            <>
              <label htmlFor="from-language-select">To</label>
              <select
                name="to"
                className="text-black p-2 rounded-md"
                id="to-language-select"
                defaultValue={sheet.to.name}
              >
                {availableLanguages.map((l) => (
                  <option key={`${l}-to`} value={l}>
                    {capitalize(l)}
                  </option>
                ))}
              </select>
            </>
          ))
          .with(false, () => (
            <div>
              <span>Translations - </span>
              <span className="font-bold">{capitalize(sheet.to.name)}</span>
            </div>
          ))
          .exhaustive()}
      </div>
    </Form>
  );
};

export default SheetLanguageChange;
