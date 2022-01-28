import { useLoaderData, useSearchParams } from "remix";
import { WordListLoaderData } from "../validators";

export const useSheetRouteWithSearchParams = () => {
  const { sheet } = useLoaderData<WordListLoaderData>();
  const [searchParams] = useSearchParams();
  return `/sheets/${sheet.id}?${searchParams.toString()}`;
};
