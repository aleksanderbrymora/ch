import { formatDistanceToNow, parseISO } from "date-fns";

export const distanceToNow = (date: Date | string) =>
  formatDistanceToNow(parseISO(date as string)) + " ago";
