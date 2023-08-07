import { TRPCError } from "@trpc/server";
import { profanity } from "../../common/profanity";
import type { NonNullableUserContext } from "../../lib/types";
import type { TCreateSchema } from "./create.schema";

type CreateOptions = {
  ctx: NonNullableUserContext;
  input: TCreateSchema;
};

export const createHandler = async ({ ctx, input }: CreateOptions) => {
  if (!ctx.session.user.isOrgEligible)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "User not eligible for organizations",
    });

  if (profanity.exists(input.name))
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "name_profane",
    });

  const domain = ctx.session.user.email!.split("@")[1]!;
  const existing = await ctx.prisma.organizationDomain.findFirst({
    where: {
      domain,
    },
  });

  if (existing)
    throw new TRPCError({
      code: "CONFLICT",
      message: "Organization already created for domain",
    });

  return await ctx.prisma.organization.create({
    data: {
      name: input.name,
      icon: input.icon,
      members: {
        create: {
          userId: ctx.session.user.id,
          role: "Owner",
          accepted: true,
        },
      },
      domains: {
        create: {
          type: "Base",
          requestedDomain: domain,
          verifiedEmail: ctx.session.user.email!,
          verifiedAt: new Date(),
        },
      },
    },
  });
};

export default createHandler;
