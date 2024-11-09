import { z } from "zod";
import { createTRPCRouter, organizationProcedure } from "../trpc";
import { permissionGroups, groupsToPermissions } from "../../db/schema";
import { and, count, eq, getTableColumns, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const roleRouter = createTRPCRouter({
  addRole: organizationProcedure
    .input(z.object({ name: z.string().trim().min(1), isDefault: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const role = await ctx.db.transaction(async (tx) => {
        if (input.isDefault) {
          await tx
            .update(permissionGroups)
            .set({
              isDefault: false,
            })
            .where(
              and(
                eq(permissionGroups.organizationId, ctx.organizationId),
                eq(permissionGroups.isDefault, true),
              ),
            );
        }

        const { organizationId: _organizationId, ...columns } =
          getTableColumns(permissionGroups);
        const createdRole = (
          await tx
            .insert(permissionGroups)
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
      });

      return role;
    }),

  deletePermissionGroups: organizationProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        const toBeDeletedPermissionGroup =
          await tx.query.permissionGroups.findFirst({
            where: (permissionGroup, { eq }) =>
              eq(permissionGroup.id, input.id),
            columns: {
              isAdmin: true,
            },
          });

        if (toBeDeletedPermissionGroup?.isAdmin) {
          const permissionGroupsCount = (
            await tx
              .select({ count: count() })
              .from(permissionGroups)
              .where(
                and(
                  eq(permissionGroups.organizationId, ctx.organizationId),
                  eq(permissionGroups.isAdmin, true),
                ),
              )
          ).find(Boolean);

          if (!permissionGroupsCount || permissionGroupsCount.count === 1) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Organization need to have at least 1 administrator",
            });
          }
        }

        const deletedRole = await tx
          .delete(permissionGroups)
          .where(eq(permissionGroups.id, input.id))
          .returning({ id: permissionGroups.id });
        if (!deletedRole) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete role.",
          });
        }
      });
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
      const roleToEdit = await ctx.db.query.permissionGroups.findFirst({
        where: (permissionGroup, { eq }) =>
          eq(permissionGroup.id, input.roleId),
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
        permissionGroupId: input.roleId,
        permissionId,
      }));
      const addedPermissions = await ctx.db
        .insert(groupsToPermissions)
        .values(valuesToAdd)
        .returning({ id: groupsToPermissions.id });

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
      const roleToEdit = await ctx.db.query.permissionGroups.findFirst({
        where: (permissionGroup, { eq }) =>
          eq(permissionGroup.id, input.roleId),
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
        .delete(permissionGroups)
        .where(
          and(
            eq(groupsToPermissions.permissionGroupId, input.roleId),
            inArray(groupsToPermissions.permissionId, input.permissionsId),
          ),
        )
        .returning({ id: permissionGroups.id });
      if (removedPermissions.length !== input.permissionsId.length) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove some or all permissions from role.",
        });
      }
      return { success: true };
    }),

  getPermissionGroups: organizationProcedure.query(async ({ ctx }) => {
    const organisationPermissionGroups =
      await ctx.db.query.permissionGroups.findMany({
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
    return organisationPermissionGroups;
  }),
});

export default roleRouter;
