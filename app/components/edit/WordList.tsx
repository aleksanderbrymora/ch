import { Transition } from "@remix-run/react/transition";
import { FC, memo } from "react";
import { WordListLoaderData } from "~/utils/validators";
import { Row } from "./WordRow";

const WordList: FC<{
  sheet: WordListLoaderData["sheet"];
  transition: Transition;
}> = ({ sheet, transition }) => {
  return (
    <div>
      {sheet.translationGroups.map((t) => (
        <Row
          key={t.translationGroupId}
          translationGroup={t}
          from={sheet.from.name}
          to={sheet.to.name}
          transition={transition}
        />
      ))}
    </div>
  );
};

// This just never seams to do what i want...
export default memo(WordList, (prevProps, nextProps) => {
  if (
    prevProps.sheet.translationGroups.length !==
    nextProps.sheet.translationGroups.length
  ) {
    return false;
  }
  return true;
});
