import { FC, memo } from "react";
import { useLoaderData } from "remix";
import { WordListLoaderData } from "~/utils/validators";
import { Row } from "./WordRow";

const WordList: FC<{ sheet: WordListLoaderData["sheet"] }> = ({ sheet }) => {
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

export default memo(WordList, (prev, now) => {
  for (let i = 0; i < prev.sheet.translationGroups.length; i++) {
    const prevTG = prev.sheet.translationGroups[i].translationGroup;
    const nowTG = now.sheet.translationGroups[i].translationGroup;

    if (prevTG.id !== nowTG.id) return false;

    const areWordsSame = nowTG.words.every(
      (w, i) => prevTG.words[i].content === w.content
    );
    if (!areWordsSame) return false;
  }
  return true;
});
