import { useLoaderData } from "remix";
import { match } from "ts-pattern";
import { Cancel, Confirm, Edit } from "~/components/icons";
import { useEditAction } from "~/utils/hooks/useEditAction";
import { capitalize } from "~/utils/textTransformation";
import { WordListLoaderData } from "~/utils/validators";
import ActionInput from "../ActionInput";

const SheetLanguageChange = () => {
  const { sheet, availableLanguages } = useLoaderData<WordListLoaderData>();
  const { isEditing, Form, cancel, edit, optimisticProps } = useEditAction([
    "from",
    "to",
  ]);

  return (
    <Form method="post">
      <ActionInput type="languages.update" />
      <div className="flex gap-3 items-center">
        <p className="text-lg font-bold items-center">Languages</p>
        {match(isEditing)
          .with(true, () => (
            <fieldset className="flex gap-1 items-center">
              <button
                type="submit"
                aria-label="Update title of this cheat sheet"
              >
                <Confirm />
              </button>
              <button
                aria-label="Cancel editing the title of this cheat sheet"
                type="button"
                onClick={cancel}
              >
                <Cancel />
              </button>
            </fieldset>
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
      <div className="flex flex-col gap-1">
        {match(isEditing)
          .with(true, () => (
            <>
              <label htmlFor="from-language-select">From</label>
              <select
                name="from"
                className="text-black p-2 rounded-md"
                id="from-language-select"
                defaultValue={optimisticProps.from || sheet.from.name}
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
              <span className="font-bold">
                {capitalize(optimisticProps.from || sheet.from.name)}
              </span>
            </div>
          ))
          .exhaustive()}
      </div>
      <div className="flex flex-col gap-1">
        {match(isEditing)
          .with(true, () => (
            <>
              <label htmlFor="from-language-select">To</label>
              <select
                name="to"
                className="text-black p-2 rounded-md"
                id="to-language-select"
                defaultValue={optimisticProps.to || sheet.to.name}
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
              <span className="font-bold">
                {capitalize(optimisticProps.to || sheet.to.name)}
              </span>
            </div>
          ))
          .exhaustive()}
      </div>
    </Form>
  );
};

export default SheetLanguageChange;
