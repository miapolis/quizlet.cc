import { EntityType } from "@quenti/prisma/client";
import { z } from "zod";

export const ZAddEntitiesSchema = z.object({
  classId: z.string().cuid2(),
  type: z.nativeEnum(EntityType),
  entities: z.array(z.string().cuid2()).max(16),
});

export type TAddEntitiesSchema = z.infer<typeof ZAddEntitiesSchema>;
