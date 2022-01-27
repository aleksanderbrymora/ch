import { FC } from "react";
import { SheetAction } from "~/utils/validators";

const ActionInput: FC<{ type: SheetAction["type"] }> = ({ type }) => (
  <input
    type="hidden"
    aria-hidden="true"
    tabIndex={-1}
    name="type"
    value={type}
    readOnly
  />
);

export default ActionInput;
