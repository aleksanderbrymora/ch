import { useSearchParams } from "remix";
import { toSearchParams } from "./urlHelper";
import { changeActionString } from "./validators";

export const useSearchParamsAction = (actionString: string) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const l = changeActionString(actionString);
  const isChanging = Boolean(searchParams.get(l));

  const editLink = new URLSearchParams(searchParams);
  editLink.set(l, "true");

  const cancelLink = new URLSearchParams(searchParams);
  cancelLink.delete(l);

  return {
    edit: toSearchParams(editLink),
    cancel: toSearchParams(cancelLink),
    isChanging,
  };
};
