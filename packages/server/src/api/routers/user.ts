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
    .input(z.object({ email: z.string().email().trim().max(256) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify user.",
        });
      }
      const invitedUser = await ctx.db
        .insert(invites)
        .values({
          email: input.email,
          createdBy: ctx.user.id,
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

  checkForInvitation: protectedProcedure.query(async ({ ctx }) => {
    const userEmail = ctx.user?.userEmail;
    if (!userEmail) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to verify user email.",
      });
    }
    const invites = await ctx.db.query.invites.findMany({
      where: (invite, { eq }) => eq(invite.email, userEmail),
      columns: {
        organizationId: false,
        updatedAt: false,
        email: false,
      },
      with: {
        createdBy: {
          columns: {
            fullName: true,
          },
        },
        organization: {
          columns: {
            name: true,
          },
        },
      },
    });

    return invites;
  }),

  acceptInvite: protectedProcedure
    .input(z.object({ invitationId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const userEmail = ctx.user?.userEmail;
      if (!userEmail) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify user email.",
        });
      }
      if (ctx.user?.organizationRole) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is already in an organization.",
        });
      }

      const invite = await ctx.db.query.invites.findFirst({
        columns: {
          id: false,
          createdAt: false,
          updatedAt: false,
          email: false,
          organizationId: false,
          createdBy: false,
        },
        where: (invite, { eq, and }) =>
          and(eq(invite.id, input.invitationId), eq(invite.email, userEmail)),
        with: {
          organization: {
            columns: {
              id: true,
            },
            with: {
              organizationRoles: {
                columns: {
                  id: true,
                  isDefault: true,
                },
              },
            },
          },
        },
      });

      if (!invite) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify invitation.",
        });
      }

      const organizationRole =
        invite.organization.organizationRoles.find((role) => role.isDefault) ??
        invite.organization.organizationRoles.find(Boolean);

      if (!organizationRole) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to obtain organization roles.",
        });
      }

      await ctx.db
        .update(users)
        .set({
          organizationRoleId: organizationRole.id,
        })
        .where(eq(users.userEmail, userEmail));

      await ctx.db
        .delete(invites)
        .where(
          and(eq(invites.email, userEmail), eq(invites.id, input.invitationId)),
        );
      // TODO - send email to user
      return { success: true };
    }),

  declineInvite: protectedProcedure
    .input(z.object({ invitationId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.userEmail) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify user email.",
        });
      }
      await ctx.db
        .delete(invites)
        .where(
          and(
            eq(invites.email, ctx.user.userEmail),
            eq(invites.id, input.invitationId),
          ),
        );
      // TODO - send email to user
      return { success: true };
    }),

  removeUser: organizationProcedure
    .input(z.object({ userId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.id === input.userId) {
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
            eq(users.id, input.userId),
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

  leaveOrganization: organizationProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user?.id) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "User not found.",
      });
    }
    const removedUser = await ctx.db
      .update(users)
      .set({
        organizationRoleId: null,
      })
      .where(and(eq(users.id, ctx.user.id)))
      .returning({ id: users.id });

    if (!removedUser) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to remove organization from user.",
      });
    }
    return { success: true };
  }),
});

export default userRouter;
