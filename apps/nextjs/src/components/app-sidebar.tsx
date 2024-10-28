"use client";
import * as React from "react";
import {
  Beef,
  BookOpenText,
  Building,
  LifeBuoy,
  Send,
  Store,
} from "lucide-react";
import { NavMain } from "~/components/nav-main";
import { NavStores } from "~/components/nav-projects";
import { NavSecondary } from "~/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { type RouterOutput } from "~/trpc/server";
import { useMemo } from "react";
import { UserButton } from "@clerk/nextjs";

const data = {
  navMain: [
    {
      title: "Organization",
      url: "/dashboard/organization",
      icon: Building,
      items: [
        {
          title: "My Organization",
          url: "/dashboard/organization",
        },
      ],
    },
    {
      title: "Store",
      url: "/dashboard/stores",
      icon: Store,
      items: [
        {
          title: "Manage Stores",
          url: "/dashboard/stores",
        },
        {
          title: "Active Orders",
          url: "/dashboard/stores/active-orders",
        },
      ],
    },
    {
      title: "Menu",
      url: "/dashboard/menus",
      icon: BookOpenText,
      items: [
        {
          title: "All Menu",
          url: "/dashboard/menus",
        },
        {
          title: "Menu Groups",
          url: "/dashboard/menus",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
};

export function AppSidebar({
  stores,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  stores: RouterOutput["store"]["getAllStore"];
}) {
  const navStores = useMemo(
    () =>
      stores.map((store) => ({
        id: store.id,
        name: store.name,
        url: `/dashboard/store/${store.slug}`,
        isOpen: store.isOpen,
      })),
    [stores],
  );
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Beef className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Kedai</span>
                  <span className="truncate text-xs">Solutions</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavStores stores={navStores} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <UserButton showName={true} />
      </SidebarFooter>
    </Sidebar>
  );
}
