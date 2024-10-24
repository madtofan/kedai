import { z } from "zod";
import { createTRPCRouter, organizationProcedure } from "../trpc";
import { menuDetails, menus, menuToMenuDetails, stores } from "../../db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const menuRouter = createTRPCRouter({
  addMenu: organizationProcedure
    .input(
      z.object({
        menuGroupId: z.number().int(),
        name: z.string().min(1).max(256),
        description: z.string().max(256).optional(),
        image: z.string().url().max(256).optional(),
        sale: z.string().default("0.00"),
        cost: z.string().default("0.00"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const menuDetail = (
        await ctx.db
          .insert(menuDetails)
          .values({
            name: input.name,
            description: input.description,
            image: input.image,
            sale: input.sale,
            cost: input.cost,
          })
          .returning()
      ).find(Boolean);
      if (!menuDetail) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create menu details.",
        });
      }
      const createdMenu = (
        await ctx.db
          .insert(menus)
          .values({
            menuGroupId: input.menuGroupId,
            menuDetailsId: menuDetail.id,
          })
          .returning()
      ).find(Boolean);
      if (!createdMenu) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create menu.",
        });
      }
      await ctx.db.insert(menuToMenuDetails).values({
        menuId: createdMenu.id,
        menuDetailId: menuDetail.id,
      });
      return menuDetail;
    }),

  editMenu: organizationProcedure
    .input(
      z.object({
        id: z.number().int(),
        name: z.string().min(1).max(256),
        description: z.string().max(256).optional(),
        image: z.string().url().max(256).optional(),
        sale: z.string().default("0.00"),
        cost: z.string().default("0.00"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const menuOrganizationId = (
        await ctx.db.query.menus.findFirst({
          columns: {
            id: false,
            menuGroupId: false,
            menuDetailsId: false,
            createdAt: false,
            updatedAt: false,
          },
          where: (menu, { eq }) => eq(menu.id, input.id),
          with: {
            menuGroups: {
              columns: {
                organizationId: true,
              },
            },
          },
        })
      )?.menuGroups.organizationId;
      if (menuOrganizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Menu does not originate from this organization.",
        });
      }
      const menuDetail = (
        await ctx.db
          .insert(menuDetails)
          .values({
            name: input.name,
            description: input.description,
            image: input.image,
            sale: input.sale,
            cost: input.cost,
          })
          .returning()
      ).find(Boolean);

      if (!menuDetail) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create menu details.",
        });
      }
      const updatedMenu = await ctx.db
        .update(menus)
        .set({
          menuDetailsId: menuDetail.id,
        })
        .where(eq(menus.id, input.id))
        .returning({ id: menus.id });
      if (!updatedMenu) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update menu.",
        });
      }
      return { sucess: true };
    }),

  deleteMenu: organizationProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const menuOrganizationId = (
        await ctx.db.query.menus.findFirst({
          columns: {
            id: false,
            menuGroupId: false,
            menuDetailsId: false,
            createdAt: false,
            updatedAt: false,
          },
          where: (menu, { eq }) => eq(menu.id, input.id),
          with: {
            menuGroups: {
              columns: {
                organizationId: true,
              },
            },
          },
        })
      )?.menuGroups.organizationId;
      if (menuOrganizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Menu does not originate from this organization.",
        });
      }

      const deletedMenu = await ctx.db
        .delete(menus)
        .where(eq(stores.id, input.id))
        .returning({ id: stores.id });
      if (!deletedMenu) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete store.",
        });
      }
      return { success: true };
    }),

  getMenus: organizationProcedure.query(async ({ ctx }) => {
    const menuGroups = await ctx.db.query.menuGroups.findMany({
      columns: { name: true },
      where: (menuGroup, { eq }) =>
        eq(menuGroup.organizationId, ctx.organizationId),
      with: {
        menus: {
          columns: {
            id: false,
            menuGroupId: false,
            menuDetailsId: false,
          },
          with: {
            menuDetails: {
              columns: {
                id: false,
                createdAt: false,
                updatedAt: false,
              },
            },
          },
        },
      },
    });
    return menuGroups;
  }),
});

export default menuRouter;
