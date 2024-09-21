import { stringToFloatSafe, stringToIntSafe } from "./type";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const findStatValue = (stats: any[], name: string, type: "float" | "int"): number => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const statItem = stats.find((item: any) => item.name === name)?.stat;

  if (!statItem) {
    return 0;
  }

  if (type === "float") {
    return stringToFloatSafe(statItem.replace(/[^\d.-]/g, ""));
  } else if (type === "int") {
    return stringToIntSafe(statItem.replace(/[^\d.-]/g, ""));
  }
  return 0;
};