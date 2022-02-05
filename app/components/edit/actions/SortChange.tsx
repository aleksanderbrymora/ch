import { Link, useSearchParams } from "remix";
import { toSearchParams } from "~/utils/urlHelper";

const SortChange = () => {
  const [searchParams] = useSearchParams();
  const dir = searchParams.get("sort") || "";

  const descLink = new URLSearchParams(searchParams);
  descLink.set("sort", "desc");

  const ascLink = new URLSearchParams(searchParams);
  ascLink.set("sort", "asc");

  const noSortLink = new URLSearchParams(searchParams);
  noSortLink.delete("sort");

  return (
    <div>
      <p className="text-lg font-bold items-center">Sort words</p>
      <div className="flex gap-1">
        <Link
          className={dir === "" ? "font-bold" : "hover:underline"}
          to={toSearchParams(noSortLink)}
        >
          none
        </Link>
        <span>/</span>
        <Link
          className={dir === "asc" ? "font-bold" : "hover:underline"}
          to={toSearchParams(ascLink)}
        >
          asc
        </Link>
        <span>/</span>
        <Link
          className={dir === "desc" ? "font-bold" : "hover:underline"}
          to={toSearchParams(descLink)}
        >
          desc
        </Link>
      </div>
    </div>
  );
};

export default SortChange;
