import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `k_${name}`);

// Tables and Relations
export const organizations = createTable(
  "organizations",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("organization_name_idx").on(example.name),
  }),
);
export const organizationsRelation = relations(organizations, ({ many }) => ({
  invites: many(invites),
  organizationRoles: many(organizationRoles),
  stores: many(stores),
  menuGroups: many(menuGroups),
}));

export const invites = createTable(
  "invites",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 256 }).notNull().unique(),
    createdBy: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: integer("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    organizationIndex: index("invite_organization_idx").on(
      example.organizationId,
    ),
  }),
);
export const invitesRelations = relations(invites, ({ one }) => ({
  createdBy: one(users, {
    fields: [invites.createdBy],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [invites.organizationId],
    references: [organizations.id],
  }),
}));

export const organizationRoles = createTable(
  "organization_roles",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    isAdmin: boolean("is_admin").default(false),
    isDefault: boolean("is_default").default(false),
    organizationId: integer("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    organizationIndex: index("role_organization_idx").on(
      example.organizationId,
    ),
  }),
);
export const organizationRolesRelations = relations(
  organizationRoles,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [organizationRoles.organizationId],
      references: [organizations.id],
    }),
    users: many(users),
    permissions: many(rolesToPermissions),
  }),
);

export const permissions = createTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).unique().notNull(),
  displayName: varchar("name", { length: 256 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});
export const permissionsRelations = relations(permissions, ({ many }) => ({
  organizationRoles: many(rolesToPermissions),
}));

export const rolesToPermissions = createTable("roles_to_perms", {
  id: serial("id").primaryKey(),
  organizationRoleId: integer("org_role_id")
    .references(() => organizationRoles.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  permissionId: integer("perms_id")
    .references(() => permissions.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});
export const rolesToPermissionsRelations = relations(
  rolesToPermissions,
  ({ one }) => ({
    organizationRole: one(organizationRoles, {
      fields: [rolesToPermissions.organizationRoleId],
      references: [organizationRoles.id],
    }),
    permission: one(permissions, {
      fields: [rolesToPermissions.permissionId],
      references: [permissions.id],
    }),
  }),
);

export const users = createTable(
  "users",
  {
    id: serial("id").primaryKey(),
    clerkId: varchar("clerk_id", { length: 256 }).notNull(),
    enabled: boolean("enabled"),
    userEmail: varchar("user_email", { length: 256 }),
    firstName: varchar("first_name", { length: 256 }),
    lastName: varchar("last_name", { length: 256 }),
    fullName: varchar("full_name", { length: 256 }),
    organizationRoleId: integer("organization_role_id").references(
      () => organizationRoles.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("clerk_idx").on(example.clerkId),
    organizationRoleIndex: index("user_organization_role_idx").on(
      example.organizationRoleId,
    ),
  }),
);
export const usersRelations = relations(users, ({ one, many }) => ({
  organizationRole: one(organizationRoles, {
    fields: [users.organizationRoleId],
    references: [organizationRoles.id],
  }),
  invites: many(invites),
}));

export const stores = createTable(
  "stores",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    isOpen: boolean("is_open").default(false),
    slug: varchar("slug", { length: 256 }).notNull().unique(),
    organizationId: integer("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    organizationIndex: index("store_organization_idx").on(
      example.organizationId,
    ),
  }),
);
export const storesRelations = relations(stores, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [stores.organizationId],
    references: [organizations.id],
  }),
  orders: many(orders),
  storeMenus: many(storeMenus),
}));

export const menuGroups = createTable(
  "menu_groups",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    organizationId: integer("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    organizationIndex: index("menu_groups_organization_idx").on(
      example.organizationId,
    ),
  }),
);
export const menuGroupsRelations = relations(menuGroups, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [menuGroups.organizationId],
    references: [organizations.id],
  }),
  menus: many(menus),
}));

export const menuDetails = createTable(
  "menu_details",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    description: varchar("description", { length: 256 }),
    image: varchar("image", { length: 256 }),
    sale: numeric("sale", { precision: 12, scale: 2 }).notNull(),
    cost: numeric("cost", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("menuNameIndex").on(example.name),
  }),
);
export const menuDetailsRelations = relations(menuDetails, ({ many }) => ({
  menuToMenuDetails: many(menuToMenuDetails),
}));

export const storeMenus = createTable(
  "store_menus",
  {
    id: serial("id").primaryKey(),
    storeSlug: varchar("store_slug")
      .references(() => stores.slug, { onDelete: "cascade" })
      .notNull(),
    menuId: integer("menu_id")
      .references(() => menus.id, {
        onDelete: "cascade",
      })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    storeIndex: index("menu_store_index").on(example.storeSlug),
  }),
);
export const storeMenusRelations = relations(storeMenus, ({ one }) => ({
  store: one(stores, {
    fields: [storeMenus.storeSlug],
    references: [stores.slug],
  }),
  menu: one(menus, {
    fields: [storeMenus.menuId],
    references: [menus.id],
  }),
}));

export const menus = createTable(
  "menus",
  {
    id: serial("id").primaryKey(),
    menuGroupId: integer("menu_group_id")
      .references(() => menuGroups.id, {
        onDelete: "set null",
      })
      .notNull(),
    menuDetailsId: integer("menu_details_id")
      .references(() => menuDetails.id, {
        onDelete: "set null",
      })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    menuGroupIndex: index("menu_group_idx").on(example.menuGroupId),
  }),
);
export const menusRelations = relations(menus, ({ one, many }) => ({
  menuGroups: one(menuGroups, {
    fields: [menus.menuGroupId],
    references: [menuGroups.id],
  }),
  menuDetails: one(menuDetails, {
    fields: [menus.menuDetailsId],
    references: [menuDetails.id],
  }),
  menuToMenuDetails: many(menuToMenuDetails),
}));

export const menuToMenuDetails = createTable("menu_to_menu_details", {
  id: serial("id").primaryKey(),
  menuId: integer("menu_id")
    .references(() => menus.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  menuDetailId: integer("menu_detail_id")
    .references(() => menuDetails.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const menuToMenuDetailsRelations = relations(
  menuToMenuDetails,
  ({ one }) => ({
    menuDetails: one(menuDetails, {
      fields: [menuToMenuDetails.menuDetailId],
      references: [menuDetails.id],
    }),
    menu: one(menus, {
      fields: [menuToMenuDetails.menuId],
      references: [menus.id],
    }),
  }),
);

export const orders = createTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    storeSlug: varchar("store_slug")
      .references(() => stores.slug, { onDelete: "cascade" })
      .notNull(),
    tableName: varchar("table_name", { length: 256 }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    completedValue: numeric("completed_value", { precision: 12, scale: 2 }),
    remarks: varchar("remarks", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    storeIndex: index("order_store_index").on(example.storeSlug),
  }),
);
export const ordersRelations = relations(orders, ({ one, many }) => ({
  stores: one(stores, {
    fields: [orders.storeSlug],
    references: [stores.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItems = createTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("orderId")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    menuDetailsId: integer("menu_details_id").notNull(),
    quantity: integer("quantity").notNull(),
    status: varchar("status", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    orderIndex: index("item_order_index").on(example.orderId),
  }),
);
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuDetails: one(menuDetails, {
    fields: [orderItems.menuDetailsId],
    references: [menuDetails.id],
  }),
}));
