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
  pgTable,
  text,
  unique,
} from "drizzle-orm/pg-core";

// Auth tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});
export const userRelations = relations(user, ({ many }) => ({
  invites: many(invitation),
  members: many(member),
  sessions: many(session),
  accounts: many(account),
}));

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  activeOrganizationId: text("activeOrganizationId"),
});
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  expiresAt: timestamp("expiresAt"),
  password: text("password"),
});
export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export const passkey = pgTable("passkey", {
  id: text("id").primaryKey(),
  name: text("name"),
  publicKey: text("publicKey").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  webauthnUserID: text("webauthnUserID").notNull(),
  counter: integer("counter").notNull(),
  deviceType: text("deviceType").notNull(),
  backedUp: boolean("backedUp").notNull(),
  transports: text("transports"),
  createdAt: timestamp("createdAt"),
});

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: timestamp("createdAt").notNull(),
  metadata: text("metadata"),
});
export const organizationRelations = relations(organization, ({ many }) => ({
  invitations: many(invitation),
  permissionGroups: many(permissionGroups),
  stores: many(stores),
  menuGroups: many(menuGroups),
  members: many(member),
}));

export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organization.id),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  email: text("email").notNull(),
  role: text("role").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});
export const memberRelations = relations(member, ({ one, many }) => ({
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  roles: many(memberToPermissionGroups),
}));

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organization.id),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  inviterId: text("inviterId")
    .notNull()
    .references(() => user.id),
});
export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  inviter: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

// Custom table creations
export const createTable = pgTableCreator((name) => name);

// Tables and Relations
export const memberToPermissionGroups = createTable("member_to_perms_groups", {
  id: serial("id").primaryKey(),
  memberId: text("member_id")
    .references(() => member.id, {
      onDelete: "cascade",
    })
    .notNull(),
  permissionGroupId: integer("perms_group_id")
    .references(() => permissionGroups.id, {
      onDelete: "cascade",
    })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});
export const memberToPermissionGroupsRelations = relations(
  memberToPermissionGroups,
  ({ one }) => ({
    member: one(member, {
      fields: [memberToPermissionGroups.memberId],
      references: [member.id],
    }),
    permissionGroup: one(permissionGroups, {
      fields: [memberToPermissionGroups.permissionGroupId],
      references: [permissionGroups.id],
    }),
  }),
);

export const permissionGroups = createTable(
  "permission_groups",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    isAdmin: boolean("is_admin").default(false),
    isDefault: boolean("is_default").default(false),
    identifier: varchar("identifier", { length: 256 }),
    organizationId: text("organization_id")
      .references(() => organization.id, { onDelete: "cascade" })
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
export const permissionGroupsRelations = relations(
  permissionGroups,
  ({ one, many }) => ({
    organization: one(organization, {
      fields: [permissionGroups.organizationId],
      references: [organization.id],
    }),
    member: many(memberToPermissionGroups),
    permissions: many(groupsToPermissions),
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
  permissionGroups: many(groupsToPermissions),
}));

export const groupsToPermissions = createTable("roles_to_perms", {
  id: serial("id").primaryKey(),
  permissionGroupId: integer("org_role_id")
    .references(() => permissionGroups.id, {
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
  groupsToPermissions,
  ({ one }) => ({
    permissionGroup: one(permissionGroups, {
      fields: [groupsToPermissions.permissionGroupId],
      references: [permissionGroups.id],
    }),
    permission: one(permissions, {
      fields: [groupsToPermissions.permissionId],
      references: [permissions.id],
    }),
  }),
);

export const stores = createTable(
  "stores",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    isOpen: boolean("is_open").default(false),
    slug: varchar("slug", { length: 256 }).notNull(),
    organizationId: text("organization_id")
      .references(() => organization.id, { onDelete: "cascade" })
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
    slugIndex: unique().on(example.organizationId, example.slug),
  }),
);
export const storesRelations = relations(stores, ({ one, many }) => ({
  organization: one(organization, {
    fields: [stores.organizationId],
    references: [organization.id],
  }),
  orders: many(orders),
  storeMenus: many(storeMenus),
}));

export const menuGroups = createTable(
  "menu_groups",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    organizationId: text("organization_id")
      .references(() => organization.id, { onDelete: "cascade" })
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
  organization: one(organization, {
    fields: [menuGroups.organizationId],
    references: [organization.id],
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
      .references(() => menus.id, { onDelete: "cascade" })
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
