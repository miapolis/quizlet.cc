import { StudySetVisibility } from "@prisma/client";

export const plural = (
  value: number,
  word: string,
  opts?: Partial<{ toLocaleString: boolean }>,
): string =>
  `${opts?.toLocaleString ? value.toLocaleString() : value} ${word}${value === 1 ? "" : "s"
  }`;

export const visibilityString = (
  visbility: StudySetVisibility
): string => {
  switch (visbility) {
    case "Public":
      return "Öffentlich";
    case "Class":
      return "Klasse";
    case "Private":
      return "Privat";
    case "Unlisted":
      return "Ungelistet";
  }
}