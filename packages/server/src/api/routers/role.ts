import { z } from "zod";
import { createTRPCRouter, organizationProcedure } from "../trpc";
import {
  organizationRoles,
  organizations,
  rolesToPermissions,
} from "../../db/schema";
import { and, eq, getTableColumns, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const roleRouter = createTRPCRouter({
  addRole: organizationProcedure
    .input(z.object({ name: z.string().trim().min(1), isDefault: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (input.isDefault) {
        await ctx.db
          .update(organizationRoles)
          .set({
            isDefault: false,
          })
          .where(
            and(
              eq(organizationRoles.organizationId, ctx.organizationId),
              eq(organizationRoles.isDefault, true),
            ),
          );
      }

      const { organizationId: _organizationId, ...columns } =
        getTableColumns(organizationRoles);
      const createdRole = (
        await ctx.db
          .insert(organizationRoles)
          .values({
            name: input.name,
            isAdmin: false,
            isDefault: input.isDefault,
            organizationId: ctx.organizationId,
          })
          .returning(columns)
      ).find(Boolean);

      if (!createdRole) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create role.",
        });
      }

      return createdRole;
    }),

  deleteRole: organizationProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const deletedRole = await ctx.db
        .delete(organizationRoles)
        .where(eq(organizationRoles.id, input.id))
        .returning({ id: organizationRoles.id });
      if (!deletedRole) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete role.",
        });
      }
      return { success: true };
    }),

  addPermission: organizationProcedure
    .input(
      z.object({
        roleId: z.number().int(),
        permissionsId: z.array(z.number().int()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const roleToEdit = await ctx.db.query.organizationRoles.findFirst({
        where: (role, { eq }) => eq(organizationRoles.id, input.roleId),
        columns: {
          organizationId: true,
        },
      });
      if (roleToEdit?.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User is not allowed to edit this role.",
        });
      }

      const valuesToAdd = input.permissionsId.map((permissionId) => ({
        organizationRoleId: input.roleId,
        permissionId,
      }));
      const addedPermissions = await ctx.db
        .insert(rolesToPermissions)
        .values(valuesToAdd)
        .returning({ id: rolesToPermissions.id });

      if (addedPermissions.length !== input.permissionsId.length) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add some or all permission to role.",
        });
      }
      return addedPermissions;
    }),

  removePermission: organizationProcedure
    .input(
      z.object({
        roleId: z.number().int(),
        permissionsId: z.array(z.number().int()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const roleToEdit = await ctx.db.query.organizationRoles.findFirst({
        where: (role, { eq }) => eq(organizationRoles.id, input.roleId),
        columns: {
          organizationId: true,
        },
      });
      if (roleToEdit?.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User is not allowed to edit this role.",
        });
      }

      const removedPermissions = await ctx.db
        .delete(organizationRoles)
        .where(
          and(
            eq(rolesToPermissions.organizationRoleId, input.roleId),
            inArray(rolesToPermissions.permissionId, input.permissionsId),
          ),
        )
        .returning({ id: organizations.id });
      if (removedPermissions.length !== input.permissionsId.length) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove some or all permissions from role.",
        });
      }
      return { success: true };
    }),

  getRoles: organizationProcedure.query(async ({ ctx }) => {
    const organizationRoles = await ctx.db.query.organizationRoles.findMany({
      columns: { organizationId: false },
      where: (role, { eq }) => eq(role.organizationId, ctx.organizationId),
      with: {
        permissions: {
          columns: { createdAt: true },
          with: {
            permission: {
              columns: {
                name: false,
                createdAt: false,
                updatedAt: false,
              },
            },
          },
        },
      },
    });
    if (organizationRoles.length === 0) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to retrieve organization.",
      });
    }
    return organizationRoles;
  }),
});

export default roleRouter;
