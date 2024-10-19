import type Icons from "~/components/ui/icons";

export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
  label?: string;
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MainNavItem extends NavItem {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SidebarNavItem extends NavItemWithChildren {}

interface NavsConfig {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
}

export const navsConfig: NavsConfig = {
  mainNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Organization",
      href: "/dashboard/organization",
    },
    {
      title: "Store",
      href: "/dashboard/stores",
    },
    {
      title: "Menu",
      href: "/dashboard/menus",
    },
  ],
  sidebarNav: [
    {
      title: "Dashboard",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          items: [],
        },
      ],
    },
    {
      title: "Organization",
      items: [
        {
          title: "My Organization",
          href: "/dashboard/organization",
          items: [],
        },
        {
          title: "Organization Members",
          href: "/dashboard/organization/users",
          items: [],
        },
      ],
    },
    {
      title: "Store",
      items: [
        {
          title: "Manage Stores",
          href: "/dashboard/stores",
          items: [],
        },
        {
          title: "Store Tables",
          href: "/dashboard/stores/tables",
          items: [],
        },
        {
          title: "Active Orders",
          href: "/dashboard/stores/active-orders",
          items: [],
        },
      ],
    },
    {
      title: "Menu",
      items: [
        {
          title: "My Menus",
          href: "/dashboard/menus",
          items: [],
        },
        {
          title: "Menu Groups",
          href: "/dashboard/menus/groups",
          items: [],
        },
      ],
    },
  ],
};
