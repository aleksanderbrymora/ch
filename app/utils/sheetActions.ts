import { string } from "zod";
import { db } from "./db.server";

export const updateTitle = async (id: string, title: string) => {
  await db.sheet.update({ where: { id }, data: { title } });
};

export const updateLanguages = async (id: string, from: string, to: string) => {
  const availableLanguages = (
    await db.language.findMany({ select: { name: true } })
  ).map((l) => l.name);

  if (!availableLanguages.includes(from)) {
    throw new Error("There is no language with this name");
  }

  if (!availableLanguages.includes(to)) {
    throw new Error("There is no language with this name");
  }

  await db.sheet.update({
    where: { id },
    data: {
      from: { connect: { name: from } },
      to: { connect: { name: to } },
    },
  });
};

export const addWords = async (sheetId: string, from: string, to: string) => {
  const sheetLanguages = await db.sheet.findUnique({
    where: { id: sheetId },
    select: { toLanguage: true, fromLanguage: true },
  });

  await db.sheet.update({
    where: { id: sheetId },
    data: {
      translationGroups: {
        create: {
          translationGroup: {
            create: {
              words: {
                create: [
                  {
                    language: {
                      connect: { name: sheetLanguages!.fromLanguage },
                    },
                    content: from,
                  },
                  {
                    language: {
                      connect: { name: sheetLanguages!.toLanguage },
                    },
                    content: to,
                  },
                ],
              },
            },
          },
        },
      },
    },
  });
};

export const editTranslationGroup = async ({
  from,
  to,
  fromId,
  toId,
}: {
  from: string;
  to: string;
  fromId: string;
  toId: string;
}) => {
  await Promise.all([
    db.word.update({ where: { id: fromId }, data: { content: from } }),
    db.word.update({ where: { id: toId }, data: { content: to } }),
  ]);
};

export const deleteTranslationGroup = async (
  translationGroupId: string,
  sheetId: string
) => {
  await db.sheet.update({
    data: {
      translationGroups: {
        delete: {
          sheetId_translationGroupId: { translationGroupId, sheetId },
        },
      },
    },
    where: { id: sheetId },
  });
};

export const findTranslations = async ({
  from,
  to,
  word,
}: {
  from: string;
  to: string;
  word: string;
}) => {
  const translationGroups = await db.translationGroup.findMany({
    where: {
      words: {
        some: {
          content: { search: word },
          language: { is: { name: from } },
        },
      },
    },
    include: {
      words: {
        where: {
          language: { name: to },
        },
      },
    },
    take: 3,
  });

  return translationGroups.reduce<string[]>(
    (acc, curr) => [...acc, ...curr.words.map((w) => w.content)],
    []
  );
};
