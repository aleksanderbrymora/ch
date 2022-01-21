import * as faker from "@faker-js/faker";
import { PrismaClient, User } from "@prisma/client";
import argon from "argon2";

const db = new PrismaClient();

(async () => {
  await db.word.deleteMany();
  await db.sheetsOnTranslationGroups.deleteMany();
  await db.tagsOnTranslationGroups.deleteMany();
  await db.translationGroup.deleteMany();
  await db.language.deleteMany();
  await db.sheet.deleteMany();
  await db.user.deleteMany();

  const polish = await db.language.create({ data: { name: "polish" } });
  const english = await db.language.create({ data: { name: "english" } });

  await db.user.create({
    data: {
      username: "aleks",
      passwordHash: await argon.hash("Chicken123"),
      sheets: {
        create: Array(5)
          .fill(true)
          .map((_) => ({
            title: faker.random.randomWord(),
            translationGroups: {
              create: Array(20)
                .fill(true)
                .map((_) => ({
                  translationGroup: {
                    create: {
                      words: {
                        create: [
                          {
                            content: faker.random.randomWord(),
                            language: { connect: { name: polish.name } },
                          },
                          {
                            content: faker.random.randomWord(),
                            language: { connect: { name: english.name } },
                          },
                        ],
                      },
                    },
                  },
                })),
            },
          })),
      },
    },
  });
})();
