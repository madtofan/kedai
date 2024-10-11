import React from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { navsConfig } from "~/lib/navs";
import { ScrollArea } from "../_components/ui/scroll-area";
import { SidebarNav } from "./_components/sidebar-nav";
import MainNav from "./_components/main-nav";
import MobileNav from "./_components/mobile-nav";
import ModeToggle from "./_components/mode-toggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardContent({ children }: DashboardLayoutProps) {
  return (
    <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
      <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-10rem)] w-full shrink-0 md:sticky md:block">
        <ScrollArea className="h-full py-6 pr-6 lg:py-8">
          <SidebarNav items={navsConfig.sidebarNav} />
        </ScrollArea>
      </aside>
      {children}
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <MainNav />
          <MobileNav />
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none"></div>
            <nav className="flex items-center">
              <ModeToggle />
            </nav>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>
      <DashboardContent>
        <SignedIn>{children}</SignedIn>
        <SignedOut>
          <p>
            {"You are not currently logged in, please do login to see contents"}
          </p>
        </SignedOut>
      </DashboardContent>
    </>
  );
}
