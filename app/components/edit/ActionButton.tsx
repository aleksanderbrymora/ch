import { FC } from "react";
import { SheetAction } from "~/utils/validators";

const ActionButton: FC<{ type: SheetAction["type"] }> = ({
  type,
  children,
  ...props
}) => (
  <button type="submit" name="type" value={type} {...props}>
    {children}
  </button>
);

export default ActionButton;
