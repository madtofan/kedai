import { z } from "zod";
import { createTRPCRouter, organizationProcedure } from "../trpc";
import { menuDetails, menus, menuToMenuDetails } from "../../db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../env";
import { S3 } from "../s3";
import { nanoid } from "nanoid";

const menuRouter = createTRPCRouter({
  getMenu: organizationProcedure.query(async ({ ctx }) => {
    const menuGroups = await ctx.db.query.menuGroups.findMany({
      columns: {
        id: true,
        name: true,
      },
      where: (menuGroup, { eq }) =>
        eq(menuGroup.organizationId, ctx.organizationId),
      with: {
        menus: {
          columns: {
            updatedAt: false,
            menuDetailsId: false,
            menuGroupId: false,
          },
          with: {
            menuDetails: {
              columns: {
                updatedAt: false,
              },
            },
          },
        },
      },
    });
    return menuGroups;
  }),

  addMenu: organizationProcedure
    .input(
      z.object({
        menuGroupId: z.number().int(),
        name: z.string().trim().min(1).max(256),
        description: z.string().trim().max(256).optional(),
        image: z
          .object({
            fileSize: z.number(),
            fileType: z.string(),
          })
          .optional(),
        sale: z.string().trim().default("0.00"),
        cost: z.string().trim().default("0.00"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const preSignedUrl = await ctx.db.transaction(async (tx) => {
        let image = null;
        let signedUrl = null;
        if (input.image) {
          const sizeLimit = 1 * 1024 ** 2; // 1MB
          if (input.image.fileSize > sizeLimit) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Image size too big.",
            });
          }
          if (
            input.image.fileType !== "image/jpeg" &&
            input.image.fileType !== "image/png"
          ) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Image type not supported.",
            });
          }
          const objectKey = `${ctx.organizationId}/${nanoid()}`;
          const cmd = new PutObjectCommand({
            Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
            Key: objectKey,
            ContentLength: input.image.fileSize,
            ContentType: input.image.fileType,
          });
          signedUrl = await getSignedUrl(S3, cmd, { expiresIn: 3600 });
          image = `${env.CLOUDFLARE_IMAGE_BASE_PATH}/${objectKey}`;
        }
        const createdMenuDetail = (
          await tx
            .insert(menuDetails)
            .values({
              name: input.name,
              description: input.description,
              image,
              sale: input.sale,
              cost: input.cost,
            })
            .returning()
        ).find(Boolean);
        if (!createdMenuDetail) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create menu details.",
          });
        }
        const createdMenu = (
          await tx
            .insert(menus)
            .values({
              menuGroupId: input.menuGroupId,
              menuDetailsId: createdMenuDetail.id,
            })
            .returning()
        ).find(Boolean);
        if (!createdMenu) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create menu.",
          });
        }
        await tx.insert(menuToMenuDetails).values({
          menuId: createdMenu.id,
          menuDetailId: createdMenuDetail.id,
        });
        return signedUrl;
      });
      return preSignedUrl;
    }),

  editMenu: organizationProcedure
    .input(
      z.object({
        id: z.number().int(),
        name: z.string().trim().min(1).max(256),
        description: z.string().trim().max(256).optional(),
        image: z.string().trim().url().max(256).optional(),
        sale: z.string().trim().default("0.00"),
        cost: z.string().trim().default("0.00"),
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
      await ctx.db.transaction(async (tx) => {
        const menuDetail = (
          await tx
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
        const updatedMenu = await tx
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
      });
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

      await ctx.db.transaction(async (tx) => {
        const deletedMenu = (
          await tx
            .delete(menus)
            .where(eq(menus.id, input.id))
            .returning({ id: menus.id, menuDetailsId: menus.menuDetailsId })
        ).find(Boolean);
        if (!deletedMenu) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete menu.",
          });
        }
        const ordersWithMenu = await tx.query.orderItems.findFirst({
          where: (orderItem, { eq }) =>
            eq(orderItem.menuDetailsId, deletedMenu.menuDetailsId),
        });
        if (!ordersWithMenu) {
          await tx
            .delete(menuDetails)
            .where(eq(menuDetails.id, deletedMenu.menuDetailsId));
        }
      });
      return { success: true };
    }),
});

export default menuRouter;
