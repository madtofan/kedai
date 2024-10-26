import { z } from "zod";
import {
  createTRPCRouter,
  organizationProcedure,
  protectedProcedure,
} from "../trpc";
import { organizationRoles, organizations, users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const organizationRouter = createTRPCRouter({
  createOrganization: protectedProcedure
    .input(z.object({ name: z.string().trim().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.organizationRole?.organizationId || !ctx.user?.clerkId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "User must not be in an existing organization to create one.",
        });
      }

      const createdOrganization = (
        await ctx.db
          .insert(organizations)
          .values({ name: input.name })
          .returning()
      ).find(Boolean);

      if (!createdOrganization) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create organization",
        });
      }

      const createdOrganizationRole = (
        await ctx.db
          .insert(organizationRoles)
          .values({
            name: "admin",
            isAdmin: true,
            organizationId: createdOrganization.id,
          })
          .returning({ id: organizationRoles.id })
      ).find(Boolean);

      if (!createdOrganizationRole) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create organization role",
        });
      }

      await ctx.db.insert(organizationRoles).values({
        name: "member",
        organizationId: createdOrganization.id,
        isDefault: true,
      });

      await ctx.db
        .update(users)
        .set({
          organizationRoleId: createdOrganizationRole.id,
        })
        .where(eq(users.clerkId, ctx.user.clerkId));

      const { id: _id, ...response } = createdOrganization;
      return response;
    }),

  deleteOrganization: organizationProcedure.mutation(async ({ ctx }) => {
    const deletedOrganization = await ctx.db
      .delete(organizations)
      .where(eq(organizations.id, ctx.organizationId))
      .returning({ id: organizations.id });
    if (!deletedOrganization) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete organization.",
      });
    }
    return { success: true };
  }),

  getOrganization: organizationProcedure.query(async ({ ctx }) => {
    const organization = await ctx.db.query.organizations.findFirst({
      columns: { id: false },
      where: (organization, { eq }) => eq(organization.id, ctx.organizationId),
      with: {
        organizationRoles: {
          columns: { organizationId: false },
          with: {
            users: {
              columns: {
                organizationRoleId: false,
                createdAt: false,
                updatedAt: false,
                clerkId: false,
              },
            },
          },
        },
      },
    });
    if (!organization) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to retrieve organization.",
      });
    }
    return organization;
  }),
});

export default organizationRouter;
