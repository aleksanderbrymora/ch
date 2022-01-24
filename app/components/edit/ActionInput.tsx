import { FC } from "react";
import { SheetAction } from "~/utils/validators";

const ActionInput: FC<{ type: SheetAction }> = ({ type }) => (
  <input type="hidden" aria-hidden="true" name="type" value={type} />
);

export default ActionInput;
