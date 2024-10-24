import { z } from "zod";
import {
  createTRPCRouter,
  organizationProcedure,
  protectedProcedure,
} from "../trpc";
import { invites, users } from "../../db/schema";
import { and, eq, getTableColumns, inArray, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const userRouter = createTRPCRouter({
  inviteUser: organizationProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const invitedUser = await ctx.db
        .insert(invites)
        .values({
          email: input.email,
          organizationId: ctx.organizationId,
        })
        .returning({ id: invites.id });
      // TODO - send email to user
      if (!invitedUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User already have an invitation.",
        });
      }
      return { success: true };
    }),

  acceptInvite: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user?.userEmail) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to verify user email.",
      });
    }
    await ctx.db.delete(invites).where(eq(invites.email, ctx.user.userEmail));
    // TODO - send email to user
    return { success: true };
  }),

  addUser: organizationProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const defaultRole = await ctx.db.query.organizationRoles.findFirst({
        where: (organizationRole, { eq }) =>
          and(
            eq(organizationRole.organizationId, ctx.organizationId),
            eq(organizationRole.isDefault, true),
          ),
      });
      if (!defaultRole) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Organization must have a default role.",
        });
      }

      const { clerkId: _clerkId, ...columns } = getTableColumns(users);
      const addedUser = await ctx.db
        .update(users)
        .set({
          organizationRoleId: defaultRole.id,
        })
        .where(
          and(
            isNull(users.organizationRoleId),
            eq(users.userEmail, input.email),
          ),
        )
        .returning(columns);
      if (!addedUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User does not exist or have is in an existing organization",
        });
      }
      // TODO - send email to user
      return addedUser;
    }),

  removeUser: organizationProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.userEmail === input.email) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User cannot remove self.",
        });
      }

      const organizationRoles = (
        await ctx.db.query.organizationRoles.findMany({
          columns: { id: true },
          where: (organizationRole, { eq }) =>
            and(eq(organizationRole.organizationId, ctx.organizationId)),
        })
      ).map((data) => data.id);

      const removedUser = await ctx.db
        .update(users)
        .set({
          organizationRoleId: null,
        })
        .where(
          and(
            inArray(users.organizationRoleId, organizationRoles),
            eq(users.userEmail, input.email),
          ),
        )
        .returning({ id: users.id });

      if (!removedUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User does not exist in the organization.",
        });
      }
      return { success: true };
    }),
});

export default userRouter;
