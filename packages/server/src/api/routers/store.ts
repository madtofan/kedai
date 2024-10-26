import { z } from "zod";
import {
  createTRPCRouter,
  organizationProcedure,
  publicProcedure,
} from "../trpc";
import { stores } from "../../db/schema";
import { and, eq, getTableColumns } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const storeRouter = createTRPCRouter({
  addStore: organizationProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(256),
        slug: z.string().trim().min(1).max(256),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { organizationId: _organizationId, ...columns } =
        getTableColumns(stores);
      const createdStore = await ctx.db
        .insert(stores)
        .values({
          name: input.name,
          slug: input.slug,
          organizationId: ctx.organizationId,
        })
        .returning(columns);
      if (!createdStore) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create store.",
        });
      }
      return createdStore;
    }),

  editStore: organizationProcedure
    .input(
      z.object({
        id: z.number().int(),
        name: z.string().trim().min(1).max(256),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { organizationId: _organizationId, ...columns } =
        getTableColumns(stores);
      const updatedStore = await ctx.db
        .update(stores)
        .set({
          name: input.name,
        })
        .where(
          and(
            eq(stores.organizationId, ctx.organizationId),
            eq(stores.id, input.id),
          ),
        )
        .returning(columns);
      if (!updatedStore) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update store.",
        });
      }
      return updatedStore;
    }),

  deleteStore: organizationProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const deletedStore = await ctx.db
        .delete(stores)
        .where(
          and(
            eq(stores.organizationId, ctx.organizationId),
            eq(stores.id, input.id),
          ),
        )
        .returning({ id: stores.id });
      if (!deletedStore) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete store.",
        });
      }
      return { success: true };
    }),

  updateStore: organizationProcedure
    .input(
      z.object({
        storeId: z.number().int(),
        isOpen: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedStore = await ctx.db
        .update(stores)
        .set({
          isOpen: input.isOpen,
        })
        .where(
          and(
            eq(stores.organizationId, ctx.organizationId),
            eq(stores.id, input.storeId),
          ),
        )
        .returning({ id: stores.id });
      if (!updatedStore) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to update the store.",
        });
      }
      return { success: true };
    }),

  getAllStore: organizationProcedure.query(async ({ ctx }) => {
    const stores = await ctx.db.query.stores.findMany({
      columns: { organizationId: false },
      where: (store, { eq }) => eq(store.organizationId, ctx.organizationId),
    });
    return stores;
  }),

  getStoreMenus: publicProcedure
    .input(
      z.object({
        storeSlug: z.string().trim().min(1).max(256),
      }),
    )
    .query(async ({ ctx, input }) => {
      const storeMenus = await ctx.db.query.stores.findFirst({
        columns: { name: true },
        where: (store, { eq }) => eq(store.slug, input.storeSlug),
        with: {
          storeMenus: {
            columns: {
              id: true,
            },
            with: {
              menu: {
                columns: {
                  id: true,
                },
                with: {
                  menuDetails: {
                    columns: {
                      createdAt: false,
                      updatedAt: false,
                      cost: false,
                    },
                  },
                  menuGroups: {
                    columns: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!storeMenus) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Unable to find store.",
        });
      }
      return storeMenus;
    }),
});

export default storeRouter;
