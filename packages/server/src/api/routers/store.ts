import { z } from "zod";
import { createTRPCRouter, organizationProcedure } from "../trpc";
import { stores } from "../../db/schema";
import { and, eq, getTableColumns } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const storeRouter = createTRPCRouter({
  addStore: organizationProcedure
    .input(z.object({ name: z.string().min(1), slug: z.string().min(1) }))
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
    .input(z.object({ id: z.number().int(), name: z.string().min(1) }))
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

  getAllStore: organizationProcedure.query(async ({ ctx }) => {
    const stores = await ctx.db.query.stores.findMany({
      columns: { organizationId: false },
      where: (store, { eq }) => eq(store.organizationId, ctx.organizationId),
    });
    return stores;
  }),
});

export default storeRouter;
