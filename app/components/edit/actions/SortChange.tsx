import clsx from "clsx";
import { Form, useSearchParams, useTransition } from "remix";

const SortChange = () => {
  const [searchParams] = useSearchParams();
  const transition = useTransition();
  const dir =
    transition.submission?.formData.get("sort") ||
    searchParams.get("sort") ||
    "";

  const isSorting = transition.state === "submitting";

  return (
    <Form method="get">
      <p className="text-lg font-bold items-center">Sort words</p>
      <div className={clsx("flex gap-1", isSorting && "opacity-60")}>
        <button
          className={
            dir === "none" || dir === "" ? "font-bold" : "hover:underline"
          }
          name="sort"
          value="none"
          type="submit"
        >
          none
        </button>
        <span>/</span>
        <button
          className={dir === "asc" ? "font-bold" : "hover:underline"}
          name="sort"
          value="asc"
          type="submit"
        >
          asc
        </button>
        <span>/</span>
        <button
          className={dir === "desc" ? "font-bold" : "hover:underline"}
          name="sort"
          value="desc"
          type="submit"
        >
          desc
        </button>
      </div>
    </Form>
  );
};

export default SortChange;
