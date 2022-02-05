import { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "remix";
import { WordListLoaderData } from "../validators";

export const useEditAction = (
  /** names of inputs that will be submitted */
  toGet: string[]
) => {
  const fetcher = useFetcher();
  const { sheet } = useLoaderData<WordListLoaderData>();
  const [isEditing, setIsEditing] = useState(false);

  const edit = () => setIsEditing(true);
  const cancel = () => setIsEditing(false);

  const optimisticProps: { [key: string]: string | undefined } = {};

  const formData = fetcher.submission?.formData;
  toGet.forEach((p) => (optimisticProps[p] = formData?.get(p)?.toString()));

  useEffect(() => {
    if (fetcher.type === "actionSubmission") setIsEditing(false);
  }, [fetcher.type === "actionSubmission"]);

  return {
    edit,
    cancel,
    Form: fetcher.Form,
    isEditing,
    sheet,
    optimisticProps,
  };
};
