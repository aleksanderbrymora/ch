import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
} from "docx";
import { WordListLoaderData } from "../validators";
import { saveAs } from "./fileSaver";

interface TranslationGroup {
  from: string;
  to: string;
}

const prepareChildren = (
  items: TranslationGroup[],
  translationSeparator: string,
  groupSeparator: string
) => {
  const children = items.map((pair) => [
    new TextRun({
      text: pair.from,
      bold: true,
    }),
    new TextRun({
      text: translationSeparator,
    }),
    new TextRun({
      text: pair.to,
    }),
    new TextRun({
      text: groupSeparator,
    }),
  ]);
  return children.flat();
};

export const generateDoc = async (sheet: WordListLoaderData["sheet"]) => {
  const words: { from: string; to: string }[] = sheet.translationGroups.map(
    (t) => {
      const from = t.translationGroup.words.find(
        (w) => w.language.name === sheet.from.name
      )!.content;
      const to = t.translationGroup.words.find(
        (w) => w.language.name === sheet.to.name
      )!.content;
      return { from, to };
    }
  );

  const paragraphs = Array(3).fill(
    new TableCell({
      children: [
        new Paragraph({
          style: "cheat",
          children: prepareChildren(
            words,
            sheet.translationSeparator,
            sheet.groupSeparator
          ),
          alignment: AlignmentType.JUSTIFIED,
        }),
      ],
      margins: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
      borders: {
        top: { size: 0.5, style: BorderStyle.SINGLE },
        bottom: { size: 0.5, style: BorderStyle.SINGLE },
        left: { size: 0.5, style: BorderStyle.SINGLE },
        right: { size: 0.5, style: BorderStyle.SINGLE },
      },
    })
  );

  const table = new Table({
    rows: [
      new TableRow({
        children: paragraphs,
      }),
    ],
    columnWidths: new Array(3).fill(3000),
  });

  const doc = new Document({
    // todo this is required??? and probably wrong
    sections: [{ children: [table] }],
    styles: {
      paragraphStyles: [
        {
          id: "cheat",
          name: sheet.title || "Cheat text",
          basedOn: "Normal",
          quickFormat: true,
          run: {
            size: 3.5,
            font: "Arial",
          },
        },
      ],
    },
  });

  Packer.toBlob(doc).then((blob: any) => {
    saveAs(blob, sheet.title !== "" ? sheet.title + ".docx" : "sheet.docx");
  });
};
