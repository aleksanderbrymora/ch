import { match } from "ts-pattern";
import { Cancel, Confirm, Edit } from "~/components/icons";
import { useEditAction } from "~/utils/hooks/useEditAction";
import ActionInput from "../ActionInput";

const SheetSeparatorsChange = () => {
  const { sheet, cancel, edit, Form, isEditing, optimisticProps } =
    useEditAction(["translationSeparator", "groupSeparator"]);

  return (
    <Form className="grid gap-2" method="post">
      <div className="flex gap-3">
        <details>
          <summary className="text-lg font-bold items-center cursor-pointer">
            Cheat sheet separators
          </summary>
          <p className="text-xs leading-snug">
            A sign you'll use to separate words, their translations and groups
            of the translations. For example "translation separator" can be
            simple "=", without the spaces around it. This will save some space
            and keep the words together.
            <strong> Remember! Spaces matter with this one!</strong>
          </p>
        </details>
        {match(isEditing)
          .with(false, () => (
            <button
              aria-label="Edit the title of this cheat sheet"
              onClick={edit}
              type="button"
            >
              <Edit />
            </button>
          ))
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
          .exhaustive()}
      </div>
      <ActionInput type="separators.update" />
      <fieldset className="grid gap-3 grid-cols-4 items-center">
        <label
          htmlFor="translationSeparatorInput"
          className="whitespace-nowrap col-span-3"
        >
          Word Separator
        </label>
        {match(isEditing)
          .with(true, () => (
            <input
              className="py-1 px-3 rounded-md font-bold"
              id="translationSeparatorInput"
              type="text"
              required
              name="translationSeparator"
              autoComplete="off"
              defaultValue={
                optimisticProps.translationSeparator ||
                sheet.translationSeparator
              }
            />
          ))
          .with(false, () => (
            <p className="py-1 px-3 font-bold">
              {optimisticProps.translationSeparator ||
                sheet.translationSeparator}
            </p>
          ))
          .exhaustive()}
      </fieldset>

      <fieldset className="grid gap-3 grid-cols-4 items-center">
        <label
          htmlFor="groupSeparatorInput"
          className="whitespace-nowrap col-span-3"
        >
          Group Separator
        </label>
        {match(isEditing)
          .with(true, () => (
            <input
              className="py-1 px-3 rounded-md font-bold"
              id="groupSeparatorInput"
              type="text"
              autoComplete="off"
              required
              name="groupSeparator"
              defaultValue={
                optimisticProps.groupSeparator || sheet.groupSeparator
              }
            />
          ))
          .with(false, () => (
            <p className="py-1 px-3 font-bold">
              {optimisticProps.groupSeparator || sheet.groupSeparator}
            </p>
          ))
          .exhaustive()}
      </fieldset>
    </Form>
  );
};

export default SheetSeparatorsChange;
