import { TestQuestionType } from "@quenti/interfaces";

import {
  IconLayersSubtract,
  IconLayoutGrid,
  IconPencil,
  IconToggleRight,
  type TablerIconsProps,
} from "@tabler/icons-react";

export const getQuestionTypeName = (type: TestQuestionType) => {
  switch (type) {
    case TestQuestionType.TrueFalse:
      return "Wahr / Falsch";
    case TestQuestionType.MultipleChoice:
      return "Multiple Choice";
    case TestQuestionType.Match:
      return "Kombinieren";
    case TestQuestionType.Write:
      return "Schreiben";
  }
};

export const getQuestionTypeIcon = (
  type: TestQuestionType,
): React.FC<TablerIconsProps> => {
  switch (type) {
    case TestQuestionType.TrueFalse:
      return IconToggleRight;
    case TestQuestionType.MultipleChoice:
      return IconLayoutGrid;
    case TestQuestionType.Match:
      return IconLayersSubtract;
    case TestQuestionType.Write:
      return IconPencil;
  }
};
