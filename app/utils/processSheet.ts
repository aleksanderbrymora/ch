import { z } from "zod";
import { WordListLoaderData } from "./validators";

export const orderDetails = (link: string) => {
  const url = new URL(link);
  const orderDirection = url.searchParams.get("sort") || "";

  const orderDirSchema = z.enum(["asc", "desc", "none", ""]);
  const orderDirValidation = orderDirSchema.safeParse(orderDirection);
  return orderDirValidation.success ? orderDirValidation.data : "";
};

export const processSheet = (
  sheet: WordListLoaderData["sheet"],
  url: string
) => {
  const orderDir = orderDetails(url);

  switch (orderDir) {
    case "asc": {
      sheet.translationGroups.sort((a, b) => {
        const first = a.translationGroup.words.find(
          (w) => w.language.name === sheet.from.name
        );

        const second = b.translationGroup.words.find(
          (w) => w.language.name === sheet.from.name
        );

        return first!.content.localeCompare(second!.content);
      });
      return sheet;
    }

    case "desc": {
      sheet.translationGroups.sort((a, b) => {
        const first = a.translationGroup.words.find(
          (w) => w.language.name === sheet.from.name
        );

        const second = b.translationGroup.words.find(
          (w) => w.language.name === sheet.from.name
        );

        return second!.content.localeCompare(first!.content);
      });
      return sheet;
    }

    case "none": {
      return sheet;
    }

    default: {
      console.log("no sort");
      return sheet;
    }
  }
};
