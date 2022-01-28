import { Transition } from "@remix-run/react/transition";
import { FC, memo } from "react";
import { useLoaderData } from "remix";
import { WordListLoaderData } from "~/utils/validators";
import { Row } from "./WordRow";

const WordList = () => {
  const { sheet } = useLoaderData<WordListLoaderData>();
  return (
    <div>
      {sheet.translationGroups.map((t) => (
        <Row
          key={t.translationGroupId}
          translationGroup={t}
          from={sheet.from.name}
          to={sheet.to.name}
        />
      ))}
    </div>
  );
};

export default WordList;
