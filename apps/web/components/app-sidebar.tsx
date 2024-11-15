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
import { useMemo } from "react";
import { NavUser } from "./nav-user";
import Link from "next/link";
import { api } from "~/trpc/react";

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: stores } = api.store.getAllStore.useQuery();
  const { data: userDetails } = api.user.getCurrentUser.useQuery();

  const navStores = useMemo(
    () =>
      stores?.map((store) => ({
        id: store.id,
        name: store.name,
        url: `/dashboard/store/${store.slug}`,
        isOpen: store.isOpen,
      })) ?? [],
    [stores],
  );
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="#" prefetch={true}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Beef className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Kedai</span>
                  <span className="truncate text-xs">Solutions</span>
                </div>
              </Link>
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
        {userDetails && <NavUser user={userDetails} />}
      </SidebarFooter>
    </Sidebar>
  );
}
